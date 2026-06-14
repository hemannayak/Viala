// Enhanced Real-Time Alerts, Triggers, and Notifications Engine
// Production-grade alerting system with role-based targeting and audit trail

import { db } from './db'

export type AlertType = 
  | 'low_stock' 
  | 'critical_stock' 
  | 'expiry_warning' 
  | 'expiry_critical'
  | 'reorder_needed' 
  | 'supplier_issue'
  | 'patient_notification'
  | 'audit_required'

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type UserRole = 'pharmacist' | 'admin' | 'manager'

export interface SystemAlert {
  id: string
  alert_type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  related_item_id?: string
  related_medicine?: string
  target_roles: UserRole[]
  is_acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  is_dismissed: boolean
  dismissed_by?: string
  dismissed_at?: string
  auto_generated: boolean
  trigger_conditions?: any
  created_at: string
  expires_at?: string
}

export class EnhancedAlertsEngine {
  private static instance: EnhancedAlertsEngine
  private subscribers: Map<string, (alerts: SystemAlert[]) => void> = new Map()
  private isMonitoring = false
  private currentAlerts: SystemAlert[] = []

  static getInstance(): EnhancedAlertsEngine {
    if (!EnhancedAlertsEngine.instance) {
      EnhancedAlertsEngine.instance = new EnhancedAlertsEngine()
    }
    return EnhancedAlertsEngine.instance
  }

