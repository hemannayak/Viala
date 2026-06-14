import { useState } from 'react'
import { toast } from 'sonner'

// Types for better type safety
export interface ProcessingStats {
  totalFiles: number
  processedRecords: number
  cleanedRecords: number
  errorRecords: number
}

export interface VisualizationData {
  id: string
  title: string
  type: 'line-chart' | 'bar-chart' | 'heatmap' | 'pie-chart' | 'scatter-plot'
  description: string
  data: any
  insights: string[]
}

export interface DataItem {
  medicine_name?: string
  med_name?: string
  product_name?: string
  expiry_date: string
  quantity?: number
  current_stock?: number
  category?: string
  price?: number
  date?: string
  sale_date?: string
  total_amount?: number
  revenue?: number
  quantity_sold?: number
  qty?: number
}

export const useDataAnalytics = () => {
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [generatedVisualizations, setGeneratedVisualizations] = useState<VisualizationData[]>([])
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    totalFiles: 0,
    processedRecords: 0,
    cleanedRecords: 0,
    errorRecords: 0
  })
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false)

  const handleDataProcessed = async (data: any) => {
    setUploadedData(data)
    setProcessingStats(prev => ({
      totalFiles: prev.totalFiles + 1,
      processedRecords: prev.processedRecords + data.summary.totalRecords,
      cleanedRecords: prev.cleanedRecords + data.summary.cleanedRecords,
      errorRecords: prev.errorRecords + data.summary.errorRecords
    }))
    
    setIsGeneratingVisuals(true)
    try {
      const { generateVisualizationsFromData } = await import('@/lib/data-visualization')
      const visualizations = await generateVisualizationsFromData(data)
      setGeneratedVisualizations(visualizations)
      
      toast.success('Dataset processed & visualizations generated!', {
        description: `Created ${visualizations.length} analytics dashboards from your data`
      })
    } catch (error) {
      console.error('Visualization generation failed:', error)
      toast.error('Failed to generate visualizations', {
        description: 'Data was uploaded but visualization generation failed'
      })
    } finally {
      setIsGeneratingVisuals(false)
    }
  }

  return {
    uploadedData,
    generatedVisualizations,
    processingStats,
    isGeneratingVisuals,
    handleDataProcessed
  }
}