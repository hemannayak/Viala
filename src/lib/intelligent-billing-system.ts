/**
 * Intelligent Billing System
 * Enforces medical safety, transparency, and legal compliance in billing
 */

import { MedicalSafetyEngine, BillingSafetyValidator, MedicineStatus, DynamicPricing } from './medical-safety-engine'

export interface BillItem {
  medicineId: string
  medicineName: string
  batchNumber: string
  quantity: number
  basePrice: number
  finalPrice: number
  discountPercentage: number
  isRescueItem: boolean
  transparencyMessage: string
  expiryDate: string
  daysToExpiry: number
  shelfLocation: string
}

export interface Bill {
  id: string
  timestamp: string
  pharmacistId: string
  patientId?: string
  patientName?: string
  items: BillItem[]
  subtotal: number
  totalDiscount: number
  finalTotal: number
  rescueItemsCount: number
  complianceStatus: 'COMPLIANT' | 'VIOLATION'
  warnings: string[]
  auditTrail: any[]
}

export interface SearchResult {
  medicine: MedicineStatus
  classification: any
  pricing: DynamicPricing
  fefoRank: number
  recommendationMessage: string
  canAddToBill: boolean
  blockingReason?: string
}

export class IntelligentBillingSystem {
  private currentBill: Bill | null = null
  private inventory: MedicineStatus[] = []
  
  constructor(inventory: MedicineStatus[]) {
    this.inventory = inventory
  }

  /**
   * Smart Medicine Search with FEFO Enforcement
   * Returns medicines sorted by expiry with safety recommendations
   */
  searchMedicines(searchTerm: string): SearchResult[] {
    // Get FEFO-sorted medicines
    const fefoSortedMedicines = MedicalSafetyEngine.enforceFEFO(this.inventory, searchTerm)
    
    return fefoSortedMedicines.map((medicine, index) => {
      const classification = MedicalSafetyEngine.classifyMedicine(medicine)
      const pricing = MedicalSafetyEngine.calculateDynamicPricing(medicine)
      const validation = BillingSafetyValidator.validateBillingItem(medicine)
      
      let recommendationMessage = ''
      
      if (index === 0 && classification.status === 'NEAR_EXPIRY') {
        recommendationMessage = `🚨 PRIORITY: Sell Batch #${medicine.batch_no} first (Expiring in ${classification.daysToExpiry} days)`
      } else if (classification.status === 'NEAR_EXPIRY') {
        recommendationMessage = `⚠️ RESCUE ITEM: Expires in ${classification.daysToExpiry} days - ${pricing.discountPercentage}% discount applied`
      } else if (index === 0) {
        recommendationMessage = `✅ RECOMMENDED: Earliest expiry batch (${classification.daysToExpiry} days remaining)`
      }
      
      return {
        medicine,
        classification,
        pricing,
        fefoRank: index + 1,
        recommendationMessage,
        canAddToBill: validation.canBill,
        blockingReason: validation.reason
      }
    })
  }

  /**
   * Initialize New Bill
   */
  startNewBill(pharmacistId: string, patientId?: string, patientName?: string): Bill {
    this.currentBill = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      pharmacistId,
      patientId,
      patientName,
      items: [],
      subtotal: 0,
      totalDiscount: 0,
      finalTotal: 0,
      rescueItemsCount: 0,
      complianceStatus: 'COMPLIANT',
      warnings: [],
      auditTrail: []
    }
    
