'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  ShoppingCart,
  Calendar,
  Target,
  Zap
} from 'lucide-react'
import { PriceForecast, AdvancedFEFOEngine } from '@/lib/advanced-fefo-engine'
import { InventoryItem } from '@/lib/db'
import { toast } from 'sonner'

interface PriceForecastDashboardProps {
  inventory: InventoryItem[]
  onReorderRequest?: (drugName: string, quantity: number) => void
}

export function PriceForecastDashboard({ 
  inventory, 
  onReorderRequest 
}: PriceForecastDashboardProps) {
  const [forecasts, setForecasts] = useState<PriceForecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateForecasts = async () => {
      try {
        // Simulate API delay for realistic experience
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const priceForecasts = AdvancedFEFOEngine.generatePriceForecasts(inventory)
        setForecasts(priceForecasts)
      } catch (error) {
        console.error('Error generating price forecasts:', error)
        toast.error('Failed to generate price forecasts')
      } finally {
        setLoading(false)
      }
    }

    generateForecasts()
  }, [inventory])

  const handleReorderClick = (forecast: PriceForecast) => {
    onReorderRequest?.(forecast.drugName, forecast.optimalReorderQuantity)
    toast.success(`Reorder request submitted for ${forecast.drugName}`)
  }

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'LOW': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTotalPotentialSavings = () => {
    return forecasts.reduce((total, forecast) => total + forecast.costSavings, 0)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing price trends...</p>
        </CardContent>
      </Card>
    )
  }

  if (forecasts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No price surge predictions at this time</p>
          <p className="text-xs text-gray-400 mt-1">System monitors market trends continuously</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Price Surge Forecasting
          </CardTitle>
          <p className="text-sm text-gray-600">
            Predictive analysis of upcoming price increases with reorder recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{forecasts.length}</div>
              <div className="text-sm text-orange-700">Drugs at Risk</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₹{getTotalPotentialSavings().toFixed(0)}</div>
              <div className="text-sm text-green-700">Potential Savings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {forecasts.filter(f => f.confidenceLevel === 'HIGH').length}
              </div>
              <div className="text-sm text-blue-700">High Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Forecasts */}
      <div className="space-y-4">
        {forecasts.map((forecast, index) => (
          <Card key={index} className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{forecast.drugName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Expected in {forecast.timeframe}
                    </div>
                    <Badge className={getConfidenceColor(forecast.confidenceLevel)}>
                      {forecast.confidenceLevel} Confidence
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    +{forecast.priceIncreasePercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Price Increase</div>
                </div>
              </div>

              {/* Price Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Current Price</div>
                  <div className="text-lg font-semibold">₹{forecast.currentPrice}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-sm text-orange-600">Predicted Price</div>
                  <div className="text-lg font-semibold text-orange-700">₹{forecast.predictedPrice}</div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <div className="text-sm text-red-600">Price Increase</div>
                  <div className="text-lg font-semibold text-red-700">+₹{forecast.priceIncrease}</div>
                </div>
              </div>

              {/* Recommendation */}
              <Alert className="border-blue-200 bg-blue-50 mb-4">
                <Target className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="text-blue-800">
                    <strong>Recommendation:</strong> {forecast.recommendation}
                  </div>
                  <div className="text-blue-700 text-sm mt-1">
                    Potential savings: ₹{forecast.costSavings} by ordering {forecast.optimalReorderQuantity} units now
                  </div>
                </AlertDescription>
              </Alert>

              {/* Progress Bar for Urgency */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Urgency Level</span>
                  <span>{forecast.confidenceLevel === 'HIGH' ? '85%' : forecast.confidenceLevel === 'MEDIUM' ? '65%' : '40%'}</span>
                </div>
                <Progress 
                  value={forecast.confidenceLevel === 'HIGH' ? 85 : forecast.confidenceLevel === 'MEDIUM' ? 65 : 40}
                  className="h-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReorderClick(forecast)}
                  className="bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Reorder {forecast.optimalReorderQuantity} Units
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info(`Price alert set for ${forecast.drugName}`)
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Set Price Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Intelligence Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-teal-600" />
            Market Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Price forecasting based on market volatility patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Optimal reorder quantities calculated for 3.5-month supply</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cost savings estimated based on predicted price increases</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>High confidence predictions prioritized for immediate action</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}