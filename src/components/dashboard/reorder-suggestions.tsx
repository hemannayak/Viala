'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Package,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { 
  forecastingEngine, 
  getUrgencyColor, 
  formatCurrency,
  type ReorderSuggestion,
  type SeasonalMode 
} from '@/lib/forecasting'
import { db, type InventoryItem } from '@/lib/db'

interface ReorderSuggestionsProps {
  seasonalMode: SeasonalMode
  className?: string
}

export function ReorderSuggestions({ seasonalMode, className = '' }: ReorderSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch current inventory
      const { data: inventoryData, error } = await db
        .from('inventory')
        .select('*')
        .order('shelf_location')

      if (error) throw error

      const currentInventory: InventoryItem[] = (inventoryData || []).map((item: any) => ({
        ...item,
        med_name: item.med_name ?? 'Unknown',
        category: item.category ?? 'General',
      }))

      setInventory(currentInventory)

      // Update forecasting engine with seasonal mode
      forecastingEngine.setSeasonalMode(seasonalMode)
      forecastingEngine.initialize(currentInventory)

      // Generate reorder suggestions
      const reorderSuggestions = forecastingEngine.generateReorderSuggestions(currentInventory)
      setSuggestions(reorderSuggestions.slice(0, 8)) // Show top 8 suggestions
    } catch (error) {
      console.error('Error loading reorder suggestions:', error)
      setError('Failed to load reorder suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [seasonalMode])

  // Load suggestions on mount and when seasonal mode changes
  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  // Memoize computed values to prevent unnecessary recalculations
  const { totalReorderValue, criticalItems, highPriorityItems } = useMemo(() => {
    const totalValue = suggestions.reduce((sum, s) => sum + s.potentialRevenueLoss, 0)
    const critical = suggestions.filter(s => s.urgency === 'CRITICAL').length
    const highPriority = suggestions.filter(s => s.urgency === 'HIGH').length
    
    return {
      totalReorderValue: totalValue,
      criticalItems: critical,
      highPriorityItems: highPriority
    }
  }, [suggestions])

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Reorder Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Analyzing demand patterns...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Reorder Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-muted-foreground text-center">{error}</p>
            <Button onClick={loadSuggestions} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Reorder Suggestions</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadSuggestions}
            className="h-8 px-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{suggestions.length}</div>
            <div className="text-xs text-muted-foreground">Items to Reorder</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{criticalItems + highPriorityItems}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalReorderValue)}</div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No reorder suggestions at this time</p>
            <p className="text-sm text-muted-foreground mt-1">
              Current stock levels are adequate for predicted demand
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.med_name}
                className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/20 transition-colors duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-foreground truncate">
                      {suggestion.med_name}
                    </span>
                    <Badge className={`text-xs px-2 py-1 ${getUrgencyColor(suggestion.urgency)}`}>
                      {suggestion.urgency}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>Stock: {suggestion.currentStock} → {suggestion.currentStock + suggestion.suggestedQuantity}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{suggestion.estimatedDaysUntilStockout} days left</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {suggestion.reasoning}
                  </p>
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      +{suggestion.suggestedQuantity}
                    </div>
                    <div className="text-xs text-muted-foreground">units</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">
                      {formatCurrency(suggestion.potentialRevenueLoss)}
                    </div>
                    <div className="text-xs text-muted-foreground">value</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Showing top {suggestions.length} recommendations
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Export List
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Generate Orders
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}