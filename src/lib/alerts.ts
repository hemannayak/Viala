// Viala Real-Time Alerts System
// Monitors inventory changes and triggers instant notifications

import { InventoryItem, calculateDaysToExpiry, calculateFefoStatus } from './db'
import { toast } from 'sonner'

export type AlertType = 'LOW_STOCK' | 'CRITICAL_EXPIRY' | 'STOCKOUT' | 'QUALITY_ISSUE'
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  medName: string
  currentStock: number
  minSafetyStock: number
  daysToExpiry?: number
  shelfLocation: string
  timestamp: Date
  acknowledged: boolean
  actionRequired: string
}

export interface AlertConfig {
  minSafetyStock: number
  criticalExpiryDays: number
  warningExpiryDays: number
  enableSounds: boolean
  enableBanners: boolean
}

// Default alert configuration
const DEFAULT_CONFIG: AlertConfig = {
  minSafetyStock: 20, // Minimum stock level before alert
  criticalExpiryDays: 7, // Days before expiry to trigger critical alert
  warningExpiryDays: 30, // Days before expiry to trigger warning
  enableSounds: true,
  enableBanners: true
}

// Alert storage (in production, this would be in database)
let activeAlerts: Alert[] = []
let alertListeners: ((alerts: Alert[]) => void)[] = []
let config: AlertConfig = { ...DEFAULT_CONFIG }

// Generate unique alert ID
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Calculate minimum safety stock based on medicine category
function calculateMinSafetyStock(item: InventoryItem): number {
  const baseStock = config.minSafetyStock
  
  // Adjust based on category importance
  switch (item.category?.toLowerCase()) {
    case 'analgesic':
    case 'antibiotic':
      return Math.max(baseStock * 1.5, 30) // Higher safety stock for critical medicines
    case 'cough/cold':
    case 'hydration':
      return Math.max(baseStock * 1.2, 25) // Seasonal medicines need more buffer
    case 'vitamin':
    case 'antacid':
      return Math.max(baseStock * 0.8, 15) // Lower priority medicines
    default:
      return baseStock
  }
}

// Create alert from inventory item
function createAlert(item: InventoryItem, type: AlertType): Alert {
  const daysToExpiry = calculateDaysToExpiry(item.expiry_date)
  const minSafetyStock = calculateMinSafetyStock(item)
  
  let severity: AlertSeverity = 'LOW'
  let title = ''
  let message = ''
  let actionRequired = ''

  switch (type) {
    case 'LOW_STOCK':
      severity = item.quantity === 0 ? 'CRITICAL' : item.quantity < 10 ? 'HIGH' : 'MEDIUM'
      title = item.quantity === 0 ? 'STOCKOUT ALERT' : 'Low Stock Alert'
      message = item.quantity === 0 
        ? `${item.med_name} is completely out of stock`
        : `${item.med_name} is running low (${item.quantity} units remaining)`
      actionRequired = item.quantity === 0 
        ? 'Immediate reorder required - potential customer impact'
        : 'Schedule reorder within 24 hours'
      break

    case 'CRITICAL_EXPIRY':
      severity = daysToExpiry <= 3 ? 'CRITICAL' : daysToExpiry <= 7 ? 'HIGH' : 'MEDIUM'
      title = daysToExpiry <= 3 ? 'IMMEDIATE EXPIRY' : 'Critical Expiry Alert'
      message = `${item.med_name} expires in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'}`
      actionRequired = daysToExpiry <= 3 
        ? 'Apply maximum discount or donate immediately'
        : 'Move to front shelf and apply discount'
      break

    case 'STOCKOUT':
      severity = 'CRITICAL'
      title = 'STOCKOUT - CUSTOMER IMPACT'
      message = `${item.med_name} is completely out of stock`
      actionRequired = 'Emergency reorder - check with suppliers immediately'
      break

    case 'QUALITY_ISSUE':
      severity = 'HIGH'
      title = 'Quality Alert'
      message = `${item.med_name} requires quality check`
      actionRequired = 'Inspect batch and verify storage conditions'
      break
  }

  return {
    id: generateAlertId(),
    type,
    severity,
    title,
    message,
    medName: item.med_name ?? 'Unknown Medicine',
    currentStock: item.quantity,
    minSafetyStock,
    daysToExpiry: daysToExpiry > 0 ? daysToExpiry : undefined,
    shelfLocation: item.shelf_location,
    timestamp: new Date(),
    acknowledged: false,
    actionRequired
  }
}

// Check if item should trigger alert
function shouldTriggerAlert(item: InventoryItem): Alert[] {
  const alerts: Alert[] = []
  const minSafetyStock = calculateMinSafetyStock(item)
  const daysToExpiry = calculateDaysToExpiry(item.expiry_date)

  // Check for low stock / stockout
  if (item.quantity <= minSafetyStock) {
    const alertType = item.quantity === 0 ? 'STOCKOUT' : 'LOW_STOCK'
    alerts.push(createAlert(item, alertType))
  }

  // Check for critical expiry
  if (daysToExpiry <= config.criticalExpiryDays && daysToExpiry > 0) {
    alerts.push(createAlert(item, 'CRITICAL_EXPIRY'))
  }

  return alerts
}

