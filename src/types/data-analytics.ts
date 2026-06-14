// Core data types
export interface SalesRecord {
  date?: string
  sale_date?: string
  medicine_name?: string
  product_name?: string
  total_amount?: number
  revenue?: number
  quantity_sold?: number
  qty?: number
}

export interface InventoryRecord {
  medicine_name?: string
  med_name?: string
  expiry_date: string
  quantity?: number
  current_stock?: number
  category?: string
  price?: number
}

export interface ProcessedDataset {
  sales?: SalesRecord[]
  inventory?: InventoryRecord[]
  summary: {
    totalRecords: number
    cleanedRecords: number
    errorRecords: number
  }
}

// Visualization types
export type ChartType = 'line-chart' | 'bar-chart' | 'heatmap' | 'pie-chart' | 'scatter-plot'

export interface VisualizationData {
  id: string
  title: string
  type: ChartType
  description: string
  data: unknown
  insights: string[]
}

// Processing stats
export interface ProcessingStats {
  totalFiles: number
  processedRecords: number
  cleanedRecords: number
  errorRecords: number
}

// Feature definitions
export interface CompetitionFeature {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'active' | 'inactive' | 'pending'
  features: string[]
}

// FEFO status types
export type FefoStatus = 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'MODERATE' | 'HEALTHY'
export type RiskLevel = 'high' | 'medium' | 'low'

// Processed data types
export interface ProcessedSalesData {
  date?: string
  revenue: number
  quantity: number
  product?: string
}

export interface ProcessedInventoryHealth {
  medicine: string
  daysToExpiry: number
  quantity: number
  category: string
  status: FefoStatus
}

export interface ProcessedWasteData {
  medicine: string
  daysToExpiry: number
  salesVelocity: number
  quantity: number
  riskLevel: RiskLevel
}