// AI-Powered Pharmacy Analytics & Demand Forecasting
// Based on ZENITH'25 requirements

import { dbML } from './db'

// Constants for better maintainability
const FORECASTING_CONSTANTS = {
  DEFAULT_MOVING_AVERAGE_WINDOW: 7,
  EXPONENTIAL_SMOOTHING_ALPHA: 0.3,
  MINIMUM_DATA_POINTS_FOR_SEASONALITY: 30,
  SEASONALITY_THRESHOLD: 1.2,
  SAFETY_STOCK_PERCENTAGE: 0.3,
  MINIMUM_DAILY_DEMAND: 0.1,
  MAX_REORDER_DAYS: 365,
  DEFAULT_REORDER_DAYS: 30,
  TREND_INCREASE_THRESHOLD: 1.1,
  TREND_DECREASE_THRESHOLD: 0.9,
  TREND_MULTIPLIER_INCREASE: 1.15,
  TREND_MULTIPLIER_DECREASE: 0.85,
  DAYS_IN_MONTH: 30,
  LOW_STOCK_THRESHOLD: 0.5,
  CRITICAL_STOCK_THRESHOLD: 0.2,
  PREVENTABLE_WASTE_FACTOR: 0.7,
  CO2_PER_UNIT: 0.02 * 4.5,
  WATER_POLLUTION_FACTOR: 0.001,
  VENDOR_RETURN_RECOVERY: 0.7,
  NGO_DONATION_RECOVERY: 0.3,
  DISCOUNT_SALES_RECOVERY: 0.4
} as const

export interface SalesRecord {
  sale_date: string
  medicine_name: string
  quantity_sold: number
  unit_price: number
  total_amount: number
  customer_type: 'walk-in' | 'prescription'
  category: string
}

export interface PurchaseRecord {
  purchase_date: string
  medicine_name: string
  quantity_purchased: number
  unit_cost: number
  total_cost: number
  supplier: string
  batch_no: string
}

export interface DemandForecast {
  medicine_name: string
  predicted_demand: number
  confidence_score: number
  reorder_quantity: number
  reorder_date: string
  seasonality_factor: number
  trend_direction: 'increasing' | 'decreasing' | 'stable'
  risk_level: 'low' | 'medium' | 'high'
}

export interface InventoryAlert {
  type: 'low_stock' | 'expiry_warning' | 'reorder_suggestion' | 'seasonal_surge'
  medicine_name: string
  current_stock: number
  threshold: number
  days_until_expiry?: number
  predicted_stockout_date?: string
  priority: 'high' | 'medium' | 'low'
  action_required: string
  supplier_info?: string
}

export interface WasteAnalytics {
  total_expired_value: number
  total_expired_quantity: number
  waste_by_category: Record<string, number>
  preventable_waste: number
  environmental_impact: {
    co2_equivalent: number
    water_pollution_risk: number
  }
  recovery_opportunities: {
    vendor_returns: number
    ngo_donations: number
    discount_sales: number
  }
}

export interface SeasonalPattern {
  medicine_name: string
  category: string
  peak_months: string[]
  demand_multiplier: number
  historical_pattern: Array<{
    month: string
    demand_factor: number
  }>
}

// AI Demand Forecasting Engine
export class DemandForecastingEngine {
  private salesData: SalesRecord[] = []
  private purchaseData: PurchaseRecord[] = []

  constructor(salesData: SalesRecord[], purchaseData: PurchaseRecord[]) {
    this.salesData = salesData
    this.purchaseData = purchaseData
  }

  // Simple Moving Average with Seasonal Adjustment
  calculateMovingAverage(data: number[], window: number = FORECASTING_CONSTANTS.DEFAULT_MOVING_AVERAGE_WINDOW): number {
    if (data.length < window) return data.reduce((a, b) => a + b, 0) / data.length
    const recent = data.slice(-window)
    return recent.reduce((a, b) => a + b, 0) / window
  }