    return this.currentBill
  }

  /**
   * Add Item to Bill with Safety Validation
   */
  addItemToBill(medicineId: string, requestedQuantity: number): {
    success: boolean
    message: string
    updatedBill?: Bill
    violations?: string[]
  } {
    if (!this.currentBill) {
      return {
        success: false,
        message: 'No active bill. Please start a new bill first.'
      }
    }

    const medicine = this.inventory.find(m => m.id === medicineId)
    if (!medicine) {
      return {
        success: false,
        message: 'Medicine not found in inventory.'
      }
    }

    // Safety validation
    const validation = BillingSafetyValidator.validateBillingItem(medicine)
    if (!validation.canBill) {
      const auditLog = MedicalSafetyEngine.generateAuditLog(
        'BILLING_VIOLATION_BLOCKED',
        medicine,
        { 
          reason: validation.reason,
          requestedQuantity,
          pharmacistId: this.currentBill.pharmacistId
        }
      )
      
      this.currentBill.auditTrail.push(auditLog)
      this.currentBill.complianceStatus = 'VIOLATION'
      
      return {
        success: false,
        message: `SAFETY VIOLATION: ${validation.reason}`,
        violations: validation.warnings
      }
    }

    // Quantity validation
    if (requestedQuantity > medicine.quantity) {
      return {
        success: false,
        message: `Insufficient stock. Available: ${medicine.quantity}, Requested: ${requestedQuantity}`
      }
    }

    // Check if this is the earliest expiry batch for FEFO compliance
    const searchResults = this.searchMedicines(medicine.med_name)
    const earliestBatch = searchResults[0]?.medicine
    
    if (earliestBatch && earliestBatch.id !== medicineId) {
      // Allow override with reason, but log it
      const auditLog = MedicalSafetyEngine.generateAuditLog(
        'FEFO_OVERRIDE',
        medicine,
        {
          earliestBatchId: earliestBatch.id,
          earliestBatchExpiry: earliestBatch.expiry_date,
          selectedBatchExpiry: medicine.expiry_date,
          reason: 'Pharmacist override - reason required',
          pharmacistId: this.currentBill.pharmacistId
        }
      )
      
      this.currentBill.auditTrail.push(auditLog)
      this.currentBill.warnings.push(
        `FEFO WARNING: Earlier expiry batch available (${earliestBatch.batch_no} expires ${earliestBatch.expiry_date})`
      )
    }

    // Create bill item with dynamic pricing
    const pricing = validation.pricing!
    const billItem: BillItem = {
      medicineId: medicine.id,
      medicineName: medicine.med_name,
      batchNumber: medicine.batch_no,
      quantity: requestedQuantity,
      basePrice: pricing.basePrice,
      finalPrice: pricing.finalPrice,
      discountPercentage: pricing.discountPercentage,
      isRescueItem: pricing.isRescueItem,
      transparencyMessage: pricing.transparencyMessage,
      expiryDate: medicine.expiry_date,
      daysToExpiry: MedicalSafetyEngine.classifyMedicine(medicine).daysToExpiry,
      shelfLocation: medicine.shelf_location
    }

    // Add to bill
    this.currentBill.items.push(billItem)
    
    // Update totals
    this.recalculateBillTotals()
    
    // Add warnings for rescue items
    if (pricing.isRescueItem) {
      this.currentBill.warnings.push(pricing.transparencyMessage)
      this.currentBill.rescueItemsCount++
    }

    // Audit log for successful addition
    const auditLog = MedicalSafetyEngine.generateAuditLog(
      'ITEM_ADDED_TO_BILL',
      medicine,
      {
        quantity: requestedQuantity,
        finalPrice: pricing.finalPrice,
        discountApplied: pricing.discountPercentage,
        isRescueItem: pricing.isRescueItem,
        billId: this.currentBill.id,
        pharmacistId: this.currentBill.pharmacistId
      }
    )
    
    this.currentBill.auditTrail.push(auditLog)

    return {
      success: true,
      message: pricing.isRescueItem 
        ? `Added rescue item with ${pricing.discountPercentage}% discount`
        : 'Item added successfully',
      updatedBill: this.currentBill
    }
  }

  /**
   * Remove Item from Bill
   */
  removeItemFromBill(medicineId: string): {
    success: boolean
    message: string
    updatedBill?: Bill
  } {
    if (!this.currentBill) {
      return {
        success: false,
        message: 'No active bill.'
      }
    }

    const itemIndex = this.currentBill.items.findIndex(item => item.medicineId === medicineId)
    if (itemIndex === -1) {
      return {
        success: false,
        message: 'Item not found in bill.'
      }
    }

    const removedItem = this.currentBill.items[itemIndex]
    this.currentBill.items.splice(itemIndex, 1)
    
    if (removedItem.isRescueItem) {
      this.currentBill.rescueItemsCount--
    }
    
    this.recalculateBillTotals()

    // Audit log
    const medicine = this.inventory.find(m => m.id === medicineId)!
    const auditLog = MedicalSafetyEngine.generateAuditLog(
      'ITEM_REMOVED_FROM_BILL',
      medicine,
      {
        removedQuantity: removedItem.quantity,
        billId: this.currentBill.id,
        pharmacistId: this.currentBill.pharmacistId
      }
    )
    
    this.currentBill.auditTrail.push(auditLog)

    return {
      success: true,
      message: 'Item removed from bill',
      updatedBill: this.currentBill
    }
  }

  /**
   * Finalize Bill with Compliance Check
   */
  finalizeBill(): {
    success: boolean
    message: string
    finalBill?: Bill
    complianceReport: any
  } {
    if (!this.currentBill || this.currentBill.items.length === 0) {
      return {
        success: false,
        message: 'No items in bill to finalize.',
        complianceReport: { status: 'INVALID', violations: ['Empty bill'] }
      }
    }

    // Final compliance check
    const complianceReport = this.generateComplianceReport()
    
    if (complianceReport.status === 'VIOLATION') {
      return {
        success: false,
        message: 'Bill contains compliance violations and cannot be finalized.',
        complianceReport
      }
    }

    // Update inventory quantities (in real system, this would be a database transaction)
    this.currentBill.items.forEach(item => {
      const medicine = this.inventory.find(m => m.id === item.medicineId)
      if (medicine) {
        medicine.quantity -= item.quantity
      }
    })

    // Final audit log
    const finalAuditLog = {
      id: `audit_final_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'BILL_FINALIZED',
      billId: this.currentBill.id,
      totalItems: this.currentBill.items.length,
      rescueItems: this.currentBill.rescueItemsCount,
      finalTotal: this.currentBill.finalTotal,
      complianceStatus: this.currentBill.complianceStatus,
      pharmacistId: this.currentBill.pharmacistId
    }
    
    this.currentBill.auditTrail.push(finalAuditLog)

    const finalizedBill = { ...this.currentBill }
    this.currentBill = null // Clear current bill

    return {
      success: true,
      message: 'Bill finalized successfully',
      finalBill: finalizedBill,
      complianceReport
    }
  }

  /**
   * Generate Compliance Report
   */
  private generateComplianceReport(): any {
    if (!this.currentBill) {
      return { status: 'INVALID', violations: ['No active bill'] }
    }

    const violations: string[] = []
    const warnings: string[] = []
    
    // Check each item for compliance
    this.currentBill.items.forEach(item => {
      const medicine = this.inventory.find(m => m.id === item.medicineId)
      if (!medicine) {
        violations.push(`Medicine ${item.medicineName} not found in inventory`)
        return
      }

      const validation = BillingSafetyValidator.validateBillingItem(medicine)
      if (!validation.canBill) {
        violations.push(`${item.medicineName}: ${validation.reason}`)
      }
      
      if (validation.warnings) {
        warnings.push(...validation.warnings)
      }
    })

    const status = violations.length > 0 ? 'VIOLATION' : 
                  warnings.length > 0 ? 'WARNING' : 'COMPLIANT'

    return {
      status,
      violations,
      warnings,
      totalItems: this.currentBill.items.length,
      rescueItems: this.currentBill.rescueItemsCount,
      complianceScore: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 20)
    }
  }

  /**
   * Recalculate Bill Totals
   */
  private recalculateBillTotals(): void {
    if (!this.currentBill) return

    let subtotal = 0
    let totalDiscount = 0

    this.currentBill.items.forEach(item => {
      const itemSubtotal = item.basePrice * item.quantity
      const itemDiscount = (item.basePrice - item.finalPrice) * item.quantity
      
      subtotal += itemSubtotal
      totalDiscount += itemDiscount
    })

    this.currentBill.subtotal = Math.round(subtotal * 100) / 100
    this.currentBill.totalDiscount = Math.round(totalDiscount * 100) / 100
    this.currentBill.finalTotal = Math.round((subtotal - totalDiscount) * 100) / 100
  }

  /**
   * Get Current Bill
   */
  getCurrentBill(): Bill | null {
    return this.currentBill
  }

  /**
   * Get Bill Summary for Display
   */
  getBillSummary(): any {
    if (!this.currentBill) return null

    return {
      id: this.currentBill.id,
      itemCount: this.currentBill.items.length,
      rescueItemsCount: this.currentBill.rescueItemsCount,
      subtotal: this.currentBill.subtotal,
      totalDiscount: this.currentBill.totalDiscount,
      finalTotal: this.currentBill.finalTotal,
      hasWarnings: this.currentBill.warnings.length > 0,
      complianceStatus: this.currentBill.complianceStatus
    }
  }
}