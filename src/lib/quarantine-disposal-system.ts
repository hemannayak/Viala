/**
 * Quarantine & Disposal Management System
 * Handles expired medicines with eco-friendly disposal workflows
 */

import { MedicalSafetyEngine, MedicineStatus, DisposalWorkflow } from './medical-safety-engine'

export interface QuarantineItem {
  id: string
  medicineId: string
  medicineName: string
  batchNumber: string
  quantity: number
  originalShelfLocation: string
  quarantineDate: string
  expiryDate: string
  daysExpired: number
  quarantineReason: 'EXPIRED' | 'BLACKLISTED' | 'DAMAGED' | 'RECALLED'
  status: 'QUARANTINED' | 'DISPOSAL_PENDING' | 'DISPOSED' | 'RETURNED'
  disposalWorkflow?: DisposalWorkflow
  hazardLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  requiresSpecialHandling: boolean
}

export interface DisposalFacility {
  id: string
  name: string
  location: string
  coordinates: { lat: number; lng: number }
  certifications: string[]
  specializations: string[]
  costPerKg: number
  maxCapacityKg: number
  contactInfo: {
    phone: string
    email: string
    website: string
  }
  rating: number
  isVerified: boolean
}

export interface SustainabilityImpact {
  totalWasteKg: number
  co2EmissionsSaved: number
  chemicalWastePrevented: number
  recyclingRate: number
  disposalCost: number
  creditRecovered: number
  sustainabilityScoreImpact: number
  environmentalGrade: 'A+' | 'A' | 'B' | 'C' | 'D'
}

export class QuarantineDisposalSystem {
  private quarantineItems: QuarantineItem[] = []
  private disposalFacilities: DisposalFacility[] = []
  private sustainabilityMetrics: SustainabilityImpact

  constructor() {
    this.initializeDisposalFacilities()
    this.sustainabilityMetrics = {
      totalWasteKg: 0,
      co2EmissionsSaved: 0,
      chemicalWastePrevented: 0,
      recyclingRate: 0,
      disposalCost: 0,
      creditRecovered: 0,
      sustainabilityScoreImpact: 0,
      environmentalGrade: 'A+'
    }
  }

