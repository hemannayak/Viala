/**
 * Patient Notification & Hospital Integration System
 * Handles patient records, purchase history, and proactive notifications
 */

import { MedicalSafetyEngine, MedicineStatus } from './medical-safety-engine'

export interface Patient {
  id: string
  name: string
  email?: string
  phone?: string
  dateOfBirth: string
  address: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory: {
    chronicConditions: string[]
    allergies: string[]
    currentMedications: string[]
  }
  preferences: {
    preferredContact: 'email' | 'sms' | 'both'
    notificationConsent: boolean
    languagePreference: 'english' | 'hindi' | 'local'
    reminderFrequency: 'daily' | 'weekly' | 'monthly'
  }
  registrationDate: string
  lastVisit: string
  isActive: boolean
}

export interface PurchaseHistory {
  id: string
  patientId: string
  medicineId: string
  medicineName: string
  batchNumber: string
  quantity: number
  price: number
  purchaseDate: string
  prescriptionId?: string
  doctorName?: string
  frequency: 'one-time' | 'weekly' | 'monthly' | 'chronic'
  nextRefillDue?: string
  adherenceScore: number // 0-100 based on refill patterns
}

export interface NotificationTemplate {
  id: string
  type: 'STOCK_ALERT' | 'REFILL_REMINDER' | 'EXPIRY_WARNING' | 'HEALTH_TIP' | 'EMERGENCY'
  title: string
  message: string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  channels: ('email' | 'sms' | 'push')[]
  personalization: {
    includePatientName: boolean
    includeMedicineName: boolean
    includeQuantity: boolean
    includeDoctorName: boolean
  }
}

export interface Notification {
  id: string
  patientId: string
  templateId: string
  title: string
  message: string
  channel: 'email' | 'sms' | 'push'
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'OPENED'
  scheduledTime: string
  sentTime?: string
  deliveredTime?: string
  openedTime?: string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  metadata: {
    medicineId?: string
    medicineName?: string
    quantity?: number
    expiryDate?: string
    doctorName?: string
  }
}

export class PatientNotificationSystem {
  private patients: Patient[] = []
  private purchaseHistory: PurchaseHistory[] = []
  private notifications: Notification[] = []
  private notificationTemplates: NotificationTemplate[] = []

  constructor() {
    this.initializeNotificationTemplates()
    this.loadDemoPatients()
  }

  /**
   * Register New Patient
   */
  registerPatient(patientData: Omit<Patient, 'id' | 'registrationDate' | 'lastVisit' | 'isActive'>): Patient {
    const patient: Patient = {
      ...patientData,
      id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      registrationDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      isActive: true
    }

    this.patients.push(patient)
    return patient
  }

  /**
   * Record Purchase History
   */
  recordPurchase(
    patientId: string,
    medicineId: string,
    medicineName: string,
    batchNumber: string,
    quantity: number,
    price: number,
    prescriptionDetails?: {
      prescriptionId: string
      doctorName: string
      frequency: 'one-time' | 'weekly' | 'monthly' | 'chronic'
    }
  ): PurchaseHistory {
    const purchase: PurchaseHistory = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      medicineId,
      medicineName,
      batchNumber,
      quantity,
      price,
      purchaseDate: new Date().toISOString(),
      prescriptionId: prescriptionDetails?.prescriptionId,
      doctorName: prescriptionDetails?.doctorName,
      frequency: prescriptionDetails?.frequency || 'one-time',
      adherenceScore: this.calculateAdherenceScore(patientId, medicineName)
    }

    // Calculate next refill due for chronic medications
    if (purchase.frequency === 'chronic' || purchase.frequency === 'monthly') {
      const nextRefill = new Date()
      nextRefill.setDate(nextRefill.getDate() + 30)
      purchase.nextRefillDue = nextRefill.toISOString()
    } else if (purchase.frequency === 'weekly') {
      const nextRefill = new Date()
      nextRefill.setDate(nextRefill.getDate() + 7)
      purchase.nextRefillDue = nextRefill.toISOString()
    }

    this.purchaseHistory.push(purchase)

    // Update patient's last visit
    const patient = this.patients.find(p => p.id === patientId)
    if (patient) {
      patient.lastVisit = new Date().toISOString()
    }

