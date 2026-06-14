import { NextRequest } from 'next/server'
import { ApiSecurity, withAuth } from '@/lib/api-security'
import { db } from '@/lib/db'

type HorizonDays = 15 | 30

type SeasonMode = 'auto' | 'winter' | 'summer' | 'monsoon' | 'neutral'

type DemandRisk = 'low' | 'medium' | 'high'

interface ForecastPoint {
  ds: string
  yhat: number
  yhat_lower: number
  yhat_upper: number
}

interface InventoryBatch {
  id: string
  med_name: string
  batch_no: string
  expiry_date: string
  quantity: number
  shelf_location: string | null
}

interface MedicineForecastSummary {
  medicine_name: string
  horizon_total: number
  avg_daily: number
  seasonality_factor: number
  trend_direction: 'increasing' | 'decreasing' | 'stable'
  confidence: number
  current_stock: number
  estimated_days_of_stock: number | null
  risk: DemandRisk
}

interface DemandForecastResponse {
  horizon_days: HorizonDays
  generated_at: string
  kpis: {
    total_predicted_units: number
    medicines_forecasted: number
    high_risk_medicines: number
    winter_season_boost_active: boolean
  }
  top_medicines: MedicineForecastSummary[]
  selected_medicine?: {
    medicine_name: string
    points: ForecastPoint[]
    batches: InventoryBatch[]
  }
}

function parseHorizon(value: string | null): HorizonDays {
  return value === '15' ? 15 : 30
}

function formatDateYYYYMMDD(d: Date): string {
  return d.toISOString().split('T')[0]
}

function isWinterMonth(monthIndex: number): boolean {
  return [10, 11, 0, 1, 2].includes(monthIndex)
}

function getSeasonModeFromQuery(value: string | null): SeasonMode {
  const v = (value || '').toLowerCase()
  if (v === 'winter' || v === 'summer' || v === 'monsoon' || v === 'neutral' || v === 'auto') return v
  return 'auto'
}

function seasonBoostFactor(medicineName: string, seasonMode: SeasonMode, now: Date): number {
  const n = medicineName.toLowerCase()
  const resolved: SeasonMode =
    seasonMode === 'auto'
      ? isWinterMonth(now.getMonth())
        ? 'winter'
        : 'neutral'
      : seasonMode

  if (resolved === 'neutral') return 1

  if (resolved === 'winter') {
    const winterKeywords = ['cough', 'cold', 'flu', 'fever', 'paracetamol', 'cetirizine', 'dolo', 'ibuprofen', 'syrup']
    return winterKeywords.some((k) => n.includes(k)) ? 1.25 : 1
  }

  if (resolved === 'monsoon') {
    const monsoonKeywords = ['diarr', 'ors', 'antibi', 'dengue', 'malaria', 'paracetamol', 'fever']
    return monsoonKeywords.some((k) => n.includes(k)) ? 1.18 : 1
  }

  if (resolved === 'summer') {
    const summerKeywords = ['ors', 'electroly', 'dehyd', 'sun', 'vitamin', 'antacid']
    return summerKeywords.some((k) => n.includes(k)) ? 1.12 : 1
  }

  return 1
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function classifyRisk(estimatedDaysOfStock: number | null, horizonDays: number): DemandRisk {
  if (estimatedDaysOfStock === null) return 'low'
  if (estimatedDaysOfStock <= Math.ceil(horizonDays / 3)) return 'high'
  if (estimatedDaysOfStock <= horizonDays) return 'medium'
  return 'low'
}

function keywordSeasonalityBoost(medicineName: string, seasonMode: SeasonMode, now: Date): number {
  return seasonBoostFactor(medicineName, seasonMode, now)
}

function parseNumber(v: any): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const parsed = parseFloat(String(v))
  return Number.isFinite(parsed) ? parsed : 0
}