  // Exponential Smoothing for Trend Analysis
  calculateExponentialSmoothing(data: number[], alpha: number = FORECASTING_CONSTANTS.EXPONENTIAL_SMOOTHING_ALPHA): number {
    if (data.length === 0) return 0
    if (data.length === 1) return data[0]
    
    let smoothed = data[0]
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed
    }
    return smoothed
  }

  // Seasonal Decomposition
  detectSeasonality(medicine: string): SeasonalPattern | null {
    const medicineData = this.salesData.filter(s => s.medicine_name === medicine)
    if (medicineData.length < FORECASTING_CONSTANTS.MINIMUM_DATA_POINTS_FOR_SEASONALITY) return null

    const monthlyData: Record<string, number[]> = {}
    
    medicineData.forEach(record => {
      const month = new Date(record.sale_date).toLocaleString('default', { month: 'long' })
      if (!monthlyData[month]) monthlyData[month] = []
      monthlyData[month].push(record.quantity_sold)
    })

    const monthlyAverages = Object.entries(monthlyData).map(([month, quantities]) => ({
      month,
      demand_factor: quantities.reduce((a, b) => a + b, 0) / quantities.length
    }))

    const overallAverage = monthlyAverages.reduce((sum, m) => sum + m.demand_factor, 0) / monthlyAverages.length
    const peakMonths = monthlyAverages
      .filter(m => m.demand_factor > overallAverage * FORECASTING_CONSTANTS.SEASONALITY_THRESHOLD)
      .map(m => m.month)

    const maxDemand = Math.max(...monthlyAverages.map(m => m.demand_factor))
    const demandMultiplier = maxDemand / overallAverage

    return {
      medicine_name: medicine,
      category: this.getCategoryForMedicine(medicine),
      peak_months: peakMonths,
      demand_multiplier: demandMultiplier,
      historical_pattern: monthlyAverages
    }
  }

  // AI-Powered Demand Prediction
  predictDemand(medicine: string, daysAhead: number = FORECASTING_CONSTANTS.DAYS_IN_MONTH): DemandForecast {
    // Input validation
    if (!medicine || typeof medicine !== 'string') {
      throw new Error('Invalid medicine name provided')
    }
    
    if (daysAhead <= 0 || daysAhead > FORECASTING_CONSTANTS.MAX_REORDER_DAYS) {
      throw new Error(`Days ahead must be between 1 and ${FORECASTING_CONSTANTS.MAX_REORDER_DAYS}`)
    }

    const historicalSales = this.salesData
      .filter(s => s.medicine_name === medicine)
      .map(s => s.quantity_sold)
      .sort((a, b) => a - b)

    if (historicalSales.length === 0) {
      return this.createEmptyForecast(medicine)
    }

    // Calculate base demand using multiple methods
    const baseDemand = this.calculateBaseDemand(historicalSales)

    // Apply seasonality and trend adjustments
    const { seasonalityFactor, trendDirection, trendMultiplier } = this.calculateAdjustmentFactors(medicine, historicalSales)

    // Final prediction with adjustments
    const predictedDemand = Math.round(baseDemand * seasonalityFactor * trendMultiplier * (daysAhead / FORECASTING_CONSTANTS.DAYS_IN_MONTH))

    // Calculate confidence and risk metrics
    const { confidenceScore, riskLevel } = this.calculateConfidenceAndRisk(historicalSales, baseDemand)

    // Calculate reorder logistics
    const { reorderQuantity, reorderDate } = this.calculateReorderLogistics(medicine, baseDemand, predictedDemand)

    return {
      medicine_name: medicine,
      predicted_demand: Math.max(0, predictedDemand),
      confidence_score: Math.round(confidenceScore * 100) / 100,
      reorder_quantity: Math.max(0, reorderQuantity),
      reorder_date: reorderDate.toISOString().split('T')[0],
      seasonality_factor: Math.round(seasonalityFactor * 100) / 100,
      trend_direction: trendDirection,
      risk_level: riskLevel
    }
  }

  private calculateBaseDemand(historicalSales: number[]): number {
    const movingAverage = this.calculateMovingAverage(historicalSales)
    const exponentialSmoothing = this.calculateExponentialSmoothing(historicalSales)
    const median = historicalSales[Math.floor(historicalSales.length / 2)]

    // Weighted combination of forecasting methods
    return (movingAverage * 0.4 + exponentialSmoothing * 0.4 + median * 0.2)
  }

  private calculateAdjustmentFactors(medicine: string, historicalSales: number[]) {
    // Apply seasonality adjustment
    const seasonalPattern = this.detectSeasonality(medicine)
    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    const seasonalityFactor = seasonalPattern?.historical_pattern
      .find(p => p.month === currentMonth)?.demand_factor || 1

    // Calculate trend direction
    const recentTrend = historicalSales.slice(-7)
    const olderTrend = historicalSales.slice(-14, -7)
    const recentAvg = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length
    const olderAvg = olderTrend.reduce((a, b) => a + b, 0) / olderTrend.length
    
    let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (recentAvg > olderAvg * FORECASTING_CONSTANTS.TREND_INCREASE_THRESHOLD) trendDirection = 'increasing'
    else if (recentAvg < olderAvg * FORECASTING_CONSTANTS.TREND_DECREASE_THRESHOLD) trendDirection = 'decreasing'

    // Apply trend adjustment
    let trendMultiplier = 1
    if (trendDirection === 'increasing') trendMultiplier = FORECASTING_CONSTANTS.TREND_MULTIPLIER_INCREASE
    else if (trendDirection === 'decreasing') trendMultiplier = FORECASTING_CONSTANTS.TREND_MULTIPLIER_DECREASE

    return { seasonalityFactor, trendDirection, trendMultiplier }
  }

  private calculateConfidenceAndRisk(historicalSales: number[], baseDemand: number) {
    // Calculate confidence score based on data consistency
    const variance = historicalSales.reduce((sum, val) => sum + Math.pow(val - baseDemand, 2), 0) / historicalSales.length
    const confidenceScore = Math.max(0.1, Math.min(0.95, 1 - (variance / (baseDemand * baseDemand))))

    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (confidenceScore < 0.5) riskLevel = 'high'
    else if (confidenceScore < 0.7) riskLevel = 'medium'

    return { confidenceScore, riskLevel }
  }

  private calculateReorderLogistics(medicine: string, baseDemand: number, predictedDemand: number) {
    // Calculate reorder quantity (safety stock + predicted demand)
    const safetyStock = Math.ceil(baseDemand * FORECASTING_CONSTANTS.SAFETY_STOCK_PERCENTAGE)
    const reorderQuantity = predictedDemand + safetyStock

    // Calculate reorder date (when stock will reach reorder point)
    const currentStock = this.getCurrentStock(medicine)
    const dailyDemand = Math.max(FORECASTING_CONSTANTS.MINIMUM_DAILY_DEMAND, baseDemand / FORECASTING_CONSTANTS.DAYS_IN_MONTH)
    
    // Calculate days until reorder with proper bounds checking
    let daysUntilReorder: number = FORECASTING_CONSTANTS.DEFAULT_REORDER_DAYS
    
    if (currentStock > safetyStock && dailyDemand > 0) {
      const calculatedDays = Math.floor((currentStock - safetyStock) / dailyDemand)
      daysUntilReorder = Math.max(1, Math.min(FORECASTING_CONSTANTS.MAX_REORDER_DAYS, calculatedDays))
    }
    
    const reorderDate = this.calculateFutureDate(daysUntilReorder)

    return { reorderQuantity, reorderDate }
  }

  // Generate Real-time Alerts
  generateAlerts(): InventoryAlert[] {
    const alerts: InventoryAlert[] = []
    const uniqueMedicines = [...new Set(this.salesData.map(s => s.medicine_name))]

    uniqueMedicines.forEach(medicine => {
      const currentStock = this.getCurrentStock(medicine)
      const forecast = this.predictDemand(medicine, 30)
      const dailyDemand = forecast.predicted_demand / 30

      // Low Stock Alert
      if (currentStock < forecast.reorder_quantity * FORECASTING_CONSTANTS.LOW_STOCK_THRESHOLD) {
        alerts.push({
          type: 'low_stock',
          medicine_name: medicine,
          current_stock: currentStock,
          threshold: forecast.reorder_quantity * FORECASTING_CONSTANTS.LOW_STOCK_THRESHOLD,
          predicted_stockout_date: this.calculateStockoutDate(currentStock, dailyDemand),
          priority: currentStock < forecast.reorder_quantity * FORECASTING_CONSTANTS.CRITICAL_STOCK_THRESHOLD ? 'high' : 'medium',
          action_required: 'Immediate reorder required',
          supplier_info: this.getSupplierInfo(medicine)
        })
      }

      // Reorder Suggestion
      if (new Date(forecast.reorder_date) <= new Date()) {
        alerts.push({
          type: 'reorder_suggestion',
          medicine_name: medicine,
          current_stock: currentStock,
          threshold: forecast.reorder_quantity,
          priority: forecast.risk_level === 'high' ? 'high' : 'medium',
          action_required: `Reorder ${forecast.reorder_quantity} units`,
          supplier_info: this.getSupplierInfo(medicine)
        })
      }

      // Seasonal Surge Alert
      const seasonalPattern = this.detectSeasonality(medicine)
      if (seasonalPattern && seasonalPattern.demand_multiplier > 1.5) {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' })
        if (seasonalPattern.peak_months.includes(currentMonth)) {
          alerts.push({
            type: 'seasonal_surge',
            medicine_name: medicine,
            current_stock: currentStock,
            threshold: forecast.predicted_demand * seasonalPattern.demand_multiplier,
            priority: 'medium',
            action_required: `Prepare for ${Math.round(seasonalPattern.demand_multiplier * 100)}% demand increase`
          })
        }
      }
    })

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Waste Analytics - Simplified for current data structure
  calculateWasteAnalytics(): WasteAnalytics {
    // For demo purposes, simulate expired items based on purchase data
    // In real implementation, this would check actual expiry dates
    const simulatedExpiredItems = this.purchaseData.filter((_, index) => index % 10 === 0) // Simulate 10% expiry rate

    const totalExpiredValue = simulatedExpiredItems.reduce((sum, item) => sum + item.total_cost, 0)
    const totalExpiredQuantity = simulatedExpiredItems.reduce((sum, item) => sum + item.quantity_purchased, 0)

    const wasteByCategory: Record<string, number> = {}
    simulatedExpiredItems.forEach(item => {
      const category = this.getCategoryForMedicine(item.medicine_name)
      wasteByCategory[category] = (wasteByCategory[category] || 0) + item.total_cost
    })

    // Calculate preventable waste (items that could have been sold with FEFO)
    const preventableWaste = totalExpiredValue * FORECASTING_CONSTANTS.PREVENTABLE_WASTE_FACTOR

    // Environmental impact calculations
    const co2Equivalent = totalExpiredQuantity * FORECASTING_CONSTANTS.CO2_PER_UNIT
    const waterPollutionRisk = totalExpiredQuantity * FORECASTING_CONSTANTS.WATER_POLLUTION_FACTOR

    // Recovery opportunities
    const vendorReturns = simulatedExpiredItems
      .filter(item => this.hasReturnPolicy(item.medicine_name))
      .reduce((sum, item) => sum + item.total_cost * FORECASTING_CONSTANTS.VENDOR_RETURN_RECOVERY, 0)

    const ngoDonatableValue = simulatedExpiredItems
      .filter(item => this.isDonatable(item.medicine_name))
      .reduce((sum, item) => sum + item.total_cost * FORECASTING_CONSTANTS.NGO_DONATION_RECOVERY, 0)

    const discountSalesValue = totalExpiredValue * FORECASTING_CONSTANTS.DISCOUNT_SALES_RECOVERY

    return {
      total_expired_value: Math.round(totalExpiredValue),
      total_expired_quantity: totalExpiredQuantity,
      waste_by_category: wasteByCategory,
      preventable_waste: Math.round(preventableWaste),
      environmental_impact: {
        co2_equivalent: Math.round(co2Equivalent * 100) / 100,
        water_pollution_risk: Math.round(waterPollutionRisk * 100) / 100
      },
      recovery_opportunities: {
        vendor_returns: Math.round(vendorReturns),
        ngo_donations: Math.round(ngoDonatableValue),
        discount_sales: Math.round(discountSalesValue)
      }
    }
  }

  // Helper Methods
  private createEmptyForecast(medicine: string): DemandForecast {
    return {
      medicine_name: medicine,
      predicted_demand: 0,
      confidence_score: 0,
      reorder_quantity: 0,
      reorder_date: new Date().toISOString().split('T')[0],
      seasonality_factor: 1,
      trend_direction: 'stable',
      risk_level: 'high'
    }
  }

  private calculateFutureDate(daysAhead: number): Date {
    const futureDate = new Date()
    try {
      futureDate.setDate(futureDate.getDate() + daysAhead)
      // Validate the resulting date
      if (isNaN(futureDate.getTime())) {
        throw new Error('Invalid date calculation')
      }
      return futureDate
    } catch (error) {
      // Fallback to default date if calculation fails
      const fallbackDate = new Date()
      fallbackDate.setDate(fallbackDate.getDate() + FORECASTING_CONSTANTS.DEFAULT_REORDER_DAYS)
      return fallbackDate
    }
  }

  private getCurrentStock(medicine: string): number {
    const purchased = this.purchaseData
      .filter(p => p.medicine_name === medicine)
      .reduce((sum, p) => sum + p.quantity_purchased, 0)
    
    const sold = this.salesData
      .filter(s => s.medicine_name === medicine)
      .reduce((sum, s) => sum + s.quantity_sold, 0)
    
    return Math.max(0, purchased - sold)
  }

  private getCategoryForMedicine(medicine: string): string {
    const salesRecord = this.salesData.find(s => s.medicine_name === medicine)
    return salesRecord?.category || 'General'
  }

  private getSupplierInfo(medicine: string): string {
    const purchaseRecord = this.purchaseData
      .filter(p => p.medicine_name === medicine)
      .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0]
    
    return purchaseRecord?.supplier || 'Unknown Supplier'
  }

  private calculateStockoutDate(currentStock: number, dailyDemand: number): string {
    if (dailyDemand <= 0) return new Date().toISOString().split('T')[0]
    const daysUntilStockout = Math.floor(currentStock / dailyDemand)
    const stockoutDate = new Date()
    stockoutDate.setDate(stockoutDate.getDate() + daysUntilStockout)
    return stockoutDate.toISOString().split('T')[0]
  }

  private hasReturnPolicy(medicine: string): boolean {
    // Simplified logic - in real implementation, this would check actual return policies
    return !medicine.toLowerCase().includes('syrup') && !medicine.toLowerCase().includes('injection')
  }

  private isDonatable(medicine: string): boolean {
    // Simplified logic - basic medicines are usually donatable
    const donatableKeywords = ['paracetamol', 'vitamin', 'ors', 'iron', 'calcium']
    return donatableKeywords.some(keyword => medicine.toLowerCase().includes(keyword))
  }
}

