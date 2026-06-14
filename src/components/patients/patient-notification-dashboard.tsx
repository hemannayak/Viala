'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Users, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Search,
  Filter,
  TrendingUp,
  Heart,
  Pill,
  Phone,
  User,
  Activity
} from 'lucide-react'
import { PatientNotificationSystem, Patient, Notification } from '@/lib/patient-notification-system'
import { MedicineStatus } from '@/lib/medical-safety-engine'
import { toast } from 'sonner'

interface PatientNotificationDashboardProps {
  inventory: MedicineStatus[]
}

export function PatientNotificationDashboard({ inventory }: PatientNotificationDashboardProps) {
  const [notificationSystem] = useState(() => new PatientNotificationSystem())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patientDashboard, setPatientDashboard] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isSendingNotifications, setIsSendingNotifications] = useState(false)

  useEffect(() => {
    // Generate proactive notifications
    const stockAlerts = notificationSystem.generateStockAlerts(inventory)
    const refillReminders = notificationSystem.generateRefillReminders()
    const expiryWarnings = notificationSystem.generateExpiryWarnings(inventory)
    
    const allNotifications = [...stockAlerts, ...refillReminders, ...expiryWarnings]
    setNotifications(allNotifications)
    
    // Get analytics
    const analyticsData = notificationSystem.getNotificationAnalytics()
    setAnalytics(analyticsData)
    
    // Show summary
    if (allNotifications.length > 0) {
      toast.success(`Generated ${allNotifications.length} proactive notifications`, {
        description: `${stockAlerts.length} stock alerts, ${refillReminders.length} refill reminders, ${expiryWarnings.length} expiry warnings`
      })
    }
  }, [inventory, notificationSystem])

  const handleSendNotifications = async (notificationIds: string[]) => {
    if (notificationIds.length === 0) {
      toast.error('No notifications selected')
      return
    }

    setIsSendingNotifications(true)
    try {
      const result = await notificationSystem.sendNotifications(notificationIds)
      
      toast.success(`Sent ${result.sent} notifications successfully`, {
        description: result.failed > 0 ? `${result.failed} failed to send` : 'All notifications delivered'
      })
      
      // Update notifications state
      setNotifications(prev => 
        prev.map(notification => {
          const sentResult = result.results.find(r => r.notificationId === notification.id)
          if (sentResult) {
            return {
              ...notification,
              status: sentResult.status as any,
              sentTime: sentResult.status === 'SENT' ? new Date().toISOString() : notification.sentTime
            }
          }
          return notification
        })
      )
      
      // Refresh analytics
      const analyticsData = notificationSystem.getNotificationAnalytics()
      setAnalytics(analyticsData)
      
    } finally {
      setIsSendingNotifications(false)
    }
  }

  const handleViewPatient = (patientId: string) => {
    const dashboard = notificationSystem.getPatientDashboard(patientId)
    setPatientDashboard(dashboard)
    setSelectedPatient(patientId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200'
      case 'OPENED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-3 w-3" />
      case 'sms': return <Smartphone className="h-3 w-3" />
      case 'push': return <Bell className="h-3 w-3" />
      default: return <MessageSquare className="h-3 w-3" />
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
      notification.status.toLowerCase() === filterType.toLowerCase() ||
      notification.urgency.toLowerCase() === filterType.toLowerCase()
    
    return matchesSearch && matchesFilter
  })

  const pendingNotifications = notifications.filter(n => n.status === 'PENDING')

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sent Today</p>
                <p className="text-2xl font-bold text-green-600">{analytics.sentToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-teal-600">{analytics.deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.openRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {pendingNotifications.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Bell className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="text-blue-800">
                <strong>{pendingNotifications.length} notifications ready to send</strong>
                <p className="text-sm mt-1">Proactive patient notifications generated based on inventory status</p>
              </div>
              <Button
                onClick={() => handleSendNotifications(pendingNotifications.map(n => n.id))}
                disabled={isSendingNotifications}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send All ({pendingNotifications.length})
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="critical">Critical</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-teal-600" />
                Patient Notifications ({filteredNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{notification.title}</h3>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                          <Badge className={getUrgencyColor(notification.urgency)}>
                            {notification.urgency}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(notification.channel)}
                          <span className="text-xs text-gray-500">{notification.channel}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.scheduledTime).toLocaleString()}
                          </div>
                          {notification.sentTime && (
                            <div className="flex items-center gap-1">
                              <Send className="h-3 w-3" />
                              Sent: {new Date(notification.sentTime).toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {notification.status === 'PENDING' && (
                            <Button
                              onClick={() => handleSendNotifications([notification.id])}
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Send Now
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => handleViewPatient(notification.patientId)}
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs"
                          >
                            <User className="h-3 w-3 mr-1" />
                            View Patient
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          {selectedPatient && patientDashboard ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-teal-600" />
                    Patient Dashboard - {patientDashboard.patient?.name}
                  </CardTitle>
                  <Button
                    onClick={() => setSelectedPatient(null)}
                    variant="outline"
                    size="sm"
                  >
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Contact Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {patientDashboard.patient.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {patientDashboard.patient.phone}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Medical History</h4>
                    <div className="text-sm text-gray-600">
                      <div>Conditions: {patientDashboard.patient.medicalHistory.chronicConditions.join(', ')}</div>
                      <div>Allergies: {patientDashboard.patient.medicalHistory.allergies.join(', ')}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Adherence Score</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={patientDashboard.adherenceScore} className="flex-1" />
                      <span className="text-sm font-semibold">{patientDashboard.adherenceScore}%</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recent Purchases */}
                <div>
                  <h4 className="font-medium mb-3">Recent Purchases</h4>
                  <div className="space-y-2">
                    {patientDashboard.recentPurchases.slice(0, 5).map((purchase: any) => (
                      <div key={purchase.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-teal-600" />
                          <span className="text-sm">{purchase.medicineName}</span>
                          <Badge variant="outline" className="text-xs">
                            {purchase.frequency}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Refills */}
                {patientDashboard.upcomingRefills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Upcoming Refills</h4>
                    <div className="space-y-2">
                      {patientDashboard.upcomingRefills.map((refill: any) => (
                        <div key={refill.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{refill.medicineName}</span>
                          </div>
                          <div className="text-sm text-blue-600">
                            Due: {new Date(refill.nextRefillDue).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Insights */}
                {patientDashboard.healthInsights.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Health Insights</h4>
                    <div className="space-y-2">
                      {patientDashboard.healthInsights.map((insight: any, index: number) => (
                        <Alert key={index} className={
                          insight.severity === 'HIGH' ? 'border-red-200 bg-red-50' :
                          insight.severity === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }>
                          <Heart className="h-4 w-4" />
                          <AlertDescription>
                            <div className="text-sm">
                              <strong>{insight.type.replace('_', ' ')}:</strong> {insight.message}
                              <div className="mt-1 text-xs">Action: {insight.action}</div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-600" />
                  Registered Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a patient from notifications to view their dashboard</p>
                  <p className="text-xs mt-1">Patient management features available in full version</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notifications by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count as number / analytics.totalNotifications) * 100} className="w-20 h-2" />
                        <span className="text-sm font-semibold w-8">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Urgency Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Urgency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.byUrgency).map(([urgency, count]) => (
                    <div key={urgency} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{urgency}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count as number / analytics.totalNotifications) * 100} 
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-semibold w-8">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <div>
                        <div className="text-sm font-medium">{activity.patientName}</div>
                        <div className="text-xs text-gray-600">{activity.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.sentTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}