    return purchase
  }

  /**
   * Generate Proactive Stock Alerts
   * Notifies patients when their regular medicines are running low
   */
  generateStockAlerts(inventory: MedicineStatus[]): Notification[] {
    const stockAlerts: Notification[] = []

    // Find medicines with low stock
    const lowStockMedicines = inventory.filter(medicine => medicine.quantity <= 10)

    lowStockMedicines.forEach(medicine => {
      // Find regular patients for this medicine
      const regularPatients = this.findRegularPatients(medicine.med_name)

      regularPatients.forEach(patient => {
        if (!patient.preferences.notificationConsent) return

        const notification = this.createNotification(
          patient.id,
          'STOCK_ALERT',
          {
            medicineId: medicine.id,
            medicineName: medicine.med_name,
            quantity: medicine.quantity
          }
        )

        stockAlerts.push(notification)
        this.notifications.push(notification)
      })
    })

    return stockAlerts
  }

  /**
   * Generate Refill Reminders
   * Reminds patients when their chronic medications are due for refill
   */
  generateRefillReminders(): Notification[] {
    const refillReminders: Notification[] = []
    const today = new Date()

    // Find purchases due for refill in next 3 days
    const dueRefills = this.purchaseHistory.filter(purchase => {
      if (!purchase.nextRefillDue) return false
      
      const refillDate = new Date(purchase.nextRefillDue)
      const daysUntilRefill = Math.ceil((refillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return daysUntilRefill <= 3 && daysUntilRefill >= 0
    })

    dueRefills.forEach(purchase => {
      const patient = this.patients.find(p => p.id === purchase.patientId)
      if (!patient || !patient.preferences.notificationConsent) return

      const notification = this.createNotification(
        patient.id,
        'REFILL_REMINDER',
        {
          medicineName: purchase.medicineName,
          doctorName: purchase.doctorName
        }
      )

      refillReminders.push(notification)
      this.notifications.push(notification)
    })

    return refillReminders
  }

  /**
   * Generate Expiry Warnings
   * Warns patients about medicines they purchased that are nearing expiry
   */
  generateExpiryWarnings(inventory: MedicineStatus[]): Notification[] {
    const expiryWarnings: Notification[] = []

    // Find medicines expiring in next 30 days
    const nearExpiryMedicines = inventory.filter(medicine => {
      const classification = MedicalSafetyEngine.classifyMedicine(medicine)
      return classification.daysToExpiry <= 30 && classification.daysToExpiry > 0
    })

    nearExpiryMedicines.forEach(medicine => {
      // Find patients who recently purchased this medicine
      const recentPurchases = this.purchaseHistory.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        return purchase.medicineName === medicine.med_name && 
               purchaseDate > thirtyDaysAgo
      })

      recentPurchases.forEach(purchase => {
        const patient = this.patients.find(p => p.id === purchase.patientId)
        if (!patient || !patient.preferences.notificationConsent) return

        const classification = MedicalSafetyEngine.classifyMedicine(medicine)
        const notification = this.createNotification(
          patient.id,
          'EXPIRY_WARNING',
          {
            medicineName: medicine.med_name,
            expiryDate: medicine.expiry_date,
            quantity: classification.daysToExpiry
          }
        )

        expiryWarnings.push(notification)
        this.notifications.push(notification)
      })
    })

    return expiryWarnings
  }

  /**
   * Send Notifications
   * Processes and sends pending notifications
   */
  async sendNotifications(notificationIds: string[]): Promise<{
    sent: number
    failed: number
    results: any[]
  }> {
    const results: any[] = []
    let sent = 0
    let failed = 0

    for (const notificationId of notificationIds) {
      const notification = this.notifications.find(n => n.id === notificationId)
      if (!notification || notification.status !== 'PENDING') {
        results.push({
          notificationId,
          status: 'FAILED',
          error: 'Notification not found or already processed'
        })
        failed++
        continue
      }

      const patient = this.patients.find(p => p.id === notification.patientId)
      if (!patient) {
        results.push({
          notificationId,
          status: 'FAILED',
          error: 'Patient not found'
        })
        failed++
        continue
      }

      try {
        // Simulate sending notification
        const sendResult = await this.simulateSendNotification(notification, patient)
        
        notification.status = sendResult.success ? 'SENT' : 'FAILED'
        notification.sentTime = new Date().toISOString()
        
        if (sendResult.success) {
          sent++
          // Simulate delivery after a delay
          setTimeout(() => {
            notification.status = 'DELIVERED'
            notification.deliveredTime = new Date().toISOString()
          }, 1000)
        } else {
          failed++
        }

        results.push({
          notificationId,
          status: notification.status,
          channel: notification.channel,
          patientName: patient.name,
          message: notification.message
        })

      } catch (error) {
        notification.status = 'FAILED'
        failed++
        results.push({
          notificationId,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return { sent, failed, results }
  }

  /**
   * Get Patient Dashboard
   */
  getPatientDashboard(patientId: string): {
    patient: Patient | null
    recentPurchases: PurchaseHistory[]
    upcomingRefills: PurchaseHistory[]
    notifications: Notification[]
    adherenceScore: number
    healthInsights: any[]
  } {
    const patient = this.patients.find(p => p.id === patientId)
    if (!patient) {
      return {
        patient: null,
        recentPurchases: [],
        upcomingRefills: [],
        notifications: [],
        adherenceScore: 0,
        healthInsights: []
      }
    }

    const recentPurchases = this.purchaseHistory
      .filter(p => p.patientId === patientId)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 10)

    const upcomingRefills = this.purchaseHistory
      .filter(p => p.patientId === patientId && p.nextRefillDue)
      .filter(p => new Date(p.nextRefillDue!) > new Date())
      .sort((a, b) => new Date(a.nextRefillDue!).getTime() - new Date(b.nextRefillDue!).getTime())

    const patientNotifications = this.notifications
      .filter(n => n.patientId === patientId)
      .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())
      .slice(0, 20)

    const adherenceScore = this.calculateOverallAdherenceScore(patientId)

    const healthInsights = this.generateHealthInsights(patient, recentPurchases)

    return {
      patient,
      recentPurchases,
      upcomingRefills,
      notifications: patientNotifications,
      adherenceScore,
      healthInsights
    }
  }

  /**
   * Get Notification Analytics
   */
  getNotificationAnalytics(): {
    totalNotifications: number
    sentToday: number
    deliveryRate: number
    openRate: number
    byType: Record<string, number>
    byUrgency: Record<string, number>
    recentActivity: any[]
  } {
    const today = new Date().toDateString()
    const sentToday = this.notifications.filter(n => 
      n.sentTime && new Date(n.sentTime).toDateString() === today
    ).length

    const delivered = this.notifications.filter(n => n.status === 'DELIVERED').length
    const sent = this.notifications.filter(n => n.status === 'SENT' || n.status === 'DELIVERED').length
    const opened = this.notifications.filter(n => n.status === 'OPENED').length

    const byType: Record<string, number> = {}
    const byUrgency: Record<string, number> = {}

    this.notifications.forEach(n => {
      const template = this.notificationTemplates.find(t => t.id === n.templateId)
      if (template) {
        byType[template.type] = (byType[template.type] || 0) + 1
      }
      byUrgency[n.urgency] = (byUrgency[n.urgency] || 0) + 1
    })

    const recentActivity = this.notifications
      .filter(n => n.sentTime)
      .sort((a, b) => new Date(b.sentTime!).getTime() - new Date(a.sentTime!).getTime())
      .slice(0, 10)
      .map(n => ({
        id: n.id,
        patientName: this.patients.find(p => p.id === n.patientId)?.name || 'Unknown',
        type: this.notificationTemplates.find(t => t.id === n.templateId)?.type || 'Unknown',
        status: n.status,
        sentTime: n.sentTime,
        urgency: n.urgency
      }))

    return {
      totalNotifications: this.notifications.length,
      sentToday,
      deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
      openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
      byType,
      byUrgency,
      recentActivity
    }
  }

  // Private helper methods
  private findRegularPatients(medicineName: string): Patient[] {
    const regularPatientIds = new Set<string>()

    // Find patients who purchased this medicine 3+ times in last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentPurchases = this.purchaseHistory.filter(p => 
      p.medicineName === medicineName && 
      new Date(p.purchaseDate) > sixMonthsAgo
    )

    const purchasesByPatient = new Map<string, number>()
    recentPurchases.forEach(p => {
      purchasesByPatient.set(p.patientId, (purchasesByPatient.get(p.patientId) || 0) + 1)
    })

    purchasesByPatient.forEach((count, patientId) => {
      if (count >= 3) {
        regularPatientIds.add(patientId)
      }
    })

    return this.patients.filter(p => regularPatientIds.has(p.id))
  }

  private createNotification(
    patientId: string,
    templateType: string,
    metadata: any
  ): Notification {
    const template = this.notificationTemplates.find(t => t.type === templateType)
    if (!template) {
      throw new Error(`Notification template not found: ${templateType}`)
    }

    const patient = this.patients.find(p => p.id === patientId)
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`)
    }

    let message = template.message
    let title = template.title

    // Personalize message
    if (template.personalization.includePatientName && patient.name) {
      message = message.replace('{patientName}', patient.name)
      title = title.replace('{patientName}', patient.name)
    }
    if (template.personalization.includeMedicineName && metadata.medicineName) {
      message = message.replace('{medicineName}', metadata.medicineName)
      title = title.replace('{medicineName}', metadata.medicineName)
    }
    if (template.personalization.includeQuantity && metadata.quantity !== undefined) {
      message = message.replace('{quantity}', metadata.quantity.toString())
    }
    if (template.personalization.includeDoctorName && metadata.doctorName) {
      message = message.replace('{doctorName}', metadata.doctorName)
    }

    // Determine channel based on patient preference
    let channel: 'email' | 'sms' | 'push' = 'email'
    if (patient.preferences.preferredContact === 'sms') {
      channel = 'sms'
    } else if (patient.preferences.preferredContact === 'both') {
      channel = template.channels.includes('sms') ? 'sms' : 'email'
    }

    return {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      templateId: template.id,
      title,
      message,
      channel,
      status: 'PENDING',
      scheduledTime: new Date().toISOString(),
      urgency: template.urgency,
      metadata
    }
  }

  private calculateAdherenceScore(patientId: string, medicineName: string): number {
    const purchases = this.purchaseHistory.filter(p => 
      p.patientId === patientId && p.medicineName === medicineName
    )

    if (purchases.length < 2) return 100 // New patient, assume good adherence

    // Calculate adherence based on refill patterns
    let adherenceScore = 100
    const chronicPurchases = purchases.filter(p => p.frequency === 'chronic' || p.frequency === 'monthly')

    chronicPurchases.forEach((purchase, index) => {
      if (index === 0) return // Skip first purchase

      const previousPurchase = chronicPurchases[index - 1]
      const expectedRefillDate = new Date(previousPurchase.purchaseDate)
      expectedRefillDate.setDate(expectedRefillDate.getDate() + 30) // Assume 30-day supply

      const actualRefillDate = new Date(purchase.purchaseDate)
      const daysDifference = Math.abs(
        (actualRefillDate.getTime() - expectedRefillDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDifference > 7) { // More than 7 days late/early
        adherenceScore -= Math.min(20, daysDifference) // Reduce score
      }
    })

    return Math.max(0, Math.min(100, adherenceScore))
  }

  private calculateOverallAdherenceScore(patientId: string): number {
    const patientPurchases = this.purchaseHistory.filter(p => p.patientId === patientId)
    if (patientPurchases.length === 0) return 100

    const adherenceScores = patientPurchases.map(p => p.adherenceScore)
    return Math.round(adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length)
  }

  private generateHealthInsights(patient: Patient, recentPurchases: PurchaseHistory[]): any[] {
    const insights: any[] = []

    // Medication interaction warnings
    const currentMedications = recentPurchases
      .filter(p => {
        const purchaseDate = new Date(p.purchaseDate)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return purchaseDate > thirtyDaysAgo
      })
      .map(p => p.medicineName)

    if (currentMedications.includes('Aspirin') && currentMedications.includes('Warfarin')) {
      insights.push({
        type: 'INTERACTION_WARNING',
        severity: 'HIGH',
        message: 'Potential interaction between Aspirin and Warfarin. Consult your doctor.',
        action: 'Contact healthcare provider'
      })
    }

    // Adherence insights
    const adherenceScore = this.calculateOverallAdherenceScore(patient.id)
    if (adherenceScore < 80) {
      insights.push({
        type: 'ADHERENCE_CONCERN',
        severity: 'MEDIUM',
        message: `Your medication adherence score is ${adherenceScore}%. Consider setting reminders.`,
        action: 'Enable refill reminders'
      })
    }

    // Chronic condition management
    if (patient.medicalHistory.chronicConditions.includes('Diabetes')) {
      const diabetesMeds = recentPurchases.filter(p => 
        p.medicineName.toLowerCase().includes('metformin') ||
        p.medicineName.toLowerCase().includes('insulin')
      )
      
      if (diabetesMeds.length === 0) {
        insights.push({
          type: 'CONDITION_MANAGEMENT',
          severity: 'MEDIUM',
          message: 'No diabetes medications purchased recently. Ensure you have adequate supply.',
          action: 'Check with healthcare provider'
        })
      }
    }

    return insights
  }

  private async simulateSendNotification(notification: Notification, patient: Patient): Promise<{
    success: boolean
    error?: string
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Simulate 95% success rate
    if (Math.random() < 0.95) {
      return { success: true }
    } else {
      return { 
        success: false, 
        error: notification.channel === 'sms' ? 'Invalid phone number' : 'Email delivery failed'
      }
    }
  }

  private initializeNotificationTemplates(): void {
    this.notificationTemplates = [
      {
        id: 'stock_alert',
        type: 'STOCK_ALERT',
        title: 'Medicine Stock Alert - {medicineName}',
        message: 'Dear {patientName}, your regular medicine "{medicineName}" may be out of stock soon. Current stock: {quantity} units. Please plan accordingly.',
        urgency: 'MEDIUM',
        channels: ['email', 'sms'],
        personalization: {
          includePatientName: true,
          includeMedicineName: true,
          includeQuantity: true,
          includeDoctorName: false
        }
      },
      {
        id: 'refill_reminder',
        type: 'REFILL_REMINDER',
        title: 'Medication Refill Reminder',
        message: 'Dear {patientName}, it\'s time to refill your "{medicineName}" prescription. Please visit the pharmacy or contact Dr. {doctorName}.',
        urgency: 'MEDIUM',
        channels: ['email', 'sms'],
        personalization: {
          includePatientName: true,
          includeMedicineName: true,
          includeQuantity: false,
          includeDoctorName: true
        }
      },
      {
        id: 'expiry_warning',
        type: 'EXPIRY_WARNING',
        title: 'Medicine Expiry Warning',
        message: 'Dear {patientName}, your "{medicineName}" will expire in {quantity} days. Please use before the expiry date for safety.',
        urgency: 'HIGH',
        channels: ['email', 'sms'],
        personalization: {
          includePatientName: true,
          includeMedicineName: true,
          includeQuantity: true,
          includeDoctorName: false
        }
      }
    ]
  }

  private loadDemoPatients(): void {
    // Load some demo patients for testing
    this.patients = [
      {
        id: 'patient_001',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91-9876543210',
        dateOfBirth: '1975-05-15',
        address: 'A-123, Sector 18, Gurgaon, Haryana',
        emergencyContact: {
          name: 'Sunita Kumar',
          phone: '+91-9876543211',
          relationship: 'Spouse'
        },
        medicalHistory: {
          chronicConditions: ['Diabetes', 'Hypertension'],
          allergies: ['Penicillin'],
          currentMedications: ['Metformin', 'Amlodipine']
        },
        preferences: {
          preferredContact: 'both',
          notificationConsent: true,
          languagePreference: 'english',
          reminderFrequency: 'weekly'
        },
        registrationDate: '2023-01-15T00:00:00Z',
        lastVisit: '2024-12-15T10:30:00Z',
        isActive: true
      },
      {
        id: 'patient_002',
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91-9876543212',
        dateOfBirth: '1985-08-22',
        address: 'B-456, DLF Phase 2, Gurgaon, Haryana',
        emergencyContact: {
          name: 'Amit Sharma',
          phone: '+91-9876543213',
          relationship: 'Spouse'
        },
        medicalHistory: {
          chronicConditions: ['Asthma'],
          allergies: ['Dust', 'Pollen'],
          currentMedications: ['Salbutamol Inhaler']
        },
        preferences: {
          preferredContact: 'email',
          notificationConsent: true,
          languagePreference: 'english',
          reminderFrequency: 'monthly'
        },
        registrationDate: '2023-03-20T00:00:00Z',
        lastVisit: '2024-12-10T14:15:00Z',
        isActive: true
      }
    ]

    // Add some demo purchase history
    this.purchaseHistory = [
      {
        id: 'purchase_001',
        patientId: 'patient_001',
        medicineId: 'med_001',
        medicineName: 'Metformin',
        batchNumber: 'MET-2024-001',
        quantity: 30,
        price: 45.50,
        purchaseDate: '2024-11-15T10:30:00Z',
        prescriptionId: 'RX-001',
        doctorName: 'Dr. Anil Gupta',
        frequency: 'chronic',
        nextRefillDue: '2024-12-15T10:30:00Z',
        adherenceScore: 95
      },
      {
        id: 'purchase_002',
        patientId: 'patient_002',
        medicineId: 'med_002',
        medicineName: 'Salbutamol Inhaler',
        batchNumber: 'SAL-2024-002',
        quantity: 1,
        price: 125.00,
        purchaseDate: '2024-12-01T14:15:00Z',
        prescriptionId: 'RX-002',
        doctorName: 'Dr. Meera Singh',
        frequency: 'monthly',
        nextRefillDue: '2025-01-01T14:15:00Z',
        adherenceScore: 88
      }
    ]
  }
}