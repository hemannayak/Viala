'use client'

import { useState, useEffect } from 'react'
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
import { 
  ShoppingCart, 
  Package, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { 
  getBatchesByFEFO, 
  processFEFOSale,
  formatCurrency,
  type BatchInfo
} from '@/lib/batch-management'
import { calculateDaysToExpiry } from '@/lib/db'
import { toast } from 'sonner'

interface FEFOSaleDialogProps {
  medName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaleProcessed: () => void
}

export function FEFOSaleDialog({ 
  medName, 
  open, 
  onOpenChange, 
  onSaleProcessed 
}: FEFOSaleDialogProps) {
  const [saleQuantity, setSaleQuantity] = useState('')
  const [availableBatches, setAvailableBatches] = useState<BatchInfo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load available batches when dialog opens
  useEffect(() => {
    if (open && medName) {
      loadBatches()
    }
  }, [open, medName])

  const loadBatches = async () => {
    if (!medName) return
    
    setIsLoading(true)
    try {
      const batches = await getBatchesByFEFO(medName)
      setAvailableBatches(batches)
    } catch (error) {
      console.error('Error loading batches:', error)
      toast.error('Failed to load batch information')
    } finally {
      setIsLoading(false)
    }
  }

  if (!medName) return null

  const saleQty = parseInt(saleQuantity) || 0
  const totalAvailable = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0)
  
  // Calculate which batches will be used (FEFO order)
  const batchesForSale = []
  let remainingQty = saleQty
  let totalValue = 0

  for (const batch of availableBatches) {
    if (remainingQty <= 0) break
    
    const qtyFromBatch = Math.min(remainingQty, batch.quantity)
    if (qtyFromBatch > 0) {
      batchesForSale.push({
        ...batch,
        quantityUsed: qtyFromBatch,
        valueFromBatch: qtyFromBatch * batch.price
      })
      totalValue += qtyFromBatch * batch.price
      remainingQty -= qtyFromBatch
    }
  }

  const handleSale = async () => {
    if (!saleQuantity || saleQty <= 0 || saleQty > totalAvailable) {
      toast.error('Invalid quantity', {
        description: `Please enter a quantity between 1 and ${totalAvailable}`
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await processFEFOSale(medName, saleQty)

      if (result.success) {
        toast.success('FEFO Sale Processed', {
          description: `${saleQty} units sold using earliest expiry batches`,
          duration: 5000
        })
        
        // Reset form
        setSaleQuantity('')
        
        // Close dialog and refresh data
        onOpenChange(false)
        onSaleProcessed()
      } else {
        toast.error('Sale Failed', {
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span>FEFO Sale Processing</span>
          </DialogTitle>
          <DialogDescription>
            Process sale using First Expiry, First Out logic to minimize waste
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Medicine Information */}
          <div className="bg-primary/5 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">{medName}</h4>
            <div className="flex items-center justify-between text-sm">
              <span>Total Available: <strong>{totalAvailable} units</strong></span>
              <span>Active Batches: <strong>{availableBatches.length}</strong></span>
            </div>
          </div>

          {/* Sale Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="sale-quantity">Sale Quantity</Label>
            <Input
              id="sale-quantity"
              type="number"
              placeholder="Enter quantity to sell"
              value={saleQuantity}
              onChange={(e) => setSaleQuantity(e.target.value)}
              min="1"
              max={totalAvailable}
            />
            <p className="text-xs text-muted-foreground">
              Max available: {totalAvailable} units
            </p>
          </div>

          {/* FEFO Batch Preview */}
          {saleQty > 0 && batchesForSale.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h5 className="font-semibold text-foreground">FEFO Batch Selection</h5>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Earliest Expiry First
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {batchesForSale.map((batch, index) => {
                  const daysToExpiry = calculateDaysToExpiry(batch.expiry_date)
                  return (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">Batch {batch.batch_no}</span>
                            <Badge className={
                              daysToExpiry <= 15 
                                ? "bg-red-50 text-red-700 border-red-200"
                                : daysToExpiry <= 30
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }>
                              {daysToExpiry} days
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Expires: {new Date(batch.expiry_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {batch.quantityUsed} units
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(batch.valueFromBatch)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Sale Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-800">Sale Summary</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Total Quantity:</span>
                    <div className="font-bold text-green-800">{saleQty} units</div>
                  </div>
                  <div>
                    <span className="text-green-700">Total Value:</span>
                    <div className="font-bold text-green-800">{formatCurrency(totalValue)}</div>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  FEFO logic ensures oldest stock is sold first, minimizing waste
                </p>
              </div>
            </div>
          )}

          {/* Warnings */}
          {saleQty > totalAvailable && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Insufficient Stock</p>
                <p className="text-red-700">
                  Only {totalAvailable} units available. Please reduce the sale quantity.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading batch information...</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSale} 
            disabled={!saleQuantity || saleQty <= 0 || saleQty > totalAvailable || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Process Sale
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}