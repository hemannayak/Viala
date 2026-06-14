'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react'
import { StockRequestManager, StockRequest } from '@/lib/advanced-fefo-engine'
import { toast } from 'sonner'

interface StockRequestWorkflowProps {
  pharmacistId: string
  pharmacistName: string
  onRequestSubmitted?: (requestId: string) => void
}

export function StockRequestWorkflow({ 
  pharmacistId, 
  pharmacistName, 
  onRequestSubmitted 
}: StockRequestWorkflowProps) {
  const [medicineName, setMedicineName] = useState('')
  const [currentStock, setCurrentStock] = useState<number>(0)
  const [requestedQuantity, setRequestedQuantity] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastRequest, setLastRequest] = useState<{ success: boolean; message: string; requestId?: string } | null>(null)

  const handleSubmitRequest = async () => {
    if (!medicineName.trim() || requestedQuantity <= 0) {
      toast.error('Please enter medicine name and valid quantity')
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = StockRequestManager.submitStockRequest(
        medicineName,
        currentStock,
        requestedQuantity,
        pharmacistId,
        pharmacistName
      )
      
      setLastRequest(result)
      
      if (result.success) {
        toast.success('Stock request submitted successfully!')
        onRequestSubmitted?.(result.requestId!)
        
        // Reset form
        setMedicineName('')
        setCurrentStock(0)
        setRequestedQuantity(0)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: 'Network error: Failed to submit request. Please check your connection and try again.'
      }
      setLastRequest(errorResult)
      toast.error(errorResult.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUrgencyColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800 border-red-200'
    if (stock <= 5) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (stock <= 20) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getUrgencyLevel = (stock: number) => {
    if (stock === 0) return 'CRITICAL'
    if (stock <= 5) return 'HIGH'
    if (stock <= 20) return 'MEDIUM'
    return 'LOW'
  }

  const getUrgencyIcon = (stock: number) => {
    if (stock === 0) return <XCircle className="h-4 w-4 text-red-500" />
    if (stock <= 5) return <AlertTriangle className="h-4 w-4 text-orange-500" />
    if (stock <= 20) return <Clock className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-teal-600" />
            Low Stock Request Workflow
          </CardTitle>
          <p className="text-sm text-gray-600">
            Submit requests for medicines that are low in stock or out of stock
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pharmacist Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-600" />
              <span className="font-medium">Requesting Pharmacist:</span>
              <span>{pharmacistName}</span>
              <Badge variant="outline" className="text-xs">ID: {pharmacistId}</Badge>
            </div>
          </div>

          {/* Medicine Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Medicine Name *</label>
            <Input
              placeholder="Enter medicine name (e.g., Paracetamol 500mg)"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Current Stock */}
          <div>
            <label className="block text-sm font-medium mb-2">Current Stock Level</label>
            <Input
              type="number"
              placeholder="0"
              value={currentStock}
              onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full"
            />
            {currentStock >= 0 && (
              <div className="mt-2">
                <Badge className={getUrgencyColor(currentStock)}>
                  {getUrgencyIcon(currentStock)}
                  <span className="ml-1">{getUrgencyLevel(currentStock)} Priority</span>
                </Badge>
              </div>
            )}
          </div>

          {/* Requested Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">Requested Quantity *</label>
            <Input
              type="number"
              placeholder="Enter quantity needed"
              value={requestedQuantity}
              onChange={(e) => setRequestedQuantity(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitRequest}
            disabled={isSubmitting || !medicineName.trim() || requestedQuantity <= 0}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Stock Request
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Request Status */}
      {lastRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              {lastRequest.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              Request Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={lastRequest.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={lastRequest.success ? 'text-green-800' : 'text-red-800'}>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {lastRequest.success ? 'Success' : 'Failed'}</p>
                  <p><strong>Message:</strong> {lastRequest.message}</p>
                  {lastRequest.requestId && (
                    <p><strong>Request ID:</strong> {lastRequest.requestId}</p>
                  )}
                  {lastRequest.success && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center gap-2 text-blue-800 text-sm">
                        <Send className="h-4 w-4" />
                        <span className="font-medium">Manager Notification Sent</span>
                      </div>
                      <p className="text-blue-700 text-xs mt-1">
                        Your manager has been automatically notified and will review your request shortly.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Workflow Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-600" />
            Request Workflow Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Submit Request</p>
                <p className="text-xs text-gray-600">Pharmacist submits low stock request with details</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Manager Notification</p>
                <p className="text-xs text-gray-600">System automatically notifies manager via email/SMS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Review & Approval</p>
                <p className="text-xs text-gray-600">Manager reviews request and approves/rejects</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <p className="font-medium text-sm">Order Processing</p>
                <p className="text-xs text-gray-600">Approved requests are processed and stock is replenished</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Priority Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <XCircle className="h-3 w-3 text-red-500" />
              <span><strong>CRITICAL (0 units):</strong> Immediate attention - processed within 2 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span><strong>HIGH (1-5 units):</strong> Urgent - processed within 24 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-yellow-500" />
              <span><strong>MEDIUM (6-20 units):</strong> Standard - processed within 48 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span><strong>LOW (21+ units):</strong> Routine - processed within 1 week</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}