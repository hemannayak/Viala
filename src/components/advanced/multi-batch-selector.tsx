'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Package, 
  MapPin,
  Calendar,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { BatchInfo, AdvancedFEFOEngine } from '@/lib/advanced-fefo-engine'
import { InventoryItem } from '@/lib/db'
import { toast } from 'sonner'

interface MultiBatchSelectorProps {
  medicineName: string
  inventory: InventoryItem[]
  onBatchSelected: (batch: BatchInfo) => void
}

export function MultiBatchSelector({ 
  medicineName, 
  inventory, 
  onBatchSelected 
}: MultiBatchSelectorProps) {
  const [selectedBatch, setSelectedBatch] = useState<BatchInfo | null>(null)
  
  const batches = AdvancedFEFOEngine.analyzeBatchesForMedicine(medicineName, inventory)

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No batches found for "{medicineName}"</p>
        </CardContent>
      </Card>
    )
  }

  const handleBatchSelect = (batch: BatchInfo) => {
    if (batch.warningLevel === 'EXPIRED') {
      toast.error('Cannot select expired batch')
      return
    }

    setSelectedBatch(batch)
    onBatchSelected(batch)

    if (!batch.isRecommended) {
      toast.warning(
        `FEFO Warning: Earlier expiry batch available (${batches[0].batch_no})`,
        { duration: 5000 }
      )
    }
  }

  const getWarningColor = (level: string) => {
    switch (level) {
      case 'EXPIRED': return 'bg-gray-900 text-white border-gray-700'
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300'
      case 'NEAR_EXPIRY': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  const getBatchIcon = (batch: BatchInfo) => {
    if (batch.warningLevel === 'EXPIRED') return <AlertTriangle className="h-4 w-4 text-gray-500" />
    if (batch.warningLevel === 'CRITICAL') return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (batch.isRecommended) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <Clock className="h-4 w-4 text-orange-500" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-teal-600" />
            Available Batches for {medicineName}
          </CardTitle>
          <p className="text-sm text-gray-600">
            FEFO (First Expiry, First Out) enforcement active - earliest expiry batches prioritized
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedBatch?.id === batch.id 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${batch.warningLevel === 'EXPIRED' ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleBatchSelect(batch)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getBatchIcon(batch)}
                  <div>
                    <h4 className="font-medium">Batch #{batch.batch_no}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {new Date(batch.expiry_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Qty: {batch.quantity}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {batch.shelf_location}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {batch.isRecommended && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      FEFO Priority #{batch.batchRank}
                    </Badge>
                  )}
                  {!batch.isRecommended && (
                    <Badge variant="outline">
                      Rank #{batch.batchRank}
                    </Badge>
                  )}
                  <div className="text-right">
                    <div className="font-semibold">₹{batch.price}</div>
                    <div className="text-xs text-gray-500">per unit</div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              {batch.warningMessage && (
                <Alert className={`mb-3 ${getWarningColor(batch.warningLevel)}`}>
                  <AlertDescription className="text-xs">
                    {batch.warningMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Alternative Batches Suggestion */}
              {!batch.isRecommended && batch.alternativeBatches && batch.alternativeBatches.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">FEFO Recommendation:</span>
                  </div>
                  <p className="text-blue-700 text-xs mt-1">
                    Consider Batch #{batch.alternativeBatches[0].batch_no} first 
                    (expires {new Date(batch.alternativeBatches[0].expiry_date).toLocaleDateString()})
                  </p>
                </div>
              )}

              {/* Selection Indicator */}
              {selectedBatch?.id === batch.id && (
                <div className="flex items-center gap-2 mt-3 text-teal-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Selected for billing
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FEFO Compliance Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-sm">FEFO Compliance Active</span>
            </div>
            <div className="text-xs text-gray-600">
              {batches.filter(b => b.warningLevel !== 'EXPIRED').length} sellable batches available
            </div>
          </div>
          
          {batches[0] && batches[0].warningLevel !== 'EXPIRED' && (
            <div className="mt-2 text-xs text-gray-600">
              Recommended: Batch #{batches[0].batch_no} 
              (expires in {Math.max(0, Math.ceil((new Date(batches[0].expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}