async function buildFallbackForecastsFromSales(opts: {
  req: NextRequest
  user: any
  horizonDays: HorizonDays
  winterBoostActive: boolean
  inventoryRows: any[]
  startDate: Date
  selectedMedicine: string | null
}): Promise<Record<string, ForecastPoint[]>> {
  const { user, horizonDays, winterBoostActive, inventoryRows, startDate, selectedMedicine } = opts

  // 180d lookback
  const lookbackStart = new Date(startDate)
  lookbackStart.setDate(lookbackStart.getDate() - 180)

  let salesQuery = db
    .from('sales_transactions')
    .select('created_at, items')
    .gte('created_at', lookbackStart.toISOString())
    .order('created_at', { ascending: true })

  if (user?.pharmacy_id) {
    salesQuery = salesQuery.eq('pharmacy_id', user.pharmacy_id)
  }

  const { data: salesRows, error: salesError } = await salesQuery
  if (salesError) {
    console.error('Demand forecasting fallback: sales_transactions query failed', salesError)
    return {}
  }

  const inventoryNameById = new Map<string, string>()
  for (const inv of inventoryRows || []) {
    if (inv?.id) inventoryNameById.set(inv.id, inv.med_name || 'Unknown medicine')
  }

  // med -> day -> qty
  const dailyByMed: Record<string, Record<string, number>> = {}
  for (const row of salesRows || []) {
    const createdAt = row?.created_at ? new Date(row.created_at) : null
    if (!createdAt || Number.isNaN(createdAt.getTime())) continue
    const ds = formatDateYYYYMMDD(createdAt)

    const itemsRaw: any = (row as any).items
    const items: any[] = Array.isArray(itemsRaw) ? itemsRaw : []
    for (const item of items) {
      const qty = typeof item?.quantity === 'number' ? item.quantity : parseInt(item?.quantity || '0', 10)
      if (!Number.isFinite(qty) || qty <= 0) continue

      const inventoryId = item?.inventory_id
      const medFromInventory = inventoryId ? inventoryNameById.get(inventoryId) : null
      const medFromItem = item?.medicine_name || item?.med_name || item?.drug_name || null
      const medName = (medFromInventory || medFromItem || 'Unknown medicine') as string
      dailyByMed[medName] ||= {}
      dailyByMed[medName][ds] = (dailyByMed[medName][ds] || 0) + qty
    }
  }

  const pointsByDrug: Record<string, ForecastPoint[]> = {}
  const horizonStart = new Date(startDate)
  horizonStart.setDate(horizonStart.getDate() + 1)

  const allMedicines = Object.keys(dailyByMed)
  for (const medicineName of allMedicines) {
    // If a specific medicine requested, we can limit compute, but still return all for top list
    const dailyMap = dailyByMed[medicineName]
    const dates = Object.keys(dailyMap).sort()

    const last30Start = new Date(startDate)
    last30Start.setDate(last30Start.getDate() - 30)
    const last30StartStr = formatDateYYYYMMDD(last30Start)
    const last30 = dates.filter((d) => d >= last30StartStr).map((d) => dailyMap[d])
    const avgDaily = last30.length > 0 ? last30.reduce((a, b) => a + b, 0) / last30.length : 0

    const last7Start = new Date(startDate)
    last7Start.setDate(last7Start.getDate() - 7)
    const prev14Start = new Date(startDate)
    prev14Start.setDate(prev14Start.getDate() - 14)

    const last7StartStr = formatDateYYYYMMDD(last7Start)
    const prev14StartStr = formatDateYYYYMMDD(prev14Start)

    const last7 = dates.filter((d) => d >= last7StartStr).map((d) => dailyMap[d])
    const prev7 = dates.filter((d) => d >= prev14StartStr && d < last7StartStr).map((d) => dailyMap[d])
    const last7Avg = last7.length > 0 ? last7.reduce((a, b) => a + b, 0) / last7.length : avgDaily
    const prev7Avg = prev7.length > 0 ? prev7.reduce((a, b) => a + b, 0) / prev7.length : avgDaily

    let trendMultiplier = 1
    const ratio = prev7Avg > 0 ? last7Avg / prev7Avg : 1
    if (ratio >= 1.15) trendMultiplier = 1.08
    else if (ratio <= 0.85) trendMultiplier = 0.92

    const fallbackSeasonMode: SeasonMode = winterBoostActive ? 'winter' : 'neutral'
    const seasonalityFactor = keywordSeasonalityBoost(medicineName, fallbackSeasonMode, startDate)
    const base = avgDaily > 0 ? avgDaily : last7Avg

    pointsByDrug[medicineName] ||= []
    for (let i = 0; i < horizonDays; i++) {
      const d = new Date(horizonStart)
      d.setDate(horizonStart.getDate() + i)
      const wave = 1 + 0.12 * Math.sin((i / Math.max(1, horizonDays)) * Math.PI)
      const yhat = base * trendMultiplier * seasonalityFactor * wave
      const interval = yhat * 0.25

      pointsByDrug[medicineName].push({
        ds: formatDateYYYYMMDD(d),
        yhat: Math.max(0, Math.round(yhat * 100) / 100),
        yhat_lower: Math.max(0, Math.round((yhat - interval) * 100) / 100),
        yhat_upper: Math.max(0, Math.round((yhat + interval) * 100) / 100),
      })
    }
  }

  // If a medicine was explicitly requested and we still have no points, return empty
  if (selectedMedicine && !Object.keys(pointsByDrug).some((k) => k.toLowerCase() === selectedMedicine.toLowerCase())) {
    return pointsByDrug
  }

  return pointsByDrug
}