// Add alert to active list
function addAlert(alert: Alert) {
  // Check if similar alert already exists
  const existingAlert = activeAlerts.find(a => 
    a.medName === alert.medName && 
    a.type === alert.type && 
    !a.acknowledged
  )

  if (existingAlert) {
    // Update existing alert
    existingAlert.currentStock = alert.currentStock
    existingAlert.timestamp = alert.timestamp
    existingAlert.message = alert.message
  } else {
    // Add new alert
    activeAlerts.unshift(alert) // Add to beginning for newest first
  }

  // Limit to 50 active alerts
  if (activeAlerts.length > 50) {
    activeAlerts = activeAlerts.slice(0, 50)
  }

  // Notify listeners
  notifyListeners()
}

// Remove alert
function removeAlert(alertId: string) {
  activeAlerts = activeAlerts.filter(alert => alert.id !== alertId)
  notifyListeners()
}

// Acknowledge alert
function acknowledgeAlert(alertId: string) {
  const alert = activeAlerts.find(a => a.id === alertId)
  if (alert) {
    alert.acknowledged = true
    notifyListeners()
  }
}

// Notify all listeners
function notifyListeners() {
  alertListeners.forEach(listener => listener([...activeAlerts]))
}

// Show toast notification
function showToastNotification(alert: Alert) {
  const duration = alert.severity === 'CRITICAL' ? 10000 : alert.severity === 'HIGH' ? 7000 : 5000
  
  const toastOptions = {
    duration,
    action: {
      label: 'View Details',
      onClick: () => {
        // This could open a detailed alert modal
        console.log('Alert details:', alert)
      }
    }
  }

  switch (alert.severity) {
    case 'CRITICAL':
      toast.error(alert.title, {
        description: alert.message,
        ...toastOptions
      })
      break
    case 'HIGH':
      toast.error(alert.title, {
        description: alert.message,
        ...toastOptions
      })
      break
    case 'MEDIUM':
      toast.warning(alert.title, {
        description: alert.message,
        ...toastOptions
      })
      break
    case 'LOW':
      toast.info(alert.title, {
        description: alert.message,
        ...toastOptions
      })
      break
  }
}

// Process inventory change
export function processInventoryChange(
  oldItem: InventoryItem | null, 
  newItem: InventoryItem | null
) {
  // Handle deletion
  if (oldItem && !newItem) {
    // Remove alerts for deleted item
    activeAlerts = activeAlerts.filter(alert => alert.medName !== oldItem.med_name)
    notifyListeners()
    return
  }

  // Handle creation or update
  if (newItem) {
    const newAlerts = shouldTriggerAlert(newItem)
    
    newAlerts.forEach(alert => {
      addAlert(alert)
      
      // Show toast notification
      if (config.enableSounds) {
        showToastNotification(alert)
      }
    })

    // Remove resolved alerts
    if (oldItem) {
      const oldMinSafetyStock = calculateMinSafetyStock(oldItem)
      const newMinSafetyStock = calculateMinSafetyStock(newItem)
      
      // If stock was replenished above safety level
      if (oldItem.quantity <= oldMinSafetyStock && newItem.quantity > newMinSafetyStock) {
        activeAlerts = activeAlerts.filter(alert => 
          !(alert.medName === newItem.med_name && alert.type === 'LOW_STOCK')
        )
        
        // Show success toast
        toast.success('Stock Replenished', {
          description: `${newItem.med_name} stock restored to ${newItem.quantity} units`,
          duration: 3000
        })
        
        notifyListeners()
      }
    }
  }
}

// Subscribe to alerts
export function subscribeToAlerts(callback: (alerts: Alert[]) => void): () => void {
  alertListeners.push(callback)
  
  // Send current alerts immediately
  callback([...activeAlerts])
  
  // Return unsubscribe function
  return () => {
    alertListeners = alertListeners.filter(listener => listener !== callback)
  }
}

// Get active alerts
export function getActiveAlerts(): Alert[] {
  return [...activeAlerts]
}

// Get critical alerts (for banner display)
export function getCriticalAlerts(): Alert[] {
  return activeAlerts.filter(alert => 
    (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') && 
    !alert.acknowledged
  )
}

// Update alert configuration
export function updateAlertConfig(newConfig: Partial<AlertConfig>) {
  config = { ...config, ...newConfig }
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('viala-alert-config', JSON.stringify(config))
  }
}

// Load alert configuration
export function loadAlertConfig() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('viala-alert-config')
    if (saved) {
      try {
        config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) }
      } catch (error) {
        console.error('Error loading alert config:', error)
      }
    }
  }
}

// Get alert severity color
export function getAlertSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200'
    case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

// Get alert type icon
export function getAlertTypeIcon(type: AlertType): string {
  switch (type) {
    case 'LOW_STOCK': return '📦'
    case 'CRITICAL_EXPIRY': return '⏰'
    case 'STOCKOUT': return '🚨'
    case 'QUALITY_ISSUE': return '⚠️'
    default: return '🔔'
  }
}

// Initialize alerts system
export function initializeAlerts() {
  loadAlertConfig()
  
  // Clear old alerts on startup (optional)
  // activeAlerts = []
}

// Export alert management functions
export {
  removeAlert,
  acknowledgeAlert
}