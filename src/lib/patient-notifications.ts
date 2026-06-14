// Patient-Based Predictive Stock Notification System
// Fixed to match actual Database schema

import { db } from './db'

export interface PatientProfile {
  id?: string
  patient_id: string
  name: string
  phone: string
  email?: string
  address?: string
  date_of_birth?: string
  created_at?: string
  updated_at?: string
}

export interface PurchasePattern {
  id: string
  patient_id: string
  medicine_name: string
  purchase_frequency: 'daily' | 'weekly' | 'monthly'
  average_quantity: number
  last_purchase_date: string
  next_predicted_purchase: string
  pattern_confidence: number
  is_active: boolean
}

export interface StockNotification {
  id: string
  patient_id: string
  medicine_name: string
  notification_type: string
  message: string
  phone: string
  sent_at: string
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed'
  stock_level_at_trigger: number
  threshold_triggered: number
}

// Configuration constants
const STOCK_TRIGGER_THRESHOLD = 10
const NOTIFICATION_COOLDOWN_HOURS = 24
const MIN_PATTERN_CONFIDENCE = 0.5
const SMS_DELIVERY_SIMULATION_DELAY = 2000

export class PatientNotificationEngine {
  private static instance: PatientNotificationEngine
  private isMonitoring = false
  private channel: any = null

  static getInstance(): PatientNotificationEngine {
    if (!PatientNotificationEngine.instance) {
      PatientNotificationEngine.instance = new PatientNotificationEngine()
    }
    return PatientNotificationEngine.instance
  }

  /**
   * Start monitoring inventory for patient notification triggers
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return

    this.isMonitoring = true

    // Set up real-time inventory monitoring
    this.channel = db
      .channel('patient-notifications-inventory')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inventory'
        },
        async (payload: any) => {
          await this.handleInventoryChange(payload)
        }
      )
      .subscribe()

    // Run initial check for existing low stock items
    await this.checkExistingLowStock()
  }

  /**
   * Stop monitoring and cleanup resources
   */
  async stopMonitoring(): Promise<void> {
    if (this.channel) {
      await db.removeChannel(this.channel)
      this.channel = null
    }
    this.isMonitoring = false
  }

  /**
   * Handle inventory changes and trigger notifications if needed
   */
  private async handleInventoryChange(payload: any): Promise<void> {
    try {
      const { new: newRecord, old: oldRecord } = payload

      if (!newRecord || !oldRecord) return

      // Check if stock dropped to trigger level (10 units)
      const TRIGGER_THRESHOLD = 10
      const wasAboveThreshold = oldRecord.quantity > TRIGGER_THRESHOLD
      const isNowAtOrBelowThreshold = newRecord.quantity <= TRIGGER_THRESHOLD

      if (wasAboveThreshold && isNowAtOrBelowThreshold) {
        console.log(`📉 Stock trigger detected for ${newRecord.med_name}: ${newRecord.quantity} units`)
        await this.processStockTrigger(newRecord)
      }
    } catch (error) {
      console.error('Error handling inventory change for notifications:', error)
    }
  }

  /**
   * Process stock trigger and send notifications to relevant patients
   */
  private async processStockTrigger(inventoryItem: any): Promise<void> {
    try {
      // Find patients with patterns for this medicine
      const { data: patterns, error } = await (db as any)
        .from('patient_medicine_patterns')
        .select(`
          *,
          patients!inner (
            patient_id,
            name,
            phone
          )
        `)
        .eq('medicine_name', inventoryItem.med_name)
        .eq('is_active', true)
        .gte('pattern_confidence', 0.5) // Only confident patterns

      if (error) {
        console.error('Error fetching patient patterns:', error)
        return
      }

      if (!patterns || patterns.length === 0) {
        console.log(`No patient patterns found for ${inventoryItem.med_name}`)
        return
      }

      console.log(`Found ${patterns.length} patients with patterns for ${inventoryItem.med_name}`)

      const medicineName = inventoryItem.med_name
      if (!medicineName) {
        console.warn('Inventory item has no med_name; skipping patient notifications')
        return
      }

      // Check if we already sent notifications for this threshold
      for (const pattern of patterns as any[]) {
        const patientId = pattern.patient_id
        if (!patientId) {
          continue
        }

        const alreadySent = await this.hasRecentNotification(
          patientId,
          medicineName,
          10 // threshold
        )

        if (!alreadySent) {
          await this.sendStockNotification(pattern, inventoryItem)
        }
      }
    } catch (error) {
      console.error('Error processing stock trigger:', error)
    }
  }

