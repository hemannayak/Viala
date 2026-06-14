'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  ShoppingCart, 
  RotateCcw, 
  Package,
  TestTube2,
  Zap
} from 'lucide-react'
import { batchDemos } from '@/lib/batch-management'
import { toast } from 'sonner'

interface BatchDemoControlsProps {
  className?: string
}

export function BatchDemoControls({ className = '' }: BatchDemoControlsProps) {
  const [isRunning, setIsRunning] = useState(false)

  const handleDemoAction = async (action: () => Promise<void>, actionName: string) => {
    if (isRunning) return
    
    setIsRunning(true)
    try {
      await action()
    } catch (error) {
      toast.error(`${actionName} failed`, {
        description: 'Check console for details'
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className={`${className} border-dashed border-2 border-emerald-200 bg-emerald-50/30`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <TestTube2 className="h-5 w-5 text-emerald-600" />
          <span>FEFO & Batch Demo</span>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Smart Shelf
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test FEFO logic, vendor returns, and batch management features
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* FEFO Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">FEFO Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoAction(batchDemos.simulateFEFOSale, 'FEFO Sale')}
              disabled={isRunning}
              className="h-auto p-3 flex flex-col items-start space-y-1 hover:bg-primary/5 border-primary/20"
            >
              <div className="flex items-center space-x-2 w-full">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span className="font-medium text-xs">FEFO Sale Demo</span>
              </div>
              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                Process sale using earliest expiry batches
              </p>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoAction(batchDemos.simulateReturn, 'Vendor Return')}
              disabled={isRunning}
              className="h-auto p-3 flex flex-col items-start space-y-1 hover:bg-red-50 border-red-200"
            >
              <div className="flex items-center space-x-2 w-full">
                <RotateCcw className="h-4 w-4 text-red-600" />
                <span className="font-medium text-xs">Vendor Return Demo</span>
              </div>
              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                Return near-expiry items to vendor
              </p>
            </Button>
          </div>
        </div>

        {/* Custom Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Custom Tests</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoAction(
                () => batchDemos.simulateFEFOSale('Cough Syrup 100ml', 10), 
                'Custom FEFO Sale'
              )}
              disabled={isRunning}
              className="flex items-center space-x-2 text-xs hover:bg-primary/5"
            >
              <ShoppingCart className="h-3 w-3" />
              <span>Sell Cough Syrup</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoAction(
                () => batchDemos.simulateReturn('Ibuprofen 400mg'), 
                'Custom Return'
              )}
              disabled={isRunning}
              className="flex items-center space-x-2 text-xs hover:bg-red-50"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Return Ibuprofen</span>
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border/50 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-sm text-muted-foreground">
              {isRunning ? 'Processing...' : 'Ready for FEFO demo'}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Watch heatmap update in real-time
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-foreground mb-3">How to Use:</h5>
          <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <li>• Click FEFO Sale to process sale using earliest expiry batches</li>
            <li>• Click Vendor Return to return near-expiry items for credit</li>
            <li>• Watch the heatmap update automatically after each action</li>
            <li>• Check browser console for detailed transaction logs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}