// Data Loading Functions with improved error handling
export async function loadSalesData(): Promise<SalesRecord[]> {
  try {
    const response = await fetch('/datasets/sales_data.csv')
    if (!response.ok) {
      throw new Error(`Failed to fetch sales data: ${response.status} ${response.statusText}`)
    }
    const csvText = await response.text()
    if (!csvText.trim()) {
      throw new Error('Sales data file is empty')
    }
    return parseCsvToSalesRecords(csvText)
  } catch (error) {
    console.error('Error loading sales data:', error)
    // Return empty array instead of throwing to prevent app crashes
    return []
  }
}

export async function loadPurchaseData(): Promise<PurchaseRecord[]> {
  try {
    const response = await fetch('/datasets/purchase_data.csv')
    if (!response.ok) {
      throw new Error(`Failed to fetch purchase data: ${response.status} ${response.statusText}`)
    }
    const csvText = await response.text()
    if (!csvText.trim()) {
      throw new Error('Purchase data file is empty')
    }
    return parseCsvToPurchaseRecords(csvText)
  } catch (error) {
    console.error('Error loading purchase data:', error)
    // Return empty array instead of throwing to prevent app crashes
    return []
  }
}

// CSV Parsing Functions - Simplified and matching actual data structure
function parseCsvToSalesRecords(csvText: string): SalesRecord[] {
  try {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []
    
    return lines.slice(1).map(line => {
      const values = line.split(',')
      return {
        sale_date: values[0]?.trim() || '',
        medicine_name: values[1]?.trim() || '',
        quantity_sold: parseInt(values[2]) || 0,
        unit_price: parseFloat(values[3]) || 0,
        total_amount: parseFloat(values[4]) || 0,
        customer_type: (values[5]?.trim() as 'walk-in' | 'prescription') || 'walk-in',
        category: values[6]?.trim() || 'General'
      }
    }).filter(record => record.medicine_name && record.quantity_sold > 0)
  } catch (error) {
    console.error('Error parsing sales CSV:', error)
    return []
  }
}

