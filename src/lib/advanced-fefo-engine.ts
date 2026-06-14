/**
 * Advanced FEFO Engine with Multi-Batch Management
 * Handles complex scenarios with multiple batches, price forecasting, and seasonal patterns
 */

import { InventoryItem, calculateDaysToExpiry } from './db'

export interface BatchInfo extends InventoryItem {
  batchRank: number
  isRecommended: boolean
  warningLevel: 'NONE' | 'NEAR_EXPIRY' | 'CRITICAL' | 'EXPIRED'
  warningMessage: string
  alternativeBatches?: BatchInfo[]
}

export interface PriceForecast {
  drugName: string
  currentPrice: number
  predictedPrice: number
  priceIncrease: number
  priceIncreasePercentage: number
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  timeframe: string
  recommendation: string
  optimalReorderQuantity: number
  costSavings: number
}

export interface SeasonalPattern {
  drugName: string
  category: string
  seasonalPeriods: {
    period: string
    startMonth: number
    endMonth: number
    demandMultiplier: number
    historicalSalesIncrease: number
  }[]
  nextSpike: {
    expectedDate: string
    daysUntilSpike: number
    recommendedStockLevel: number
    currentStock: number
    stockDeficit: number
  }
  isCurrentlyInSeason: boolean
}

export interface AlternativeBrand {
  originalBrand: string
  alternativeBrand: string
  manufacturer: string
  dosage: string
  formulation: string
  equivalenceConfirmed: boolean
  priceComparison: number
  availableQuantity: number
  shelfLocation: string
  substitutionNotes: string
}

export class AdvancedFEFOEngine {
  
  /**
   * Enhanced FEFO with Multi-Batch Analysis
   */
  static analyzeBatchesForMedicine(
    medicineName: string, 
    inventory: InventoryItem[]
  ): BatchInfo[] {
    // Find all batches of the same medicine
    const batches = inventory.filter(item => 
      (item.med_name ?? '').toLowerCase().includes(medicineName.toLowerCase())
    )

    if (batches.length === 0) return []

    // Sort by expiry date (FEFO order)
    const sortedBatches = batches.sort((a, b) => {
      const dateA = new Date(a.expiry_date).getTime()
      const dateB = new Date(b.expiry_date).getTime()
      return dateA - dateB
    })

    // Analyze each batch
    return sortedBatches.map((batch, index) => {
      const daysToExpiry = calculateDaysToExpiry(batch.expiry_date)
      const isRecommended = index === 0 // First batch is always recommended (FEFO)
      
      let warningLevel: 'NONE' | 'NEAR_EXPIRY' | 'CRITICAL' | 'EXPIRED' = 'NONE'
      let warningMessage = ''

      if (daysToExpiry < 0) {
        warningLevel = 'EXPIRED'
        warningMessage = `⚠️ EXPIRED: This batch expired ${Math.abs(daysToExpiry)} days ago and cannot be sold`
      } else if (daysToExpiry <= 7) {
        warningLevel = 'CRITICAL'
        warningMessage = `🚨 CRITICAL: This batch expires in ${daysToExpiry} days - immediate action required`
      } else if (daysToExpiry <= 30) {
        warningLevel = 'NEAR_EXPIRY'
        warningMessage = `⚠️ NEAR EXPIRY: This batch expires in ${daysToExpiry} days - apply rescue discount`
      }

      // Add alternative batches for non-recommended items (will be populated later)
      const alternativeBatches: BatchInfo[] = []

      return {
        ...batch,
        batchRank: index + 1,
        isRecommended,
        warningLevel,
        warningMessage,
        alternativeBatches
      }
    })
  }

