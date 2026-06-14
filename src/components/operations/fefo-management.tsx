'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ShoppingCart, 
  RotateCcw, 
  Package,
  Zap,
  Heart,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { db, calculateDaysToExpiry } from '@/lib/db'
import { toast } from 'sonner'

interface FEFOManagementProps {
  className?: string
}

export function FEFOManagement({ className = '' }: FEFOManagementProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [saleQuantity, setSaleQuantity] = useState('10')
  const [selectedMedicine, setSelectedMedicine] = useState('')

  const handleFEFOSale = async () => {
    if (!selectedMedicine.trim()) {
      toast.error('Please enter a medicine name')
      return
    }

    const quantity = parseInt(saleQuantity) || 10
    setIsProcessing(true)

    try {
      // Find items matching the medicine name, ordered by expiry date (FEFO)
      const { data: items, error: fetchError } = await db
        .from('inventory')
        .select('*')
        .ilike('med_name', `%${selectedMedicine}%`)
        .order('expiry_date', { ascending: true })

      if (fetchError) throw fetchError

      if (!items || items.length === 0) {
        toast.error(`No items found matching "${selectedMedicine}"`)
        return
      }

      // Process FEFO sale
      let remainingQuantity = quantity
      const updatedItems = []

      for (const item of items) {
        if (remainingQuantity <= 0) break

        const availableQuantity = item.quantity
        const quantityToSell = Math.min(remainingQuantity, availableQuantity)
        const newQuantity = availableQuantity - quantityToSell

        // Update the item
        const { error: updateError } = await db
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('id', item.id)

        if (updateError) throw updateError

        updatedItems.push({
          name: item.med_name,
          batch: item.batch_no,
          sold: quantityToSell,
          remaining: newQuantity,
          expiryDays: calculateDaysToExpiry(item.expiry_date)
        })

        remainingQuantity -= quantityToSell
      }

      // Show success message with FEFO details
      const primaryItem = updatedItems[0]
      toast.success(`FEFO Sale Processed: ${quantity} units of ${selectedMedicine}`, {
        description: `Sold from batch ${primaryItem.batch} (expires in ${primaryItem.expiryDays} days)`,
        duration: 7000
      })

      // Reset form
      setSelectedMedicine('')
      setSaleQuantity('10')

    } catch (error) {
      console.error('FEFO Sale Error:', error)
      toast.error('FEFO sale failed', {
        description: 'Please check the medicine name and try again'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVendorReturn = async () => {
    if (!selectedMedicine.trim()) {
      toast.error('Please enter a medicine name for return')
      return
    }

    setIsProcessing(true)

    try {
      // Find items that are near expiry (within 60 days) for vendor return
      const sixtyDaysFromNow = new Date()
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60)

      const { data: items, error: fetchError } = await db
        .from('inventory')
        .select('*')
        .ilike('med_name', `%${selectedMedicine}%`)
        .lt('expiry_date', sixtyDaysFromNow.toISOString())
        .order('expiry_date', { ascending: true })

      if (fetchError) throw fetchError

      if (!items || items.length === 0) {
        toast.info(`No near-expiry items found for "${selectedMedicine}"`, {
          description: 'Only items expiring within 60 days can be returned to vendor'
        })
        return
      }

      // Process vendor return for the first eligible item
      const item = items[0]
      const returnValue = item.price * item.quantity * 0.7 // 70% return value

      // Remove item from inventory (simulate return)
      const { error: deleteError } = await db
        .from('inventory')
        .delete()
        .eq('id', item.id)

      if (deleteError) throw deleteError

      toast.success(`Vendor Return Processed: ${item.med_name}`, {
        description: `Returned ${item.quantity} units, recovered ₹${returnValue.toFixed(2)} (70% value)`,
        duration: 7000
      })

      // Reset form
      setSelectedMedicine('')

    } catch (error) {
      console.error('Vendor Return Error:', error)
      toast.error('Vendor return failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNGODonation = async () => {
    if (!selectedMedicine.trim()) {
      toast.error('Please enter a medicine name for donation')
      return
    }

    setIsProcessing(true)

    try {
      // Find items that are close to expiry but still valid (10-30 days)
      const tenDaysFromNow = new Date()
      tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10)
      
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const { data: items, error: fetchError } = await db
        .from('inventory')
        .select('*')
        .ilike('med_name', `%${selectedMedicine}%`)
        .gte('expiry_date', tenDaysFromNow.toISOString())
        .lt('expiry_date', thirtyDaysFromNow.toISOString())
        .order('expiry_date', { ascending: true })

      if (fetchError) throw fetchError

      if (!items || items.length === 0) {
        toast.info(`No suitable items found for NGO donation`, {
          description: 'Items must have 10-30 days until expiry for safe donation'
        })
        return
      }

      // Process NGO donation for the first eligible item
      const item = items[0]
      const donationValue = item.price * item.quantity

      // Remove item from inventory (simulate donation)
      const { error: deleteError } = await db
        .from('inventory')
        .delete()
        .eq('id', item.id)

      if (deleteError) throw deleteError

      toast.success(`NGO Donation Processed: ${item.med_name}`, {
        description: `Donated ${item.quantity} units to HealthCare Foundation, value: ₹${donationValue.toFixed(2)}`,
        duration: 7000
      })

      // Reset form
      setSelectedMedicine('')

    } catch (error) {
      console.error('NGO Donation Error:', error)
      toast.error('NGO donation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={`${className} border-emerald-200 bg-emerald-50/30`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-emerald-600" />
          <span>FEFO & Rescue Management</span>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Smart Operations
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          First Expiry First Out logic and rescue action management
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Medicine Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Medicine Selection</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="medicine" className="text-xs text-muted-foreground">Medicine Name</Label>
              <Input
                id="medicine"
                placeholder="e.g., Paracetamol, Cough Syrup"
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quantity" className="text-xs text-muted-foreground">Sale Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="10"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* FEFO Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">FEFO Operations</h4>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFEFOSale}
              disabled={isProcessing || !selectedMedicine.trim()}
              className="h-auto p-3 flex flex-col items-start space-y-1 hover:bg-primary/5 border-primary/20"
            >
              <div className="flex items-center space-x-2 w-full">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span className="font-medium text-xs">Process FEFO Sale</span>
              </div>
              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                Automatically sell from earliest expiry batches first
              </p>
            </Button>
          </div>
        </div>

        {/* Rescue Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Rescue Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVendorReturn}
              disabled={isProcessing || !selectedMedicine.trim()}
              className="h-auto p-3 flex flex-col items-start space-y-1 hover:bg-blue-50 border-blue-200"
            >
              <div className="flex items-center space-x-2 w-full">
                <RotateCcw className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-xs">Vendor Return</span>
              </div>
              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                Return near-expiry items for 70% credit
              </p>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNGODonation}
              disabled={isProcessing || !selectedMedicine.trim()}
              className="h-auto p-3 flex flex-col items-start space-y-1 hover:bg-red-50 border-red-200"
            >
              <div className="flex items-center space-x-2 w-full">
                <Heart className="h-4 w-4 text-red-600" />
                <span className="font-medium text-xs">NGO Donation</span>
              </div>
              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                Donate suitable items to verified NGOs
              </p>
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border/50 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isProcessing ? 'bg-emerald-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isProcessing ? 'Processing...' : 'FEFO system active'}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Smart rescue actions enabled
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-foreground mb-3">How FEFO Works:</h5>
          <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <li>• <strong>FEFO Sale:</strong> Automatically sells from earliest expiry batches</li>
            <li>• <strong>Vendor Return:</strong> Returns items expiring within 60 days for credit</li>
            <li>• <strong>NGO Donation:</strong> Donates items with 10-30 days shelf life</li>
            <li>• All actions update inventory and heatmap in real-time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}