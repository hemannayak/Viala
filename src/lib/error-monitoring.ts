/**
 * Error Monitoring and Logging System
 * Comprehensive error tracking, logging, and alerting for production
 */

import type { AuthUser } from './auth-types'

export interface ErrorLog {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  error?: Error
  context?: Record<string, any>
  user?: Partial<AuthUser>
  request?: {
    method: string
    url: string
    headers: Record<string, string>
    body?: any
  }
  stack?: string
  fingerprint: string
}

export interface PerformanceMetric {
  id: string
  timestamp: string
  metric: string
  value: number
  unit: string
  context?: Record<string, any>
  user?: Partial<AuthUser>
}

/**
 * Error Monitoring Service
 */
export class ErrorMonitor {
  private static instance: ErrorMonitor
  private errorLogs: ErrorLog[] = []
  private performanceMetrics: PerformanceMetric[] = []
  private maxLogs = 1000 // Keep last 1000 logs in memory
  private alertThresholds = {
    errorRate: 10, // errors per minute
    responseTime: 5000, // milliseconds
    memoryUsage: 0.9 // 90% of available memory
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  /**
   * Log an error with context
   */
  logError(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    user?: Partial<AuthUser>,
    request?: any
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error,
      context,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        pharmacy_id: user.pharmacy_id
      } : undefined,
      request: request ? {
        method: request.method,
        url: request.url,
        headers: this.sanitizeHeaders(request.headers),
        body: this.sanitizeBody(request.body)
      } : undefined,
      stack: error?.stack,
      fingerprint: this.generateFingerprint(message, error)
    }

    this.addLog(errorLog)
    this.checkAlerts()