export const GET = withAuth(
  async (req, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const horizonDays = parseHorizon(searchParams.get('horizon'))
      const selectedMedicine = searchParams.get('medicine')?.trim() || null
      const seasonMode = getSeasonModeFromQuery(searchParams.get('season'))

      const now = new Date()
      const winterBoostActive = seasonMode === 'winter' || (seasonMode === 'auto' && isWinterMonth(now.getMonth()))

      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() + 1)
      const endDate = new Date(now)
      endDate.setDate(endDate.getDate() + horizonDays)

      // 1) Pull forecasts from ML table (preferred)
      const { data: mlRows, error: mlError } = await db
        .from('ml_forecasts')
        .select('drug_name, ds, yhat, yhat_lower, yhat_upper')
        .gte('ds', formatDateYYYYMMDD(startDate))
        .lte('ds', formatDateYYYYMMDD(endDate))
        .order('ds', { ascending: true })

      if (mlError) {
        console.error('Demand forecasting: ml_forecasts query failed', mlError)
      }

      const mlPointsByDrug: Record<string, ForecastPoint[]> = {}
      for (const r of mlRows || []) {
        const drug = (r as any).drug_name || 'Unknown medicine'
        mlPointsByDrug[drug] ||= []
        mlPointsByDrug[drug].push({
          ds: (r as any).ds,
          yhat: parseNumber((r as any).yhat),
          yhat_lower: parseNumber((r as any).yhat_lower),
          yhat_upper: parseNumber((r as any).yhat_upper),
        })
      }

      // 2) Load inventory rows (batches) for stock + batch listing
      let invQuery = db
        .from('inventory')
        .select('id, med_name, batch_no, expiry_date, quantity, shelf_location')
        .order('expiry_date', { ascending: true })

      // If authenticated, scope to pharmacy
      if (user?.pharmacy_id) {
        invQuery = invQuery.eq('pharmacy_id', user.pharmacy_id)
      }

      const { data: inventoryRows, error: invError } = await invQuery

      if (invError) {
        console.error('Demand forecasting: inventory query failed', invError)
        return ApiSecurity.createResponse(false, null, 'Database error', 'Failed to load inventory', 500)
      }

      // Fallback: if ML forecasts are missing/empty (or selected medicine has no ML points)
      const needsFullFallback = Object.keys(mlPointsByDrug).length === 0
      const needsSelectedFallback =
        !!selectedMedicine &&
        !Object.keys(mlPointsByDrug).some((k) => k.toLowerCase() === selectedMedicine.toLowerCase())

      if (needsFullFallback || needsSelectedFallback) {
        const fallbackPoints = await buildFallbackForecastsFromSales({
          req,
          user,
          horizonDays,
          winterBoostActive,
          inventoryRows: inventoryRows || [],
          startDate: now,
          selectedMedicine,
        })

        for (const [drug, pts] of Object.entries(fallbackPoints)) {
          if (!mlPointsByDrug[drug] || mlPointsByDrug[drug].length === 0) {
            mlPointsByDrug[drug] = pts
          }
        }
      }

      const stockByMedicineLower = new Map<string, number>()
      const canonicalNameByLower = new Map<string, string>()

      for (const inv of inventoryRows || []) {
        const name = (inv as any).med_name || 'Unknown medicine'
        const lower = String(name).toLowerCase()
        canonicalNameByLower.set(lower, name)
        const qty = typeof (inv as any).quantity === 'number' ? (inv as any).quantity : 0
        stockByMedicineLower.set(lower, (stockByMedicineLower.get(lower) || 0) + qty)
      }

      // 3) Build top list primarily from ml_forecasts
      const summaries: MedicineForecastSummary[] = []
      const allDrugs = Object.keys(mlPointsByDrug)

      // If we still don't have any forecast points, at least return inventory medicines (0 forecast)
      if (allDrugs.length === 0 && (inventoryRows || []).length > 0) {
        const uniqueInventoryNames = Array.from(
          new Set((inventoryRows || []).map((inv: any) => (inv?.med_name || 'Unknown medicine') as string))
        ) as string[]
        for (const name of uniqueInventoryNames) {
          mlPointsByDrug[name] = []
        }
      }

      const finalDrugList = Object.keys(mlPointsByDrug)

      for (const drugName of finalDrugList) {
        const points = mlPointsByDrug[drugName]
        const horizonTotal = Math.round(points.reduce((sum, p) => sum + p.yhat, 0))
        const avgDaily = points.length > 0 ? points.reduce((sum, p) => sum + p.yhat, 0) / points.length : 0

        const seasonalityFactor = keywordSeasonalityBoost(drugName, seasonMode, now)
        const adjustedAvgDaily = avgDaily * seasonalityFactor

        let trendDirection: MedicineForecastSummary['trend_direction'] = 'stable'
        if (points.length >= 2) {
          const first = points[0].yhat
          const last = points[points.length - 1].yhat
          if (first > 0 && last / first >= 1.15) trendDirection = 'increasing'
          else if (first > 0 && last / first <= 0.85) trendDirection = 'decreasing'
        }

        // ml_forecasts table also has confidence_score but not selected in this query; keep heuristic
        const confidence = clamp(0.75, 0.4, 0.9)

        const stock = stockByMedicineLower.get(String(drugName).toLowerCase()) || 0
        const estDaily = Math.max(0.1, adjustedAvgDaily)
        const estDays = stock > 0 ? Math.floor(stock / estDaily) : 0
        const risk = classifyRisk(Number.isFinite(estDays) ? estDays : null, horizonDays)

        summaries.push({
          medicine_name: drugName,
          horizon_total: Math.max(0, horizonTotal),
          avg_daily: Math.round(adjustedAvgDaily * 100) / 100,
          seasonality_factor: Math.round(seasonalityFactor * 100) / 100,
          trend_direction: trendDirection,
          confidence: Math.round(confidence * 100) / 100,
          current_stock: stock,
          estimated_days_of_stock: Number.isFinite(estDays) ? estDays : null,
          risk,
        })
      }

      summaries.sort((a, b) => b.horizon_total - a.horizon_total)
      const top = summaries.slice(0, 20)

      const totalPredictedUnits = top.reduce((sum, m) => sum + m.horizon_total, 0)
      const highRisk = summaries.filter((m) => m.risk === 'high').length

      // 4) Selected medicine points + batches
      let selectedPoints: ForecastPoint[] = []
      let selectedBatches: InventoryBatch[] = []

      if (selectedMedicine) {
        const canonical = canonicalNameByLower.get(selectedMedicine.toLowerCase()) || selectedMedicine

        // Prefer exact key match in ML forecasts, else case-insensitive lookup
        selectedPoints =
          mlPointsByDrug[canonical] ||
          mlPointsByDrug[selectedMedicine] ||
          mlPointsByDrug[
            Object.keys(mlPointsByDrug).find((k) => k.toLowerCase() === selectedMedicine.toLowerCase()) || ''
          ] ||
          []

        selectedBatches = (inventoryRows || [])
          .filter((inv: any) => String(inv.med_name || '').toLowerCase() === canonical.toLowerCase())
          .map((inv: any) => ({
            id: inv.id,
            med_name: inv.med_name,
            batch_no: inv.batch_no,
            expiry_date: inv.expiry_date,
            quantity: typeof inv.quantity === 'number' ? inv.quantity : 0,
            shelf_location: inv.shelf_location ?? null,
          }))
      }

      const response: DemandForecastResponse = {
        horizon_days: horizonDays,
        generated_at: new Date().toISOString(),
        kpis: {
          total_predicted_units: totalPredictedUnits,
          medicines_forecasted: summaries.length,
          high_risk_medicines: highRisk,
          winter_season_boost_active: winterBoostActive,
        },
        top_medicines: top,
        ...(selectedMedicine
          ? {
              selected_medicine: {
                medicine_name: selectedMedicine,
                points: selectedPoints,
                batches: selectedBatches,
              },
            }
          : {}),
      }

      return ApiSecurity.createResponse(true, response, undefined, 'Demand forecast generated successfully')
    } catch (error) {
      console.error('Demand forecasting API error:', error)
      return ApiSecurity.createResponse(false, null, 'Internal server error', 'An unexpected error occurred', 500)
    }
  },
  { requiredRoles: ['admin', 'manager', 'pharmacist'], requireAuth: false }
)
