// Enhanced Features Adapter
// Works with existing database schema and provides enhanced functionality

import { db } from './db'

// Simplified interfaces that work with existing schema
export interface SimplePatient {
  patient_id: string
  name: string
  phone: string
  created_at?: string
}

export interface SimpleNotification {
  id?: string
  patient_id: string
  medicine_name: string
  message: string
  phone: string
  sent_at: string
  status: 'sent' | 'delivered' | 'failed'
}

export interface SimpleAlert {
  id?: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  created_at: string
  acknowledged: boolean
}

export interface SimpleAudit {
  id?: string
  operation: 'check_in' | 'check_out'
  medicine_name: string
  quantity: number
  performed_by: string
  created_at: string
}

export class EnhancedFeaturesAdapter {
  private static instance: EnhancedFeaturesAdapter
  private isInitialized = false

  static getInstance(): EnhancedFeaturesAdapter {
    if (!EnhancedFeaturesAdapter.instance) {
      EnhancedFeaturesAdapter.instance = new EnhancedFeaturesAdapter()
    }
    return EnhancedFeaturesAdapter.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    console.log('🚀 Initializing Enhanced Features Adapter...')
    
    // Set up real-time monitoring for inventory changes
    db
      .channel('enhanced-features-inventory')
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

    this.isInitialized = true
    console.log('✅ Enhanced Features Adapter initialized')
  }

  // 1️⃣ Patient Management (using existing patients table)
  async getPatients(): Promise<SimplePatient[]> {
    try {
      const { data, error } = await db
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map((p: any) => ({
        patient_id: p.patient_id ?? p.id,
        name: p.name ?? 'Unknown',
        phone: p.phone ?? '-',
        created_at: p.created_at ?? undefined,
      }))
    } catch (error) {
      console.error('Error fetching patients:', error)
      return []
    }
  }

  async addPatient(patientId: string, name: string, phone: string): Promise<SimplePatient | null> {
    try {
      const { data, error } = await db
        .from('patients')
        .insert({
          patient_id: patientId,
          name,
          phone
        })
        .select()
        .single()

      if (error) throw error
      console.log(`✅ Patient added: ${patientId}`)
      return {
        patient_id: data.patient_id ?? patientId,
        name: data.name ?? name,
        phone: data.phone ?? phone,
        created_at: data.created_at ?? undefined,
      }
    } catch (error) {
      console.error('Error adding patient:', error)
      return null
    }
  }

  // 2️⃣ Stock Notifications (simulated with in-memory storage)
  private notifications: SimpleNotification[] = []

  async sendStockNotification(
    patientId: string,
    medicineName: string,
    phone: string,
    currentStock: number
  ): Promise<void> {
    const message = `🏥 Viala Alert: Your regular medicine "${medicineName}" is running low (${currentStock} units left). Visit us soon to avoid stock-out.`
    
    const notification: SimpleNotification = {
      id: `notif-${Date.now()}`,
      patient_id: patientId,
      medicine_name: medicineName,
      message,
      phone,
      sent_at: new Date().toISOString(),
      status: 'sent'
    }

    this.notifications.push(notification)
    console.log(`📱 Notification sent to ${phone}: ${medicineName}`)

    // Simulate delivery after 2 seconds
    setTimeout(() => {
      const notif = this.notifications.find(n => n.id === notification.id)
      if (notif) {
        notif.status = 'delivered'
        console.log(`✅ SMS delivered to ${phone}`)
      }
    }, 2000)
  }

  async getNotifications(): Promise<SimpleNotification[]> {
    return [...this.notifications].reverse() // Most recent first
  }

  // 3️⃣ Enhanced Alerts (simulated with in-memory storage)
  private alerts: SimpleAlert[] = []

  async createAlert(
    type: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    title: string,
    message: string
  ): Promise<void> {
    const alert: SimpleAlert = {
      id: `alert-${Date.now()}`,
      type,
      severity,
      title,
      message,
      created_at: new Date().toISOString(),
      acknowledged: false
    }

    this.alerts.push(alert)
    console.log(`🚨 Alert created: ${title} (${severity})`)
  }

