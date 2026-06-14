// Viala Demand Forecasting Engine
// Uses Moving Average with Seasonal Multipliers for predictive analytics

import { InventoryItem } from './db'

export type SeasonalMode = 'normal' | 'monsoon' | 'summer' | 'winter'

export interface ForecastConfig {
  mode: SeasonalMode
  lookbackMonths: number
  confidenceLevel: number
}

export interface SalesHistory {
  med_name: string
  month: string
  units_sold: number
  revenue: number
}

export interface ForecastResult {
  med_name: string
  currentStock: number
  predictedDemand: number
  suggestedReorder: number
  confidence: number
  seasonalFactor: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  reasoning: string
}

export interface ReorderSuggestion {
  med_name: string
  currentStock: number
  suggestedQuantity: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  estimatedDaysUntilStockout: number
  potentialRevenueLoss: number
  reasoning: string
}

// Seasonal multipliers for different medicine categories
const SEASONAL_MULTIPLIERS: Record<SeasonalMode, Record<string, number>> = {
  normal: {
    'Analgesic': 1.0,
    'Cough/Cold': 1.0,
    'Hydration': 1.0,
    'Antibiotic': 1.0,
    'Vitamin': 1.0,
    'Antihistamine': 1.0,
    'Antacid': 1.0,
    'Diabetes': 1.0,
    'default': 1.0
  },
  monsoon: {
    'Analgesic': 2.5, // Paracetamol, Ibuprofen for fever/body ache
    'Cough/Cold': 3.2, // High demand during monsoon
    'Hydration': 2.8, // ORS for dehydration from illness
    'Antibiotic': 2.1, // Infections increase
    'Antihistamine': 1.8, // Allergies from humidity
    'Vitamin': 1.3, // Immunity boosters
    'Antacid': 1.1,
    'Diabetes': 1.0,
    'default': 1.2
  },
  summer: {
    'Hydration': 3.5, // Peak ORS demand
    'Antihistamine': 2.2, // Allergies
    'Vitamin': 1.4, // Heat stress
    'Analgesic': 1.6, // Headaches from heat
    'Antacid': 1.3, // Digestive issues
    'Cough/Cold': 0.7, // Lower demand
    'Antibiotic': 0.9,
    'Diabetes': 1.0,
    'default': 1.0
  },
  winter: {
    'Cough/Cold': 2.8, // Peak cold/flu season
    'Analgesic': 2.2, // Fever, body ache
    'Vitamin': 2.0, // Immunity
    'Antibiotic': 1.8, // Respiratory infections
    'Hydration': 0.8, // Lower dehydration
    'Antihistamine': 0.9,
    'Antacid': 1.1,
    'Diabetes': 1.0,
    'default': 1.1
  }
}

// Medicine-specific multipliers (overrides category multipliers)
const MEDICINE_SPECIFIC_MULTIPLIERS: Record<SeasonalMode, Record<string, number>> = {
  normal: {},
  monsoon: {
    'ORS Sachets': 2.5,
    'Paracetamol 500mg': 2.5,
    'Cough Syrup 100ml': 3.0,
    'Amoxicillin 250mg': 2.2
  },
  summer: {
    'ORS Sachets': 3.5,
    'Paracetamol 500mg': 1.8
  },
  winter: {
    'Cough Syrup 100ml': 3.2,
    'Paracetamol 500mg': 2.4,
    'Amoxicillin 250mg': 2.0
  }
}

// Generate mock historical sales data (in production, this would come from database)
function generateMockSalesHistory(inventory: InventoryItem[]): SalesHistory[] {
  const history: SalesHistory[] = []
  const months = ['2024-09', '2024-10', '2024-11'] // Last 3 months
  
  inventory.forEach(item => {
    months.forEach(month => {
      // Generate realistic sales based on current stock and category
      let baseSales = Math.floor(item.quantity * 0.15) // 15% monthly turnover
      
      // Add some randomness
      baseSales += Math.floor(Math.random() * 20) - 10
      baseSales = Math.max(5, baseSales) // Minimum 5 units
      
      history.push({
        med_name: item.med_name ?? 'Unknown Medicine',
        month,
        units_sold: baseSales,
        revenue: baseSales * item.price
      })
    })
  })
  
  return history
}

// Calculate moving average from sales history
function calculateMovingAverage(salesHistory: SalesHistory[], medName: string, months: number = 3): number {
  const medSales = salesHistory
    .filter(sale => sale.med_name === medName)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, months)
  
  if (medSales.length === 0) return 0
  
  const totalSales = medSales.reduce((sum, sale) => sum + sale.units_sold, 0)
  return Math.round(totalSales / medSales.length)
}

// Get seasonal multiplier for a medicine
function getSeasonalMultiplier(medName: string, category: string, mode: SeasonalMode): number {
  // Check medicine-specific multipliers first
  const medicineMultiplier = MEDICINE_SPECIFIC_MULTIPLIERS[mode][medName]
  if (medicineMultiplier) return medicineMultiplier
  
  // Fall back to category multiplier
  const categoryMultiplier = SEASONAL_MULTIPLIERS[mode][category]
  if (categoryMultiplier) return categoryMultiplier
  
  // Default multiplier
  return SEASONAL_MULTIPLIERS[mode]['default']
}

// Calculate risk level based on stock vs predicted demand
function calculateRiskLevel(currentStock: number, predictedDemand: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  const ratio = currentStock / predictedDemand
  
  if (ratio < 0.5) return 'HIGH'
  if (ratio < 1.0) return 'MEDIUM'
  return 'LOW'
}

