'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEnhancedSystems } from '@/components/providers/enhanced-systems-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X,
  TrendingUp,
  Activity,
  Bell,
  AlertCircle,
  Info,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import type { UserRole, AlertSeverity } from '@/lib/enhanced-alerts'

export function EnhancedAlertsPanel() {
  const { user } = useAuth()
  const {
    systemAlerts,
    criticalAlerts,
    alertStats,
    acknowledgeAlert,
    dismissAlert,
    getAlertsForRole,
    isSystemsInitialized
  } = useEnhancedSystems()

  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all')
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  if (!isSystemsInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Initializing enhanced alerts system...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, user?.email || 'Unknown User')
      toast.success('Alert acknowledged')
    } catch (error) {
      toast.error('Failed to acknowledge alert')
      console.error(error)
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId, user?.email || 'Unknown User')
      toast.success('Alert dismissed')
    } catch (error) {
      toast.error('Failed to dismiss alert')
      console.error(error)
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'HIGH':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'MEDIUM':
        return <Info className="h-4 w-4 text-yellow-600" />
      case 'LOW':
        return <Bell className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getSeverityBadge = (severity: AlertSeverity) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return (
      <Badge variant="outline" className={colors[severity]}>
        {getSeverityIcon(severity)}
        <span className="ml-1">{severity}</span>
      </Badge>
    )
  }

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'low_stock':
      case 'critical_stock':
        return <TrendingUp className="h-4 w-4" />
      case 'expiry_warning':
      case 'expiry_critical':
        return <Clock className="h-4 w-4" />
      case 'reorder_needed':
        return <Activity className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  // Filter alerts based on user role
  const userRole: UserRole = user?.role === 'admin' ? 'admin' : 'pharmacist'
  const roleBasedAlerts = getAlertsForRole(userRole)

  // Apply filters
  const filteredAlerts = roleBasedAlerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false
    if (!showAcknowledged && alert.is_acknowledged) return false
    return true
  })

  const severityOptions: { value: AlertSeverity | 'all', label: string, count: number }[] = [
    { value: 'all', label: 'All Alerts', count: roleBasedAlerts.length },
    { value: 'CRITICAL', label: 'Critical', count: alertStats.critical },
    { value: 'HIGH', label: 'High', count: alertStats.high },
    { value: 'MEDIUM', label: 'Medium', count: alertStats.medium },
    { value: 'LOW', label: 'Low', count: alertStats.low }
  ]

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-teal-600" />
              <div>
                <p className="text-sm font-medium">Total Alerts</p>
                <p className="text-2xl font-bold">{alertStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-600">{alertStats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{alertStats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Unacknowledged</p>
                <p className="text-2xl font-bold text-yellow-600">{alertStats.unacknowledged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Response Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {alertStats.total > 0 
                    ? Math.round(((alertStats.total - alertStats.unacknowledged) / alertStats.total) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Critical Alerts Requiring Immediate Attention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    {getAlertTypeIcon(alert.alert_type)}
                    <span className="font-medium">{alert.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
              {criticalAlerts.length > 3 && (
                <p className="text-sm text-red-700">
                  +{criticalAlerts.length - 3} more critical alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Alerts Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Real-time alerts and notifications for {userRole} role
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAcknowledged(!showAcknowledged)}
              >
                {showAcknowledged ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Severity Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {severityOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedSeverity === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeverity(option.value)}
              >
                {option.label} ({option.count})
              </Button>
            ))}
          </div>

          {/* Alerts List */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No alerts match the current filters</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 border rounded-lg ${
                      alert.is_acknowledged ? 'bg-gray-50 opacity-75' : 'bg-white'
                    } ${
                      alert.severity === 'CRITICAL' ? 'border-red-200' : 
                      alert.severity === 'HIGH' ? 'border-orange-200' : 
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          {getAlertTypeIcon(alert.alert_type)}
                          <h4 className="font-medium">{alert.title}</h4>
                          {getSeverityBadge(alert.severity)}
                          {alert.is_acknowledged && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        
                        {alert.related_medicine && (
                          <p className="text-xs text-muted-foreground">
                            Related: {alert.related_medicine}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{new Date(alert.created_at).toLocaleString()}</span>
                          {alert.acknowledged_by && (
                            <span>Acknowledged by {alert.acknowledged_by}</span>
                          )}
                          {alert.auto_generated && (
                            <Badge variant="outline" className="text-xs">Auto-generated</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.is_acknowledged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                        
                        {!alert.is_dismissed && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Trigger Conditions (for debugging/admin) */}
                    {user?.role === 'admin' && alert.trigger_conditions && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          Trigger Conditions
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(alert.trigger_conditions, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}