function parseCsvToPurchaseRecords(csvText: string): PurchaseRecord[] {
  try {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []
    
    return lines.slice(1).map(line => {
      const values = line.split(',')
      return {
        purchase_date: values[0]?.trim() || '',
        medicine_name: values[1]?.trim() || '',
        quantity_purchased: parseInt(values[2]) || 0,
        unit_cost: parseFloat(values[3]) || 0,
        total_cost: parseFloat(values[4]) || 0,
        supplier: values[5]?.trim() || '',
        batch_no: values[6]?.trim() || ''
      }
    }).filter(record => record.medicine_name && record.quantity_purchased > 0)
  } catch (error) {
    console.error('Error parsing purchase CSV:', error)
    return []
  }
}

// Demo data generator for fallback
function generateDemoSalesData(): SalesRecord[] {
  return [
    {
      sale_date: '2024-12-10',
      medicine_name: 'Paracetamol 500mg',
      quantity_sold: 5,
      unit_price: 15.50,
      total_amount: 77.50,
      customer_type: 'walk-in',
      category: 'Pain Relief'
    },
    {
      sale_date: '2024-12-09',
      medicine_name: 'Amoxicillin 250mg',
      quantity_sold: 3,
      unit_price: 45.00,
      total_amount: 135.00,
      customer_type: 'prescription',
      category: 'Antibiotic'
    }
  ]
}