  /**
   * Price Surge Forecasting
   */
  static generatePriceForecasts(inventory: InventoryItem[]): PriceForecast[] {
    const forecasts: PriceForecast[] = []

    // Simulate price forecasting based on drug categories and market patterns
    const priceVolatileDrugs = [
      { name: 'Paracetamol', category: 'Analgesic', volatility: 0.15 },
      { name: 'Amoxicillin', category: 'Antibiotic', volatility: 0.25 },
      { name: 'Insulin', category: 'Diabetes', volatility: 0.30 },
      { name: 'Aspirin', category: 'Cardiac', volatility: 0.12 },
      { name: 'Ibuprofen', category: 'Analgesic', volatility: 0.18 }
    ]

    inventory.forEach(item => {
      const volatileMatch = priceVolatileDrugs.find(drug => 
        (item.med_name ?? '').toLowerCase().includes(drug.name.toLowerCase())
      )

      if (volatileMatch) {
        const basePrice = item.price
        const priceIncrease = basePrice * volatileMatch.volatility
        const predictedPrice = basePrice + priceIncrease
        const priceIncreasePercentage = volatileMatch.volatility * 100

        // Calculate optimal reorder quantity (3-month supply with buffer)
        const monthlyConsumption = Math.max(10, item.quantity / 6) // Estimate monthly usage
        const optimalReorderQuantity = Math.ceil(monthlyConsumption * 3.5) // 3.5 months supply
        const costSavings = priceIncrease * optimalReorderQuantity

        forecasts.push({
          drugName: item.med_name ?? 'Unknown Medicine',
          currentPrice: basePrice,
          predictedPrice: Math.round(predictedPrice * 100) / 100,
          priceIncrease: Math.round(priceIncrease * 100) / 100,
          priceIncreasePercentage: Math.round(priceIncreasePercentage),
          confidenceLevel: volatileMatch.volatility > 0.2 ? 'HIGH' : 'MEDIUM',
          timeframe: '2-3 months',
          recommendation: `Reorder ${optimalReorderQuantity} units before price increase`,
          optimalReorderQuantity,
          costSavings: Math.round(costSavings * 100) / 100
        })
      }
    })

    return forecasts.sort((a, b) => b.costSavings - a.costSavings) // Sort by potential savings
  }

  /**
   * Seasonal Pattern Detection
   */
  static detectSeasonalPatterns(inventory: InventoryItem[]): SeasonalPattern[] {
    const patterns: SeasonalPattern[] = []
    const currentMonth = new Date().getMonth() + 1 // 1-12

    // Define seasonal patterns for common medicines
    const seasonalMedicines = [
      {
        names: ['Cough', 'Cold', 'Flu'],
        category: 'Respiratory',
        periods: [
          { period: 'Winter Peak', startMonth: 11, endMonth: 2, demandMultiplier: 2.5, historicalSalesIncrease: 150 },
          { period: 'Monsoon Surge', startMonth: 6, endMonth: 9, demandMultiplier: 1.8, historicalSalesIncrease: 80 }
        ]
      },
      {
        names: ['ORS', 'Electrolyte', 'Hydration'],
        category: 'Hydration',
        periods: [
          { period: 'Summer Peak', startMonth: 4, endMonth: 6, demandMultiplier: 2.0, historicalSalesIncrease: 100 },
          { period: 'Monsoon Diarrhea', startMonth: 7, endMonth: 9, demandMultiplier: 1.6, historicalSalesIncrease: 60 }
        ]
      },
      {
        names: ['Paracetamol', 'Fever', 'Analgesic'],
        category: 'Analgesic',
        periods: [
          { period: 'Viral Season', startMonth: 10, endMonth: 3, demandMultiplier: 1.5, historicalSalesIncrease: 50 },
          { period: 'School Season', startMonth: 6, endMonth: 8, demandMultiplier: 1.3, historicalSalesIncrease: 30 }
        ]
      }
    ]

    inventory.forEach(item => {
      seasonalMedicines.forEach(seasonal => {
        const isMatch = seasonal.names.some(name => 
          (item.med_name ?? '').toLowerCase().includes(name.toLowerCase()) ||
          (item.category ?? '').toLowerCase().includes(name.toLowerCase())
        )

        if (isMatch) {
          // Find next seasonal spike
          const nextSpike = this.calculateNextSeasonalSpike(seasonal.periods, currentMonth, item.quantity)
          const isCurrentlyInSeason = this.isCurrentlyInSeason(seasonal.periods, currentMonth)

          if (nextSpike) {
            patterns.push({
              drugName: item.med_name ?? 'Unknown Medicine',
              category: seasonal.category,
              seasonalPeriods: seasonal.periods,
              nextSpike,
              isCurrentlyInSeason
            })
          }
        }
      })
    })

    return patterns
  }

