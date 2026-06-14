'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  AlertTriangle, 
  Package, 
  Clock, 
  RefreshCw,
  Zap,
  TestTube
} from 'lucide-react'
import { runDemoScenario, quickDemos, DEMO_SCENARIOS } from '@/lib/demo-alerts'
import { toast } from 'sonner'

interface DemoControlsProps {
  className?: string
}

export function DemoControls({ className = '' }: DemoControlsProps) {
  const [isRunning, setIsRunning] = useState(false)

  const handleRunScenario = async (scenarioId: string) => {
    if (isRunning) return
    
    setIsRunning(true)
    try {
      await runDemoScenario(scenarioId)
    } catch (error) {
      toast.error('Demo failed', {
        description: 'Check console for details'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleQuickAction = async (action: () => Promise<void>, actionName: string) => {
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
    <Card className={`${className} border-dashed border-2 border-primary/20 bg-primary/5`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5 text-primary" />
          <span>Demo Controls</span>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Testing Only
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Simulate real-time alerts and inventory changes for demonstration
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Full Scenarios */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Full Demo Scenarios</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEMO_SCENARIOS.map((scenario) => (
              <Button
                key={scenario.id}
                variant="outline"
                size="sm"
                onClick={() => handleRunScenario(scenario.id)}
                disabled={isRunning}
                className="h-auto p-3 flex flex-col items-start space-y-1 hover:bg-primary/5"
              >
                <div className="flex items-center space-x-2 w-full">
                  <Play className="h-4 w-4" />
                  <span className="font-medium text-xs">{scenario.name}</span>
                </div>
                <p className="text-xs text-muted-foreground text-left leading-relaxed">
                  {scenario.description}
                </p>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Quick Actions</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(quickDemos.makeStockCritical, 'Make Stock Critical')}
              disabled={isRunning}
              className="flex items-center space-x-2 hover:bg-orange-50 hover:border-orange-200"
            >
              <Package className="h-4 w-4 text-orange-600" />
              <span className="text-xs">Low Stock</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(quickDemos.makeStockout, 'Create Stockout')}
              disabled={isRunning}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200"
            >
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs">Stockout</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(quickDemos.makeExpiringSoon, 'Make Expiring Soon')}
              disabled={isRunning}
              className="flex items-center space-x-2 hover:bg-amber-50 hover:border-amber-200"
            >
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs">Expiring</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(quickDemos.replenishStock, 'Replenish Stock')}
              disabled={isRunning}
              className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-200"
            >
              <RefreshCw className="h-4 w-4 text-green-600" />
              <span className="text-xs">Replenish</span>
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border/50 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-sm text-muted-foreground">
              {isRunning ? 'Demo running...' : 'Ready for demo'}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Real-time alerts will appear instantly
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-foreground mb-3">Demo Instructions:</h5>
          <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <li>• Click scenarios to trigger multiple alerts in sequence</li>
            <li>• Use quick actions for individual alert types</li>
            <li>• Watch the banner and alerts panel for real-time updates</li>
            <li>• Toast notifications will appear for each change</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}