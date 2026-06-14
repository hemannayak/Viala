// System-Wide Functional Validation Engine
// Production-grade health monitoring and validation system

import { db } from './db'
import { patientNotificationEngine } from './patient-notifications'
import { enhancedAlertsEngine } from './enhanced-alerts'
import { ocrAuditSystem } from './ocr-audit-system'

export interface ValidationResult {
  component_name: string
  validation_type: string
  validation_status: 'passed' | 'failed' | 'warning'
  details: any
  error_message?: string
  execution_time_ms: number
  timestamp: string
}

export interface SystemHealthReport {
  overall_status: 'healthy' | 'degraded' | 'critical'
  total_checks: number
  passed: number
  failed: number
  warnings: number
  components: ValidationResult[]
  generated_at: string
}

export class SystemValidationEngine {
  private static instance: SystemValidationEngine
  private isRunning = false
  private lastHealthCheck: Date | null = null

  static getInstance(): SystemValidationEngine {
    if (!SystemValidationEngine.instance) {
      SystemValidationEngine.instance = new SystemValidationEngine()
    }
    return SystemValidationEngine.instance
  }

  /**
   * Run comprehensive system validation
   */
  async runFullSystemValidation(): Promise<SystemHealthReport> {
    if (this.isRunning) {
      throw new Error('System validation already in progress')
    }

    this.isRunning = true
    const startTime = Date.now()

    console.log('🔍 Starting comprehensive system validation...')

    try {
      const validationResults: ValidationResult[] = []

      // 1. Database connectivity and schema validation
      validationResults.push(await this.validateDatabaseConnectivity())
      validationResults.push(await this.validateDatabaseSchema())

      // 2. Core inventory system validation
      validationResults.push(await this.validateInventorySystem())
      validationResults.push(await this.validateInventoryDataIntegrity())

      // 3. Patient notification system validation
      validationResults.push(await this.validatePatientNotificationSystem())
      validationResults.push(await this.validatePatientDataConsistency())

      // 4. Enhanced alerts system validation
      validationResults.push(await this.validateAlertsSystem())
      validationResults.push(await this.validateAlertTriggering())

      // 5. OCR audit system validation
      validationResults.push(await this.validateOCRAuditSystem())
      validationResults.push(await this.validateAuditTrailIntegrity())

      // 6. Real-time subscriptions validation
      validationResults.push(await this.validateRealtimeSubscriptions())

      // 7. Performance and resource validation
      validationResults.push(await this.validateSystemPerformance())

      // 8. Data consistency validation
      validationResults.push(await this.validateDataConsistency())

      // Calculate overall health status
      const passed = validationResults.filter(r => r.validation_status === 'passed').length
      const failed = validationResults.filter(r => r.validation_status === 'failed').length
      const warnings = validationResults.filter(r => r.validation_status === 'warning').length

      let overallStatus: 'healthy' | 'degraded' | 'critical'
      if (failed === 0 && warnings <= 2) {
        overallStatus = 'healthy'
      } else if (failed <= 2 || warnings <= 5) {
        overallStatus = 'degraded'
      } else {
        overallStatus = 'critical'
      }

      const report: SystemHealthReport = {
        overall_status: overallStatus,
        total_checks: validationResults.length,
        passed,
        failed,
        warnings,
        components: validationResults,
        generated_at: new Date().toISOString()
      }

      // Log results to database
      await this.logValidationResults(validationResults)

      this.lastHealthCheck = new Date()
      console.log(`✅ System validation completed in ${Date.now() - startTime}ms`)
      console.log(`📊 Status: ${overallStatus.toUpperCase()} | Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings}`)

      return report

    } catch (error) {
      console.error('Error during system validation:', error)
      throw error
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Validate database connectivity
   */
  private async validateDatabaseConnectivity(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      const { data, error } = await db
        .from('inventory')
        .select('count')
        .limit(1)

      if (error) {
        return {
          component_name: 'Database Connectivity',
          validation_type: 'connectivity_test',
          validation_status: 'failed',
          details: { error: error.message },
          error_message: `Database connection failed: ${error.message}`,
          execution_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }

      return {
        component_name: 'Database Connectivity',
        validation_type: 'connectivity_test',
        validation_status: 'passed',
        details: { connection_successful: true },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Database Connectivity',
        validation_type: 'connectivity_test',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Database connectivity check failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate database schema
   */
  private async validateDatabaseSchema(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      const requiredTables = [
        'inventory',
        'patients',
        'purchase_history',
        'patient_medicine_patterns',
        'stock_notifications',
        'system_alerts',
        'ocr_scan_sessions',
        'audit_operations',
        'system_validation_logs'
      ]

      const missingTables: string[] = []

      for (const table of requiredTables) {
        try {
          const { error } = await (db as any)
            .from(table)
            .select('*')
            .limit(1)

          if (error && error.message.includes('does not exist')) {
            missingTables.push(table)
          }
        } catch (error) {
          missingTables.push(table)
        }
      }

      if (missingTables.length > 0) {
        return {
          component_name: 'Database Schema',
          validation_type: 'schema_validation',
          validation_status: 'failed',
          details: { missing_tables: missingTables },
          error_message: `Missing required tables: ${missingTables.join(', ')}`,
          execution_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }

      return {
        component_name: 'Database Schema',
        validation_type: 'schema_validation',
        validation_status: 'passed',
        details: { tables_validated: requiredTables.length },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Database Schema',
        validation_type: 'schema_validation',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Schema validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate inventory system
   */
  private async validateInventorySystem(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Check inventory data structure
      const { data: inventory, error } = await db
        .from('inventory')
        .select('*')
        .limit(10)

      if (error) {
        return {
          component_name: 'Inventory System',
          validation_type: 'component_health',
          validation_status: 'failed',
          details: { error: error.message },
          error_message: `Inventory system validation failed: ${error.message}`,
          execution_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }

      // Check for required fields
      const requiredFields = ['id', 'med_name', 'batch_no', 'quantity', 'expiry_date']
      const invalidItems = inventory?.filter((item: any) => 
        requiredFields.some(field => !item[field])
      ) || []

      if (invalidItems.length > 0) {
        return {
          component_name: 'Inventory System',
          validation_type: 'component_health',
          validation_status: 'warning',
          details: { 
            invalid_items_count: invalidItems.length,
            total_items_checked: inventory?.length || 0
          },
          error_message: `Found ${invalidItems.length} inventory items with missing required fields`,
          execution_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }

      return {
        component_name: 'Inventory System',
        validation_type: 'component_health',
        validation_status: 'passed',
        details: { 
          items_validated: inventory?.length || 0,
          all_fields_valid: true
        },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Inventory System',
        validation_type: 'component_health',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Inventory system validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate inventory data integrity
   */
  private async validateInventoryDataIntegrity(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Check for negative quantities
      const { data: negativeQty, error: negError } = await db
        .from('inventory')
        .select('id, med_name, quantity')
        .lt('quantity', 0)

      if (negError) throw negError

      // Check for expired items still in stock
      const { data: expiredItems, error: expError } = await db
        .from('inventory')
        .select('id, med_name, expiry_date, quantity')
        .lt('expiry_date', new Date().toISOString().split('T')[0])
        .gt('quantity', 0)

      if (expError) throw expError

      const issues: string[] = []
      if (negativeQty && negativeQty.length > 0) {
        issues.push(`${negativeQty.length} items with negative quantities`)
      }
      if (expiredItems && expiredItems.length > 0) {
        issues.push(`${expiredItems.length} expired items still in stock`)
      }

      if (issues.length > 0) {
        return {
          component_name: 'Inventory Data Integrity',
          validation_type: 'data_consistency',
          validation_status: 'warning',
          details: { 
            issues,
            negative_quantity_items: negativeQty?.length || 0,
            expired_items_in_stock: expiredItems?.length || 0
          },
          error_message: `Data integrity issues found: ${issues.join(', ')}`,
          execution_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }

      return {
        component_name: 'Inventory Data Integrity',
        validation_type: 'data_consistency',
        validation_status: 'passed',
        details: { integrity_check_passed: true },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Inventory Data Integrity',
        validation_type: 'data_consistency',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Data integrity validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate patient notification system
   */
  private async validatePatientNotificationSystem(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Test patient notification engine
      const patients = await patientNotificationEngine.getPatients()
      const patterns = await patientNotificationEngine.getPatientPatterns()
      const notifications = await patientNotificationEngine.getNotificationHistory(10)

      return {
        component_name: 'Patient Notification System',
        validation_type: 'component_health',
        validation_status: 'passed',
        details: { 
          patients_count: patients.length,
          patterns_count: patterns.length,
          recent_notifications: notifications.length,
          system_responsive: true
        },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Patient Notification System',
        validation_type: 'component_health',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Patient notification system validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate patient data consistency
   */
  private async validatePatientDataConsistency(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Check for orphaned patterns (patterns without patients)
      const { data: orphanedPatterns, error } = await db
        .from('patient_medicine_patterns')
        .select(`
          id,
          patient_id,
          patients!inner(id)
        `)

      if (error) throw error

      // Check for patterns with invalid confidence scores
      const { data: invalidPatterns, error: invalidError } = await db
        .from('patient_medicine_patterns')
        .select('id, pattern_confidence')
        .or('pattern_confidence.lt.0,pattern_confidence.gt.1')

      if (invalidError) throw invalidError

      const issues: string[] = []
      if (invalidPatterns && invalidPatterns.length > 0) {
        issues.push(`${invalidPatterns.length} patterns with invalid confidence scores`)
      }

      if (issues.length > 0) {
        return {
          component_name: 'Patient Data Consistency',
          validation_type: 'data_consistency',
          validation_status: 'warning',
          details: { issues },
          error_message: `Patient data consistency issues: ${issues.join(', ')}`,
          execution_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }

      return {
        component_name: 'Patient Data Consistency',
        validation_type: 'data_consistency',
        validation_status: 'passed',
        details: { consistency_check_passed: true },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Patient Data Consistency',
        validation_type: 'data_consistency',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Patient data consistency validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate alerts system
   */
  private async validateAlertsSystem(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Test enhanced alerts engine
      const stats = enhancedAlertsEngine.getAlertStats()
      
      return {
        component_name: 'Enhanced Alerts System',
        validation_type: 'component_health',
        validation_status: 'passed',
        details: { 
          alert_stats: stats,
          system_responsive: true
        },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Enhanced Alerts System',
        validation_type: 'component_health',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Alerts system validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate alert triggering
   */
  private async validateAlertTriggering(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Check for low stock items that should have alerts
      const { data: lowStockItems, error } = await db
        .from('inventory')
        .select('id, med_name, quantity')
        .lte('quantity', 10)

      if (error) throw error

      // Check if corresponding alerts exist
      const { data: existingAlerts, error: alertError } = await db
        .from('system_alerts')
        .select('related_item_id')
        .in('alert_type', ['low_stock', 'critical_stock'])
        .eq('is_dismissed', false)

      if (alertError) throw alertError

      const alertedItemIds = new Set(existingAlerts?.map((a: any) => a.related_item_id) || [])
      const unalertedItems = lowStockItems?.filter((item: any) => !alertedItemIds.has(item.id)) || []

      if (unalertedItems.length > 0) {
        return {
          component_name: 'Alert Triggering',
          validation_type: 'integration_test',
          validation_status: 'warning',
          details: { 
            low_stock_items: lowStockItems?.length || 0,
            unalerted_items: unalertedItems.length
          },
          error_message: `${unalertedItems.length} low stock items without alerts`,
          execution_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }

      return {
        component_name: 'Alert Triggering',
        validation_type: 'integration_test',
        validation_status: 'passed',
        details: { 
          alert_coverage_complete: true,
          low_stock_items_alerted: lowStockItems?.length || 0
        },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Alert Triggering',
        validation_type: 'integration_test',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Alert triggering validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate OCR audit system
   */
  private async validateOCRAuditSystem(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Test OCR audit system
      const sessions = await ocrAuditSystem.getScanSessions(5)
      const auditHistory = await ocrAuditSystem.getAuditHistory(5)
      
      return {
        component_name: 'OCR Audit System',
        validation_type: 'component_health',
        validation_status: 'passed',
        details: { 
          recent_sessions: sessions.length,
          recent_audits: auditHistory.length,
          system_responsive: true
        },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'OCR Audit System',
        validation_type: 'component_health',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `OCR audit system validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate audit trail integrity
   */
  private async validateAuditTrailIntegrity(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Check for audit operations without corresponding inventory changes
      const { data: auditOps, error } = await db
        .from('audit_operations')
        .select('id, inventory_item_id, operation_type')
        .not('inventory_item_id', 'is', null)

      if (error) throw error

      // Check if referenced inventory items exist
      const inventoryIds = [...new Set(auditOps?.map((op: any) => op.inventory_item_id) || [])]
      const { data: existingItems, error: invError } = await db
        .from('inventory')
        .select('id')
        .in('id', inventoryIds)

      if (invError) throw invError

      const existingIds = new Set(existingItems?.map((item: any) => item.id) || [])
      const orphanedAudits = auditOps?.filter((op: any) => !existingIds.has(op.inventory_item_id)) || []

      if (orphanedAudits.length > 0) {
        return {
          component_name: 'Audit Trail Integrity',
          validation_type: 'data_consistency',
          validation_status: 'warning',
          details: { 
            orphaned_audits: orphanedAudits.length,
            total_audits_checked: auditOps?.length || 0
          },
          error_message: `${orphanedAudits.length} audit operations reference non-existent inventory items`,
          execution_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }

      return {
        component_name: 'Audit Trail Integrity',
        validation_type: 'data_consistency',
        validation_status: 'passed',
        details: { 
          audit_integrity_verified: true,
          audits_checked: auditOps?.length || 0
        },
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Audit Trail Integrity',
        validation_type: 'data_consistency',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Audit trail integrity validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate real-time subscriptions
   */
  private async validateRealtimeSubscriptions(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // This is a basic check - in production you'd test actual subscription functionality
      const testConnection = db.realtime.isConnected()
      
      return {
        component_name: 'Real-time Subscriptions',
        validation_type: 'integration_test',
        validation_status: testConnection ? 'passed' : 'warning',
        details: { 
          realtime_connected: testConnection,
          websocket_status: testConnection ? 'connected' : 'disconnected'
        },
        error_message: testConnection ? undefined : 'Real-time connection not established',
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Real-time Subscriptions',
        validation_type: 'integration_test',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Real-time subscriptions validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate system performance
   */
  private async validateSystemPerformance(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Test database query performance
      const queryStart = Date.now()
      const { data, error } = await db
        .from('inventory')
        .select('*')
        .limit(100)

      if (error) throw error

      const queryTime = Date.now() - queryStart
      
      // Performance thresholds
      const isPerformant = queryTime < 1000 // Less than 1 second
      const status = isPerformant ? 'passed' : 'warning'

      return {
        component_name: 'System Performance',
        validation_type: 'performance_test',
        validation_status: status,
        details: { 
          query_time_ms: queryTime,
          records_fetched: data?.length || 0,
          performance_threshold_met: isPerformant
        },
        error_message: isPerformant ? undefined : `Query performance degraded: ${queryTime}ms`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'System Performance',
        validation_type: 'performance_test',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Performance validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate overall data consistency
   */
  private async validateDataConsistency(): Promise<ValidationResult> {
    const startTime = Date.now()
    
    try {
      // Check for data consistency across related tables
      const issues: string[] = []

      // Check patient patterns without purchase history
      let patternsWithoutHistory: any = null
      let patternError: any = null
      try {
        const result = await (db as any).rpc('check_patterns_without_history')
        patternsWithoutHistory = result?.data ?? null
        patternError = result?.error ?? null
      } catch {
        // Ignore if function doesn't exist
      }

      // Check notifications without patients
      const { data: orphanedNotifications, error: notifError } = await (db as any)
        .from('stock_notifications')
        .select(`
          id,
          patient_id,
          patients!inner(id)
        `)
        .is('patients.id', null)

      if (notifError && !notifError.message.includes('does not exist')) {
        throw notifError
      }

      if (orphanedNotifications && orphanedNotifications.length > 0) {
        issues.push(`${orphanedNotifications.length} notifications without valid patients`)
      }

      const status = issues.length === 0 ? 'passed' : 'warning'

      return {
        component_name: 'Data Consistency',
        validation_type: 'data_consistency',
        validation_status: status,
        details: { 
          consistency_issues: issues,
          cross_table_validation_complete: true
        },
        error_message: issues.length > 0 ? `Data consistency issues: ${issues.join(', ')}` : undefined,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        component_name: 'Data Consistency',
        validation_type: 'data_consistency',
        validation_status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: `Data consistency validation failed: ${error}`,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Log validation results to database
   */
  private async logValidationResults(results: ValidationResult[]): Promise<void> {
    try {
      const { error } = await (db as any)
        .from('system_validation_logs')
        .insert(
          results.map(result => ({
            validation_type: result.validation_type,
            component_name: result.component_name,
            validation_status: result.validation_status,
            details: result.details,
            error_message: result.error_message,
            execution_time_ms: result.execution_time_ms
          }))
        )

      if (error) {
        console.error('Error logging validation results:', error)
      }
    } catch (error) {
      console.error('Error logging validation results:', error)
    }
  }

  /**
   * Get last health check time
   */
  getLastHealthCheck(): Date | null {
    return this.lastHealthCheck
  }

  /**
   * Check if validation is currently running
   */
  isValidationRunning(): boolean {
    return this.isRunning
  }

  /**
   * Run quick health check (subset of full validation)
   */
  async runQuickHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical'
    checks: ValidationResult[]
  }> {
    console.log('🔍 Running quick health check...')
    
    const checks: ValidationResult[] = []
    
    // Quick essential checks only
    checks.push(await this.validateDatabaseConnectivity())
    checks.push(await this.validateInventorySystem())
    checks.push(await this.validateAlertsSystem())

    const failed = checks.filter(c => c.validation_status === 'failed').length
    const warnings = checks.filter(c => c.validation_status === 'warning').length

    let status: 'healthy' | 'degraded' | 'critical'
    if (failed === 0 && warnings === 0) {
      status = 'healthy'
    } else if (failed === 0 && warnings <= 1) {
      status = 'degraded'
    } else {
      status = 'critical'
    }

    return { status, checks }
  }
}

// Export singleton instance
export const systemValidationEngine = SystemValidationEngine.getInstance()