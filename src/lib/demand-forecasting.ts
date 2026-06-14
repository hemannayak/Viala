/**
 * AI Demand Forecasting Service
 * Integrates with Database ML forecasts and inventory data
 */

import { dbML } from './db'

// Simple cache for demo data to avoid regenerating
const demoDataCache = new Map<string, { data: InventoryBatch[], timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Configuration object for better maintainability
const FORECASTING_CONFIG = {
  FORECAST_DAYS: 30,
  REORDER_POINT_PERCENTAGE: 0.2,
  MIN_REORDER_POINT: 50,
  CRITICAL_DAYS_THRESHOLD: 7,
  WARNING_DAYS_THRESHOLD: 14,
  CONFIDENCE_INTERVAL_PERCENTAGE: 0.2,
  SUPPLY_DURATION_DAYS: 60,
  SEASONAL_VARIATION_AMPLITUDE: 0.3,
  RANDOM_VARIATION_RANGE: 0.4,
  // Demo-specific configuration
  DEMO: {
    NEAR_EXPIRY_DAYS: 25,
    FAR_EXPIRY_DAYS: 85,
    MANUFACTURING_OFFSET_DAYS: 365,
    DEFAULT_PRICE: 25.50,
    BATCH_QUANTITIES: [85, 120],
    SHELF_LOCATIONS: ['A2', 'A3']
  }
} as const

// Error types for better error handling
export class ForecastingError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'ForecastingError'
  }
}

export class DataValidationError extends ForecastingError {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'DataValidationError'
  }
}

