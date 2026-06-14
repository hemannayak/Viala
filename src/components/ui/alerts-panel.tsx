'use client'

import { useState } from 'react'
import { useAlerts } from '@/components/providers/alerts-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Package,
  Clock,
  RefreshCw,
  Filter
} from 'lucide-react'
import { getAlertSeverityColor, getAlertTypeIcon, type AlertSeverity } from '@/lib/alerts'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface AlertsPanelProps {
  className?: string
  maxHeight?: string
}

export function AlertsPanel({ className = '', maxHeight = 'h-96' }: AlertsPanelProps) {
  const { alerts, criticalAlerts, acknowledgeAlert, clearAlert, isListening } = useAlerts()
  const [filter, setFilter] = useState<AlertSeverity | 'ALL'>('ALL')
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  // Filter alerts based on current filter
  const filteredAlerts = alerts.filter(alert => {
    if (!showAcknowledged && alert.acknowledged) return false
    if (filter === 'ALL') return true
    return alert.severity === filter
  })

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length
  const criticalCount = criticalAlerts.length

  return (
    <Card className={`${className} shadow-sm border-border/50`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {criticalCount > 0 ? (
              <BellRing className="h-5 w-5 text-red-500" />
            ) : (
              <Bell className="h-5 w-5 text-muted-foreground" />
            )}
            <span>System Alerts</span>
            {unacknowledgedCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                {unacknowledgedCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-1 text-xs px-2 py-1 rounded-full",
              isListening 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            )}>
              <div className={cn(
                "h-2 w-2 rounded-full",
                isListening ? "bg-green-500" : "bg-red-500"
              )} />
              <span>{isListening ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as AlertSeverity | 'ALL')}
              className="text-xs border border-border rounded px-2 py-1 bg-background"
            >
              <option value="ALL">All Alerts</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAcknowledged(!showAcknowledged)}
            className="h-7 px-2 text-xs"
          >
            {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">
              {filter === 'ALL' ? 'No alerts at this time' : `No ${filter.toLowerCase()} alerts`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              System is monitoring inventory in real-time
            </p>
          </div>
        ) : (
          <ScrollArea className={maxHeight}>
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
                    alert.acknowledged 
                      ? "bg-muted/20 border-muted opacity-60" 
                      : "bg-background border-border/50 hover:bg-muted/10",
                    alert.severity === 'CRITICAL' && !alert.acknowledged && "ring-1 ring-red-200 bg-red-50/30"
                  )}
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Alert Icon */}
                      <div className={cn(
                        "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5",
                        alert.severity === 'CRITICAL' && !alert.acknowledged 
                          ? "bg-red-100 animate-pulse" 
                          : alert.severity === 'HIGH' 
                          ? "bg-orange-100" 
                          : "bg-muted"
                      )}>
                        {alert.type === 'LOW_STOCK' && <Package className="h-4 w-4" />}
                        {alert.type === 'CRITICAL_EXPIRY' && <Clock className="h-4 w-4" />}
                        {alert.type === 'STOCKOUT' && <AlertTriangle className="h-4 w-4" />}
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {alert.medName}
                          </h4>
                          <Badge className={cn(
                            "text-xs px-2 py-0.5",
                            getAlertSeverityColor(alert.severity)
                          )}>
                            {alert.severity}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5">
                              ✓ Ack
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-foreground mb-2">
                          {alert.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Location: {alert.shelfLocation}</span>
                          <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {alert.actionRequired}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-1">
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="h-7 px-2 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ack
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => clearAlert(alert.id)}
                        className="h-7 w-7"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Summary Stats */}
        {alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length}
                </div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {alerts.filter(a => a.severity === 'HIGH' && !a.acknowledged).length}
                </div>
                <div className="text-xs text-muted-foreground">High</div>
              </div>
              <div>
                <div className="text-lg font-bold text-muted-foreground">
                  {alerts.filter(a => a.acknowledged).length}
                </div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}