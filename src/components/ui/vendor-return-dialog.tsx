'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeftRight, 
  Package, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { 
  processVendorReturn, 
  calculateReturnEligibility,
  getReturnUrgencyColor,
  getReturnReasonLabel,
  formatCurrency,
  type ReturnReason 
} from '@/lib/batch-management'
import { type InventoryItem, calculateDaysToExpiry } from '@/lib/db'
import { toast } from 'sonner'

interface VendorReturnDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReturnProcessed: () => void
}

export function VendorReturnDialog({ 
  item, 
  open, 
  onOpenChange, 
  onReturnProcessed 
}: VendorReturnDialogProps) {
  const [returnQuantity, setReturnQuantity] = useState('')
  const [returnReason, setReturnReason] = useState<ReturnReason>('NEAR_EXPIRY')
  const [vendorName, setVendorName] = useState('Primary Vendor')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!item) return null

  const eligibility = calculateReturnEligibility(item)
  const daysToExpiry = calculateDaysToExpiry(item.expiry_date)
  const maxReturnQuantity = item.quantity
  const returnQty = parseInt(returnQuantity) || 0
  const estimatedRecovery = returnQty * item.price * 0.7 // 70% recovery rate

  const handleReturn = async () => {
    if (!returnQuantity || returnQty <= 0 || returnQty > maxReturnQuantity) {
      toast.error('Invalid quantity', {
        description: `Please enter a quantity between 1 and ${maxReturnQuantity}`
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await processVendorReturn(
        item.id,
        returnReason,
        returnQty,
        vendorName,
        notes
      )

      if (result.success) {
        toast.success('Return Processed Successfully', {
          description: `${returnQty} units of ${item.med_name} returned to vendor`,
          duration: 5000
        })
        
        // Reset form
        setReturnQuantity('')
        setNotes('')
        
        // Close dialog and refresh data
        onOpenChange(false)
        onReturnProcessed()
      } else {
        toast.error('Return Failed', {
          description: result.error
        })
      }
    } catch (error) {
      toast.error('Unexpected Error', {
        description: 'Please try again or contact support'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <span>Process Vendor Return</span>
          </DialogTitle>
          <DialogDescription>
            Return near-expiry or problematic inventory to vendor for credit recovery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Information */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">{item.med_name}</h4>
              <Badge className={getReturnUrgencyColor(eligibility.urgency)}>
                {eligibility.urgency} Priority
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>Batch: {item.batch_no}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Expires: {daysToExpiry} days</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Available Stock: <strong>{item.quantity} units</strong></span>
              <span>Unit Price: <strong>{formatCurrency(item.price)}</strong></span>
            </div>
          </div>

          {/* Return Details Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="return-quantity">Return Quantity</Label>
              <Input
                id="return-quantity"
                type="number"
                placeholder="Enter quantity"
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(e.target.value)}
                min="1"
                max={maxReturnQuantity}
              />
              <p className="text-xs text-muted-foreground">
                Max: {maxReturnQuantity} units
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-reason">Return Reason</Label>
              <Select value={returnReason} onValueChange={(value) => setReturnReason(value as ReturnReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEAR_EXPIRY">Near Expiry</SelectItem>
                  <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                  <SelectItem value="OVERSTOCKED">Overstocked</SelectItem>
                  <SelectItem value="DAMAGED">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input
              id="vendor-name"
              placeholder="Enter vendor name"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the return..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Recovery Estimate */}
          {returnQty > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">Estimated Recovery</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(estimatedRecovery)}
              </div>
              <p className="text-xs text-green-700 mt-1">
                Based on 70% recovery rate for {getReturnReasonLabel(returnReason).toLowerCase()} returns
              </p>
            </div>
          )}

          {/* Warnings */}
          {daysToExpiry <= 7 && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Critical Expiry Warning</p>
                <p className="text-red-700">
                  This item expires in {daysToExpiry} days. Process return immediately to maximize recovery value.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleReturn} 
            disabled={!returnQuantity || returnQty <= 0 || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Process Return
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}