  /**
   * Check if we already sent a notification recently for this threshold
   */
  private async hasRecentNotification(
    patientId: string,
    medicineName: string,
    threshold: number
  ): Promise<boolean> {
    const { data, error } = await db
      .from('stock_notifications')
      .select('id')
      .eq('patient_id', patientId)
      .eq('medicine_name', medicineName)
      .eq('threshold_triggered', threshold)
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

    if (error) {
      console.error('Error checking recent notifications:', error)
      return false
    }

    return (data?.length || 0) > 0
  }

  /**
   * Send stock notification to patient
   */
  private async sendStockNotification(
    pattern: any,
    inventoryItem: any
  ): Promise<void> {
    try {
      const patient = pattern.patients
      if (!patient) return

      const message = this.generateNotificationMessage(
        inventoryItem.med_name,
        inventoryItem.quantity,
        pattern.purchase_frequency
      )

      // Log the notification (in production, this would trigger actual SMS)
      const { data, error } = await db
        .from('stock_notifications')
        .insert({
          patient_id: pattern.patient_id,
          medicine_name: inventoryItem.med_name,
          notification_type: 'low_stock_warning',
          message,
          phone: patient.phone,
          stock_level_at_trigger: inventoryItem.quantity,
          threshold_triggered: 10,
          delivery_status: 'sent' // In production: 'pending' until SMS confirmation
        })
        .select()
        .single()

      if (error) {
        console.error('Error logging notification:', error)
        return
      }

      console.log(`📱 Notification sent to ${patient.name} (${patient.phone}):`)
      console.log(`   ${message}`)

      // In production, integrate with SMS service here
      await this.simulateSMSDelivery(data.id, patient.phone, message)

    } catch (error) {
      console.error('Error sending stock notification:', error)
    }
  }

  /**
   * Generate notification message
   */
  private generateNotificationMessage(
    medicineName: string,
    currentStock: number,
    frequency: string
  ): string {
    return `🏥 Viala Alert: Your regular medicine "${medicineName}" is running low (${currentStock} units left). We recommend purchasing soon to avoid stock-out. Visit us or call to reserve your supply. - Viala Pharmacy`
  }

  /**
   * Simulate SMS delivery (replace with actual SMS service in production)
   */
  private async simulateSMSDelivery(
    notificationId: string,
    phoneNumber: string,
    message: string
  ): Promise<void> {
    // Simulate SMS delivery delay
    setTimeout(async () => {
      try {
        await db
          .from('stock_notifications')
          .update({ delivery_status: 'delivered' })
          .eq('id', notificationId)

        console.log(`✅ SMS delivered to ${phoneNumber}`)
      } catch (error) {
        console.error('Error updating delivery status:', error)
      }
    }, 2000)
  }

  /**
   * Check existing low stock items and send notifications
   */
  private async checkExistingLowStock(): Promise<void> {
    try {
      const { data: lowStockItems, error } = await db
        .from('inventory')
        .select('*')
        .lte('quantity', 10)

      if (error) {
        console.error('Error fetching low stock items:', error)
        return
      }

      console.log(`Found ${lowStockItems?.length || 0} existing low stock items`)

      for (const item of lowStockItems || []) {
        await this.processStockTrigger(item)
      }
    } catch (error) {
      console.error('Error checking existing low stock:', error)
    }
  }

