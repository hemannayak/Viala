'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Calendar, DollarSign, Leaf } from 'lucide-react'
import { InventoryWithRescue, calculateCO2Saved } from '@/lib/rescue-matrix'

interface RescueItemCardProps {
  item: InventoryWithRescue
  isProcessing: boolean
  onProcess: (item: InventoryWithRescue) => void
}

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
    case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function RescueItemCard({ item, isProcessing, onProcess }: RescueItemCardProps) {
  const originalValue = (item.batch_cost_price || item.price) * item.current_stock
  const recoveredValue = (originalValue * item.rescueRecommendation.recoveryPercentage) / 100
  const co2Saved = calculateCO2Saved(item.current_stock, item.rescueRecommendation.co2SavedPerUnit)

  return (
    <div className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{item.med_name}</h4>
            <Badge className={getPriorityBadgeColor(item.rescueRecommendation.priority)}>
              {item.rescueRecommendation.priority}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>Batch: {item.batch_no}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{item.daysToExpiry} days left</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Stock: {item.current_stock} units</span>
            </div>
            <div className="flex items-center gap-1">
              <Leaf className="h-4 w-4" />
              <span>{co2Saved.toFixed(1)} kg CO₂</span>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-3">
            {item.rescueRecommendation.description}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Recovery: <span className="font-semibold text-green-600">₹{recoveredValue.toFixed(2)}</span>
            </span>
            <span className="text-gray-600">
              Rate: <span className="font-semibold">{item.rescueRecommendation.recoveryPercentage}%</span>
            </span>
          </div>
        </div>

        <Button
          onClick={() => onProcess(item)}
          disabled={isProcessing}
          className={`ml-4 ${item.rescueRecommendation.buttonColor} text-white`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            item.rescueRecommendation.buttonText
          )}
        </Button>
      </div>
    </div>
  )
}