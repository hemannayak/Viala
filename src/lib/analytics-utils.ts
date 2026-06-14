// Utility functions for analytics calculations
// Separated for better testability and reusability

export interface AnalyticsConfig {
  movingAverageWindow: number
  exponentialSmoothingAlpha: number
  safetyStockPercentage: number
  seasonalityThreshold: number
}

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  movingAverageWindow: 7,
  exponentialSmoothingAlpha: 0.3,
  safetyStockPercentage: 0.3,
  seasonalityThreshold: 1.2
}

// Statistical calculations
export function calculateMovingAverage(data: number[], window: number): number {
  if (data.length === 0) return 0
  if (data.length < window) return data.reduce((a, b) => a + b, 0) / data.length
  
  const recent = data.slice(-window)
  return recent.reduce((a, b) => a + b, 0) / window
}

export function calculateExponentialSmoothing(data: number[], alpha: number): number {
  if (data.length === 0) return 0
  if (data.length === 1) return data[0]
  
  let smoothed = data[0]
  for (let i = 1; i < data.length; i++) {
    smoothed = alpha * data[i] + (1 - alpha) * smoothed
  }
  return smoothed
}

export function calculateVariance(data: number[], mean: number): number {
  if (data.length === 0) return 0
  return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
}

export function calculateConfidenceScore(variance: number, mean: number): number {
  if (mean === 0) return 0.1
  return Math.max(0.1, Math.min(0.95, 1 - (variance / (mean * mean))))
}

// Date utilities
export function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Risk assessment
export function assessRiskLevel(confidenceScore: number): 'low' | 'medium' | 'high' {
  if (confidenceScore < 0.5) return 'high'
  if (confidenceScore < 0.7) return 'medium'
  return 'low'
}

// Trend analysis
export function analyzeTrend(recentData: number[], olderData: number[]): {
  direction: 'increasing' | 'decreasing' | 'stable'
  multiplier: number
} {
  if (recentData.length === 0 || olderData.length === 0) {
    return { direction: 'stable', multiplier: 1 }
  }

  const recentAvg = recentData.reduce((a, b) => a + b, 0) / recentData.length
  const olderAvg = olderData.reduce((a, b) => a + b, 0) / olderData.length

  if (recentAvg > olderAvg * 1.1) {
    return { direction: 'increasing', multiplier: 1.15 }
  } else if (recentAvg < olderAvg * 0.9) {
    return { direction: 'decreasing', multiplier: 0.85 }
  }
  
  return { direction: 'stable', multiplier: 1 }
}

// Validation utilities
export function validateMedicineName(name: string): boolean {
  return typeof name === 'string' && name.trim().length > 0
}

export function validateDaysAhead(days: number): boolean {
  return typeof days === 'number' && days > 0 && days <= 365
}

export function sanitizeNumericValue(value: any, defaultValue: number = 0): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : Math.max(0, parsed)
}

// Formatting utilities
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

// Chart styling utilities
export function getCommonTooltipStyle() {
  return {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  }
}

export function getCommonAxisStyle() {
  return {
    tick: { fontSize: 12, fill: '#6b7280' },
    axisLine: { stroke: '#e5e7eb' },
    tickLine: { stroke: '#e5e7eb' },
  }
}