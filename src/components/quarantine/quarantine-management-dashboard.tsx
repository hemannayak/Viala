'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Skull, 
  AlertTriangle, 
  Trash2, 
  Recycle, 
  MapPin, 
  Calendar,
  Package,
  DollarSign,
  Leaf,
  Shield,
  Clock,
  Building,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react'
import { QuarantineDisposalSystem, QuarantineItem, DisposalFacility } from '@/lib/quarantine-disposal-system'
import { MedicineStatus } from '@/lib/medical-safety-engine'
import { toast } from 'sonner'

interface QuarantineManagementDashboardProps {
  inventory: MedicineStatus[]
  onInventoryUpdate?: (updatedInventory: MedicineStatus[]) => void
}

export function QuarantineManagementDashboard({ 
  inventory, 
  onInventoryUpdate 
}: QuarantineManagementDashboardProps) {
  const [quarantineSystem] = useState(() => new QuarantineDisposalSystem())
  const [quarantineItems, setQuarantineItems] = useState<QuarantineItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [disposalFacilities, setDisposalFacilities] = useState<DisposalFacility[]>([])
  const [isProcessingDisposal, setIsProcessingDisposal] = useState(false)

  useEffect(() => {
    // Auto-quarantine expired medicines
    const result = quarantineSystem.autoQuarantineExpiredMedicines(inventory)
    setQuarantineItems(result.quarantinedItems)
    
    // Show shelf instructions
    if (result.shelfInstructions.length > 0) {
      result.shelfInstructions.forEach(instruction => {
        toast.error(instruction.instruction, { 
          duration: 10000,
          description: `${instruction.action} - ${instruction.specialHandling}`
        })
      })
    }

    // Get dashboard data
    const dashboard = quarantineSystem.getQuarantineDashboard()
    setDashboardData(dashboard)

    // Get disposal facilities
    const facilities = quarantineSystem.getNearestDisposalFacilities(
      { lat: 28.4595, lng: 77.0266 }, // Gurgaon coordinates
      100
    )
    setDisposalFacilities(facilities)
  }, [inventory, quarantineSystem])

  const handleItemSelection = (itemId: string, selected: boolean) => {
    const newSelection = new Set(selectedItems)
    if (selected) {
      newSelection.add(itemId)
    } else {
      newSelection.delete(itemId)
    }
    setSelectedItems(newSelection)
  }

  const handleSelectAll = () => {
    const pendingItems = quarantineItems.filter(item => item.status === 'QUARANTINED')
    if (selectedItems.size === pendingItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(pendingItems.map(item => item.id)))
    }
  }

  const handleProcessDisposal = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to dispose')
      return
    }

    setIsProcessingDisposal(true)
    try {
      const result = quarantineSystem.processDisposal(Array.from(selectedItems))
      
      if (result.success) {
        toast.success(`Successfully processed disposal of ${result.disposalSummary.totalItems} items`)
        
        // Update quarantine items status
        setQuarantineItems(prev => 
          prev.map(item => 
            selectedItems.has(item.id) 
              ? { ...item, status: 'DISPOSED' as const }
              : item
          )
        )
        
        // Clear selection
        setSelectedItems(new Set())
        
        // Update dashboard data
        const dashboard = quarantineSystem.getQuarantineDashboard()
        setDashboardData(dashboard)
        
        // Show sustainability impact
        toast.success(
          `Environmental Impact: ${result.sustainabilityImpact.totalWasteKg.toFixed(2)}kg waste processed safely`,
          { duration: 5000 }
        )
      } else {
        toast.error('Failed to process disposal')
      }
    } finally {
      setIsProcessingDisposal(false)
    }
  }

  const generateDisposalCertificate = () => {
    const certificate = quarantineSystem.generateDisposalCertificate('current')
    toast.success('Disposal certificate generated', {
      description: `Certificate ID: ${certificate.certificateId}`,
      duration: 5000
    })
  }

  const getHazardColor = (hazardLevel: string) => {
    switch (hazardLevel) {
      case 'CRITICAL': return 'bg-red-100 border-red-300 text-red-800'
      case 'HIGH': return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'LOW': return 'bg-green-100 border-green-300 text-green-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUARANTINED': return 'bg-red-100 text-red-800 border-red-200'
      case 'DISPOSAL_PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'DISPOSED': return 'bg-green-100 text-green-800 border-green-200'
      case 'RETURNED': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Skull className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quarantined</p>
                <p className="text-2xl font-bold text-red-600">{dashboardData.totalQuarantined}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Disposal</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardData.pendingDisposal}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Hazard</p>
                <p className="text-2xl font-bold text-red-600">{dashboardData.criticalHazard}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Disposal Cost</p>
                <p className="text-2xl font-bold text-green-600">₹{dashboardData.disposalCostEstimate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Actions Alert */}
      {dashboardData.urgentActions.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="text-red-800">
              <strong>Urgent Actions Required:</strong>
              <ul className="mt-2 space-y-1">
                {dashboardData.urgentActions.map((action: any) => (
                  <li key={action.id} className="text-sm">
                    • {action.medicineName} (Batch: {action.batchNumber}) - {action.action}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quarantined Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Skull className="h-5 w-5 text-red-600" />
                  Quarantined Items ({quarantineItems.filter(item => item.status === 'QUARANTINED').length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                  >
                    {selectedItems.size === quarantineItems.filter(item => item.status === 'QUARANTINED').length 
                      ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={handleProcessDisposal}
                    disabled={selectedItems.size === 0 || isProcessingDisposal}
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Process Disposal ({selectedItems.size})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {quarantineItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 ${getHazardColor(item.hazardLevel)}`}
                    >
                      <div className="flex items-start gap-3">
                        {item.status === 'QUARANTINED' && (
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => handleItemSelection(item.id, e.target.checked)}
                            className="mt-1"
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{item.medicineName}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.hazardLevel} HAZARD
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Batch: {item.batchNumber}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expired: {item.daysExpired} days ago
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              From: {item.originalShelfLocation}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Qty: {item.quantity} units
                            </div>
                          </div>

                          {/* Disposal Workflow Info */}
                          {item.disposalWorkflow && (
                            <div className="bg-white/50 rounded p-2 text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                {item.disposalWorkflow.disposalType === 'RETURN_TO_MANUFACTURER' ? (
                                  <Recycle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                )}
                                <span className="font-medium">
                                  {item.disposalWorkflow.disposalType === 'RETURN_TO_MANUFACTURER' 
                                    ? 'Return to Manufacturer' 
                                    : 'Certified Disposal'}
                                </span>
                              </div>
                              
                              {item.disposalWorkflow.facilityName && (
                                <div>Facility: {item.disposalWorkflow.facilityName}</div>
                              )}
                              
                              <div className="flex justify-between mt-1">
                                <span>Cost:</span>
                                <span className="text-red-600">₹{item.disposalWorkflow.disposalCost || 0}</span>
                              </div>
                              
                              {item.disposalWorkflow.creditRecovery && (
                                <div className="flex justify-between">
                                  <span>Credit Recovery:</span>
                                  <span className="text-green-600">₹{item.disposalWorkflow.creditRecovery}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {item.requiresSpecialHandling && (
                            <Alert className="mt-2 border-orange-200 bg-orange-50">
                              <Shield className="h-3 w-3 text-orange-600" />
                              <AlertDescription className="text-xs text-orange-800">
                                Special handling required - Use protective equipment
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Disposal Facilities & Sustainability */}
        <div className="space-y-4">
          {/* Sustainability Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="h-5 w-5 text-green-600" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Waste Processed</span>
                    <span className="font-semibold">{dashboardData.sustainabilityImpact.totalWasteKg.toFixed(2)} kg</span>
                  </div>
                  <Progress value={Math.min(100, (dashboardData.sustainabilityImpact.totalWasteKg / 10) * 100)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CO₂ Saved</span>
                    <span className="font-semibold text-green-600">{dashboardData.sustainabilityImpact.co2EmissionsSaved.toFixed(2)} kg</span>
                  </div>
                  <Progress value={Math.min(100, (dashboardData.sustainabilityImpact.co2EmissionsSaved / 25) * 100)} className="h-2" />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Environmental Grade</span>
                  <Badge className={`${
                    dashboardData.sustainabilityImpact.environmentalGrade === 'A+' ? 'bg-green-100 text-green-800' :
                    dashboardData.sustainabilityImpact.environmentalGrade === 'A' ? 'bg-green-100 text-green-700' :
                    dashboardData.sustainabilityImpact.environmentalGrade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {dashboardData.sustainabilityImpact.environmentalGrade}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Total Disposal Cost:</span>
                  <span className="text-red-600">₹{dashboardData.sustainabilityImpact.disposalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Recovered:</span>
                  <span className="text-green-600">₹{dashboardData.sustainabilityImpact.creditRecovered.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Net Cost:</span>
                  <span>₹{(dashboardData.sustainabilityImpact.disposalCost - dashboardData.sustainabilityImpact.creditRecovered).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disposal Facilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-blue-600" />
                Certified Facilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {disposalFacilities.map((facility) => (
                    <div key={facility.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{facility.name}</h4>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ★ {facility.rating}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {facility.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ₹{facility.costPerKg}/kg
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Capacity: {facility.maxCapacityKg}kg
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-teal-600" />
                Compliance Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={generateDisposalCertificate}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Disposal Certificate
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                View Audit Trail
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Leaf className="h-4 w-4 mr-2" />
                Environmental Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}