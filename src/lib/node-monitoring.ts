/**
 * Node.js-specific monitoring utilities
 * Separated from error-monitoring.ts to avoid Edge Runtime conflicts
 */

import { ErrorMonitor } from './error-monitoring'

/**
 * Node.js Performance Monitor
 * Only works in Node.js runtime, not Edge Runtime
 */
export class NodePerformanceMonitor {
  
  /**
   * Monitor memory usage (Node.js only)
   */
  static monitorMemory(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      try {
        const usage = process.memoryUsage()
        const monitor = ErrorMonitor.getInstance()
        
        monitor.logPerformance('memory_heap_used', usage.heapUsed, 'bytes')
        monitor.logPerformance('memory_heap_total', usage.heapTotal, 'bytes')
        monitor.logPerformance('memory_rss', usage.rss, 'bytes')
        
        // Calculate usage percentage
        const usagePercent = usage.heapUsed / usage.heapTotal
        monitor.logPerformance('memory_usage', usagePercent, 'percent')
      } catch (error) {
        // Silently fail
      }
    }
  }

  /**
   * Get system health info (Node.js only)
   */
  static getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    memory?: {
      used: number
      total: number
      percentage: number
    }
    uptime: number
  } {
    let memoryInfo
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    let uptime = 0
    
    if (typeof process !== 'undefined') {
      try {
        // Get uptime
        if (process.uptime) {
          uptime = Math.floor(process.uptime())
        }

        // Get memory usage
        if (process.memoryUsage) {
          const usage = process.memoryUsage()
          const usagePercentage = usage.heapUsed / usage.heapTotal
          
          memoryInfo = {
            used: Math.round(usage.heapUsed / 1024 / 1024), // MB
            total: Math.round(usage.heapTotal / 1024 / 1024), // MB
            percentage: Math.round(usagePercentage * 100)
          }
          
          // Determine status based on memory usage
          if (usagePercentage > 0.9) {
            status = 'unhealthy'
          } else if (usagePercentage > 0.7) {
            status = 'degraded'
          }
        }
      } catch (error) {
        status = 'unhealthy'
      }
    }
    
    return {
      status,
      memory: memoryInfo,
      uptime
    }
  }
}

/**
 * Setup Node.js-specific error handlers
 */
export function setupNodeErrorHandling(): void {
  if (typeof process !== 'undefined') {
    const monitor = ErrorMonitor.getInstance()

    try {
      process.on('unhandledRejection', (reason, promise) => {
        monitor.logError(
          'Unhandled Promise Rejection',
          reason instanceof Error ? reason : new Error(String(reason)),
          { promise: promise.toString() }
        )
      })

      process.on('uncaughtException', (error) => {
        monitor.logError('Uncaught Exception', error)
        // In production, you might want to gracefully shutdown
        // process.exit(1)
      })

      // Monitor memory usage periodically
      setInterval(() => {
        NodePerformanceMonitor.monitorMemory()
      }, 60000) // Every minute

    } catch (error) {
      // Silently fail if process events are not available
    }
  }
}