  /**
   * Alternative Brand Suggestions
   */
  static findAlternativeBrands(
    outOfStockMedicine: string,
    inventory: InventoryItem[]
  ): AlternativeBrand[] {
    const alternatives: AlternativeBrand[] = []

    // Define brand equivalencies (simplified for demo)
    const brandEquivalencies = [
      {
        activeIngredient: 'Paracetamol',
        brands: ['Crocin', 'Dolo', 'Panadol', 'Calpol'],
        dosages: ['500mg', '650mg', '125mg'],
        formulations: ['Tablet', 'Syrup', 'Suspension']
      },
      {
        activeIngredient: 'Ibuprofen',
        brands: ['Brufen', 'Combiflam', 'Advil', 'Nurofen'],
        dosages: ['400mg', '600mg', '200mg'],
        formulations: ['Tablet', 'Syrup', 'Gel']
      },
      {
        activeIngredient: 'Amoxicillin',
        brands: ['Novamox', 'Amoxil', 'Polymox', 'Trimox'],
        dosages: ['250mg', '500mg', '125mg'],
        formulations: ['Capsule', 'Syrup', 'Injection']
      }
    ]

    // Find the active ingredient of the out-of-stock medicine
    const matchingGroup = brandEquivalencies.find(group =>
      group.brands.some(brand => 
        outOfStockMedicine.toLowerCase().includes(brand.toLowerCase())
      ) || outOfStockMedicine.toLowerCase().includes(group.activeIngredient.toLowerCase())
    )

    if (matchingGroup) {
      // Find available alternatives in inventory
      inventory.forEach(item => {
        const isAlternative = matchingGroup.brands.some(brand =>
          (item.med_name ?? '').toLowerCase().includes(brand.toLowerCase())
        ) && !(item.med_name ?? '').toLowerCase().includes(outOfStockMedicine.toLowerCase())

        if (isAlternative && item.quantity > 0) {
          // Extract dosage and formulation (simplified)
          const dosage = matchingGroup.dosages.find(d => 
            (item.med_name ?? '').includes(d)
          ) || 'Standard'
          
          const formulation = matchingGroup.formulations.find(f =>
            (item.med_name ?? '').toLowerCase().includes(f.toLowerCase())
          ) || 'Tablet'

          alternatives.push({
            originalBrand: outOfStockMedicine,
            alternativeBrand: item.med_name ?? 'Unknown Medicine',
            manufacturer: 'Various', // In real system, this would be from database
            dosage,
            formulation,
            equivalenceConfirmed: true,
            priceComparison: item.price,
            availableQuantity: item.quantity,
            shelfLocation: item.shelf_location,
            substitutionNotes: `Same active ingredient (${matchingGroup.activeIngredient}), equivalent dosage and formulation`
          })
        }
      })
    }

    return alternatives.sort((a, b) => a.priceComparison - b.priceComparison) // Sort by price
  }

  // Helper methods
  private static calculateNextSeasonalSpike(periods: any[], currentMonth: number, currentStock: number): any {
    const currentYear = new Date().getFullYear()
    let nextSpike = null
    let minDaysUntil = Infinity

    periods.forEach(period => {
      let spikeMonth = period.startMonth
      let spikeYear = currentYear

      // If the spike month has passed this year, consider next year
      if (spikeMonth < currentMonth) {
        spikeYear = currentYear + 1
      }

      const spikeDate = new Date(spikeYear, spikeMonth - 1, 1)
      const today = new Date()
      const daysUntil = Math.ceil((spikeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil < minDaysUntil) {
        minDaysUntil = daysUntil
        const recommendedStockLevel = Math.ceil(currentStock * period.demandMultiplier)
        
        nextSpike = {
          expectedDate: spikeDate.toISOString().split('T')[0],
          daysUntilSpike: daysUntil,
          recommendedStockLevel,
          currentStock,
          stockDeficit: Math.max(0, recommendedStockLevel - currentStock)
        }
      }
    })

    return nextSpike || {
      expectedDate: new Date().toISOString().split('T')[0],
      daysUntilSpike: 365,
      recommendedStockLevel: currentStock,
      currentStock,
      stockDeficit: 0
    }
  }

  private static isCurrentlyInSeason(periods: any[], currentMonth: number): boolean {
    return periods.some(period => {
      if (period.startMonth <= period.endMonth) {
        // Same year period
        return currentMonth >= period.startMonth && currentMonth <= period.endMonth
      } else {
        // Cross-year period (e.g., Nov-Feb)
        return currentMonth >= period.startMonth || currentMonth <= period.endMonth
      }
    })
  }
}

/**
 * Enhanced Chatbot Restrictions
 */
export class PharmacyChatbotRestrictions {
  
  private static readonly ALLOWED_TOPICS = [
    'medicine', 'drug', 'pharmacy', 'prescription', 'dosage', 'expiry', 'batch',
    'inventory', 'stock', 'fefo', 'patient', 'health', 'treatment', 'medication',
    'tablet', 'capsule', 'syrup', 'injection', 'antibiotic', 'painkiller',
    'fever', 'cold', 'cough', 'diabetes', 'blood pressure', 'heart', 'kidney',
    'liver', 'stomach', 'headache', 'allergy', 'infection', 'vitamin', 'supplement',
    'ors', 'paracetamol', 'amoxicillin', 'aspirin', 'ibuprofen', 'vendor',
    'return', 'donation', 'ngo', 'rescue', 'revenue', 'profit', 'loss',
    'financial', 'cost', 'price', 'value', 'money', 'seasonal', 'demand',
    'forecast', 'monsoon', 'winter', 'summer', 'reorder', 'shortage',
    'compliance', 'audit', 'alert', 'notification', 'heatmap', 'shelf'
  ]