  /**
   * Start real-time monitoring for alerts
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return

    console.log('🚨 Starting Enhanced Alerts Engine...')
    this.isMonitoring = true

    // Load initial alerts
    await this.loadAlerts()

    // Set up real-time subscription for new alerts
    db
      .channel('system-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_alerts'
        },
        async () => {
          await this.loadAlerts()
        }
      )
      .subscribe()

    // Set up inventory monitoring for automatic alert generation
    db
      .channel('inventory-alerts-monitoring')
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

    // Run periodic expiry checks
    this.startExpiryMonitoring()
  }

  /**
   * Load all active alerts
   */
  private async loadAlerts(): Promise<void> {
    try {
      const { data, error } = await db
        .from('system_alerts')
        .select('*')
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      this.currentAlerts = (data || []).map((a: any): SystemAlert => ({
        id: a.id,
        alert_type: (a.alert_type ?? 'audit_required') as AlertType,
        severity: (a.severity ?? 'LOW') as AlertSeverity,
        title: a.title ?? 'System Alert',
        message: a.message ?? '',
        related_item_id: a.related_item_id ?? undefined,
        related_medicine: a.related_medicine ?? undefined,
        target_roles: (Array.isArray(a.target_roles)
          ? a.target_roles
          : (a.target_roles ? (a.target_roles as any) : ['admin'])) as UserRole[],
        is_acknowledged: a.is_acknowledged ?? false,
        acknowledged_by: a.acknowledged_by ?? undefined,
        acknowledged_at: a.acknowledged_at ?? undefined,
        is_dismissed: a.is_dismissed ?? false,
        dismissed_by: a.dismissed_by ?? undefined,
        dismissed_at: a.dismissed_at ?? undefined,
        auto_generated: a.auto_generated ?? true,
        trigger_conditions: a.trigger_conditions ?? undefined,
        created_at: a.created_at ?? new Date().toISOString(),
        expires_at: a.expires_at ?? undefined,
      }))
      this.notifySubscribers()
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  /**
   * Handle inventory changes and generate alerts
   */
  private async handleInventoryChange(payload: any): Promise<void> {
    try {
      const { new: newRecord, old: oldRecord } = payload

      if (!newRecord || !oldRecord) return

      // Low stock alert (10 units)
      if (newRecord.quantity <= 10 && oldRecord.quantity > 10) {
        await this.createAlert({
          alert_type: 'low_stock',
          severity: 'HIGH',
          title: `Low Stock: ${newRecord.med_name}`,
          message: `Stock for ${newRecord.med_name} has dropped to ${newRecord.quantity} units. Reorder recommended.`,
          related_item_id: newRecord.id,
          related_medicine: newRecord.med_name,
          target_roles: ['pharmacist', 'admin'],
          trigger_conditions: {
            threshold: 10,
            current_stock: newRecord.quantity,
            previous_stock: oldRecord.quantity
          }
        })
      }

      // Critical stock alert (5 units)
      if (newRecord.quantity <= 5 && oldRecord.quantity > 5) {
        await this.createAlert({
          alert_type: 'critical_stock',
          severity: 'CRITICAL',
          title: `CRITICAL: ${newRecord.med_name} Nearly Out`,
          message: `URGENT: Only ${newRecord.quantity} units remaining for ${newRecord.med_name}. Immediate action required.`,
          related_item_id: newRecord.id,
          related_medicine: newRecord.med_name,
          target_roles: ['pharmacist', 'admin', 'manager'],
          trigger_conditions: {
            threshold: 5,
            current_stock: newRecord.quantity,
            previous_stock: oldRecord.quantity
          }
        })
      }

      // Reorder needed (based on velocity)
      if (newRecord.quantity <= 15 && (oldRecord.quantity - newRecord.quantity) >= 5) {
        await this.createAlert({
          alert_type: 'reorder_needed',
          severity: 'MEDIUM',
          title: `Reorder Recommended: ${newRecord.med_name}`,
          message: `${newRecord.med_name} is selling rapidly (${oldRecord.quantity - newRecord.quantity} units sold recently). Current stock: ${newRecord.quantity} units.`,
          related_item_id: newRecord.id,
          related_medicine: newRecord.med_name,
          target_roles: ['admin'],
          trigger_conditions: {
            velocity: oldRecord.quantity - newRecord.quantity,
            current_stock: newRecord.quantity
          }
        })
      }
    } catch (error) {
      console.error('Error handling inventory change for alerts:', error)
    }
  }

  /**
   * Start monitoring for expiry alerts
   */
  private startExpiryMonitoring(): void {
    // Check every hour
    setInterval(async () => {
      await this.checkExpiryAlerts()
    }, 60 * 60 * 1000)

    // Initial check
    this.checkExpiryAlerts()
  }

  /**
   * Check for expiry-related alerts
   */
  private async checkExpiryAlerts(): Promise<void> {
    try {
      const { data: inventory, error } = await db
        .from('inventory')
        .select('*')

      if (error) throw error

      const now = new Date()

      for (const item of inventory || []) {
        const expiryDate = new Date(item.expiry_date)
        const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Critical expiry (7 days or less)
        if (daysToExpiry <= 7 && daysToExpiry > 0) {
          const existingAlert = await this.hasRecentAlert(
            'expiry_critical',
            item.id,
            24 // hours
          )

          if (!existingAlert) {
            await this.createAlert({
              alert_type: 'expiry_critical',
              severity: 'CRITICAL',
              title: `EXPIRY ALERT: ${item.med_name}`,
              message: `${item.med_name} (Batch: ${item.batch_no}) expires in ${daysToExpiry} days. Immediate action required.`,
              related_item_id: item.id,
              related_medicine: item.med_name ?? undefined,
              target_roles: ['pharmacist', 'admin'],
              trigger_conditions: {
                days_to_expiry: daysToExpiry,
                expiry_date: item.expiry_date,
                batch_no: item.batch_no
              }
            })
          }
        }

        // Warning expiry (30 days or less)
        if (daysToExpiry <= 30 && daysToExpiry > 7) {
          const existingAlert = await this.hasRecentAlert(
            'expiry_warning',
            item.id,
            72 // hours
          )

          if (!existingAlert) {
            await this.createAlert({
              alert_type: 'expiry_warning',
              severity: 'HIGH',
              title: `Expiry Warning: ${item.med_name}`,
              message: `${item.med_name} (Batch: ${item.batch_no}) expires in ${daysToExpiry} days. Plan FEFO actions.`,
              related_item_id: item.id,
              related_medicine: item.med_name ?? undefined,
              target_roles: ['pharmacist', 'admin'],
              trigger_conditions: {
                days_to_expiry: daysToExpiry,
                expiry_date: item.expiry_date,
                batch_no: item.batch_no
              }
            })
          }
        }
      }
    } catch (error) {
      console.error('Error checking expiry alerts:', error)
    }
  }

  /**
   * Check if similar alert was created recently
   */
  private async hasRecentAlert(
    alertType: AlertType,
    relatedItemId: string,
    hoursAgo: number
  ): Promise<boolean> {
    try {
      const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

      const { data, error } = await db
        .from('system_alerts')
        .select('id')
        .eq('alert_type', alertType)
        .eq('related_item_id', relatedItemId)
        .gte('created_at', cutoffTime)
        .limit(1)

      if (error) throw error
      return (data?.length || 0) > 0
    } catch (error) {
      console.error('Error checking recent alerts:', error)
      return false
    }
  }

  /**
   * Create a new alert
   */
  async createAlert(alert: Partial<SystemAlert>): Promise<SystemAlert | null> {
    try {
      const { data, error } = await db
        .from('system_alerts')
        .insert({
          alert_type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          related_item_id: alert.related_item_id,
          related_medicine: alert.related_medicine,
          target_roles: alert.target_roles || [],
          auto_generated: alert.auto_generated !== false,
          trigger_conditions: alert.trigger_conditions,
          expires_at: alert.expires_at
        })
        .select()
        .single()

      if (error) throw error

      console.log(`🚨 Alert created: ${alert.title}`)
      await this.loadAlerts()
      return {
        id: data.id,
        alert_type: (data.alert_type ?? 'audit_required') as AlertType,
        severity: (data.severity ?? 'LOW') as AlertSeverity,
        title: data.title ?? 'System Alert',
        message: data.message ?? '',
        related_item_id: data.related_item_id ?? undefined,
        related_medicine: data.related_medicine ?? undefined,
        target_roles: (Array.isArray((data as any).target_roles)
          ? (data as any).target_roles
          : ((data as any).target_roles ? ((data as any).target_roles as any) : ['admin'])) as UserRole[],
        is_acknowledged: (data as any).is_acknowledged ?? false,
        acknowledged_by: (data as any).acknowledged_by ?? undefined,
        acknowledged_at: (data as any).acknowledged_at ?? undefined,
        is_dismissed: data.is_dismissed ?? false,
        dismissed_by: data.dismissed_by ?? undefined,
        dismissed_at: data.dismissed_at ?? undefined,
        auto_generated: (data as any).auto_generated ?? true,
        trigger_conditions: (data as any).trigger_conditions ?? undefined,
        created_at: data.created_at ?? new Date().toISOString(),
        expires_at: (data as any).expires_at ?? undefined,
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      return null
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      const { error } = await db
        .from('system_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_by: acknowledgedBy,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      console.log(`✅ Alert acknowledged: ${alertId}`)
      await this.loadAlerts()
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      throw error
    }
  }

  /**
   * Dismiss an alert (removes from view but keeps in audit trail)
   */
  async dismissAlert(alertId: string, dismissedBy: string): Promise<void> {
    try {
      const { error } = await db
        .from('system_alerts')
        .update({
          is_dismissed: true,
          dismissed_by: dismissedBy,
          dismissed_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      console.log(`❌ Alert dismissed: ${alertId}`)
      await this.loadAlerts()
    } catch (error) {
      console.error('Error dismissing alert:', error)
      throw error
    }
  }

  /**
   * Get alerts for specific role
   */
  getAlertsForRole(role: UserRole): SystemAlert[] {
    return this.currentAlerts.filter(alert => 
      alert.target_roles.includes(role)
    )
  }

  /**
   * Get critical alerts
   */
  getCriticalAlerts(): SystemAlert[] {
    return this.currentAlerts.filter(alert => 
      alert.severity === 'CRITICAL' && !alert.is_acknowledged
    )
  }

  /**
   * Subscribe to alert updates
   */
  subscribe(id: string, callback: (alerts: SystemAlert[]) => void): () => void {
    this.subscribers.set(id, callback)
    
    // Immediately send current alerts
    callback(this.currentAlerts)

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id)
    }
  }

  /**
   * Notify all subscribers of alert changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      callback(this.currentAlerts)
    })
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    unacknowledged: number
  } {
    return {
      total: this.currentAlerts.length,
      critical: this.currentAlerts.filter(a => a.severity === 'CRITICAL').length,
      high: this.currentAlerts.filter(a => a.severity === 'HIGH').length,
      medium: this.currentAlerts.filter(a => a.severity === 'MEDIUM').length,
      low: this.currentAlerts.filter(a => a.severity === 'LOW').length,
      unacknowledged: this.currentAlerts.filter(a => !a.is_acknowledged).length
    }
  }
}

// Export singleton instance
export const enhancedAlertsEngine = EnhancedAlertsEngine.getInstance()