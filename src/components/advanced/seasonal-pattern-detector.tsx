'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  TrendingUp, 
  Snowflake, 
  Sun, 
  CloudRain,
  Thermometer,
  AlertTriangle,
  Package,
  Clock
} from 'lucide-react'
import { SeasonalPattern, AdvancedFEFOEngine } from '@/lib/advanced-fefo-engine'
import { InventoryItem } from '@/lib/db'
import { toast } from 'sonner'

interface SeasonalPatternDetectorProps {
  inventory: InventoryItem[]
  onStockAdjustment?: (drugName: string, recommendedLevel: number) => void
}

export function SeasonalPatternDetector({ 
  inventory, 
  onStockAdjustment 
}: SeasonalPatternDetectorProps) {
  const [patterns, setPatterns] = useState<SeasonalPattern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detectPatterns = async () => {
      try {
        // Simulate pattern analysis delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const seasonalPatterns = AdvancedFEFOEngine.detectSeasonalPatterns(inventory)
        setPatterns(seasonalPatterns)
      } catch (error) {
        console.error('Error detecting seasonal patterns:', error)
        toast.error('Failed to analyze seasonal patterns')
      } finally {
        setLoading(false)
      }
    }

    detectPatterns()
  }, [inventory])

  const handleStockAdjustment = (pattern: SeasonalPattern) => {
    onStockAdjustment?.(pattern.drugName, pattern.nextSpike.recommendedStockLevel)
    toast.success(`Stock adjustment requested for ${pattern.drugName}`)
  }

  const getSeasonIcon = (period: string) => {
    if (period.toLowerCase().includes('winter')) return <Snowflake className="h-4 w-4 text-blue-500" />
    if (period.toLowerCase().includes('summer')) return <Sun className="h-4 w-4 text-yellow-500" />
    if (period.toLowerCase().includes('monsoon')) return <CloudRain className="h-4 w-4 text-gray-500" />
    return <Calendar className="h-4 w-4 text-green-500" />
  }

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 30) return 'bg-red-100 text-red-800 border-red-200'
    if (daysUntil <= 60) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (daysUntil <= 90) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getUrgencyLevel = (daysUntil: number) => {
    if (daysUntil <= 30) return 'CRITICAL'
    if (daysUntil <= 60) return 'HIGH'
    if (daysUntil <= 90) return 'MEDIUM'
    return 'LOW'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing seasonal patterns...</p>
        </CardContent>
      </Card>
    )
  }

  if (patterns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No seasonal patterns detected</p>
          <p className="text-xs text-gray-400 mt-1">System requires more historical data for pattern recognition</p>
        </CardContent>
      </Card>
    )
  }

  const upcomingSpikes = patterns
    .filter(p => p.nextSpike.daysUntilSpike <= 90)
    .sort((a, b) => a.nextSpike.daysUntilSpike - b.nextSpike.daysUntilSpike)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Seasonal Demand Patterns
          </CardTitle>
          <p className="text-sm text-gray-600">
            AI-detected recurring sales patterns with predictive stock recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{patterns.length}</div>
              <div className="text-sm text-blue-700">Patterns Detected</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{upcomingSpikes.length}</div>
              <div className="text-sm text-orange-700">Upcoming Spikes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {patterns.filter(p => p.isCurrentlyInSeason).length}
              </div>
              <div className="text-sm text-green-700">Currently In Season</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {patterns.filter(p => p.nextSpike.stockDeficit > 0).length}
              </div>
              <div className="text-sm text-red-700">Stock Deficits</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Seasonal Spikes */}
      {upcomingSpikes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Upcoming Seasonal Spikes (Next 90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSpikes.map((pattern, index) => (
              <Alert key={index} className={`${getUrgencyColor(pattern.nextSpike.daysUntilSpike)}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{pattern.drugName}</strong> - Expected spike in {pattern.nextSpike.daysUntilSpike} days
                      <div className="text-xs mt-1">
                        Current: {pattern.nextSpike.currentStock} units | 
                        Recommended: {pattern.nextSpike.recommendedStockLevel} units |
                        Deficit: {pattern.nextSpike.stockDeficit} units
                      </div>
                    </div>
                    <Badge className={getUrgencyColor(pattern.nextSpike.daysUntilSpike)}>
                      {getUrgencyLevel(pattern.nextSpike.daysUntilSpike)}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Pattern Analysis */}
      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <Card key={index} className={`border-l-4 ${
            pattern.isCurrentlyInSeason ? 'border-l-green-500' : 'border-l-blue-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {pattern.drugName}
                    {pattern.isCurrentlyInSeason && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        In Season
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">Category: {pattern.category}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600">Next Spike</div>
                  <div className="font-semibold">
                    {pattern.nextSpike.daysUntilSpike} days
                  </div>
                </div>
              </div>

              {/* Seasonal Periods */}
              <div className="mb-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Seasonal Periods
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pattern.seasonalPeriods.map((period, periodIndex) => (
                    <div key={periodIndex} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeasonIcon(period.period)}
                        <span className="font-medium text-sm">{period.period}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div>Months: {period.startMonth}-{period.endMonth}</div>
                        <div>Demand: +{period.historicalSalesIncrease}% increase</div>
                        <div>Multiplier: {period.demandMultiplier}x normal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Analysis */}
              <div className="mb-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Stock Analysis for Next Spike
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-blue-600">Current Stock</div>
                    <div className="text-lg font-semibold text-blue-700">
                      {pattern.nextSpike.currentStock} units
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-green-600">Recommended Level</div>
                    <div className="text-lg font-semibold text-green-700">
                      {pattern.nextSpike.recommendedStockLevel} units
                    </div>
                  </div>
                  <div className={`p-3 rounded ${
                    pattern.nextSpike.stockDeficit > 0 ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <div className={`text-sm ${
                      pattern.nextSpike.stockDeficit > 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      Stock Status
                    </div>
                    <div className={`text-lg font-semibold ${
                      pattern.nextSpike.stockDeficit > 0 ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {pattern.nextSpike.stockDeficit > 0 
                        ? `${pattern.nextSpike.stockDeficit} short`
                        : 'Adequate'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar for Time Until Spike */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Time Until Next Spike</span>
                  <span>{pattern.nextSpike.daysUntilSpike} days</span>
                </div>
                <Progress 
                  value={Math.max(0, 100 - (pattern.nextSpike.daysUntilSpike / 365 * 100))}
                  className="h-2"
                />
              </div>

              {/* Action Buttons */}
              {pattern.nextSpike.stockDeficit > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStockAdjustment(pattern)}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Adjust Stock Level
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info(`Seasonal alert set for ${pattern.drugName}`)
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Set Seasonal Alert
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pattern Intelligence Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-teal-600" />
            Pattern Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>AI analyzes historical sales data to identify recurring patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Seasonal multipliers calculated from past demand spikes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Stock recommendations based on predicted demand increases</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Proactive alerts prevent stockouts during high-demand periods</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}