// Generate reasoning text for forecast
function generateReasoning(
  medName: string, 
  category: string, 
  mode: SeasonalMode, 
  seasonalFactor: number,
  riskLevel: string
): string {
  const reasons = []
  
  if (mode === 'monsoon') {
    if (category === 'Cough/Cold') reasons.push('High cold/flu risk during monsoon')
    if (category === 'Hydration') reasons.push('Increased dehydration from illness')
    if (category === 'Analgesic') reasons.push('Fever and body ache common in monsoon')
    if (medName.includes('ORS')) reasons.push('Essential for monsoon-related dehydration')
    if (medName.includes('Paracetamol')) reasons.push('Primary fever reducer during monsoon')
  }
  
  if (seasonalFactor > 2.0) reasons.push('Peak seasonal demand expected')
  else if (seasonalFactor > 1.5) reasons.push('Elevated seasonal demand')
  else if (seasonalFactor < 0.9) reasons.push('Lower seasonal demand')
  
  if (riskLevel === 'HIGH') reasons.push('Stock critically low vs demand')
  else if (riskLevel === 'MEDIUM') reasons.push('Stock may run low')
  
  return reasons.length > 0 ? reasons.join('. ') + '.' : 'Standard demand pattern expected.'
}

// Main forecasting engine class
export class ForecastingEngine {
  private config: ForecastConfig
  private salesHistory: SalesHistory[]
  
  constructor(config: ForecastConfig = {
    mode: 'normal',
    lookbackMonths: 3,
    confidenceLevel: 0.85
  }) {
    this.config = config
    this.salesHistory = []
  }
  
  // Initialize with inventory data
  initialize(inventory: InventoryItem[]) {
    this.salesHistory = generateMockSalesHistory(inventory)
  }
  
  // Update seasonal mode
  setSeasonalMode(mode: SeasonalMode) {
    this.config.mode = mode
  }
  
  // Generate forecast for all medicines
  generateForecast(inventory: InventoryItem[]): ForecastResult[] {
    if (this.salesHistory.length === 0) {
      this.initialize(inventory)
    }
    
    return inventory.map(item => {
      const medName = item.med_name ?? 'Unknown Medicine'
      const category = item.category ?? 'General'
      const movingAverage = calculateMovingAverage(this.salesHistory, medName, this.config.lookbackMonths)
      const seasonalFactor = getSeasonalMultiplier(medName, category, this.config.mode)
      const predictedDemand = Math.round(movingAverage * seasonalFactor)
      const suggestedReorder = Math.max(0, predictedDemand - item.quantity)
      const riskLevel = calculateRiskLevel(item.quantity, predictedDemand)
      
      return {
        med_name: medName,
        currentStock: item.quantity,
        predictedDemand,
        suggestedReorder,
        confidence: this.config.confidenceLevel,
        seasonalFactor,
        riskLevel,
        reasoning: generateReasoning(medName, category, this.config.mode, seasonalFactor, riskLevel)
      }
    })
  }
  
  // Generate reorder suggestions (filtered and prioritized)
  generateReorderSuggestions(inventory: InventoryItem[]): ReorderSuggestion[] {
    const forecasts = this.generateForecast(inventory)
    
    return forecasts
      .filter(forecast => forecast.suggestedReorder > 0) // Only items that need reordering
      .map(forecast => {
        const item = inventory.find(i => i.med_name === forecast.med_name)!
        const daysUntilStockout = Math.floor((forecast.currentStock / forecast.predictedDemand) * 30)
        const potentialRevenueLoss = forecast.suggestedReorder * item.price
        
        let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
        if (daysUntilStockout < 7) urgency = 'CRITICAL'
        else if (daysUntilStockout < 14) urgency = 'HIGH'
        else if (daysUntilStockout < 21) urgency = 'MEDIUM'
        else urgency = 'LOW'
        
        return {
          med_name: forecast.med_name,
          currentStock: forecast.currentStock,
          suggestedQuantity: forecast.suggestedReorder,
          urgency,
          estimatedDaysUntilStockout: Math.max(1, daysUntilStockout),
          potentialRevenueLoss,
          reasoning: forecast.reasoning
        }
      })
      .sort((a, b) => {
        // Sort by urgency first, then by potential revenue loss
        const urgencyOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
        const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
        if (urgencyDiff !== 0) return urgencyDiff
        return b.potentialRevenueLoss - a.potentialRevenueLoss
      })
  }
  
  // Get summary statistics
  getSummaryStats(inventory: InventoryItem[]) {
    const forecasts = this.generateForecast(inventory)
    const reorderSuggestions = this.generateReorderSuggestions(inventory)
    
    const totalPredictedDemand = forecasts.reduce((sum, f) => sum + f.predictedDemand, 0)
    const totalCurrentStock = forecasts.reduce((sum, f) => sum + f.currentStock, 0)
    const totalReorderValue = reorderSuggestions.reduce((sum, r) => sum + r.potentialRevenueLoss, 0)
    
    const highRiskItems = forecasts.filter(f => f.riskLevel === 'HIGH').length
    const mediumRiskItems = forecasts.filter(f => f.riskLevel === 'MEDIUM').length
    
    return {
      totalMedicines: inventory.length,
      totalPredictedDemand,
      totalCurrentStock,
      stockCoverageRatio: totalCurrentStock / totalPredictedDemand,
      itemsNeedingReorder: reorderSuggestions.length,
      totalReorderValue,
      highRiskItems,
      mediumRiskItems,
      seasonalMode: this.config.mode,
      forecastAccuracy: this.config.confidenceLevel
    }
  }
}

// Utility functions for UI components
export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200'
    case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'HIGH': return 'text-red-600'
    case 'MEDIUM': return 'text-amber-600'
    case 'LOW': return 'text-green-600'
    default: return 'text-gray-600'
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Create singleton instance
export const forecastingEngine = new ForecastingEngine()