  /**
   * Get patient purchase patterns
   */
  async getPatientPatterns(patientId?: string): Promise<PurchasePattern[]> {
    try {
      let query = (db as any)
        .from('patient_medicine_patterns')
        .select(`
          *,
          patients!inner (
            patient_id,
            name,
            phone
          )
        `)
        .eq('is_active', true)
        .order('pattern_confidence', { ascending: false })

      if (patientId) {
        query = query.eq('patient_id', patientId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        patient_id: row.patient_id ?? 'unknown',
        medicine_name: row.medicine_name ?? 'Unknown',
        purchase_frequency: (row.purchase_frequency ?? 'monthly') as PurchasePattern['purchase_frequency'],
        average_quantity: row.average_quantity ?? 0,
        last_purchase_date: row.last_purchase_date ?? new Date().toISOString(),
        next_predicted_purchase: row.next_predicted_purchase ?? new Date().toISOString(),
        pattern_confidence: row.pattern_confidence ?? 0,
        is_active: row.is_active ?? true,
      }))
    } catch (error) {
      console.error('Error fetching patient patterns:', error)
      return []
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(limit = 50): Promise<StockNotification[]> {
    try {
      const { data, error } = await (db as any)
        .from('stock_notifications')
        .select(`
          *,
          patients!inner (
            patient_id,
            name,
            phone
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        patient_id: row.patient_id ?? 'unknown',
        medicine_name: row.medicine_name ?? 'Unknown',
        notification_type: row.notification_type ?? 'unknown',
        message: row.message ?? '',
        phone: row.phone ?? '-',
        sent_at: row.sent_at ?? row.created_at ?? new Date().toISOString(),
        delivery_status: (row.delivery_status ?? 'sent') as StockNotification['delivery_status'],
        stock_level_at_trigger: row.stock_level_at_trigger ?? 0,
        threshold_triggered: row.threshold_triggered ?? 0,
      }))
    } catch (error) {
      console.error('Error fetching notification history:', error)
      return []
    }
  }

  /**
   * Add patient purchase record
   */
  async addPurchaseRecord(
    patientId: string,
    medicineName: string,
    quantity: number,
    unitPrice: number,
    batchNo?: string,
    expiryDate?: string,
    shelfLocation?: string
  ): Promise<void> {
    try {
      const { error } = await db
        .from('purchase_history')
        .insert({
          patient_id: patientId,
          medicine_name: medicineName,
          quantity,
          unit_price: unitPrice,
          total_amount: quantity * unitPrice,
          batch_no: batchNo,
          expiry_date: expiryDate,
          shelf_location: shelfLocation
        })

      if (error) throw error
      console.log(`✅ Purchase record added for patient ${patientId}: ${medicineName}`)
    } catch (error) {
      console.error('Error adding purchase record:', error)
      throw error
    }
  }

  /**
   * Get patients list
   */
  async getPatients(): Promise<PatientProfile[]> {
    try {
      const { data, error } = await db
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        patient_id: row.patient_id ?? row.id,
        name: row.name ?? 'Unknown',
        phone: row.phone ?? '-',
        email: row.email ?? undefined,
        address: row.address ?? undefined,
        date_of_birth: row.date_of_birth ?? undefined,
        created_at: row.created_at ?? undefined,
        updated_at: row.updated_at ?? undefined,
      }))
    } catch (error) {
      console.error('Error fetching patients:', error)
      return []
    }
  }

  /**
   * Add new patient
   */
  async addPatient(
    patientId: string,
    name: string,
    phone: string,
    email?: string,
    address?: string,
    dateOfBirth?: string
  ): Promise<PatientProfile> {
    try {
      const { data, error } = await db
        .from('patients')
        .insert({
          patient_id: patientId,
          name,
          phone: phone,
          email,
          address,
          date_of_birth: dateOfBirth
        })
        .select()
        .single()

      if (error) throw error
      console.log(`✅ Patient added: ${patientId} - ${name}`)
      return {
        id: data.id,
        patient_id: data.patient_id ?? patientId,
        name: data.name ?? name,
        phone: data.phone ?? phone,
        email: (data as any).email ?? email,
        address: (data as any).address ?? address,
        date_of_birth: (data as any).date_of_birth ?? dateOfBirth,
        created_at: data.created_at ?? undefined,
        updated_at: (data as any).updated_at ?? undefined,
      }
    } catch (error) {
      console.error('Error adding patient:', error)
      throw error
    }
  }
}

// Export singleton instance
export const patientNotificationEngine = PatientNotificationEngine.getInstance()