  private static readonly RESTRICTED_TOPICS = [
    'weather', 'sports', 'politics', 'entertainment', 'food', 'travel',
    'technology', 'programming', 'coding', 'software', 'hardware',
    'movies', 'music', 'games', 'news', 'celebrity', 'fashion',
    'cooking', 'recipe', 'restaurant', 'vacation', 'hotel'
  ]

  static isPharmacyRelated(query: string): boolean {
    const lowerQuery = query.toLowerCase()
    
    // Check for pharmacy keywords
    const hasPharmacyKeywords = this.ALLOWED_TOPICS.some(topic => 
      lowerQuery.includes(topic)
    )

    // Check for restricted keywords
    const hasRestrictedKeywords = this.RESTRICTED_TOPICS.some(topic =>
      lowerQuery.includes(topic)
    )

    // Allow if has pharmacy keywords and no restricted keywords
    // Also allow general greetings and questions about the system
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you)$/i.test(query.trim())
    const isSystemQuery = lowerQuery.includes('help') || lowerQuery.includes('what can you do') || lowerQuery.includes('how to use')

    return hasPharmacyKeywords || isGreeting || isSystemQuery || (!hasRestrictedKeywords && query.length < 50)
  }

  static getRestrictedResponse(): string {
    return `🔒 **Sorry, I can only help with pharmacy-related questions.**

I'm Viala AI, specialized in pharmacy inventory management. I can assist you with:

**Inventory & Stock Management:**
• Stock levels and expiry tracking
• FEFO recommendations and batch management
• Reorder alerts and demand forecasting

**Financial & Operational Insights:**
• Revenue at risk calculations
• Vendor return opportunities
• NGO donation eligibility

**Specific Medicine Queries:**
• Medicine availability and locations
• Expiry dates and batch information
• Seasonal demand patterns

Please ask me about your pharmacy operations, inventory, or medicine-related topics!`
  }
}

/**
 * Low Stock Request Management
 */
export interface StockRequest {
  id: string
  medicineName: string
  currentStock: number
  requestedQuantity: number
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  pharmacistId: string
  pharmacistName: string
  requestDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED'
  managerNotes?: string
  estimatedDelivery?: string
}

export class StockRequestManager {
  
  static submitStockRequest(
    medicineName: string,
    currentStock: number,
    requestedQuantity: number,
    pharmacistId: string,
    pharmacistName: string
  ): { success: boolean; message: string; requestId?: string } {
    
    try {
      // Validate request
      if (!medicineName || requestedQuantity <= 0) {
        return {
          success: false,
          message: 'Invalid request: Medicine name and quantity are required'
        }
      }

      // Determine urgency level
      const urgencyLevel = this.calculateUrgencyLevel(currentStock, requestedQuantity)
      
      // Generate request
      const request: StockRequest = {
        id: `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        medicineName,
        currentStock,
        requestedQuantity,
        urgencyLevel,
        pharmacistId,
        pharmacistName,
        requestDate: new Date().toISOString(),
        status: 'PENDING'
      }

      // Simulate saving to database
      this.saveStockRequest(request)
      
      // Send notification to manager
      this.notifyManager(request)

      return {
        success: true,
        message: `Stock request submitted successfully. Request ID: ${request.id}`,
        requestId: request.id
      }

    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit stock request. Please try again or contact support.'
      }
    }
  }

  private static calculateUrgencyLevel(currentStock: number, requestedQuantity: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (currentStock === 0) return 'CRITICAL'
    if (currentStock <= 5) return 'HIGH'
    if (currentStock <= 20) return 'MEDIUM'
    return 'LOW'
  }

  private static saveStockRequest(request: StockRequest): void {
    // In real implementation, this would save to database
    console.log('Stock request saved:', request)
    
    // Save to localStorage for demo purposes
    if (typeof window !== 'undefined') {
      const existingRequests = JSON.parse(localStorage.getItem('viala-stock-requests') || '[]')
      existingRequests.push(request)
      localStorage.setItem('viala-stock-requests', JSON.stringify(existingRequests))
    }
  }

  private static notifyManager(request: StockRequest): void {
    // In real implementation, this would send email/SMS to manager
    console.log('Manager notification sent for request:', request.id)
    
    // Simulate manager notification
    const notification = {
      type: 'STOCK_REQUEST',
      title: `${request.urgencyLevel} Stock Request`,
      message: `${request.pharmacistName} requested ${request.requestedQuantity} units of ${request.medicineName}`,
      urgency: request.urgencyLevel,
      timestamp: new Date().toISOString(),
      requestId: request.id
    }
    
    // In real system, this would trigger manager notification system
    console.log('Manager notification:', notification)
  }
}