'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEnhancedSystems } from '@/components/providers/enhanced-systems-provider'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  Database,
  Zap,
  TrendingUp,
  RefreshCw,
  Play,
  Eye,
  Server,
  Gauge
} from 'lucide-react'
import { toast } from 'sonner'
import type { ValidationResult } from '@/lib/system-validation'

export function SystemValidationPanel() {
  const {
    systemHealth,
    lastHealthCheck,
    isValidationRunning,
    runFullValidation,
    runQuickHealthCheck,
    isSystemsInitialized
  } = useEnhancedSystems()

  const [quickCheckResult, setQuickCheckResult] = useState<{
    status: 'healthy' | 'degraded' | 'critical'
    checks: ValidationResult[]
  } | null>(null)

  if (!isSystemsInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Initializing system validation...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleFullValidation = async () => {
    try {
      await runFullValidation()
      toast.success('Full system validation completed')
    } catch (error) {
      toast.error('System validation failed')
      console.error(error)
    }
  }

  const handleQuickCheck = async () => {
    try {
      const result = await runQuickHealthCheck()
      setQuickCheckResult(result)
      toast.success('Quick health check completed')
    } catch (error) {
      toast.error('Quick health check failed')
      console.error(error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'warning':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Shield className="h-5 w-5 text-green-600" />
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getComponentIcon = (componentName: string) => {
    if (componentName.toLowerCase().includes('database')) {
      return <Database className="h-4 w-4" />
    }
    if (componentName.toLowerCase().includes('inventory')) {
      return <Activity className="h-4 w-4" />
    }
    if (componentName.toLowerCase().includes('alert')) {
      return <Zap className="h-4 w-4" />
    }
    if (componentName.toLowerCase().includes('performance')) {
      return <Gauge className="h-4 w-4" />
    }
    if (componentName.toLowerCase().includes('realtime')) {
      return <Server className="h-4 w-4" />
    }
    return <CheckCircle className="h-4 w-4" />
  }

  const currentStatus = quickCheckResult?.status || systemHealth?.overall_status || 'unknown'
  const healthPercentage = systemHealth ? 
    Math.round((systemHealth.passed / systemHealth.total_checks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getHealthStatusIcon(currentStatus)}
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className={`text-lg font-bold capitalize ${getHealthStatusColor(currentStatus)}`}>
                  {currentStatus}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Health Score</p>
                <p className="text-2xl font-bold text-green-600">{healthPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Checks Passed</p>
                <p className="text-2xl font-bold">{systemHealth?.passed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Last Check</p>
                <p className="text-sm font-bold">
                  {lastHealthCheck ? new Date(lastHealthCheck).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Progress */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Health Overview</CardTitle>
                <CardDescription>
                  Overall system health based on {systemHealth.total_checks} validation checks
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getHealthStatusColor(systemHealth.overall_status)}>
                  {systemHealth.overall_status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Health Score</span>
                  <span>{healthPercentage}%</span>
                </div>
                <Progress value={healthPercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{systemHealth.passed}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{systemHealth.warnings}</p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{systemHealth.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>System Validation</CardTitle>
          <CardDescription>
            Run comprehensive system checks to ensure all components are functioning properly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleQuickCheck}
              disabled={isValidationRunning}
              className="flex-1"
            >
              {isValidationRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Quick Health Check
            </Button>
            
            <Button 
              onClick={handleFullValidation}
              disabled={isValidationRunning}
              variant="outline"
              className="flex-1"
            >
              {isValidationRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Full System Validation
            </Button>
          </div>
          
          {isValidationRunning && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-blue-800">Running system validation...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Check Results */}
      {quickCheckResult && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Health Check Results</CardTitle>
            <CardDescription>
              Essential system components status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickCheckResult.checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getComponentIcon(check.component_name)}
                    <div>
                      <p className="font-medium">{check.component_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {check.validation_type} • {check.execution_time_ms}ms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(check.validation_status)}
                    {getStatusBadge(check.validation_status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Validation Results */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Validation Results</CardTitle>
            <CardDescription>
              Complete system validation report from {new Date(systemHealth.generated_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {systemHealth.components.map((component, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getComponentIcon(component.component_name)}
                        <div>
                          <p className="font-medium">{component.component_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {component.validation_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(component.validation_status)}
                        {getStatusBadge(component.validation_status)}
                      </div>
                    </div>
                    
                    {component.error_message && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        {component.error_message}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Execution time: {component.execution_time_ms}ms</span>
                      <span>{new Date(component.timestamp).toLocaleString()}</span>
                    </div>
                    
                    {component.details && Object.keys(component.details).length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(component.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* System Recommendations */}
      {systemHealth && (systemHealth.failed > 0 || systemHealth.warnings > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">System Recommendations</CardTitle>
            <CardDescription>
              Suggested actions to improve system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth.failed > 0 && (
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-sm">
                    <strong>Critical Issues:</strong> {systemHealth.failed} components have failed validation. 
                    Immediate attention required to ensure system stability.
                  </p>
                </div>
              )}
              
              {systemHealth.warnings > 0 && (
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm">
                    <strong>Performance Warnings:</strong> {systemHealth.warnings} components show degraded performance. 
                    Consider optimization or monitoring.
                  </p>
                </div>
              )}
              
              <div className="flex items-start space-x-2">
                <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm">
                  <strong>Monitoring:</strong> Schedule regular health checks to maintain optimal system performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}