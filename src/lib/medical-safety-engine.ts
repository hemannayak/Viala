/**
 * Medical Safety & Compliance Engine
 * Enforces strict medical safety, legal compliance, and transparency
 */

export interface MedicineStatus {
  id: string
  med_name: string
  batch_no: string
  expiry_date: string
  quantity: number
  price: number
  shelf_location: string
  category: string
  is_seasonal: boolean
  created_at: string
}

export interface SafetyClassification {
  status: 'HEALTHY' | 'NEAR_EXPIRY' | 'BLACKLISTED' | 'EXPIRED'
  daysToExpiry: number
  zone: 'GREEN' | 'YELLOW' | 'RED' | 'BLACK'
  canSell: boolean
  canDonate: boolean
  requiresAction: boolean
  actionType?: 'FEFO_PRIORITY' | 'DISCOUNT_APPLY' | 'BLACKLIST' | 'QUARANTINE' | 'DISPOSE'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface DynamicPricing {
  basePrice: number
  discountPercentage: number
  finalPrice: number
  discountReason: string
  isRescueItem: boolean
  transparencyMessage: string
}

export interface DisposalWorkflow {
  batchId: string
  disposalType: 'RETURN_TO_MANUFACTURER' | 'CERTIFIED_DISPOSAL'
  facilityName?: string
  facilityLocation?: string
  creditRecovery?: number
  disposalCost?: number
  environmentalImpact: number
  sustainabilityScoreImpact: number
}

export class MedicalSafetyEngine {
  
  /**
   * Core Safety Classification
   * Determines the safety status and allowed actions for a medicine batch
   */
  static classifyMedicine(medicine: MedicineStatus): SafetyClassification {
    const daysToExpiry = this.calculateDaysToExpiry(medicine.expiry_date)
    
    // EXPIRED - Immediate quarantine
    if (daysToExpiry < 0) {
      return {
        status: 'EXPIRED',
        daysToExpiry,
        zone: 'BLACK',
        canSell: false,
        canDonate: false,
        requiresAction: true,
        actionType: 'QUARANTINE',
        riskLevel: 'CRITICAL'
      }
    }
    
    // BLACKLISTED - 7 days before expiry
    if (daysToExpiry <= 7) {
      return {
        status: 'BLACKLISTED',
        daysToExpiry,
        zone: 'BLACK',
        canSell: false,
        canDonate: false,
        requiresAction: true,
        actionType: 'BLACKLIST',
        riskLevel: 'CRITICAL'
      }
    }
    
    // NEAR-EXPIRY - Rescue mode (8-30 days)
    if (daysToExpiry <= 30) {
      return {
        status: 'NEAR_EXPIRY',
        daysToExpiry,
        zone: 'RED',
        canSell: true,
        canDonate: daysToExpiry > 7, // Can donate only before blacklist window
        requiresAction: true,
        actionType: 'FEFO_PRIORITY',
        riskLevel: 'HIGH'
      }
    }
    
    // HEALTHY - Normal operations
    return {
      status: 'HEALTHY',
      daysToExpiry,
      zone: daysToExpiry <= 90 ? 'YELLOW' : 'GREEN',
      canSell: true,
      canDonate: true,
      requiresAction: false,
      riskLevel: daysToExpiry <= 90 ? 'MEDIUM' : 'LOW'
    }
  }

