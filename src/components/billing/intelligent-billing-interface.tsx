'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  ShoppingCart, 
  AlertTriangle, 
  Shield, 
  Clock, 
  DollarSign,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin
} from 'lucide-react'
import { IntelligentBillingSystem, SearchResult, Bill, BillItem } from '@/lib/intelligent-billing-system'
import { MedicineStatus } from '@/lib/medical-safety-engine'
import { toast } from 'sonner'

interface IntelligentBillingInterfaceProps {
  inventory: MedicineStatus[]
  pharmacistId: string
  onBillFinalized?: (bill: Bill) => void
}

export function IntelligentBillingInterface({ 
  inventory, 
  pharmacistId, 
  onBillFinalized 
}: IntelligentBillingInterfaceProps) {
  const [billingSystem] = useState(() => new IntelligentBillingSystem(inventory))
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [currentBill, setCurrentBill] = useState<Bill | null>(null)
  const [patientName, setPatientName] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Initialize new bill
    const newBill = billingSystem.startNewBill(pharmacistId, undefined, patientName || undefined)
    setCurrentBill(newBill)
  }, [billingSystem, pharmacistId, patientName])

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Simulate search delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
      const results = billingSystem.searchMedicines(term)
      setSearchResults(results)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToBill = (medicineId: string, quantity: number = 1) => {
    const result = billingSystem.addItemToBill(medicineId, quantity)
    
    if (result.success) {
      setCurrentBill(result.updatedBill!)
      toast.success(result.message)
      
      // Show warnings for rescue items
      if (result.updatedBill?.warnings.length) {
        result.updatedBill.warnings.forEach(warning => {
          toast.warning(warning, { duration: 5000 })
        })
      }
    } else {
      toast.error(result.message)
      
      // Show safety violations
      if (result.violations?.length) {
        result.violations.forEach(violation => {
          toast.error(`Safety Violation: ${violation}`, { duration: 8000 })
        })
      }
    }
  }

  const handleRemoveFromBill = (medicineId: string) => {
    const result = billingSystem.removeItemFromBill(medicineId)
    
    if (result.success) {
      setCurrentBill(result.updatedBill!)
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const handleFinalizeBill = () => {
    const result = billingSystem.finalizeBill()
    
    if (result.success) {
      toast.success('Bill finalized successfully!')
      onBillFinalized?.(result.finalBill!)
      
      // Reset for new bill
      const newBill = billingSystem.startNewBill(pharmacistId, undefined, patientName || undefined)
      setCurrentBill(newBill)
      setSearchResults([])
      setSearchTerm('')
    } else {
      toast.error(result.message)
      
      // Show compliance violations
      if (result.complianceReport.violations?.length) {
        result.complianceReport.violations.forEach((violation: string) => {
          toast.error(`Compliance Violation: ${violation}`, { duration: 8000 })
        })
      }
    }
  }

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'RED': return 'bg-red-50 border-red-200 text-red-800'
      case 'YELLOW': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'GREEN': return 'bg-green-50 border-green-200 text-green-800'
      case 'BLACK': return 'bg-gray-900 border-gray-700 text-white'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return <XCircle className="h-4 w-4 text-red-500" />
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'MEDIUM': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'LOW': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Search & Results Panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search Header */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-teal-600" />
              Medicine Search & FEFO Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medicines (e.g., Paracetamol, Aspirin)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="Patient Name (Optional)"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-48"
              />
            </div>
            
            {/* Safety Notice */}
            <Alert className="border-teal-200 bg-teal-50">
              <Shield className="h-4 w-4 text-teal-600" />
              <AlertDescription className="text-teal-800">
                <strong>FEFO Enforcement:</strong> Medicines are automatically sorted by expiry date. 
                Earliest expiry batches appear first and must be sold first for safety compliance.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">
              Search Results {searchResults.length > 0 && `(${searchResults.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No medicines found' : 'Start typing to search medicines'}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div
                      key={result.medicine.id}
                      className={`p-4 rounded-lg border-2 transition-all ${getZoneColor(result.classification.zone)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getRiskIcon(result.classification.riskLevel)}
                            <h3 className="font-semibold">{result.medicine.med_name}</h3>
                            <Badge variant="outline" className="text-xs">
                              FEFO #{result.fefoRank}
                            </Badge>
                            {result.pricing.isRescueItem && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                RESCUE ITEM
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Batch: {result.medicine.batch_no}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires: {result.classification.daysToExpiry} days
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Shelf: {result.medicine.shelf_location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Stock: {result.medicine.quantity} units
                            </div>
                          </div>

                          {/* Pricing Information */}
                          <div className="bg-white/50 rounded p-2 mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Base Price:</span>
                              <span className={result.pricing.discountPercentage > 0 ? 'line-through text-gray-500' : 'font-semibold'}>
                                ₹{result.pricing.basePrice}
                              </span>
                            </div>
                            {result.pricing.discountPercentage > 0 && (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Discount ({result.pricing.discountPercentage}%):</span>
                                  <span className="text-green-600">
                                    -₹{(result.pricing.basePrice - result.pricing.finalPrice).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-semibold">
                                  <span>Final Price:</span>
                                  <span className="text-teal-600">₹{result.pricing.finalPrice}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Recommendation Message */}
                          {result.recommendationMessage && (
                            <Alert className="mb-3">
                              <AlertDescription className="text-xs">
                                {result.recommendationMessage}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Transparency Message */}
                          {result.pricing.transparencyMessage && result.pricing.transparencyMessage !== 'Regular pricing' && (
                            <Alert className="border-orange-200 bg-orange-50">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-orange-800 text-xs">
                                {result.pricing.transparencyMessage}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="ml-4">
                          {result.canAddToBill ? (
                            <Button
                              onClick={() => handleAddToBill(result.medicine.id)}
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Bill
                            </Button>
                          ) : (
                            <div className="text-center">
                              <Button disabled size="sm" variant="destructive">
                                <XCircle className="h-4 w-4 mr-1" />
                                Blocked
                              </Button>
                              <p className="text-xs text-red-600 mt-1 max-w-24">
                                {result.blockingReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Current Bill Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-teal-600" />
              Current Bill
              {currentBill?.complianceStatus === 'VIOLATION' && (
                <Badge variant="destructive">Compliance Issue</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentBill && currentBill.items.length > 0 ? (
              <div className="space-y-4">
                {/* Bill Items */}
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {currentBill.items.map((item: BillItem) => (
                      <div key={item.medicineId} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{item.medicineName}</h4>
                              {item.isRescueItem && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                  RESCUE
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Batch: {item.batchNumber}</div>
                              <div>Qty: {item.quantity} × ₹{item.finalPrice}</div>
                              {item.discountPercentage > 0 && (
                                <div className="text-green-600">
                                  Discount: {item.discountPercentage}%
                                </div>
                              )}
                              <div>Expires: {item.daysToExpiry} days</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              ₹{(item.finalPrice * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              onClick={() => handleRemoveFromBill(item.medicineId)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {item.transparencyMessage && item.transparencyMessage !== 'Regular pricing' && (
                          <Alert className="mt-2 border-orange-200 bg-orange-50">
                            <AlertDescription className="text-xs text-orange-800">
                              {item.transparencyMessage}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator />

                {/* Bill Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{currentBill.subtotal.toFixed(2)}</span>
                  </div>
                  {currentBill.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Total Discount:</span>
                      <span>-₹{currentBill.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-teal-600">₹{currentBill.finalTotal.toFixed(2)}</span>
                  </div>
                  
                  {currentBill.rescueItemsCount > 0 && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      {currentBill.rescueItemsCount} rescue item(s) with transparency discounts
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {currentBill.warnings.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <div className="text-xs space-y-1">
                        {currentBill.warnings.map((warning, index) => (
                          <div key={index}>• {warning}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Finalize Button */}
                <Button
                  onClick={handleFinalizeBill}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={currentBill.complianceStatus === 'VIOLATION'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalize Bill
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No items in bill</p>
                <p className="text-xs">Search and add medicines to start billing</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-teal-600" />
              Safety Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>FEFO enforcement active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Expired medicine blocking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Transparent pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Audit trail logging</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}