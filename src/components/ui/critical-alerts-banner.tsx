'use client'

import { useState } from 'react'
import { useAlerts } from '@/components/providers/alerts-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Clock,
  CheckCircle2
} from 'lucide-react'
import { getAlertSeverityColor, getAlertTypeIcon } from '@/lib/alerts'
import { cn } from '@/lib/utils'

export function CriticalAlertsBanner() {
  const { criticalAlerts, acknowledgeAlert, clearAlert } = useAlerts()
  const [isExpanded, setIsExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Don't show banner if no critical alerts or if dismissed
  if (criticalAlerts.length === 0 || dismissed) {
    return null
  }

  const topAlert = criticalAlerts[0]
  const remainingCount = criticalAlerts.length - 1

  return (
    <div className="relative">
      {/* Main Banner */}
      <div className={cn(
        "border-b shadow-lg transition-all duration-300",
        topAlert.severity === 'CRITICAL' 
          ? "bg-red-50 border-red-200" 
          : "bg-orange-50 border-orange-200"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Alert Icon & Message */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className={cn(
                "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                topAlert.severity === 'CRITICAL' 
                  ? "bg-red-100 animate-pulse" 
                  : "bg-orange-100"
              )}>
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  topAlert.severity === 'CRITICAL' ? "text-red-600" : "text-orange-600"
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className={cn(
                    "text-sm font-bold uppercase tracking-wide",
                    topAlert.severity === 'CRITICAL' ? "text-red-900" : "text-orange-900"
                  )}>
                    {topAlert.title}
                  </h3>
                  <Badge className={cn(
                    "text-xs px-2 py-0.5",
                    getAlertSeverityColor(topAlert.severity)
                  )}>
                    {topAlert.severity}
                  </Badge>
                  {topAlert.type === 'LOW_STOCK' && (
                    <Package className="h-4 w-4 text-muted-foreground" />
                  )}
                  {topAlert.type === 'CRITICAL_EXPIRY' && (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <p className={cn(
                  "text-sm font-medium",
                  topAlert.severity === 'CRITICAL' ? "text-red-800" : "text-orange-800"
                )}>
                  {topAlert.message}
                </p>
                
                <p className="text-xs text-muted-foreground mt-1">
                  Location: {topAlert.shelfLocation} • {topAlert.actionRequired}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {remainingCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 px-3 text-xs font-medium"
                >
                  {remainingCount} more alert{remainingCount > 1 ? 's' : ''}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => acknowledgeAlert(topAlert.id)}
                className="h-8 px-3 text-xs font-medium"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Acknowledge
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDismissed(true)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Alerts List */}
      {isExpanded && remainingCount > 0 && (
        <div className="border-b border-border/50 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="space-y-2">
              {criticalAlerts.slice(1, 6).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-lg">{getAlertTypeIcon(alert.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {alert.medName}
                        </p>
                        <Badge className={cn(
                          "text-xs px-2 py-0.5",
                          getAlertSeverityColor(alert.severity)
                        )}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.message} • {alert.shelfLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Ack
                    </Button>
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
              ))}
              
              {remainingCount > 5 && (
                <p className="text-xs text-center text-muted-foreground py-2">
                  + {remainingCount - 5} more alerts
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}