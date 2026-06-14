'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Loader2,
  Download,
  Eye,
  Trash2
} from 'lucide-react'
import { processExcelUpload, assessDataQuality } from '@/lib/dataset-processor'
import { toast } from 'sonner'

interface ProcessedData {
  inventory: any[]
  sales: any[]
  summary: {
    totalRecords: number
    cleanedRecords: number
    errorRecords: number
    categories: string[]
  }
}

interface ExcelUploadProps {
  onDataProcessed: (data: ProcessedData) => void
}

export function ExcelUpload({ onDataProcessed }: ExcelUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
  const [dataQuality, setDataQuality] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast.error('Invalid file type', {
        description: 'Please upload an Excel (.xlsx, .xls) or CSV file'
      })
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Process the file
      const result = await processExcelUpload(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Assess data quality
      const allData = [...result.inventory, ...result.sales]
      const quality = assessDataQuality(allData)
      
      setProcessedData(result)
      setDataQuality(quality)
      
      toast.success('File processed successfully!', {
        description: `Processed ${result.summary.cleanedRecords} records from ${result.summary.totalRecords} total`
      })
      
      // Pass data to parent component
      onDataProcessed(result)
      
    } catch (error) {
      console.error('File processing error:', error)
      toast.error('Processing failed', {
        description: 'Please check your file format and try again'
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleClearData = () => {
    setProcessedData(null)
    setDataQuality(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.info('Data cleared')
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Excel/CSV Data Upload
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload your pharmacy data files for AI-powered analysis and forecasting
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileSpreadsheet className="w-8 h-8 mb-3 text-primary" />
                <p className="mb-2 text-sm text-primary font-medium">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-primary/70">
                  Excel (.xlsx, .xls) or CSV files up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing data...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cleaning and validating data</span>
              </div>
            </div>
          )}

          {/* Sample Data Option */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm font-medium">No data file?</p>
              <p className="text-xs text-muted-foreground">Use our sample dataset for testing</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Load sample data
                const sampleData = {
                  inventory: [],
                  sales: [],
                  summary: {
                    totalRecords: 100,
                    cleanedRecords: 95,
                    errorRecords: 5,
                    categories: ['Analgesic', 'Antibiotic', 'Vitamin']
                  }
                }
                setProcessedData(sampleData)
                onDataProcessed(sampleData)
                toast.success('Sample data loaded')
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Load Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      {processedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Data Processing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {processedData.summary.totalRecords}
                </p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {processedData.summary.cleanedRecords}
                </p>
                <p className="text-sm text-muted-foreground">Cleaned Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {processedData.summary.errorRecords}
                </p>
                <p className="text-sm text-muted-foreground">Error Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {processedData.summary.categories.length}
                </p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Data Types Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {processedData.inventory.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Inventory Data ({processedData.inventory.length} records)
                    </Badge>
                  )}
                  {processedData.sales.length > 0 && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Sales Data ({processedData.sales.length} records)
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Medicine Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {processedData.summary.categories.map(category => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Quality Assessment */}
      {dataQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Data Quality Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getQualityIcon(dataQuality.completeness)}
                  <span className="font-medium">Completeness</span>
                </div>
                <Badge className={getQualityColor(dataQuality.completeness)}>
                  {dataQuality.completeness}%
                </Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getQualityIcon(dataQuality.accuracy)}
                  <span className="font-medium">Accuracy</span>
                </div>
                <Badge className={getQualityColor(dataQuality.accuracy)}>
                  {dataQuality.accuracy}%
                </Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getQualityIcon(dataQuality.consistency)}
                  <span className="font-medium">Consistency</span>
                </div>
                <Badge className={getQualityColor(dataQuality.consistency)}>
                  {dataQuality.consistency}%
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recommendations</h4>
              <ul className="space-y-1">
                {dataQuality.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Preview</DialogTitle>
            <DialogDescription>
              Preview of processed and cleaned data
            </DialogDescription>
          </DialogHeader>
          
          {processedData && (
            <div className="space-y-4">
              {processedData.inventory.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Inventory Data (First 5 records)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-gray-200 p-2 text-left">Medicine</th>
                          <th className="border border-gray-200 p-2 text-left">Batch</th>
                          <th className="border border-gray-200 p-2 text-left">Quantity</th>
                          <th className="border border-gray-200 p-2 text-left">Price</th>
                          <th className="border border-gray-200 p-2 text-left">Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedData.inventory.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-200 p-2">{item.medicine_name}</td>
                            <td className="border border-gray-200 p-2">{item.batch_no}</td>
                            <td className="border border-gray-200 p-2">{item.quantity}</td>
                            <td className="border border-gray-200 p-2">₹{item.unit_price}</td>
                            <td className="border border-gray-200 p-2">{item.expiry_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {processedData.sales.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Sales Data (First 5 records)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-gray-200 p-2 text-left">Date</th>
                          <th className="border border-gray-200 p-2 text-left">Medicine</th>
                          <th className="border border-gray-200 p-2 text-left">Quantity</th>
                          <th className="border border-gray-200 p-2 text-left">Price</th>
                          <th className="border border-gray-200 p-2 text-left">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedData.sales.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-200 p-2">{item.date}</td>
                            <td className="border border-gray-200 p-2">{item.medicine_name}</td>
                            <td className="border border-gray-200 p-2">{item.quantity_sold}</td>
                            <td className="border border-gray-200 p-2">₹{item.unit_price}</td>
                            <td className="border border-gray-200 p-2">{item.customer_type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}