  /**
   * Dynamic Pricing Engine
   * Computes real-time discounts without modifying base price
   */
  static calculateDynamicPricing(medicine: MedicineStatus): DynamicPricing {
    const classification = this.classifyMedicine(medicine)
    const basePrice = medicine.price
    
    // No discount for healthy items
    if (classification.status === 'HEALTHY') {
      return {
        basePrice,
        discountPercentage: 0,
        finalPrice: basePrice,
        discountReason: 'No discount applied',
        isRescueItem: false,
        transparencyMessage: 'Regular pricing'
      }
    }
    
    // Dynamic discount based on days to expiry
    let discountPercentage = 0
    let discountReason = ''
    let transparencyMessage = ''
    
    if (classification.status === 'NEAR_EXPIRY') {
      const { daysToExpiry } = classification
      
      // Progressive discount: higher discount as expiry approaches
      if (daysToExpiry <= 15) {
        discountPercentage = 40 // 40% discount for critical items
        discountReason = 'Critical expiry discount'
      } else if (daysToExpiry <= 25) {
        discountPercentage = 25 // 25% discount for urgent items
        discountReason = 'Urgent expiry discount'
      } else {
        discountPercentage = 15 // 15% discount for near-expiry items
        discountReason = 'Near-expiry discount'
      }
      
      transparencyMessage = `Rescue Item: Discount applied as the product is expiring in ${daysToExpiry} days. Please consume before expiry date.`
    }
    
    const finalPrice = basePrice * (1 - discountPercentage / 100)
    
    return {
      basePrice,
      discountPercentage,
      finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
      discountReason,
      isRescueItem: classification.status === 'NEAR_EXPIRY',
      transparencyMessage
    }
  }

  /**
   * FEFO Enforcement Engine
   * Ensures First Expiry, First Out ordering
   */
  static enforceFEFO(medicines: MedicineStatus[], searchTerm: string): MedicineStatus[] {
    // Filter medicines matching search term
    const matchingMedicines = medicines.filter(med => 
      med.med_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      this.classifyMedicine(med).canSell
    )
    
    // Sort by expiry date (earliest first) - FEFO enforcement
    return matchingMedicines.sort((a, b) => {
      const dateA = new Date(a.expiry_date).getTime()
      const dateB = new Date(b.expiry_date).getTime()
      return dateA - dateB
    })
  }

  /**
   * NGO Eligibility Engine
   * Determines which NGOs can receive specific donations
   */
  static getEligibleNGOs(medicine: MedicineStatus, ngoDatabase: any[]): any[] {
    const classification = this.classifyMedicine(medicine)
    
    // Only allow donations for items that can be donated
    if (!classification.canDonate) {
      return []
    }
    
    // Filter NGOs based on:
    // 1. High usage verification
    // 2. Ability to consume before expiry
    // 3. Category specialization
    return ngoDatabase.filter(ngo => {
      const hasHighUsage = ngo.monthlyConsumption > 1000 // High usage threshold
      const canConsumeInTime = ngo.averageConsumptionDays < classification.daysToExpiry
      const hasSpecialization = ngo.specializations.includes(medicine.category)
      
      return hasHighUsage && canConsumeInTime && (hasSpecialization || ngo.isGeneralPurpose)
    })
  }

  /**
   * Disposal Workflow Engine
   * Handles expired medicine disposal with sustainability tracking
   */
  static generateDisposalWorkflow(medicine: MedicineStatus): DisposalWorkflow {
    const batchId = medicine.id
    
    // Check if manufacturer supports return-to-source
    const manufacturerSupportsReturn = this.checkManufacturerReturn(medicine.med_name)
    
    if (manufacturerSupportsReturn) {
      return {
        batchId,
        disposalType: 'RETURN_TO_MANUFACTURER',
        creditRecovery: medicine.price * medicine.quantity * 0.3, // 30% credit recovery
        disposalCost: 0,
        environmentalImpact: 0.5, // Lower impact due to recycling
        sustainabilityScoreImpact: -2 // Minimal score reduction
      }
    }
    
    // Certified disposal facility
    return {
      batchId,
      disposalType: 'CERTIFIED_DISPOSAL',
      facilityName: 'MedWaste Solutions Pvt Ltd',
      facilityLocation: 'Industrial Area, Sector 18, Gurgaon',
      creditRecovery: 0,
      disposalCost: medicine.quantity * 5, // ₹5 per unit disposal cost
      environmentalImpact: 2.0, // Higher impact due to incineration
      sustainabilityScoreImpact: -5 // Moderate score reduction
    }
  }

