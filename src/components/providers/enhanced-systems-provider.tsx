'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { patientNotificationEngine, type PatientProfile, type PurchasePattern, type StockNotification } from '@/lib/patient-notifications'
import { enhancedAlertsEngine, type SystemAlert, type AlertSeverity, type UserRole } from '@/lib/enhanced-alerts'
import { ocrAuditSystem, type OCRScanSession, type AuditOperation, type ExtractedMedicineData } from '@/lib/ocr-audit-system'
import { systemValidationEngine, type SystemHealthReport, type ValidationResult } from '@/lib/system-validation'

interface EnhancedSystemsContextType {
  // Patient Notifications
  patients: PatientProfile[]
  patientPatterns: PurchasePattern[]
  stockNotifications: StockNotification[]
  addPatient: (patientId: string, name: string, phoneNumber: string, email?: string) => Promise<void>
  addPurchaseRecord: (patientId: string, medicineName: string, quantity: number, unitPrice: number) => Promise<void>
  
  // Enhanced Alerts
  systemAlerts: SystemAlert[]
  criticalAlerts: SystemAlert[]
  alertStats: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    unacknowledged: number
  }
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => Promise<void>
  dismissAlert: (alertId: string, dismissedBy: string) => Promise<void>
  getAlertsForRole: (role: UserRole) => SystemAlert[]
  
  // OCR Audit System
  currentOCRSession: OCRScanSession | null
  auditHistory: AuditOperation[]
  scanSessions: OCRScanSession[]
  startOCRSession: (scanType: 'camera' | 'upload' | 'manual', scannedBy: string) => Promise<OCRScanSession>
  processOCRImage: (imageFile: File | string) => Promise<ExtractedMedicineData>
  createCheckInOperation: (medicineData: ExtractedMedicineData, quantity: number, shelfLocation: string, performedBy: string, reason?: string) => Promise<AuditOperation>
  createCheckOutOperation: (inventoryItemId: string, quantity: number, performedBy: string, reason?: string) => Promise<AuditOperation>
  cleanupOCRSession: () => Promise<void>
  
  // System Validation
  systemHealth: SystemHealthReport | null
  lastHealthCheck: Date | null
  isValidationRunning: boolean
  runFullValidation: () => Promise<SystemHealthReport>
  runQuickHealthCheck: () => Promise<{ status: 'healthy' | 'degraded' | 'critical', checks: ValidationResult[] }>
  
  // System Status
  isSystemsInitialized: boolean
  systemsError: string | null
}

const EnhancedSystemsContext = createContext<EnhancedSystemsContextType | undefined>(undefined)

export function useEnhancedSystems() {
  const context = useContext(EnhancedSystemsContext)
  if (context === undefined) {
    throw new Error('useEnhancedSystems must be used within an EnhancedSystemsProvider')
  }
  return context
}

interface EnhancedSystemsProviderProps {
  children: React.ReactNode
}