    // In production, send to external service (Sentry, LogRocket, etc.)
    this.sendToExternalService(errorLog)
  }

  /**
   * Log a warning
   */
  logWarning(
    message: string,
    context?: Record<string, any>,
    user?: Partial<AuthUser>
  ): void {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        pharmacy_id: user.pharmacy_id
      } : undefined,
      fingerprint: this.generateFingerprint(message)
    }

    this.addLog(warningLog)
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    metric: string,
    value: number,
    unit: string,
    context?: Record<string, any>,
    user?: Partial<AuthUser>
  ): void {
    const performanceMetric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      metric,
      value,
      unit,
      context,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        pharmacy_id: user.pharmacy_id
      } : undefined
    }

    this.performanceMetrics.push(performanceMetric)
    
    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxLogs) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxLogs)
    }

    // Check performance alerts
    this.checkPerformanceAlerts(performanceMetric)
  }

  /**
   * Get recent error logs
   */
  getRecentErrors(limit: number = 50): ErrorLog[] {
    return this.errorLogs
      .filter(log => log.level === 'error')
      .slice(-limit)
      .reverse()
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeWindow: number = 60): {
    totalErrors: number
    errorRate: number
    topErrors: Array<{ message: string; count: number }>
    errorsByUser: Array<{ userId: string; count: number }>
  } {
    const cutoff = new Date(Date.now() - timeWindow * 60 * 1000)
    const recentErrors = this.errorLogs.filter(
      log => log.level === 'error' && new Date(log.timestamp) > cutoff
    )

    // Count errors by message
    const errorCounts = new Map<string, number>()
    const userErrorCounts = new Map<string, number>()

    recentErrors.forEach(log => {
      // Count by fingerprint for deduplication
      const count = errorCounts.get(log.fingerprint) || 0
      errorCounts.set(log.fingerprint, count + 1)

      // Count by user
      if (log.user?.id) {
        const userCount = userErrorCounts.get(log.user.id) || 0
        userErrorCounts.set(log.user.id, userCount + 1)
      }
    })

    const topErrors = Array.from(errorCounts.entries())
      .map(([fingerprint, count]) => {
        const log = recentErrors.find(l => l.fingerprint === fingerprint)
        return { message: log?.message || 'Unknown', count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const errorsByUser = Array.from(userErrorCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalErrors: recentErrors.length,
      errorRate: recentErrors.length / timeWindow, // errors per minute
      topErrors,
      errorsByUser
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(metric: string, timeWindow: number = 60): {
    average: number
    min: number
    max: number
    count: number
    p95: number
  } {
    const cutoff = new Date(Date.now() - timeWindow * 60 * 1000)
    const recentMetrics = this.performanceMetrics.filter(
      m => m.metric === metric && new Date(m.timestamp) > cutoff
    )

    if (recentMetrics.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0, p95: 0 }
    }

    const values = recentMetrics.map(m => m.value).sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)
    const p95Index = Math.floor(values.length * 0.95)

    return {
      average: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      count: values.length,
      p95: values[p95Index] || values[values.length - 1]
    }
  }

  /**
   * Clear old logs
   */
  clearOldLogs(olderThanHours: number = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    
    this.errorLogs = this.errorLogs.filter(
      log => new Date(log.timestamp) > cutoff
    )
    
    this.performanceMetrics = this.performanceMetrics.filter(
      metric => new Date(metric.timestamp) > cutoff
    )
  }

  // Private methods
  private addLog(log: ErrorLog): void {
    this.errorLogs.push(log)
    
    // Keep only recent logs
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs)
    }
  }

  private checkAlerts(): void {
    const stats = this.getErrorStats(1) // Last minute
    
    if (stats.errorRate > this.alertThresholds.errorRate) {
      this.sendAlert('HIGH_ERROR_RATE', {
        errorRate: stats.errorRate,
        threshold: this.alertThresholds.errorRate,
        topErrors: stats.topErrors.slice(0, 3)
      })
    }
  }

  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    if (metric.metric === 'response_time' && metric.value > this.alertThresholds.responseTime) {
      this.sendAlert('SLOW_RESPONSE', {
        responseTime: metric.value,
        threshold: this.alertThresholds.responseTime,
        context: metric.context
      })
    }

    if (metric.metric === 'memory_usage' && metric.value > this.alertThresholds.memoryUsage) {
      this.sendAlert('HIGH_MEMORY_USAGE', {
        memoryUsage: metric.value,
        threshold: this.alertThresholds.memoryUsage
      })
    }
  }

  private sendAlert(type: string, data: any): void {
    // In production, send to Slack, email, or alerting service
    console.warn(`🚨 ALERT [${type}]:`, data)
    
    // Log the alert
    this.logWarning(`Alert triggered: ${type}`, { alertData: data })
  }

  private sendToExternalService(errorLog: ErrorLog): void {
    // In production, send to Sentry, LogRocket, Bugsnag, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry integration
      // Sentry.captureException(errorLog.error, {
      //   tags: {
      //     level: errorLog.level,
      //     fingerprint: errorLog.fingerprint
      //   },
      //   user: errorLog.user,
      //   extra: errorLog.context
      // })
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFingerprint(message: string, error?: Error): string {
    const content = `${message}${error?.name || ''}${error?.message || ''}`

    const base64 =
      typeof btoa === 'function'
        ? btoa(content)
        : Buffer.from(content, 'utf8').toString('base64')

    return base64.replace(/[^a-zA-Z0-9]/g, '').substr(0, 16)
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {}
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
    
    for (const [key, value] of Object.entries(headers || {})) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = String(value)
      }
    }
    
    return sanitized
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined
    
    const sensitiveFields = ['password', 'token', 'secret', 'key']
    const sanitized = { ...body }
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }
    
    return sanitized
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>()

  /**
   * Start timing an operation
   */
  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now())
  }

  /**
   * End timing and log performance
   */
  static endTimer(
    operation: string,
    context?: Record<string, any>,
    user?: Partial<AuthUser>
  ): number {
    const startTime = this.timers.get(operation)
    if (!startTime) {
      console.warn(`Timer not found for operation: ${operation}`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(operation)

    // Log performance metric
    ErrorMonitor.getInstance().logPerformance(
      operation,
      duration,
      'ms',
      context,
      user
    )

    return duration
  }

  /**
   * Monitor memory usage (placeholder for Edge Runtime compatibility)
   */
  static monitorMemory(): void {
    // Implementation moved to node-monitoring.ts to avoid Edge Runtime conflicts
    // This is a placeholder to maintain API compatibility
  }
}

/**
 * Global error handler setup (Edge Runtime compatible)
 */
export function setupGlobalErrorHandling(): void {
  const monitor = ErrorMonitor.getInstance()

  // Handle browser errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      monitor.logError(
        'Browser Error',
        event.error,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      )
    })

    window.addEventListener('unhandledrejection', (event) => {
      monitor.logError(
        'Unhandled Promise Rejection',
        event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      )
    })
  }

  // Node.js-specific error handling is moved to node-monitoring.ts
  // to avoid Edge Runtime conflicts
}

/**
 * Convenience functions for common use cases
 */
export const logger = {
  error: (message: string, error?: Error, context?: Record<string, any>, user?: Partial<AuthUser>) => {
    ErrorMonitor.getInstance().logError(message, error, context, user)
  },
  
  warn: (message: string, context?: Record<string, any>, user?: Partial<AuthUser>) => {
    ErrorMonitor.getInstance().logWarning(message, context, user)
  },
  
  performance: (metric: string, value: number, unit: string, context?: Record<string, any>, user?: Partial<AuthUser>) => {
    ErrorMonitor.getInstance().logPerformance(metric, value, unit, context, user)
  },
  
  time: (operation: string) => {
    PerformanceMonitor.startTimer(operation)
  },
  
  timeEnd: (operation: string, context?: Record<string, any>, user?: Partial<AuthUser>) => {
    return PerformanceMonitor.endTimer(operation, context, user)
  }
}