  /**
   * Audit Log Generator
   * Creates comprehensive audit trails for all actions
   */
  static generateAuditLog(action: string, medicine: MedicineStatus, details: any): any {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      batchId: medicine.id,
      medicineName: medicine.med_name,
      batchNumber: medicine.batch_no,
      expiryDate: medicine.expiry_date,
      quantity: medicine.quantity,
      shelfLocation: medicine.shelf_location,
      details,
      complianceStatus: 'COMPLIANT',
      userId: 'system', // In real implementation, get from auth context
      ipAddress: '127.0.0.1', // In real implementation, get from request
      userAgent: 'Viala Safety Engine'
    }
  }

  /**
   * Patient Notification Engine
   * Handles proactive patient notifications for stock alerts
   */
  static generatePatientNotifications(
    medicine: MedicineStatus, 
    patientHistory: any[]
  ): any[] {
    const notifications: any[] = []
    
    // Find regular patients for this medicine
    const regularPatients = patientHistory.filter(patient => {
      const purchases = patient.purchaseHistory.filter((p: any) => 
        p.medicineName === medicine.med_name
      )
      
      // Consider regular if purchased 3+ times in last 6 months
      const recentPurchases = purchases.filter((p: any) => {
        const purchaseDate = new Date(p.date)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        return purchaseDate > sixMonthsAgo
      })
      
      return recentPurchases.length >= 3
    })
    
    // Generate notifications for regular patients
    regularPatients.forEach(patient => {
      if (patient.consentForNotifications && medicine.quantity <= 10) {
        notifications.push({
          patientId: patient.id,
          patientName: patient.name,
          contactMethod: patient.preferredContact, // 'email' or 'sms'
          contactDetails: patient.email || patient.phone,
          message: `Your regular medicine "${medicine.med_name}" may be out of stock soon. Current stock: ${medicine.quantity} units. Please plan accordingly.`,
          urgency: medicine.quantity <= 5 ? 'HIGH' : 'MEDIUM',
          scheduledTime: new Date().toISOString()
        })
      }
    })
    
    return notifications
  }

  // Helper methods
  private static calculateDaysToExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  private static checkManufacturerReturn(medicineName: string): boolean {
    // In real implementation, this would check a manufacturer database
    // For demo, assume 30% of medicines support return-to-source
    const supportedMedicines = [
      'Paracetamol', 'Aspirin', 'Ibuprofen', 'Amoxicillin', 'Metformin'
    ]
    return supportedMedicines.some(med => 
      medicineName.toLowerCase().includes(med.toLowerCase())
    )
  }
}

/**
 * Billing Safety Validator
 * Ensures no unsafe items can be billed
 */
export class BillingSafetyValidator {
  
  static validateBillingItem(medicine: MedicineStatus): {
    canBill: boolean
    reason?: string
    pricing?: DynamicPricing
    warnings: string[]
  } {
    const classification = MedicalSafetyEngine.classifyMedicine(medicine)
    const pricing = MedicalSafetyEngine.calculateDynamicPricing(medicine)
    const warnings: string[] = []
    
    // Absolute blocks
    if (!classification.canSell) {
      return {
        canBill: false,
        reason: classification.status === 'EXPIRED' 
          ? 'EXPIRED: Cannot sell expired medicines'
          : 'BLACKLISTED: Medicine expires within 7 days',
        warnings: ['SAFETY_VIOLATION: Attempted to bill unsafe item']
      }
    }
    
    // Rescue item warnings
    if (classification.status === 'NEAR_EXPIRY') {
      warnings.push(`RESCUE_ITEM: ${pricing.transparencyMessage}`)
      warnings.push(`FEFO_PRIORITY: This batch must be sold before other batches`)
    }
    
    return {
      canBill: true,
      pricing,
      warnings
    }
  }
}