export function EnhancedSystemsProvider({ children }: EnhancedSystemsProviderProps) {
  // Patient Notifications State
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [patientPatterns, setPatientPatterns] = useState<PurchasePattern[]>([])
  const [stockNotifications, setStockNotifications] = useState<StockNotification[]>([])
  
  // Enhanced Alerts State
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [alertStats, setAlertStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unacknowledged: 0
  })
  
  // OCR Audit System State
  const [currentOCRSession, setCurrentOCRSession] = useState<OCRScanSession | null>(null)
  const [auditHistory, setAuditHistory] = useState<AuditOperation[]>([])
  const [scanSessions, setScanSessions] = useState<OCRScanSession[]>([])
  
  // System Validation State
  const [systemHealth, setSystemHealth] = useState<SystemHealthReport | null>(null)
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null)
  const [isValidationRunning, setIsValidationRunning] = useState(false)
  
  // System Status
  const [isSystemsInitialized, setIsSystemsInitialized] = useState(false)
  const [systemsError, setSystemsError] = useState<string | null>(null)

  // Initialize all enhanced systems
  useEffect(() => {
    let mounted = true

    const initializeSystems = async () => {
      try {
        console.log('🚀 Initializing Enhanced Systems...')

        // Initialize Patient Notification Engine
        await patientNotificationEngine.startMonitoring()
        console.log('✅ Patient Notification Engine initialized')

        // Initialize Enhanced Alerts Engine
        await enhancedAlertsEngine.startMonitoring()
        console.log('✅ Enhanced Alerts Engine initialized')

        // Load initial data
        if (mounted) {
          await loadInitialData()
          setIsSystemsInitialized(true)
          console.log('✅ All Enhanced Systems initialized successfully')
        }

        // Set up alerts subscription
        const unsubscribeAlerts = enhancedAlertsEngine.subscribe('enhanced-systems-provider', (alerts) => {
          if (mounted) {
            setSystemAlerts(alerts)
            setAlertStats(enhancedAlertsEngine.getAlertStats())
          }
        })

        return () => {
          unsubscribeAlerts()
        }

      } catch (error) {
        console.error('Error initializing enhanced systems:', error)
        if (mounted) {
          setSystemsError(error instanceof Error ? error.message : 'Unknown error')
        }
      }
    }

    initializeSystems()

    return () => {
      mounted = false
    }
  }, [])

  // Load initial data
  const loadInitialData = async () => {
    try {
      // Load patients and patterns
      const [patientsData, patternsData, notificationsData] = await Promise.all([
        patientNotificationEngine.getPatients(),
        patientNotificationEngine.getPatientPatterns(),
        patientNotificationEngine.getNotificationHistory(20)
      ])

      setPatients(patientsData)
      setPatientPatterns(patternsData)
      setStockNotifications(notificationsData)

      // Load OCR audit data
      const [auditData, sessionsData] = await Promise.all([
        ocrAuditSystem.getAuditHistory(20),
        ocrAuditSystem.getScanSessions(10)
      ])

      setAuditHistory(auditData)
      setScanSessions(sessionsData)
      setCurrentOCRSession(ocrAuditSystem.getCurrentSession())

      // Update validation status
      setLastHealthCheck(systemValidationEngine.getLastHealthCheck())
      setIsValidationRunning(systemValidationEngine.isValidationRunning())

    } catch (error) {
      console.error('Error loading initial data:', error)
      throw error
    }
  }

  // Patient Notification Functions
  const addPatient = useCallback(async (
    patientId: string,
    name: string,
    phoneNumber: string,
    email?: string
  ) => {
    try {
      const newPatient = await patientNotificationEngine.addPatient(patientId, name, phoneNumber, email)
      setPatients(prev => [newPatient, ...prev])
    } catch (error) {
      console.error('Error adding patient:', error)
      throw error
    }
  }, [])

  const addPurchaseRecord = useCallback(async (
    patientId: string,
    medicineName: string,
    quantity: number,
    unitPrice: number
  ) => {
    try {
      await patientNotificationEngine.addPurchaseRecord(patientId, medicineName, quantity, unitPrice)
      
      // Refresh patterns and notifications
      const [updatedPatterns, updatedNotifications] = await Promise.all([
        patientNotificationEngine.getPatientPatterns(),
        patientNotificationEngine.getNotificationHistory(20)
      ])
      
      setPatientPatterns(updatedPatterns)
      setStockNotifications(updatedNotifications)
    } catch (error) {
      console.error('Error adding purchase record:', error)
      throw error
    }
  }, [])

  // Enhanced Alerts Functions
  const acknowledgeAlert = useCallback(async (alertId: string, acknowledgedBy: string) => {
    try {
      await enhancedAlertsEngine.acknowledgeAlert(alertId, acknowledgedBy)
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      throw error
    }
  }, [])

  const dismissAlert = useCallback(async (alertId: string, dismissedBy: string) => {
    try {
      await enhancedAlertsEngine.dismissAlert(alertId, dismissedBy)
    } catch (error) {
      console.error('Error dismissing alert:', error)
      throw error
    }
  }, [])

  const getAlertsForRole = useCallback((role: UserRole) => {
    return enhancedAlertsEngine.getAlertsForRole(role)
  }, [])

  // OCR Audit System Functions
  const startOCRSession = useCallback(async (
    scanType: 'camera' | 'upload' | 'manual',
    scannedBy: string
  ) => {
    try {
      const session = await ocrAuditSystem.startScanSession(scanType, scannedBy)
      setCurrentOCRSession(session)
      
      // Refresh sessions list
      const updatedSessions = await ocrAuditSystem.getScanSessions(10)
      setScanSessions(updatedSessions)
      
      return session
    } catch (error) {
      console.error('Error starting OCR session:', error)
      throw error
    }
  }, [])

  const processOCRImage = useCallback(async (imageFile: File | string) => {
    try {
      const extractedData = await ocrAuditSystem.processImage(imageFile)
      
      // Refresh current session
      setCurrentOCRSession(ocrAuditSystem.getCurrentSession())
      
      return extractedData
    } catch (error) {
      console.error('Error processing OCR image:', error)
      throw error
    }
  }, [])

  const createCheckInOperation = useCallback(async (
    medicineData: ExtractedMedicineData,
    quantity: number,
    shelfLocation: string,
    performedBy: string,
    reason?: string
  ) => {
    try {
      const operation = await ocrAuditSystem.createCheckInOperation(
        medicineData,
        quantity,
        shelfLocation,
        performedBy,
        reason
      )
      
      // Refresh audit history
      const updatedHistory = await ocrAuditSystem.getAuditHistory(20)
      setAuditHistory(updatedHistory)
      
      return operation
    } catch (error) {
      console.error('Error creating check-in operation:', error)
      throw error
    }
  }, [])

  const createCheckOutOperation = useCallback(async (
    inventoryItemId: string,
    quantity: number,
    performedBy: string,
    reason?: string
  ) => {
    try {
      const operation = await ocrAuditSystem.createCheckOutOperation(
        inventoryItemId,
        quantity,
        performedBy,
        reason
      )
      
      // Refresh audit history
      const updatedHistory = await ocrAuditSystem.getAuditHistory(20)
      setAuditHistory(updatedHistory)
      
      return operation
    } catch (error) {
      console.error('Error creating check-out operation:', error)
      throw error
    }
  }, [])

  const cleanupOCRSession = useCallback(async () => {
    try {
      await ocrAuditSystem.cleanupSession()
      setCurrentOCRSession(null)
      
      // Refresh sessions list
      const updatedSessions = await ocrAuditSystem.getScanSessions(10)
      setScanSessions(updatedSessions)
    } catch (error) {
      console.error('Error cleaning up OCR session:', error)
      throw error
    }
  }, [])

  // System Validation Functions
  const runFullValidation = useCallback(async () => {
    try {
      setIsValidationRunning(true)
      const report = await systemValidationEngine.runFullSystemValidation()
      setSystemHealth(report)
      setLastHealthCheck(new Date())
      return report
    } catch (error) {
      console.error('Error running full validation:', error)
      throw error
    } finally {
      setIsValidationRunning(false)
    }
  }, [])

  const runQuickHealthCheck = useCallback(async () => {
    try {
      const result = await systemValidationEngine.runQuickHealthCheck()
      setLastHealthCheck(new Date())
      return result
    } catch (error) {
      console.error('Error running quick health check:', error)
      throw error
    }
  }, [])

  // Computed values
  const criticalAlerts = useMemo(() => 
    systemAlerts.filter(alert => 
      alert.severity === 'CRITICAL' && !alert.is_acknowledged
    ), [systemAlerts]
  )

  const value = useMemo(() => ({
    // Patient Notifications
    patients,
    patientPatterns,
    stockNotifications,
    addPatient,
    addPurchaseRecord,
    
    // Enhanced Alerts
    systemAlerts,
    criticalAlerts,
    alertStats,
    acknowledgeAlert,
    dismissAlert,
    getAlertsForRole,
    
    // OCR Audit System
    currentOCRSession,
    auditHistory,
    scanSessions,
    startOCRSession,
    processOCRImage,
    createCheckInOperation,
    createCheckOutOperation,
    cleanupOCRSession,
    
    // System Validation
    systemHealth,
    lastHealthCheck,
    isValidationRunning,
    runFullValidation,
    runQuickHealthCheck,
    
    // System Status
    isSystemsInitialized,
    systemsError
  }), [
    patients,
    patientPatterns,
    stockNotifications,
    addPatient,
    addPurchaseRecord,
    systemAlerts,
    criticalAlerts,
    alertStats,
    acknowledgeAlert,
    dismissAlert,
    getAlertsForRole,
    currentOCRSession,
    auditHistory,
    scanSessions,
    startOCRSession,
    processOCRImage,
    createCheckInOperation,
    createCheckOutOperation,
    cleanupOCRSession,
    systemHealth,
    lastHealthCheck,
    isValidationRunning,
    runFullValidation,
    runQuickHealthCheck,
    isSystemsInitialized,
    systemsError
  ])

  return (
    <EnhancedSystemsContext.Provider value={value}>
      {children}
    </EnhancedSystemsContext.Provider>
  )
}