  /**
   * Auto-Quarantine Expired Medicines
   * Automatically moves expired medicines to quarantine
   */
  autoQuarantineExpiredMedicines(inventory: MedicineStatus[]): {
    quarantinedItems: QuarantineItem[]
    shelfInstructions: any[]
    auditLogs: any[]
  } {
    const expiredMedicines = inventory.filter(medicine => {
      const classification = MedicalSafetyEngine.classifyMedicine(medicine)
      return classification.status === 'EXPIRED' || classification.status === 'BLACKLISTED'
    })

    const quarantinedItems: QuarantineItem[] = []
    const shelfInstructions: any[] = []
    const auditLogs: any[] = []

    expiredMedicines.forEach(medicine => {
      const classification = MedicalSafetyEngine.classifyMedicine(medicine)
      
      const quarantineItem: QuarantineItem = {
        id: `quarantine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        medicineId: medicine.id,
        medicineName: medicine.med_name,
        batchNumber: medicine.batch_no,
        quantity: medicine.quantity,
        originalShelfLocation: medicine.shelf_location,
        quarantineDate: new Date().toISOString(),
        expiryDate: medicine.expiry_date,
        daysExpired: Math.abs(classification.daysToExpiry),
        quarantineReason: classification.status === 'EXPIRED' ? 'EXPIRED' : 'BLACKLISTED',
        status: 'QUARANTINED',
        hazardLevel: this.assessHazardLevel(medicine),
        requiresSpecialHandling: this.requiresSpecialHandling(medicine)
      }

      // Generate disposal workflow
      quarantineItem.disposalWorkflow = MedicalSafetyEngine.generateDisposalWorkflow(medicine)

      quarantinedItems.push(quarantineItem)
      this.quarantineItems.push(quarantineItem)

      // Generate shelf instruction
      shelfInstructions.push({
        shelfLocation: medicine.shelf_location,
        instruction: `🚨 REMOVE IMMEDIATELY: ${medicine.quantity} units of ${medicine.med_name} (Batch: ${medicine.batch_no})`,
        urgency: 'CRITICAL',
        action: 'MOVE_TO_QUARANTINE_BIN',
        hazardLevel: quarantineItem.hazardLevel,
        specialHandling: quarantineItem.requiresSpecialHandling ? 'Use protective equipment' : 'Standard handling'
      })

      // Generate audit log
      const auditLog = MedicalSafetyEngine.generateAuditLog(
        'AUTO_QUARANTINE',
        medicine,
        {
          quarantineId: quarantineItem.id,
          reason: quarantineItem.quarantineReason,
          daysExpired: quarantineItem.daysExpired,
          hazardLevel: quarantineItem.hazardLevel,
          disposalType: quarantineItem.disposalWorkflow?.disposalType
        }
      )

      auditLogs.push(auditLog)
    })

    return {
      quarantinedItems,
      shelfInstructions,
      auditLogs
    }
  }

  /**
   * Process Disposal for Quarantined Items
   */
  processDisposal(quarantineItemIds: string[]): {
    success: boolean
    disposalSummary: any
    sustainabilityImpact: SustainabilityImpact
    auditLogs: any[]
  } {
    const itemsToDispose = this.quarantineItems.filter(item => 
      quarantineItemIds.includes(item.id) && item.status === 'QUARANTINED'
    )

    if (itemsToDispose.length === 0) {
      return {
        success: false,
        disposalSummary: { error: 'No valid items found for disposal' },
        sustainabilityImpact: this.sustainabilityMetrics,
        auditLogs: []
      }
    }

    const disposalSummary = {
      totalItems: itemsToDispose.length,
      totalQuantity: 0,
      totalWeightKg: 0,
      returnToManufacturer: 0,
      certifiedDisposal: 0,
      totalCost: 0,
      totalCreditRecovered: 0,
      facilitiesUsed: new Set<string>()
    }

    const auditLogs: any[] = []

    itemsToDispose.forEach(item => {
      if (!item.disposalWorkflow) return

      const workflow = item.disposalWorkflow
      const itemWeightKg = item.quantity * 0.02 // Assume 20g per unit

      disposalSummary.totalQuantity += item.quantity
      disposalSummary.totalWeightKg += itemWeightKg

      if (workflow.disposalType === 'RETURN_TO_MANUFACTURER') {
        disposalSummary.returnToManufacturer += item.quantity
        disposalSummary.totalCreditRecovered += workflow.creditRecovery || 0
      } else {
        disposalSummary.certifiedDisposal += item.quantity
        disposalSummary.totalCost += workflow.disposalCost || 0
        if (workflow.facilityName) {
          disposalSummary.facilitiesUsed.add(workflow.facilityName)
        }
      }

      // Update item status
      item.status = 'DISPOSED'

      // Update sustainability metrics
      this.updateSustainabilityMetrics(workflow, itemWeightKg)

      // Generate audit log
      const auditLog = {
        id: `disposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action: 'DISPOSAL_PROCESSED',
        quarantineItemId: item.id,
        medicineName: item.medicineName,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        weightKg: itemWeightKg,
        disposalType: workflow.disposalType,
        facilityName: workflow.facilityName,
        cost: workflow.disposalCost || 0,
        creditRecovered: workflow.creditRecovery || 0,
        environmentalImpact: workflow.environmentalImpact,
        complianceStatus: 'COMPLIANT'
      }

      auditLogs.push(auditLog)
    })

    return {
      success: true,
      disposalSummary: {
        ...disposalSummary,
        facilitiesUsed: Array.from(disposalSummary.facilitiesUsed)
      },
      sustainabilityImpact: this.sustainabilityMetrics,
      auditLogs
    }
  }

  /**
   * Get Quarantine Dashboard Data
   */
  getQuarantineDashboard(): {
    totalQuarantined: number
    pendingDisposal: number
    criticalHazard: number
    disposalCostEstimate: number
    sustainabilityImpact: SustainabilityImpact
    urgentActions: any[]
  } {
    const pendingItems = this.quarantineItems.filter(item => item.status === 'QUARANTINED')
    const criticalItems = pendingItems.filter(item => item.hazardLevel === 'CRITICAL')
    
    const disposalCostEstimate = pendingItems.reduce((total, item) => {
      return total + (item.disposalWorkflow?.disposalCost || 0)
    }, 0)

    const urgentActions = criticalItems.map(item => ({
      id: item.id,
      medicineName: item.medicineName,
      batchNumber: item.batchNumber,
      daysExpired: item.daysExpired,
      hazardLevel: item.hazardLevel,
      action: 'Immediate disposal required',
      priority: 'CRITICAL'
    }))

    return {
      totalQuarantined: this.quarantineItems.length,
      pendingDisposal: pendingItems.length,
      criticalHazard: criticalItems.length,
      disposalCostEstimate,
      sustainabilityImpact: this.sustainabilityMetrics,
      urgentActions
    }
  }

