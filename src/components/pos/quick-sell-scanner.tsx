'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Scan, ShoppingCart, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { useAuth } from '@/components/providers/auth-provider'

interface SaleItem {
  id: string
  med_name: string
  batch_no: string
  current_stock: number
  price: number
  shelf_location: string
  quantity_sold: number
}

interface QuickSellScannerProps {
  onSaleComplete?: () => void
}

export function QuickSellScanner({ onSaleComplete }: QuickSellScannerProps) {
  const { user } = useAuth()
  const [barcodeInput, setBarcodeInput] = useState('')
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchInventoryByBarcode = async (searchTerm: string) => {
    if (!searchTerm.trim()) return null

    try {
      // Search by batch number or medicine name
      const { data: inventory, error } = await db
        .from('inventory')
        .select('*')
        .gt('current_stock', 0) // Only items with stock
        .or(`batch_no.ilike.%${searchTerm}%,med_name.ilike.%${searchTerm}%`)
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return inventory
    } catch (error) {
      console.error('Error searching inventory:', error)
      return null
    }
  }

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim() || loading) return

    setLoading(true)
    try {
      const item = await searchInventoryByBarcode(barcodeInput.trim())
      
      if (!item) {
        toast.error('Item not found', {
          description: 'No inventory found for this barcode/name'
        })
        return
      }

      // Check if item already in sale list
      const existingItemIndex = saleItems.findIndex(saleItem => saleItem.id === item.id)
      
      if (existingItemIndex >= 0) {
        // Increase quantity if stock allows
        const existingItem = saleItems[existingItemIndex]
        const availableStock = item.current_stock ?? 0
        if (existingItem.quantity_sold < availableStock) {
          const updatedItems = [...saleItems]
          updatedItems[existingItemIndex].quantity_sold += 1
          setSaleItems(updatedItems)
          toast.success(`Increased quantity: ${item.med_name}`)
        } else {
          toast.error('Insufficient stock', {
            description: `Only ${availableStock} units available`
          })
        }
      } else {
        // Add new item to sale
        const saleItem: SaleItem = {
          id: item.id,
          med_name: item.med_name ?? 'Unknown',
          batch_no: item.batch_no ?? 'N/A',
          current_stock: item.current_stock ?? 0,
          price: item.price ?? 0,
          shelf_location: item.shelf_location ?? 'N/A',
          quantity_sold: 1
        }
        setSaleItems(prev => [...prev, saleItem])
        toast.success(`Added to sale: ${item.med_name}`)
      }

      setBarcodeInput('')
      inputRef.current?.focus()

    } catch (error) {
      console.error('Error processing barcode:', error)
      toast.error('Error processing barcode')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const item = saleItems.find(item => item.id === itemId)
    if (!item) return

    const availableStock = item.current_stock ?? 0

    if (newQuantity <= 0) {
      setSaleItems(prev => prev.filter(item => item.id !== itemId))
      return
    }

    if (newQuantity > availableStock) {
      toast.error('Insufficient stock', {
        description: `Only ${availableStock} units available`
      })
      return
    }

    setSaleItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity_sold: newQuantity }
          : item
      )
    )
  }

  const removeItem = (itemId: string) => {
    setSaleItems(prev => prev.filter(item => item.id !== itemId))
  }

  const processSale = async () => {
    if (saleItems.length === 0) {
      toast.error('No items to sell')
      return
    }

    if (!user) {
      toast.error('User not authenticated')
      return
    }

    setProcessing(true)
    try {
      // Process each sale item
      for (const item of saleItems) {
        const newStock = (item.current_stock ?? 0) - item.quantity_sold

        // Update inventory stock
        const { error: inventoryError } = await db
          .from('inventory')
          .update({ current_stock: newStock })
          .eq('id', item.id)

        if (inventoryError) throw inventoryError

        // Create sales transaction record (if table exists)
        try {
          const { error: salesError } = await db
            .from('sales_transactions')
            .insert({
              pharmacy_id: user.pharmacy_id || 'demo-pharmacy',
              inventory_id: item.id,
              quantity_sold: item.quantity_sold,
              unit_price: item.price,
              total_amount: item.price * item.quantity_sold,
              sold_by: user.id,
              transaction_type: 'QUICK_SELL'
            })

          // Don't throw error if sales_transactions table doesn't exist
          if (salesError && !salesError.message.includes('relation "sales_transactions" does not exist')) {
            console.warn('Sales transaction logging failed:', salesError)
          }
        } catch (salesError) {
          console.warn('Sales transaction logging failed:', salesError)
        }
      }

      const totalAmount = saleItems.reduce((sum, item) => sum + (item.price * item.quantity_sold), 0)
      const totalItems = saleItems.reduce((sum, item) => sum + item.quantity_sold, 0)

      toast.success('Sale completed successfully!', {
        description: `${totalItems} items sold for ₹${totalAmount.toFixed(2)}`
      })

      // Clear sale items
      setSaleItems([])
      
      // Trigger refresh in parent component
      onSaleComplete?.()

    } catch (error) {
      console.error('Error processing sale:', error)
      toast.error('Failed to process sale')
    } finally {
      setProcessing(false)
    }
  }

  const totalAmount = saleItems.reduce((sum, item) => sum + (item.price * item.quantity_sold), 0)
  const totalItems = saleItems.reduce((sum, item) => sum + item.quantity_sold, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Quick Sell POS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barcode Scanner Input */}
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Scan barcode or enter medicine name..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading || !barcodeInput.trim()}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Add'
            )}
          </Button>
        </form>

        {/* Sale Items List */}
        {saleItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Sale Items</h4>
              <Badge variant="secondary">
                {totalItems} items • ₹{totalAmount.toFixed(2)}
              </Badge>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {saleItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.med_name}</div>
                    <div className="text-sm text-gray-600">
                      Batch: {item.batch_no} • Stock: {item.current_stock} • ₹{item.price}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity_sold - 1)}
                      disabled={processing}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity_sold}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity_sold + 1)}
                      disabled={processing}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem(item.id)}
                      disabled={processing}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Process Sale Button */}
            <Button
              onClick={processSale}
              disabled={processing || saleItems.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Sale...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Complete Sale (₹{totalAmount.toFixed(2)})
                </div>
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {saleItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Scan items to start a sale</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}