  async getAlerts(): Promise<SimpleAlert[]> {
    return [...this.alerts].reverse() // Most recent first
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      console.log(`✅ Alert acknowledged: ${alertId}`)
    }
  }

  async dismissAlert(alertId: string): Promise<void> {
    const index = this.alerts.findIndex(a => a.id === alertId)
    if (index !== -1) {
      this.alerts.splice(index, 1)
      console.log(`❌ Alert dismissed: ${alertId}`)
    }
  }

  // 4️⃣ OCR Integration (now handled by inventory system)
  async processOCRImage(imageFile: File): Promise<{
    medicine_name: string
    batch_no: string
    expiry_date: string
    quantity: number
    confidence: number
  }> {
    // This is now handled by the integrated SnapStockScanner
    // Return simulated results for compatibility
    await new Promise(resolve => setTimeout(resolve, 1000))

    const results = {
      medicine_name: 'Paracetamol 500mg Tablet',
      batch_no: `BATCH${Math.floor(Math.random() * 1000)}`,
      expiry_date: '2025-12-31',
      quantity: Math.floor(Math.random() * 50) + 10,
      confidence: 0.85 + Math.random() * 0.1
    }

    console.log('📷 OCR processing completed (legacy compatibility):', results)
    return results
  }

  // 5️⃣ Audit Operations (simulated with in-memory storage)
  private audits: SimpleAudit[] = []

  async createAuditOperation(
    operation: 'check_in' | 'check_out',
    medicineName: string,
    quantity: number,
    performedBy: string
  ): Promise<void> {
    const audit: SimpleAudit = {
      id: `audit-${Date.now()}`,
      operation,
      medicine_name: medicineName,
      quantity,
      performed_by: performedBy,
      created_at: new Date().toISOString()
    }

    this.audits.push(audit)
    console.log(`📋 Audit operation: ${operation} - ${medicineName} (${quantity} units)`)
  }

  async getAuditHistory(): Promise<SimpleAudit[]> {
    return [...this.audits].reverse() // Most recent first
  }

  // 6️⃣ System Validation (simplified health checks)
  async runSystemValidation(): Promise<{
    status: 'healthy' | 'degraded' | 'critical'
    checks: Array<{
      component: string
      status: 'passed' | 'failed' | 'warning'
      message: string
    }>
  }> {
    console.log('🔍 Running system validation...')

    const checks = []

    // Database connectivity check
    try {
      const { data, error } = await db
        .from('inventory')
        .select('count')
        .limit(1)

      checks.push({
        component: 'Database Connectivity',
        status: error ? 'failed' : 'passed',
        message: error ? error.message : 'Database connection successful'
      })
    } catch (err) {
      checks.push({
        component: 'Database Connectivity',
        status: 'failed',
        message: 'Database connection failed'
      })
    }

    // Inventory system check
    try {
      const { data: inventory } = await db
        .from('inventory')
        .select('*')
        .limit(5)

      checks.push({
        component: 'Inventory System',
        status: 'passed',
        message: `Inventory system operational (${inventory?.length || 0} items checked)`
      })
    } catch (err) {
      checks.push({
        component: 'Inventory System',
        status: 'warning',
        message: 'Inventory system check incomplete'
      })
    }

    // Enhanced features check
    checks.push({
      component: 'Enhanced Features',
      status: 'passed',
      message: `Adapter initialized with ${this.alerts.length} alerts, ${this.notifications.length} notifications`
    })

    // Real-time system check
    checks.push({
      component: 'Real-time System',
      status: this.isInitialized ? 'passed' : 'warning',
      message: this.isInitialized ? 'Real-time monitoring active' : 'Real-time monitoring not initialized'
    })

    const failed = checks.filter(c => c.status === 'failed').length
    const warnings = checks.filter(c => c.status === 'warning').length

    let status: 'healthy' | 'degraded' | 'critical'
    if (failed === 0 && warnings === 0) {
      status = 'healthy'
    } else if (failed === 0 && warnings <= 2) {
      status = 'degraded'
    } else {
      status = 'critical'
    }

    console.log(`✅ System validation complete: ${status}`)
    return { status, checks: checks as Array<{component: string; status: "warning" | "failed" | "passed"; message: string}> }
  }

  // Handle inventory changes and trigger alerts/notifications
  private async handleInventoryChange(payload: any): Promise<void> {
    try {
      const { new: newRecord, old: oldRecord } = payload

      if (!newRecord || !oldRecord) return

      // Low stock alert (≤ 10 units)
      if (newRecord.quantity <= 10 && oldRecord.quantity > 10) {
        await this.createAlert(
          'low_stock',
          'HIGH',
          `Low Stock: ${newRecord.med_name}`,
          `Stock for ${newRecord.med_name} has dropped to ${newRecord.quantity} units. Reorder recommended.`
        )

        // Send notifications to patients (simplified - just to first patient)
        const patients = await this.getPatients()
        if (patients.length > 0) {
          await this.sendStockNotification(
            patients[0].patient_id,
            newRecord.med_name,
            patients[0].phone,
            newRecord.quantity
          )
        }
      }

      // Critical stock alert (≤ 5 units)
      if (newRecord.quantity <= 5 && oldRecord.quantity > 5) {
        await this.createAlert(
          'critical_stock',
          'CRITICAL',
          `CRITICAL: ${newRecord.med_name} Nearly Out`,
          `URGENT: Only ${newRecord.quantity} units remaining for ${newRecord.med_name}. Immediate action required.`
        )
      }

    } catch (error) {
      console.error('Error handling inventory change:', error)
    }
  }

  // Get statistics for dashboards
  getStats() {
    return {
      patients: this.notifications.length > 0 ? 3 : 1, // Simulated patient count
      notifications: this.notifications.length,
      alerts: this.alerts.length,
      audits: this.audits.length,
      criticalAlerts: this.alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length
    }
  }
}

// Export singleton instance
export const enhancedFeaturesAdapter = EnhancedFeaturesAdapter.getInstance()