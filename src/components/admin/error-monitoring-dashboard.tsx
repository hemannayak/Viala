'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { ConfigValidator } from '@/lib/config-validator'
import { useAuth } from '@/components/providers/auth-provider'

export function ErrorMonitoringDashboard() {
  const { role } = useAuth()
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Only show to admins
  if (role !== 'admin') {
    return null
  }

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    setLoading(true)
    
    try {
      // Validate configuration
      const config = ConfigValidator.validateEnvironment()
      setConfigStatus(config)
      
      // Check system health
      const health = {
        database: await checkDatabaseHealth(),
        chatbot: await checkChatbotHealth(),
        ocr: await checkOCRHealth(),
        notifications: await checkNotificationHealth()
      }
      setSystemHealth(health)
      
    } catch (error) {
      console.error('Error checking system health:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDatabaseHealth = async () => {
    try {
      const response = await fetch('/api/health')
      return response.ok ? 'healthy' : 'error'
    } catch {
      return 'error'
    }
  }

  const checkChatbotHealth = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'health check' }] })
      })
      return response.ok ? 'healthy' : 'warning'
    } catch {
      return 'error'
    }
  }

  const checkOCRHealth = async () => {
    // OCR is client-side, so just check if Tesseract is available
    return typeof window !== 'undefined' && 'Tesseract' in window ? 'healthy' : 'warning'
  }

  const checkNotificationHealth = async () => {
    // Check if SMTP is configured
    return configStatus?.warnings?.some((w: string) => w.includes('Email')) ? 'warning' : 'healthy'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Checking System Health...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            System Configuration
            <Badge className={configStatus?.isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {configStatus?.mode?.toUpperCase()} MODE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configStatus?.errors?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-600 mb-2">Configuration Errors:</h4>
              <ul className="space-y-1">
                {configStatus.errors.map((error: string, index: number) => (
                  <li key={index} className="text-sm text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-2" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {configStatus?.warnings?.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-600 mb-2">Configuration Warnings:</h4>
              <ul className="space-y-1">
                {configStatus.warnings.map((warning: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            System Health Status
            <Button onClick={checkSystemHealth} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemHealth && Object.entries(systemHealth).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium capitalize">{service}</div>
                  <Badge className={getStatusColor(status as string)} variant="secondary">
                    {status as string}
                  </Badge>
                </div>
                {getStatusIcon(status as string)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Reload Application
            </Button>
            <Button onClick={() => localStorage.clear()} variant="outline" size="sm">
              Clear Cache
            </Button>
            <Button onClick={() => window.open('/api/health', '_blank')} variant="outline" size="sm">
              View API Health
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}