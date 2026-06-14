'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useScenario } from '@/components/providers/scenario-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { db, InventoryItem, 
  generatePredictiveInsights, 
  PredictiveInsight 
} from '@/lib/db'
import { 
  Brain, 
  AlertTriangle, 
  ShoppingCart, 
  TrendingUp,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'

const insightIcons = {
  shortage_risk: AlertTriangle,
  reorder_suggestion: ShoppingCart,
  demand_spike: TrendingUp
}

const insightColors = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200'
}

export function PredictiveInsights() {
  const { role } = useAuth()
  const { currentScenario } = useScenario()
  const [insights, setInsights] = useState<PredictiveInsight[]>([])
  const [loading, setLoading] = useState(false)

  // Only show for admin users
  if (role !== 'admin') {
    return null
  }

  // Fetch inventory and generate insights
  const fetchInsights = async () => {
    try {
      setLoading(true)

      const { data, error } = await db
        .from('inventory')
        .select('id, med_name, batch_no, manufacturing_date, expiry_date, quantity, price, shelf_location, category, is_seasonal, created_at, has_return_policy, return_policy_days')

      if (error) throw error

      const inventoryData: InventoryItem[] = (data || []).map((item: any) => ({
        ...item,
        med_name: item.med_name ?? 'Unknown',
        category: item.category ?? 'General',
        is_seasonal: item.is_seasonal ?? false,
        created_at: item.created_at ?? new Date().toISOString(),
        manufacturing_date: item.manufacturing_date ?? undefined,
        has_return_policy: item.has_return_policy ?? undefined,
        return_policy_days: item.return_policy_days ?? undefined,
      }))
      const generatedInsights = generatePredictiveInsights(inventoryData, currentScenario)
      setInsights(generatedInsights)
    } catch (err) {
      console.error('Error generating insights:', err)
      setInsights([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()

    // Subscribe to realtime changes
    const channel = db
      .channel('insights-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        () => {
          fetchInsights()
        }
      )
      .subscribe()

    return () => {
      db.removeChannel(channel)
    }
  }, [currentScenario])

  if (currentScenario === 'normal') {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center">
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-lg font-bold text-muted-foreground">Predictive Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <h3 className="font-semibold text-muted-foreground">Normal Operations</h3>
            <p className="text-sm text-muted-foreground">
              Switch to a scenario simulation to see predictive insights and demand forecasts.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="text-lg font-bold">Predictive Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-xl"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold">Predictive Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <h3 className="font-semibold text-muted-foreground">All Clear</h3>
            <p className="text-sm text-muted-foreground">
              No immediate concerns detected for the current scenario.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insightIcons[insight.type]
              const colorClass = insightColors[insight.priority]
              
              return (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-sm',
                    colorClass
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-sm leading-relaxed">
                        {insight.message}
                      </p>
                      
                      {insight.affectedItems.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {insight.affectedItems.slice(0, 3).map((item, itemIndex) => (
                            <span
                              key={itemIndex}
                              className="px-2 py-1 bg-white/50 rounded text-xs font-medium"
                            >
                              {item}
                            </span>
                          ))}
                          {insight.affectedItems.length > 3 && (
                            <span className="px-2 py-1 bg-white/50 rounded text-xs font-medium">
                              +{insight.affectedItems.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={cn(
                      'px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide',
                      insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {insight.priority}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}