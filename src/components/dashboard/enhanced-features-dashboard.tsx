'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  Users, 
  Bell, 
  TrendingUp, 
  Phone, 
  MessageSquare,
  UserPlus,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
  Upload,
  FileText,
  Package,
  PackagePlus,
  PackageMinus,
  History,
  Scan,
  Shield,
  Eye,
  X,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { enhancedFeaturesAdapter, type SimplePatient, type SimpleNotification, type SimpleAlert, type SimpleAudit } from '@/lib/enhanced-features-adapter'

export function EnhancedFeaturesDashboard() {
  const { user } = useAuth()
  
  // State
  const [patients, setPatients] = useState<SimplePatient[]>([])
  const [notifications, setNotifications] = useState<SimpleNotification[]>([])
  const [alerts, setAlerts] = useState<SimpleAlert[]>([])
  const [audits, setAudits] = useState<SimpleAudit[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog states
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isOCROpen, setIsOCROpen] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  
  // Form states
  const [newPatient, setNewPatient] = useState({ patientId: '', name: '', phone: '' })
  const [ocrResult, setOcrResult] = useState<any>(null)

  // Initialize enhanced features
  useEffect(() => {
    const initializeFeatures = async () => {
      try {
        await enhancedFeaturesAdapter.initialize()
        await loadData()
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing enhanced features:', error)
        setIsLoading(false)
      }
    }

    initializeFeatures()

    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [patientsData, notificationsData, alertsData, auditsData] = await Promise.all([
        enhancedFeaturesAdapter.getPatients(),
        enhancedFeaturesAdapter.getNotifications(),
        enhancedFeaturesAdapter.getAlerts(),
        enhancedFeaturesAdapter.getAuditHistory()
      ])

      setPatients(patientsData)
      setNotifications(notificationsData)
      setAlerts(alertsData)
      setAudits(auditsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleAddPatient = async () => {
    try {
      if (!newPatient.patientId || !newPatient.name || !newPatient.phone) {
        toast.error('Please fill in all fields')
        return
      }

      const patient = await enhancedFeaturesAdapter.addPatient(
        newPatient.patientId,
        newPatient.name,
        newPatient.phone
      )

      if (patient) {
        toast.success('Patient added successfully')
        setIsAddPatientOpen(false)
        setNewPatient({ patientId: '', name: '', phone: '' })
        await loadData()
      } else {
        toast.error('Failed to add patient')
      }
    } catch (error) {
      toast.error('Error adding patient')
      console.error(error)
    }
  }

  const handleOCRUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingOCR(true)
    try {
      const result = await enhancedFeaturesAdapter.processOCRImage(file)
      setOcrResult(result)
      toast.success('Image processed successfully')
    } catch (error) {
      toast.error('Failed to process image')
      console.error(error)
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const handleCheckIn = async () => {
    if (!ocrResult) return

    try {
      await enhancedFeaturesAdapter.createAuditOperation(
        'check_in',
        ocrResult.medicine_name,
        ocrResult.quantity,
        user?.email || 'Unknown User'
      )

      toast.success('Medicine checked in successfully')
      setIsOCROpen(false)
      setOcrResult(null)
      await loadData()
    } catch (error) {
      toast.error('Failed to check in medicine')
      console.error(error)
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await enhancedFeaturesAdapter.acknowledgeAlert(alertId)
      toast.success('Alert acknowledged')
      await loadData()
    } catch (error) {
      toast.error('Failed to acknowledge alert')
      console.error(error)
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    try {
      await enhancedFeaturesAdapter.dismissAlert(alertId)
      toast.success('Alert dismissed')
      await loadData()
    } catch (error) {
      toast.error('Failed to dismiss alert')
      console.error(error)
    }
  }

  const runSystemValidation = async () => {
    try {
      const result = await enhancedFeaturesAdapter.runSystemValidation()
      setSystemHealth(result)
      toast.success('System validation completed')
    } catch (error) {
      toast.error('System validation failed')
      console.error(error)
    }
  }

  const stats = enhancedFeaturesAdapter.getStats()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Initializing enhanced features...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors] || ''}>
        {severity}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><MessageSquare className="h-3 w-3 mr-1" />Sent</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-teal-600" />
              <div>
                <p className="text-sm font-medium">Patients</p>
                <p className="text-2xl font-bold">{stats.patients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-2xl font-bold">{stats.notifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Alerts</p>
                <p className="text-2xl font-bold">{stats.alerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Audits</p>
                <p className="text-2xl font-bold">{stats.audits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {stats.criticalAlerts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Critical Alerts Requiring Immediate Attention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{alert.title}</span>
                  <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.id!)}>
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="ocr">OCR Audit</TabsTrigger>
            <TabsTrigger value="validation">System Health</TabsTrigger>
          </TabsList>

          <div className="flex space-x-2">
            <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>Register a new patient for notifications</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input
                      id="patientId"
                      placeholder="PS-MP-020"
                      value={newPatient.patientId}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, patientId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddPatient}>
                      Add Patient
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isOCROpen} onOpenChange={setIsOCROpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Scan className="h-4 w-4 mr-2" />
                  OCR Scan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>OCR Medicine Scanner</DialogTitle>
                  <DialogDescription>Upload an image to extract medicine information</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Upload Medicine Package Image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOCRUpload}
                      className="hidden"
                      id="ocr-upload"
                    />
                    <Button 
                      onClick={() => document.getElementById('ocr-upload')?.click()}
                      disabled={isProcessingOCR}
                    >
                      {isProcessingOCR ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Select Image
                        </>
                      )}
                    </Button>
                  </div>

                  {ocrResult && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-green-800">Extracted Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Medicine Name</Label>
                            <Input value={ocrResult.medicine_name} readOnly className="bg-white" />
                          </div>
                          <div>
                            <Label>Batch Number</Label>
                            <Input value={ocrResult.batch_no} readOnly className="bg-white" />
                          </div>
                          <div>
                            <Label>Expiry Date</Label>
                            <Input value={ocrResult.expiry_date} readOnly className="bg-white" />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input value={ocrResult.quantity} readOnly className="bg-white" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <Badge className="bg-green-100 text-green-800">
                            Confidence: {Math.round(ocrResult.confidence * 100)}%
                          </Badge>
                          <Button onClick={handleCheckIn}>
                            <PackagePlus className="h-4 w-4 mr-2" />
                            Check In Medicine
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Real-time alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No alerts at this time</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{alert.title}</h4>
                              {getSeverityBadge(alert.severity)}
                              {alert.acknowledged && (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Acknowledged
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!alert.acknowledged && (
                              <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id!)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleDismissAlert(alert.id!)}>
                              <X className="h-4 w-4 mr-1" />
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Patient Notifications</CardTitle>
              <CardDescription>SMS notifications sent to patients</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications sent yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <MessageSquare className="h-4 w-4 mt-1 text-blue-600" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{notification.medicine_name}</p>
                            {getStatusBadge(notification.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            To: {notification.phone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.sent_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>Registered Patients</CardTitle>
              <CardDescription>Patients enrolled in the notification system</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {patients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No patients registered yet</p>
                    </div>
                  ) : (
                    patients.map((patient) => (
                      <div key={patient.patient_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {patient.patient_id}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocr">
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
              <CardDescription>OCR-based inventory operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {audits.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No audit operations yet</p>
                    </div>
                  ) : (
                    audits.map((audit) => (
                      <div key={audit.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="mt-1">
                          {audit.operation === 'check_in' ? (
                            <PackagePlus className="h-4 w-4 text-green-600" />
                          ) : (
                            <PackageMinus className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{audit.medicine_name}</p>
                            <Badge variant="outline">
                              {audit.operation === 'check_in' ? 'Check In' : 'Check Out'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {audit.quantity} units • By: {audit.performed_by}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(audit.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Monitor system components and performance</CardDescription>
                </div>
                <Button onClick={runSystemValidation}>
                  <Shield className="h-4 w-4 mr-2" />
                  Run Validation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {systemHealth ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className={`h-5 w-5 ${
                      systemHealth.status === 'healthy' ? 'text-green-600' :
                      systemHealth.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <span className="text-lg font-semibold capitalize">{systemHealth.status}</span>
                  </div>
                  <div className="space-y-2">
                    {systemHealth.checks.map((check: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {check.status === 'passed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : check.status === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{check.component}</span>
                        </div>
                        <Badge variant={check.status === 'passed' ? 'default' : 'destructive'}>
                          {check.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Click "Run Validation" to check system health</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}