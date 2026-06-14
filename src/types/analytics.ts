// Analytics-specific type definitions

export interface ChartDataPoint {
  date: string
  revenue: number
  quantity: number
  transactions: number
}

export interface ProductSalesData {
  name: string
  revenue: number
  quantity: number
}

export interface CategoryData {
  name: string
  value: number
  count: number
}

export interface ForecastChartData {
  medicine: string
  predicted: number
  confidence: number
  reorder: number
  risk: number
}

export interface WasteChartData {
  name: string
  value: number
  color: string
}

export interface AlertChartData {
  name: string
  value: number
  color: string
}

export interface ProcessedChartData {
  salesTrend: ChartDataPoint[]
  topProducts: ProductSalesData[]
  categoryDistribution: CategoryData[]
  forecastChartData: ForecastChartData[]
  wasteData: WasteChartData[]
  alertData: AlertChartData[]
}

export interface SalesMetrics {
  totalRevenue: number
  totalUnits: number
  totalTransactions: number
  walkInSales: number
  prescriptionSales: number
  avgPerSale: number
  dailyAvgRevenue: number
  avgUnitsPerSale: number
  dailyAvgVolume: number
}

export type TimeframeOption = '7d' | '30d' | '90d'

export type RiskLevel = 'high' | 'medium' | 'low'
export type PriorityLevel = 'high' | 'medium' | 'low'