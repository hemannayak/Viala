'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEnhancedSystems } from '@/components/providers/enhanced-systems-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  Users, 
  Bell, 
  TrendingUp, 
  Phone, 
  Mail, 
  Calendar,
  MessageSquare,
  UserPlus,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

export function PatientNotificationsPanel() {
  const { user } = useAuth()
  const {
    patients,
    patientPatterns,
    stockNotifications,
    addPatient,
    addPurchaseRecord,
    isSystemsInitialized
  } = useEnhancedSystems()

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false)
  const [newPatient, setNewPatient] = useState({
    patientId: '',
    name: '',
    phoneNumber: '',
    email: ''
  })
  const [newPurchase, setNewPurchase] = useState({
    patientId: '',
    medicineName: '',
    quantity: '',
    unitPrice: ''
  })

  if (!isSystemsInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Initializing patient notification system...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleAddPatient = async () => {
    try {
      if (!newPatient.patientId || !newPatient.name || !newPatient.phoneNumber) {
        toast.error('Please fill in all required fields')
        return
      }

      await addPatient(
        newPatient.patientId,
        newPatient.name,
        newPatient.phoneNumber,
        newPatient.email || undefined
      )

      toast.success('Patient added successfully')
      setIsAddPatientOpen(false)
      setNewPatient({ patientId: '', name: '', phoneNumber: '', email: '' })
    } catch (error) {
      toast.error('Failed to add patient')
      console.error(error)
    }
  }

  const handleAddPurchase = async () => {
    try {
      if (!newPurchase.patientId || !newPurchase.medicineName || !newPurchase.quantity || !newPurchase.unitPrice) {
        toast.error('Please fill in all required fields')
        return
      }

      await addPurchaseRecord(
        newPurchase.patientId,
        newPurchase.medicineName,
        parseInt(newPurchase.quantity),
        parseFloat(newPurchase.unitPrice)
      )

      toast.success('Purchase record added successfully')
      setIsAddPurchaseOpen(false)
      setNewPurchase({ patientId: '', medicineName: '', quantity: '', unitPrice: '' })
    } catch (error) {
      toast.error('Failed to add purchase record')
      console.error(error)
    }
  }

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><MessageSquare className="h-3 w-3 mr-1" />Sent</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-red-100 text-red-800',
      weekly: 'bg-yellow-100 text-yellow-800',
      monthly: 'bg-green-100 text-green-800'
    }
    return (
      <Badge variant="outline" className={colors[frequency as keyof typeof colors] || ''}>
        {frequency}
      </Badge>
    )
  }

  const recentNotifications = stockNotifications.slice(0, 10)
  const activePatterns = patientPatterns.filter(p => p.is_active)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-teal-600" />
              <div>
                <p className="text-sm font-medium">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Patterns</p>
                <p className="text-2xl font-bold">{activePatterns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Notifications Sent</p>
                <p className="text-2xl font-bold">{stockNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Delivery Rate</p>
                <p className="text-2xl font-bold">
                  {stockNotifications.length > 0 
                    ? Math.round((stockNotifications.filter(n => n.delivery_status === 'delivered').length / stockNotifications.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="notifications">Recent Notifications</TabsTrigger>
            <TabsTrigger value="patterns">Patient Patterns</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
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
                  <DialogDescription>
                    Register a new patient for predictive notifications
                  </DialogDescription>
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
                      value={newPatient.phoneNumber}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
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

            <Dialog open={isAddPurchaseOpen} onOpenChange={setIsAddPurchaseOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Add Purchase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Purchase Record</DialogTitle>
                  <DialogDescription>
                    Record a patient purchase to build patterns
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="purchasePatientId">Patient ID</Label>
                    <Input
                      id="purchasePatientId"
                      placeholder="PS-MP-017"
                      value={newPurchase.patientId}
                      onChange={(e) => setNewPurchase(prev => ({ ...prev, patientId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicineName">Medicine Name</Label>
                    <Input
                      id="medicineName"
                      placeholder="Cetirizine Cold Tablet"
                      value={newPurchase.medicineName}
                      onChange={(e) => setNewPurchase(prev => ({ ...prev, medicineName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="10"
                      value={newPurchase.quantity}
                      onChange={(e) => setNewPurchase(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      placeholder="5.50"
                      value={newPurchase.unitPrice}
                      onChange={(e) => setNewPurchase(prev => ({ ...prev, unitPrice: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddPurchaseOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddPurchase}>
                      Add Purchase
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Notifications</CardTitle>
              <CardDescription>
                Proactive notifications sent to patients when their regular medicines are running low
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications sent yet</p>
                    </div>
                  ) : (
                    recentNotifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <MessageSquare className="h-4 w-4 mt-1 text-blue-600" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{notification.medicine_name}</p>
                            {getDeliveryStatusBadge(notification.delivery_status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            To: {notification.phone} • Stock: {notification.stock_level_at_trigger} units
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

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Medicine Patterns</CardTitle>
              <CardDescription>
                AI-detected purchase patterns used for predictive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {activePatterns.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No patterns detected yet</p>
                    </div>
                  ) : (
                    activePatterns.map((pattern) => (
                      <div key={pattern.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{pattern.medicine_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Avg. {pattern.average_quantity} units • Last: {new Date(pattern.last_purchase_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getFrequencyBadge(pattern.purchase_frequency)}
                          <Badge variant="outline">
                            {Math.round(pattern.pattern_confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Patients</CardTitle>
              <CardDescription>
                Patients enrolled in the predictive notification system
              </CardDescription>
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
                      <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {patient.patient_id}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone}</span>
                          {patient.email && (
                            <>
                              <Mail className="h-3 w-3 ml-2" />
                              <span>{patient.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}