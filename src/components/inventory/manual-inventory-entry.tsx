'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Package, 
  Calendar, 
  DollarSign,
  Hash,
  Building,
  Loader2,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface ManualInventoryEntryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shelfId?: string
  onItemAdded: () => void
}

export function ManualInventoryEntry({ 
  open, 
  onOpenChange, 
  shelfId, 
  onItemAdded 
}: ManualInventoryEntryProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    medName: '',
    batchNo: '',
    manufacturingDate: '',
    expiryDate: '',
    quantity: '',
    mrp: '',
    shelfLocation: shelfId || '',
    hasReturnPolicy: false,
    returnPolicyDays: '60'
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateBatchNumber = () => {
    const prefix = formData.medName.substring(0, 3).toUpperCase() || 'MED'
    const timestamp = Date.now().toString().slice(-6)
    const batchNo = `${prefix}${timestamp}`
    setFormData(prev => ({ ...prev, batchNo }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.medName || !formData.expiryDate || !formData.quantity || !formData.mrp) {
      toast.error('Missing Required Fields', {
        description: 'Please fill in medicine name, expiry date, quantity, and MRP'
      })
      return
    }

    if (!formData.shelfLocation) {
      toast.error('Shelf Location Required', {
        description: 'Please select a shelf location'
      })
      return
    }

    setIsProcessing(true)

    try {
      const payload = {
        med_name: formData.medName,
        batch_no: formData.batchNo || `BATCH${Date.now().toString().slice(-6)}`,
        manufacturing_date: formData.manufacturingDate || null,
        expiry_date: formData.expiryDate,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.mrp),
        shelf_location: formData.shelfLocation,
        category: 'Other',
        is_seasonal: false,
        has_return_policy: formData.hasReturnPolicy,
        return_policy_days: formData.hasReturnPolicy ? parseInt(formData.returnPolicyDays) : null
      }

      const res = await fetch('/api/inventory', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to add medicine')
      }

      toast.success('Medicine Added Successfully', {
        description: `${formData.medName} added to shelf ${formData.shelfLocation}`,
        duration: 5000
      })

      // Reset form
      setFormData({
        medName: '',
        batchNo: '',
        manufacturingDate: '',
        expiryDate: '',
        quantity: '',
        mrp: '',
        shelfLocation: shelfId || '',
        hasReturnPolicy: false,
        returnPolicyDays: '60'
      })

      onItemAdded()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding medicine:', error)
      toast.error('Failed to add medicine', {
        description: 'Please check all fields and try again'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate shelf options (A1-Z99)
  const generateShelfOptions = () => {
    const shelves = []
    const rows = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
    for (const row of rows) {
      for (let col = 1; col <= 99; col++) {
        shelves.push(`${row}${col}`)
      }
    }
    return shelves
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Add Medicine to Inventory</span>
          </DialogTitle>
          <DialogDescription>
            Manually enter medicine details to add to your inventory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Medicine Information */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Medicine Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="med-name">Medicine Name *</Label>
                  <Input
                    id="med-name"
                    value={formData.medName}
                    onChange={(e) => handleInputChange('medName', e.target.value)}
                    placeholder="e.g., Paracetamol 500mg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batch-no">Batch Number</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="batch-no"
                      value={formData.batchNo}
                      onChange={(e) => handleInputChange('batchNo', e.target.value)}
                      placeholder="e.g., PCM2024A"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateBatchNumber}
                      disabled={!formData.medName}
                    >
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to auto-generate or click # to generate from medicine name
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates and Quantities */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Dates & Quantities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mfg-date">Manufacturing Date</Label>
                  <Input
                    id="mfg-date"
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) => handleInputChange('manufacturingDate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Optional - helps with shelf life tracking</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exp-date">Expiry Date *</Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="e.g., 50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP (₹) *</Label>
                  <Input
                    id="mrp"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.mrp}
                    onChange={(e) => handleInputChange('mrp', e.target.value)}
                    placeholder="e.g., 25.50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shelf Location */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Shelf Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shelf-location">Shelf Location *</Label>
                <Select 
                  value={formData.shelfLocation} 
                  onValueChange={(value) => handleInputChange('shelfLocation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shelf location" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateShelfOptions().map(shelf => (
                      <SelectItem key={shelf} value={shelf}>
                        Shelf {shelf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Return Policy */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Return Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="return-policy"
                  checked={formData.hasReturnPolicy}
                  onCheckedChange={(checked) => handleInputChange('hasReturnPolicy', checked as boolean)}
                />
                <Label htmlFor="return-policy">This medicine has a return policy</Label>
              </div>
              
              {formData.hasReturnPolicy && (
                <div className="space-y-2">
                  <Label htmlFor="return-days">Return Policy Days</Label>
                  <Select 
                    value={formData.returnPolicyDays} 
                    onValueChange={(value) => handleInputChange('returnPolicyDays', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.medName && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Medicine:</strong> {formData.medName}</div>
                  <div><strong>Shelf:</strong> {formData.shelfLocation}</div>
                  <div><strong>Quantity:</strong> {formData.quantity} units</div>
                  <div><strong>MRP:</strong> ₹{formData.mrp}</div>
                  <div><strong>Expiry:</strong> {formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : 'Not set'}</div>
                  <div><strong>Return Policy:</strong> {formData.hasReturnPolicy ? `${formData.returnPolicyDays} days` : 'No'}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isProcessing || !formData.medName || !formData.expiryDate || !formData.quantity || !formData.mrp}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}