  /**
   * Get Nearest Disposal Facilities
   */
  getNearestDisposalFacilities(coordinates: { lat: number; lng: number }, maxDistance: number = 50): DisposalFacility[] {
    return this.disposalFacilities
      .map(facility => ({
        ...facility,
        distance: this.calculateDistance(coordinates, facility.coordinates)
      }))
      .filter(facility => facility.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Return top 5 nearest facilities
  }

  /**
   * Generate Disposal Certificate
   */
  generateDisposalCertificate(disposalId: string): any {
    const disposedItems = this.quarantineItems.filter(item => 
      item.status === 'DISPOSED'
    )

    return {
      certificateId: `CERT_${Date.now()}`,
      issueDate: new Date().toISOString(),
      pharmacyName: 'Viala Pharmacy',
      totalItemsDisposed: disposedItems.length,
      totalWeightKg: disposedItems.reduce((total, item) => total + (item.quantity * 0.02), 0),
      disposalMethods: {
        returnToManufacturer: disposedItems.filter(item => 
          item.disposalWorkflow?.disposalType === 'RETURN_TO_MANUFACTURER'
        ).length,
        certifiedDisposal: disposedItems.filter(item => 
          item.disposalWorkflow?.disposalType === 'CERTIFIED_DISPOSAL'
        ).length
      },
      environmentalCompliance: 'FULLY_COMPLIANT',
      certifyingAuthority: 'Central Pollution Control Board',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // Valid for 1 year
    }
  }

  // Private helper methods
  private assessHazardLevel(medicine: MedicineStatus): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const classification = MedicalSafetyEngine.classifyMedicine(medicine)
    const daysExpired = Math.abs(classification.daysToExpiry)
    
    // Critical medicines or highly expired items
    if (medicine.category === 'Antibiotic' || medicine.category === 'Cardiac' || daysExpired > 365) {
      return 'CRITICAL'
    }
    
    if (daysExpired > 180) return 'HIGH'
    if (daysExpired > 90) return 'MEDIUM'
    return 'LOW'
  }

  private requiresSpecialHandling(medicine: MedicineStatus): boolean {
    const specialCategories = ['Antibiotic', 'Cardiac', 'Insulin', 'Chemotherapy', 'Controlled']
    return specialCategories.includes(medicine.category)
  }

  private updateSustainabilityMetrics(workflow: DisposalWorkflow, weightKg: number): void {
    this.sustainabilityMetrics.totalWasteKg += weightKg
    this.sustainabilityMetrics.disposalCost += workflow.disposalCost || 0
    this.sustainabilityMetrics.creditRecovered += workflow.creditRecovery || 0
    this.sustainabilityMetrics.sustainabilityScoreImpact += workflow.sustainabilityScoreImpact

    // Calculate CO2 emissions saved through proper disposal
    if (workflow.disposalType === 'RETURN_TO_MANUFACTURER') {
      this.sustainabilityMetrics.co2EmissionsSaved += weightKg * 2.5 // Recycling saves CO2
      this.sustainabilityMetrics.recyclingRate = 
        (this.sustainabilityMetrics.creditRecovered / this.sustainabilityMetrics.disposalCost) * 100
    }

    // Update environmental grade
    const totalImpact = Math.abs(this.sustainabilityMetrics.sustainabilityScoreImpact)
    if (totalImpact <= 10) this.sustainabilityMetrics.environmentalGrade = 'A+'
    else if (totalImpact <= 25) this.sustainabilityMetrics.environmentalGrade = 'A'
    else if (totalImpact <= 50) this.sustainabilityMetrics.environmentalGrade = 'B'
    else if (totalImpact <= 100) this.sustainabilityMetrics.environmentalGrade = 'C'
    else this.sustainabilityMetrics.environmentalGrade = 'D'
  }

  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private initializeDisposalFacilities(): void {
    this.disposalFacilities = [
      {
        id: 'facility_001',
        name: 'MedWaste Solutions Pvt Ltd',
        location: 'Industrial Area, Sector 18, Gurgaon',
        coordinates: { lat: 28.4595, lng: 77.0266 },
        certifications: ['CPCB Certified', 'ISO 14001', 'HAZMAT Certified'],
        specializations: ['Pharmaceutical Waste', 'Chemical Disposal', 'Incineration'],
        costPerKg: 25,
        maxCapacityKg: 10000,
        contactInfo: {
          phone: '+91-124-4567890',
          email: 'disposal@medwaste.com',
          website: 'www.medwaste.com'
        },
        rating: 4.8,
        isVerified: true
      },
      {
        id: 'facility_002',
        name: 'EcoPharm Disposal Services',
        location: 'Green Industrial Park, Noida',
        coordinates: { lat: 28.5355, lng: 77.3910 },
        certifications: ['CPCB Certified', 'Green Certification', 'NABL Accredited'],
        specializations: ['Eco-friendly Disposal', 'Recycling', 'Waste-to-Energy'],
        costPerKg: 30,
        maxCapacityKg: 8000,
        contactInfo: {
          phone: '+91-120-9876543',
          email: 'info@ecopharm.com',
          website: 'www.ecopharm.com'
        },
        rating: 4.9,
        isVerified: true
      },
      {
        id: 'facility_003',
        name: 'SafeDispose Medical Waste Management',
        location: 'HSIIDC Industrial Estate, Faridabad',
        coordinates: { lat: 28.4089, lng: 77.3178 },
        certifications: ['CPCB Certified', 'OSHA Compliant'],
        specializations: ['Medical Waste', 'Controlled Substances', 'Secure Destruction'],
        costPerKg: 22,
        maxCapacityKg: 12000,
        contactInfo: {
          phone: '+91-129-2345678',
          email: 'operations@safedispose.com',
          website: 'www.safedispose.com'
        },
        rating: 4.7,
        isVerified: true
      }
    ]
  }
}