'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { db, type InventoryItem } from '@/lib/db'
type RealtimeChannel = any
import { 
  processInventoryChange, 
  subscribeToAlerts, 
  initializeAlerts,
  acknowledgeAlert as ackAlert,
  removeAlert,
  type Alert 
} from '@/lib/alerts'

// Import demo alerts for development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/demo-alerts')
}

interface AlertsContextType {
  alerts: Alert[]
  criticalAlerts: Alert[]
  acknowledgeAlert: (alertId: string) => void
  clearAlert: (alertId: string) => void
  isListening: boolean
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined)

export function useAlerts() {
  const context = useContext(AlertsContext)
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider')
  }
  return context
}

interface AlertsProviderProps {
  children: React.ReactNode
}

export function AlertsProvider({ children }: AlertsProviderProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize alerts system
  useEffect(() => {
    if (isInitialized) return
    
    initializeAlerts()
    setIsInitialized(true)
    
    // Subscribe to alert changes
    const unsubscribe = subscribeToAlerts((newAlerts) => {
      setAlerts(newAlerts)
    })

    return () => {
      unsubscribe()
      // ❌ DO NOT set state in cleanup - this causes infinite loops
      // setIsInitialized(false) 
    }
  }, []) // ✅ Empty dependency array

  // Set up real-time inventory monitoring
  useEffect(() => {
    let channel: RealtimeChannel | null = null

    const setupRealtimeListener = async () => {
      try {
        // Skip real-time setup if in demo mode
        if (process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true') {
          console.log('Demo mode active - skipping real-time alerts setup')
          return
        }

        // Load initial inventory data with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        )
        
        const queryPromise = db
          .from('inventory')
          .select('*')

        const { data: initialInventory, error } = await Promise.race([queryPromise, timeoutPromise]) as any

        if (error) {
          console.error('Error loading initial inventory:', error)
          return
        }

        // Build initial cache and process alerts
        initialInventory?.forEach((item: any) => {
          if (item && item.id) {
            // Process initial alerts for existing data
            try {
              processInventoryChange(null, item)
            } catch (alertError) {
              console.error('Error processing initial alert:', alertError)
            }
          }
        })

        // Set up real-time subscription
        channel = db
          .channel('inventory-alerts-realtime')
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'inventory'
            },
            (payload: any) => {
              console.log('Real-time inventory change:', payload)
              
              // Add comprehensive null checks for payload
              if (!payload || typeof payload !== 'object') {
                console.warn('Received invalid payload from real-time subscription:', payload)
                return
              }
              
              // Safely destructure with defaults
              const eventType = payload.eventType || payload.event_type
              const newRecord = payload.new || payload.record
              const oldRecord = payload.old
              
              // Add validation for eventType
              if (!eventType) {
                console.warn('Received payload without eventType:', payload)
                return
              }
              
              try {
                switch (eventType) {
                  case 'INSERT':
                    if (newRecord) {
                      const newItem = newRecord as InventoryItem
                      processInventoryChange(null, newItem)
                    }
                    break

                  case 'UPDATE':
                    if (newRecord && oldRecord) {
                      const newItem = newRecord as InventoryItem
                      const oldItem = oldRecord as InventoryItem
                      processInventoryChange(oldItem, newItem)
                    }
                    break

                  case 'DELETE':
                    if (oldRecord) {
                      const deletedItem = oldRecord as InventoryItem
                      processInventoryChange(deletedItem, null)
                    }
                    break
                    
                  default:
                    console.warn('Unknown eventType:', eventType)
                }
              } catch (error) {
                console.error('Error processing real-time change:', error)
              }
            }
          )
          .subscribe((status: any) => {
            console.log('Real-time subscription status:', status)
            try {
              setIsListening(status === 'SUBSCRIBED')
            } catch (error) {
              console.error('Error updating listening status:', error)
              setIsListening(false)
            }
          })

      } catch (error) {
        console.error('Error setting up real-time alerts:', error)
        setIsListening(false)
        
        // Don't throw the error, just log it to prevent 500 errors
        if (error instanceof Error) {
          console.error('Alert setup error details:', error.message)
        }
      }
    }

    // Wrap the entire setup in a try-catch to prevent any unhandled errors
    setupRealtimeListener().catch((error) => {
      console.error('Failed to setup real-time listener:', error)
      setIsListening(false)
    })

    // Cleanup
    return () => {
      try {
        if (channel) {
          db.removeChannel(channel)
        }
      } catch (error) {
        console.error('Error cleaning up real-time channel:', error)
      } finally {
        setIsListening(false)
      }
    }
  }, [])

  // Get critical alerts for banner display (memoized)
  const criticalAlerts = useMemo(() => 
    alerts.filter(alert => 
      (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') && 
      !alert.acknowledged
    ), [alerts]
  )

  const acknowledgeAlert = useCallback((alertId: string) => {
    try {
      ackAlert(alertId)
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }, [])

  const clearAlert = useCallback((alertId: string) => {
    try {
      removeAlert(alertId)
    } catch (error) {
      console.error('Error clearing alert:', error)
    }
  }, [])

  const value = useMemo(() => ({
    alerts,
    criticalAlerts,
    acknowledgeAlert,
    clearAlert,
    isListening
  }), [alerts, criticalAlerts, acknowledgeAlert, clearAlert, isListening])

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  )
}