export class DatabaseError extends ForecastingError {
  constructor(message: string, public operation?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Unified data interfaces for better type safety
export interface MLForecast {
  id: string
  drug_name: string
  ds: string // Date string (YYYY-MM-DD)
  yhat: number // Predicted demand
  yhat_lower: number // Lower confidence bound
  yhat_upper: number // Upper confidence bound
  created_at: string
}

export interface InventoryBatch {
  id: string
  med_name: string
  batch_no: string
  expiry_date: string
  quantity: number
  price: number
  shelf_location: string
  manufacturing_date?: string
}

// Raw database record types for better type safety
interface CleanedInventoryRecord {
  id: string
  medicine_name: string
  batch_number: string
  expiry_date: string
  quantity?: number
  current_stock?: number
  price?: number
  unit_price?: number
  shelf_location?: string
  location?: string
  manufacturing_date?: string
  mfg_date?: string
}

interface MLPredictionRecord {
  id: string
  medicine_name?: string
  drug_name?: string
  date?: string
  ds?: string
  predicted_demand?: number
  yhat?: number
  lower_bound?: number
  yhat_lower?: number
  upper_bound?: number
  yhat_upper?: number
  created_at: string
}

// Current stock summary
export interface StockSummary {
  drug_name: string
  current_stock: number
  reorder_point: number
  total_batches: number
  earliest_expiry: string
}

// Demand insights response
export interface DemandInsights {
  stockSummary: StockSummary
  forecasts: MLForecast[]
  predictedStockoutDate: string | null
  daysUntilStockout: number | null
  urgencyLevel: 'critical' | 'warning' | 'normal'
  fefoBatches: InventoryBatch[]
  recommendations: string[]
}

/**
 * Get comprehensive demand insights for a specific drug
 */
/**
 * Fetch inventory data with fallback strategy
 */
async function fetchInventoryData(drugName: string): Promise<CleanedInventoryRecord[]> {
  try {
    // Use the inventory table that exists in your database
    const { data: inventoryData, error: inventoryError } = await dbML
      .from('inventory')
      .select('*')
      .ilike('med_name', `%${drugName}%`)
      .order('expiry_date', { ascending: true })

    if (inventoryError) {
      console.warn('Failed to fetch inventory data:', inventoryError)
      return []
    }

    // Map your inventory data to expected format
    return (inventoryData || []).map((item: any) => ({
      id: item.id,
      medicine_name: item.med_name,
      batch_number: item.batch_no,
      expiry_date: item.expiry_date,
      quantity: item.quantity,
      current_stock: item.current_stock || item.quantity,
      price: item.price,
      unit_price: item.price,
      shelf_location: item.shelf_location,
      location: item.shelf_location,
      manufacturing_date: item.manufacturing_date,
      mfg_date: item.manufacturing_date
    }))

  } catch (error) {
    console.error('Error fetching inventory data:', error)
    return []
  }
}

/**
 * Fetch ML prediction data with fallback strategy
 */
async function fetchMLPredictions(drugName: string, forecastDays: number = 30): Promise<MLPredictionRecord[]> {
  try {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + forecastDays)
    const startDate = new Date().toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Use the ml_forecasts table that exists in your database
    const { data: forecastData, error: forecastError } = await (dbML as any)
      .from('ml_forecasts')
      .select('*')
      .ilike('drug_name', `%${drugName}%`)
      .gte('ds', startDate)
      .lte('ds', endDateStr)
      .order('ds', { ascending: true })

    if (forecastError) {
      console.warn('No ML predictions available:', forecastError)
      return []
    }

    return forecastData || []

  } catch (error) {
    console.error('Error fetching ML predictions:', error)
    return []
  }
}

/**
 * Type guard to validate inventory batch data
 */
function isValidInventoryBatch(batch: any): batch is InventoryBatch {
  return (
    batch &&
    typeof batch.id === 'string' &&
    typeof batch.med_name === 'string' &&
    typeof batch.batch_no === 'string' &&
    typeof batch.expiry_date === 'string' &&
    typeof batch.quantity === 'number' &&
    batch.quantity >= 0
  )
}

/**
 * Type guard to validate ML forecast data
 */
function isValidMLForecast(forecast: any): forecast is MLForecast {
  return (
    forecast &&
    typeof forecast.drug_name === 'string' &&
    typeof forecast.ds === 'string' &&
    typeof forecast.yhat === 'number' &&
    forecast.yhat >= 0
  )
}

/**
 * Normalize inventory data to consistent format with validation
 */
function normalizeInventoryData(data: CleanedInventoryRecord[]): InventoryBatch[] {
  return data
    .map(item => ({
      id: item.id || `batch-${item.batch_number || 'unknown'}`,
      med_name: item.medicine_name || 'Unknown Medicine',
      batch_no: item.batch_number || 'N/A',
      expiry_date: item.expiry_date,
      quantity: item.quantity || item.current_stock || 0,
      price: item.price || item.unit_price || 0,
      shelf_location: item.shelf_location || item.location || 'N/A',
      manufacturing_date: item.manufacturing_date || item.mfg_date
    }))
    .filter(isValidInventoryBatch)
}

/**
 * Normalize ML prediction data to consistent format
 */
function normalizeMLPredictions(data: MLPredictionRecord[], drugName: string): MLForecast[] {
  return data
    .map(item => ({
      id: item.id || `ml-${item.date || item.ds}`,
      drug_name: drugName,
      ds: item.date || item.ds || '',
      yhat: item.predicted_demand || item.yhat || 0,
      yhat_lower: item.lower_bound || item.yhat_lower || 0,
      yhat_upper: item.upper_bound || item.yhat_upper || 0,
      created_at: item.created_at || new Date().toISOString()
    }))
    .filter(isValidMLForecast)
}
/**
 * Get comprehensive demand insights for a specific drug
 */
export async function getDemandInsights(drugName: string, forecastDays: number = 30): Promise<DemandInsights> {
  // Input validation
  if (!drugName || typeof drugName !== 'string' || drugName.trim().length === 0) {
    throw new ForecastingError('Invalid drug name provided')
  }

  if (forecastDays <= 0 || forecastDays > 365) {
    throw new ForecastingError('Forecast days must be between 1 and 365')
  }

  const sanitizedDrugName = drugName.trim()

  try {
    // Fetch inventory and ML prediction data
    const [inventoryData, mlPredictions] = await Promise.all([
      fetchInventoryData(sanitizedDrugName),
      fetchMLPredictions(sanitizedDrugName, forecastDays)
    ])

    // Normalize data to consistent formats
    const normalizedInventory = normalizeInventoryData(inventoryData)
    const normalizedForecasts = normalizeMLPredictions(mlPredictions, sanitizedDrugName)

    // If no ML predictions available, generate demo insights
    if (normalizedForecasts.length === 0) {
      return generateDemoInsights(sanitizedDrugName, normalizedInventory, forecastDays)
    }

    // Build insights from real data
    return buildInsightsFromData(sanitizedDrugName, normalizedInventory, normalizedForecasts)

  } catch (error) {
    console.error('Error in getDemandInsights:', error)
    throw new ForecastingError('Failed to generate demand insights', error)
  }
}

/**
 * Build insights from normalized data
 */
function buildInsightsFromData(
  drugName: string,
  inventoryData: InventoryBatch[],
  forecastData: MLForecast[]
): DemandInsights {
  const stockSummary = createStockSummary(drugName, inventoryData)
  const { stockoutDate, daysUntilStockout } = calculateStockoutDate(
    stockSummary.current_stock,
    forecastData
  )
  const urgencyLevel = getUrgencyLevel(daysUntilStockout)
  const recommendations = generateRecommendations(stockSummary, daysUntilStockout, urgencyLevel)

  return {
    stockSummary,
    forecasts: forecastData,
    predictedStockoutDate: stockoutDate,
    daysUntilStockout,
    urgencyLevel,
    fefoBatches: inventoryData,
    recommendations
  }
}

/**
 * Create stock summary from inventory data
 */
function createStockSummary(drugName: string, inventoryData: InventoryBatch[]): StockSummary {
  const totalStock = inventoryData.reduce((sum, item) => sum + item.quantity, 0)
  const earliestExpiry = inventoryData[0]?.expiry_date || new Date().toISOString()
  
  return {
    drug_name: drugName,
    current_stock: totalStock,
    reorder_point: Math.max(FORECASTING_CONFIG.MIN_REORDER_POINT, Math.floor(totalStock * FORECASTING_CONFIG.REORDER_POINT_PERCENTAGE)),
    total_batches: inventoryData.length,
    earliest_expiry: earliestExpiry
  }
}

/**
 * Calculate predicted stockout date based on forecasts
 */
function calculateStockoutDate(
  currentStock: number,
  forecasts: MLForecast[]
): { stockoutDate: string | null; daysUntilStockout: number | null } {
  if (forecasts.length === 0 || currentStock <= 0) {
    return { stockoutDate: null, daysUntilStockout: null }
  }

  let remainingStock = currentStock
  let cumulativeDemand = 0

  for (const forecast of forecasts) {
    cumulativeDemand += forecast.yhat
    
    if (cumulativeDemand >= currentStock) {
      const stockoutDate = forecast.ds
      const today = new Date()
      const stockoutDateObj = new Date(stockoutDate)
      const daysUntilStockout = Math.ceil(
        (stockoutDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      return { stockoutDate, daysUntilStockout }
    }
  }

  // If we don't run out in the forecast period
  return { stockoutDate: null, daysUntilStockout: null }
}

/**
 * Determine urgency level based on days until stockout
 */
function getUrgencyLevel(daysUntilStockout: number | null): 'critical' | 'warning' | 'normal' {
  if (daysUntilStockout === null) return 'normal'
  if (daysUntilStockout <= FORECASTING_CONFIG.CRITICAL_DAYS_THRESHOLD) return 'critical'
  if (daysUntilStockout <= FORECASTING_CONFIG.WARNING_DAYS_THRESHOLD) return 'warning'
  return 'normal'
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  stockSummary: StockSummary,
  daysUntilStockout: number | null,
  urgencyLevel: 'critical' | 'warning' | 'normal'
): string[] {
  const recommendations: string[] = []

  if (urgencyLevel === 'critical') {
    recommendations.push('🚨 URGENT: Place emergency order immediately')
    recommendations.push('📞 Contact supplier for expedited delivery')
    recommendations.push('🔄 Consider alternative suppliers or generic substitutes')
  } else if (urgencyLevel === 'warning') {
    recommendations.push('⚠️ Schedule reorder within next 3 days')
    recommendations.push('📊 Monitor daily consumption closely')
    recommendations.push('🔍 Review supplier lead times')
  } else {
    recommendations.push('✅ Stock levels are healthy')
    recommendations.push('📈 Continue monitoring demand patterns')
    recommendations.push('🎯 Optimize reorder quantities based on trends')
  }

  // FEFO recommendations
  if (stockSummary.total_batches > 1) {
    recommendations.push('📦 Follow FEFO: Dispense earliest expiry batches first')
  }

  // Seasonal recommendations
  const currentMonth = new Date().getMonth()
  if ([10, 11, 0, 1, 2].includes(currentMonth)) { // Nov-Mar (winter/flu season)
    recommendations.push('🌡️ Winter season: Consider increased demand for cold/flu medicines')
  }

  return recommendations
}

/**
 * Create demo inventory batches for testing/demo purposes with caching
 */
function createDemoInventoryBatches(drugName: string): InventoryBatch[] {
  const cacheKey = drugName.toLowerCase()
  const cached = demoDataCache.get(cacheKey)
  
  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const baseDate = new Date()
  const { DEMO } = FORECASTING_CONFIG
  
  const nearExpiryDate = new Date(baseDate)
  nearExpiryDate.setDate(baseDate.getDate() + DEMO.NEAR_EXPIRY_DAYS)
  
  const farExpiryDate = new Date(baseDate)
  farExpiryDate.setDate(baseDate.getDate() + DEMO.FAR_EXPIRY_DAYS)

  const mfgDate1 = new Date(baseDate.getTime() - DEMO.MANUFACTURING_OFFSET_DAYS * 24 * 60 * 60 * 1000)
  const mfgDate2 = new Date(baseDate.getTime() - (DEMO.MANUFACTURING_OFFSET_DAYS - 90) * 24 * 60 * 60 * 1000)

  const demoData = [
    {
      id: `demo-${drugName}-1`,
      med_name: drugName,
      batch_no: 'DEMO2024A',
      expiry_date: nearExpiryDate.toISOString().split('T')[0],
      quantity: DEMO.BATCH_QUANTITIES[0],
      price: DEMO.DEFAULT_PRICE,
      shelf_location: DEMO.SHELF_LOCATIONS[0],
      manufacturing_date: mfgDate1.toISOString().split('T')[0]
    },
    {
      id: `demo-${drugName}-2`,
      med_name: drugName,
      batch_no: 'DEMO2024B',
      expiry_date: farExpiryDate.toISOString().split('T')[0],
      quantity: DEMO.BATCH_QUANTITIES[1],
      price: DEMO.DEFAULT_PRICE,
      shelf_location: DEMO.SHELF_LOCATIONS[1],
      manufacturing_date: mfgDate2.toISOString().split('T')[0]
    }
  ]

  // Cache the generated data
  demoDataCache.set(cacheKey, { data: demoData, timestamp: Date.now() })
  
  return demoData
}

/**
 * Generate demo insights when ML forecasts are not available
 */
function generateDemoInsights(drugName: string, inventoryData: InventoryBatch[], forecastDays: number = 30): DemandInsights {
  // Create demo inventory data if none provided
  const demoInventoryBatches: InventoryBatch[] = inventoryData.length > 0 
    ? inventoryData 
    : createDemoInventoryBatches(drugName)

  const totalStock = demoInventoryBatches.reduce((sum, item) => sum + item.quantity, 0)
  const earliestExpiry = demoInventoryBatches[0]?.expiry_date || new Date().toISOString()

  // Generate optimized demo forecasts with custom duration
  const demoForecasts = generateDemoForecasts(drugName, totalStock, forecastDays)

  const stockSummary: StockSummary = {
    drug_name: drugName,
    current_stock: totalStock,
    reorder_point: Math.max(FORECASTING_CONFIG.MIN_REORDER_POINT, Math.floor(totalStock * FORECASTING_CONFIG.REORDER_POINT_PERCENTAGE)),
    total_batches: demoInventoryBatches.length,
    earliest_expiry: earliestExpiry
  }

  const { stockoutDate, daysUntilStockout } = calculateStockoutDate(totalStock, demoForecasts)
  const urgencyLevel = getUrgencyLevel(daysUntilStockout)
  const recommendations = generateRecommendations(stockSummary, daysUntilStockout, urgencyLevel)

  return {
    stockSummary,
    forecasts: demoForecasts,
    predictedStockoutDate: stockoutDate,
    daysUntilStockout,
    urgencyLevel,
    fefoBatches: demoInventoryBatches,
    recommendations
  }
}

/**
 * Generate demo forecasts with optimized calculation
 */
function generateDemoForecasts(drugName: string, totalStock: number, forecastDays: number = 30): MLForecast[] {
  const demoForecasts: MLForecast[] = []
  const baseDate = new Date()
  const baseDemand = Math.max(1, Math.floor(totalStock / FORECASTING_CONFIG.SUPPLY_DURATION_DAYS))
  
  // Pre-calculate seasonal and random factors for better performance
  const seasonalFactors = Array.from({ length: forecastDays }, (_, i) => 
    1 + FORECASTING_CONFIG.SEASONAL_VARIATION_AMPLITUDE * Math.sin((i / forecastDays) * Math.PI)
  )
  
  for (let i = 0; i < forecastDays; i++) {
    const forecastDate = new Date(baseDate)
    forecastDate.setDate(baseDate.getDate() + i)
    
    const randomFactor = 0.8 + Math.random() * FORECASTING_CONFIG.RANDOM_VARIATION_RANGE
    const yhat = Math.round(baseDemand * seasonalFactors[i] * randomFactor)
    const confidence = yhat * FORECASTING_CONFIG.CONFIDENCE_INTERVAL_PERCENTAGE
    
    demoForecasts.push({
      id: `demo-${i}`,
      drug_name: drugName,
      ds: forecastDate.toISOString().split('T')[0],
      yhat,
      yhat_lower: Math.max(0, Math.round(yhat - confidence)),
      yhat_upper: Math.round(yhat + confidence),
      created_at: new Date().toISOString()
    })
  }
  
  return demoForecasts
}

/**
 * Get list of available drugs for forecasting
 */
export async function getAvailableDrugs(): Promise<string[]> {
  try {
    // Get drugs from your inventory table
    const { data, error } = await dbML
      .from('inventory')
      .select('med_name')
      .order('med_name')

    if (error) {
      console.error('Error fetching available drugs:', error)
      // Return demo drugs if database query fails
      return [
        'Paracetamol 500mg',
        'Amoxicillin 250mg',
        'Cough Syrup 100ml',
        'Vitamin D3 Tablets',
        'Ibuprofen 400mg'
      ]
    }

    // Get unique drug names from your inventory
    const uniqueDrugs = [...new Set(data.map((item: any) => item.med_name))] as string[]
    return uniqueDrugs

  } catch (error) {
    console.error('Error fetching available drugs:', error)
    // Return demo drugs if database query fails
    return [
      'Paracetamol 500mg',
      'Amoxicillin 250mg',
      'Cough Syrup 100ml',
      'Vitamin D3 Tablets',
      'Ibuprofen 400mg'
    ]
  }
}