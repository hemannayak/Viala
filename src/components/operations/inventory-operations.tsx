'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  AlertTriangle, 
  Package, 
  Clock, 
  RefreshCw,
  Search,
  Bell,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { db } from '@/lib/db'
import { toast } from 'sonner'

interface InventoryOperationsProps {
  className?: string
}

export function InventoryOperations({ className = '' }: InventoryOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleLowStockCheck = async () => {
    setIsProcessing(true)
    try {
      const { data, error } = await db
        .from('inventory')
        .select('*')
        .lt('quantity', 20)
        .order('quantity', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        toast.warning(`${data.length} items are running low on stock`, {
          description: `${data[0].med_name} has only ${data[0].quantity} units left`,
          duration: 5000
        })
      } else {
        toast.success('All items are well stocked', {
          description: 'No low stock alerts at this time'
        })
      }
    } catch (error) {
      toast.error('Failed to check stock levels')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExpiryCheck = async () => {
    setIsProcessing(true)
    try {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const { data, error } = await db
        .from('inventory')
        .select('*')
        .lt('expiry_date', thirtyDaysFromNow.toISOString())
        .order('expiry_date', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        toast.warning(`${data.length} items expiring within 30 days`, {
          description: `${data[0].med_name} expires on ${new Date(data[0].expiry_date).toLocaleDateString()}`,
          duration: 5000
        })
      } else {
        toast.success('No items expiring soon', {
          description: 'All inventory has sufficient shelf life'
        })
      }
    } catch (error) {
      toast.error('Failed to check expiry dates')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInventoryAudit = async () => {
    setIsProcessing(true)
    try {
      const { data, error } = await db
        .from('inventory')
        .select('*')

      if (error) throw error

      const totalItems = data?.length || 0
      const totalValue = data?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
      const lowStock = data?.filter((item: any) => item.quantity < 20).length || 0
      
      toast.success('Inventory audit complete', {
        description: `${totalItems} items, ₹${totalValue.toFixed(0)} total value, ${lowStock} low stock items`,
        duration: 7000
      })
    } catch (error) {
      toast.error('Audit failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSearchInventory = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsProcessing(true)
    try {
      const { data, error } = await db
        .from('inventory')
        .select('*')
        .ilike('med_name', `%${searchTerm}%`)

      if (error) throw error

      if (data && data.length > 0) {
        toast.success(`Found ${data.length} items matching "${searchTerm}"`, {
          description: `First result: ${data[0].med_name} - ${data[0].quantity} units`,
          duration: 5000
        })
      } else {
        toast.info(`No items found matching "${searchTerm}"`, {
          description: 'Try a different search term'
        })
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={`${className} border-blue-200 bg-blue-50/30`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-600" />
          <span>Inventory Operations</span>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Live System
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time inventory monitoring and management tools
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Checks */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Quick Health Checks</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLowStockCheck}
              disabled={isProcessing}
              className="h-auto p-3 flex flex-col items-start space-y-1 hover:bg-orange-50 border-orange-200"
            >
              <div className="flex items-center space-x-2 w-full">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-xs">Check Low Stock</span>
              </div>
              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                Find items with less than 20 units
              </p>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExpiryCheck}
              disabled={isProcessing}
              className="h-auto p-3 flex flex-col items-start space-y-1 hover:bg-amber-50 border-amber-200"
            >
              <div className="flex items-center space-x-2 w-full">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-xs">Check Expiring Items</span>
              </div>
              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                Find items expiring within 30 days
              </p>
            </Button>
          </div>
        </div>

        {/* Search & Audit */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Search & Audit</h4>
          
          {/* Search */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search medicines</Label>
              <Input
                id="search"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchInventory()}
              />
            </div>
            <Button
              onClick={handleSearchInventory}
              disabled={isProcessing}
              size="sm"
              className="px-4"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Audit */}
          <Button
            variant="outline"
            onClick={handleInventoryAudit}
            disabled={isProcessing}
            className="w-full flex items-center space-x-2 hover:bg-primary/5"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Run Full Inventory Audit</span>
          </Button>
        </div>

        {/* Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border/50 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isProcessing ? 'Processing...' : 'System ready'}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Real-time inventory monitoring
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-foreground mb-3">How to Use:</h5>
          <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <li>• Use quick checks to identify potential issues</li>
            <li>• Search for specific medicines by name</li>
            <li>• Run full audit to get comprehensive inventory overview</li>
            <li>• All results appear as notifications with details</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}