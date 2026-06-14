'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { db, InventoryItem, 
  calculateFefoStatus, 
  calculateDaysToExpiry,
  calculateReturnPolicyStatus,
  getExpiryActionLabel
} from '@/lib/db'
import { 
  Package, 
  Calendar, 
  MapPin, 
  Plus,
  Edit3,
  Trash2,
  Settings,
  Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ManualInventoryEntry } from './manual-inventory-entry'
import { SnapStockScanner } from '@/components/ui/snap-stock-scanner'

// Common pharmacy medicines for sample data
const PHARMACY_MEDICINES = [
  'Paracetamol 500mg', 'Ibuprofen 400mg', 'Aspirin 75mg', 'Cetirizine 10mg',
  'Azithromycin 500mg', 'Amoxicillin 500mg', 'Cough Syrup 100ml', 'Paracetamol Syrup 60ml',
  'Insulin Injection 10ml', 'Vitamin B12 Injection 2ml', 'ORS Powder 21g', 'Electrolyte Solution 200ml',
  'Cotton Bandage 5m', 'Surgical Gloves (100pcs)', 'Vitamin D3 1000IU', 'Calcium Tablets 500mg',
  'Metformin 500mg', 'Atorvastatin 20mg', 'Pantoprazole 40mg', 'Domperidone 10mg',
  'Iron Syrup 200ml', 'Multivitamin Syrup 200ml', 'Diclofenac Injection 3ml', 'Glucose Powder 100g',
  'Disposable Syringes (10pcs)', 'Iron Tablets 65mg', 'Multivitamin Capsules', 'Omega-3 Capsules'
]

interface ShelfConfig {
  id: string
  name: string
  row: string
  col: number
}

interface EnhancedShelfHeatmapProps {
  className?: string
  mode?: 'inventory' | 'admin'
  rowStart?: string
  rowCount?: number
  colStart?: number
  colCount?: number
}

export function EnhancedShelfHeatmap({
  className,
  mode = 'admin',
  rowStart = 'A',
  rowCount = 6,
  colStart = 1,
  colCount = 10,
}: EnhancedShelfHeatmapProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [shelves, setShelves] = useState<ShelfConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [selectedShelf, setSelectedShelf] = useState<ShelfConfig | null>(null)
  const [newShelfDialog, setNewShelfDialog] = useState(false)
  const [editShelfDialog, setEditShelfDialog] = useState(false)
  const [manualEntryDialog, setManualEntryDialog] = useState(false)
  const [ocrScannerDialog, setOcrScannerDialog] = useState(false)
  const [selectedShelfForFilling, setSelectedShelfForFilling] = useState<string>('')
  
  // New shelf form
  const [newShelfName, setNewShelfName] = useState('')
  const [newShelfRow, setNewShelfRow] = useState('A')
  const [newShelfCol, setNewShelfCol] = useState(1)

  // Generate default shelf configuration
  const generateDefaultShelves = (): ShelfConfig[] => {
    const defaultShelves: ShelfConfig[] = []

    const rows = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
    rows.forEach((row) => {
      for (let col = 1; col <= 99; col++) {
        const shelfId = `${row}${col}`

        defaultShelves.push({
          id: shelfId,
          name: `Shelf ${shelfId}`,
          row,
          col,
        })
      }
    })
    
    return defaultShelves
  }

  // Fetch inventory and initialize shelves
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error } = await db
        .from('inventory')
        .select('id, med_name, batch_no, manufacturing_date, expiry_date, quantity, shelf_location, price, category, is_seasonal, created_at, has_return_policy, return_policy_days')
        .order('shelf_location', { ascending: true })

      if (error) throw error

      const normalizedInventory: InventoryItem[] = (data || []).map((item: any) => ({
        ...item,
        med_name: item.med_name ?? 'Unknown',
        category: item.category ?? 'General',
        is_seasonal: item.is_seasonal ?? false,
        created_at: item.created_at ?? new Date().toISOString(),
        manufacturing_date: item.manufacturing_date ?? undefined,
        has_return_policy: item.has_return_policy ?? undefined,
        return_policy_days: item.return_policy_days ?? undefined,
      }))

      setInventory(normalizedInventory)
      
      // Initialize default shelves if none exist
      if (shelves.length === 0) {
        setShelves(generateDefaultShelves())
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }, [shelves.length]) // Only depend on shelves.length to prevent infinite loops

  useEffect(() => {
    fetchData()
  }, []) // Empty dependency array to prevent infinite loops

  useEffect(() => {
    if (mode === 'inventory') {
      setEditMode(false)
    }
  }, [mode])

  useEffect(() => {
    const channel = db
      .channel('enhanced-shelf-heatmap-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      db.removeChannel(channel)
    }
  }, [fetchData])

  // Create inventory map by shelf location
  const inventoryMap = inventory.reduce((acc, item) => {
    acc[item.shelf_location] = item
    return acc
  }, {} as Record<string, InventoryItem>)

  // Create shelf map
  const shelfMap = shelves.reduce((acc, shelf) => {
    acc[shelf.id] = shelf
    return acc
  }, {} as Record<string, ShelfConfig>)

  // Get enhanced cell styling with sophisticated FEFO color system
  const getCellStyling = (item: InventoryItem | undefined) => {
    if (!item) {
      return {
        className: 'bg-gray-100 border-2 border-dashed border-gray-300 hover:bg-gray-200',
        pulseClass: '',
        glowClass: '',
        statusText: 'Empty'
      }
    }

    const status = calculateFefoStatus(item.expiry_date)
    const daysToExpiry = calculateDaysToExpiry(item.expiry_date)
    let baseClassName = ''
    let pulseClass = ''
    let statusText = ''
    
    // Sophisticated FEFO color system
    switch (status) {
      case 'EXPIRED':
        baseClassName = 'bg-black border-4 border-gray-800 hover:bg-gray-900 shadow-lg shadow-black/50'
        pulseClass = '' // Remove pulse to prevent hydration issues
        statusText = item.has_return_policy ? 'Return to Mfg' : 'Destroy'
        break
      case 'CRITICAL':
        baseClassName = 'bg-gray-600 border-4 border-gray-800 hover:bg-gray-700 shadow-lg shadow-gray-600/50'
        pulseClass = '' // Remove pulse to prevent hydration issues
        statusText = 'Not for Sale'
        break
      case 'WARNING':
        baseClassName = 'bg-red-400 border-4 border-red-600 hover:bg-red-500 shadow-lg shadow-red-400/50'
        statusText = 'Near Expiry'
        break
      case 'MODERATE':
        baseClassName = 'bg-yellow-400 border-4 border-yellow-600 hover:bg-yellow-500 shadow-md shadow-yellow-400/50'
        statusText = 'Moderate'
        break
      case 'HEALTHY':
        baseClassName = 'bg-green-400 border-4 border-green-600 hover:bg-green-500 shadow-md shadow-green-400/50'
        statusText = 'Healthy'
        break
      case 'FRESH':
        baseClassName = 'bg-emerald-400 border-4 border-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-400/50'
        statusText = 'Fresh'
        break
      default:
        baseClassName = 'bg-gray-100 border-2 border-dashed border-gray-300'
        statusText = 'Unknown'
    }
    
    return {
      className: baseClassName,
      pulseClass,
      glowClass: '',
      statusText
    }
  }

  // Add new shelf
  const handleAddShelf = () => {
    const newShelfId = `${newShelfRow}${newShelfCol}`
    
    if (shelfMap[newShelfId]) {
      toast.error('Shelf already exists at this location')
      return
    }

    const newShelf: ShelfConfig = {
      id: newShelfId,
      name: newShelfName || `Shelf ${newShelfId}`,
      row: newShelfRow,
      col: newShelfCol
    }

    setShelves([...shelves, newShelf])
    setNewShelfDialog(false)
    setNewShelfName('')
    setNewShelfRow('A')
    setNewShelfCol(1)
    toast.success('Shelf added successfully')
  }

  // Edit shelf
  const handleEditShelf = () => {
    if (!selectedShelf) return

    const updatedShelves = shelves.map(shelf => 
      shelf.id === selectedShelf.id 
        ? { ...shelf, name: newShelfName }
        : shelf
    )

    setShelves(updatedShelves)
    setEditShelfDialog(false)
    setSelectedShelf(null)
    setNewShelfName('')
    toast.success('Shelf updated successfully')
  }

  // Delete shelf
  const handleDeleteShelf = (shelfId: string) => {
    const hasInventory = inventoryMap[shelfId]
    
    if (hasInventory) {
      toast.error('Cannot delete shelf with inventory items')
      return
    }

    setShelves(shelves.filter(shelf => shelf.id !== shelfId))
    toast.success('Shelf deleted successfully')
  }

  // Add sample item to shelf with realistic manufacturing dates and return policies
  const handleAddSampleItem = async (shelf: ShelfConfig) => {
    const itemIndex = parseInt(shelf.id) % PHARMACY_MEDICINES.length // Deterministic selection
    const randomItem = PHARMACY_MEDICINES[itemIndex]
    
    // Generate realistic dates with deterministic values to prevent hydration issues
    const baseDate = new Date('2024-06-01')
    const dayOffset = (shelf.col - 1) * 30 // Deterministic offset based on shelf position
    const manufacturingDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000)
    const shelfLifeDays = 365 // Fixed shelf life
    const expiryDate = new Date(manufacturingDate.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000)
    
    // Deterministic return policy based on shelf position
    const hasReturnPolicy = shelf.col % 2 === 0 // Even columns have return policy
    const returnPolicyDays = 60
    
    try {
      const { error } = await db
        .from('inventory')
        .insert({
          med_name: randomItem,
          batch_no: `BATCH${shelf.id}`,
          manufacturing_date: manufacturingDate.toISOString().split('T')[0],
          expiry_date: expiryDate.toISOString().split('T')[0],
          quantity: 50,
          price: 100,
          shelf_location: shelf.id,
          category: 'General',
          is_seasonal: false,
          has_return_policy: hasReturnPolicy,
          return_policy_days: returnPolicyDays
        })

      if (error) throw error

      await fetchData()
      toast.success(`Added ${randomItem} to shelf ${shelf.id}`)
    } catch (error) {
      console.error('Error adding sample item:', error)
      toast.error('Failed to add sample item')
    }
  }

  // Handle manual entry for specific shelf
  const handleManualEntry = (shelfId: string) => {
    setSelectedShelfForFilling(shelfId)
    setManualEntryDialog(true)
  }

  // Handle OCR scanner for specific shelf
  const handleOcrScanner = (shelfId: string) => {
    setSelectedShelfForFilling(shelfId)
    setOcrScannerDialog(true)
  }

  // Handle item added callback with enhanced audit logging
  const handleItemAdded = async () => {
    // Log successful inventory addition
    console.log('📦 Inventory item added successfully via OCR')
    
    // Refresh inventory data
    fetchData()
    
    // Close dialogs and reset state
    setManualEntryDialog(false)
    setOcrScannerDialog(false)
    setSelectedShelfForFilling('')
    
    // Show success feedback
    toast.success('OCR Scan Complete', {
      description: 'Item added to inventory with full audit trail'
    })
  }

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-10 gap-3">
          {Array.from({ length: 60 }).map((_, index) => (
            <Card key={index} className="aspect-square rounded-xl">
              <CardContent className="p-3 h-full flex items-center justify-center">
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('space-y-8', className)}>
        {mode !== 'inventory' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">Pharmacy Shelf Layout</h3>
              <Badge variant="outline" className="text-xs">
                {shelves.length} Shelves Configured
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className={editMode ? 'bg-primary text-primary-foreground' : ''}
              >
                <Settings className="h-4 w-4 mr-2" />
                {editMode ? 'Exit Edit' : 'Manage Shelves'}
              </Button>

              <Dialog open={newShelfDialog} onOpenChange={setNewShelfDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shelf
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Shelf</DialogTitle>
                    <DialogDescription>
                      Configure a new shelf with category and location
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shelf-name">Shelf Name</Label>
                      <Input
                        id="shelf-name"
                        value={newShelfName}
                        onChange={(e) => setNewShelfName(e.target.value)}
                        placeholder="e.g., Medicine Storage A1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shelf-row">Row</Label>
                        <Select value={newShelfRow} onValueChange={setNewShelfRow}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((row) => (
                              <SelectItem key={row} value={row}>
                                {row}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="shelf-col">Column</Label>
                        <Select value={newShelfCol.toString()} onValueChange={(value) => setNewShelfCol(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 99 }, (_, i) => i + 1).map((col) => (
                              <SelectItem key={col} value={col.toString()}>
                                {col}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewShelfDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddShelf}>
                      Add Shelf
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Enhanced Shelf Grid */}
        <div className="overflow-x-auto">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${colCount}, minmax(112px, 1fr))`,
              minWidth: `${Math.max(1120, colCount * 112 + (colCount - 1) * 16)}px`,
            }}
          >
          {Array.from({ length: rowCount }).map((_, rowIndex) =>
            Array.from({ length: colCount }).map((_, colIndex) => {
              const rowCharCode = rowStart.charCodeAt(0) + rowIndex
              const row = String.fromCharCode(rowCharCode)
              const col = colStart + colIndex
              const shelfId = `${row}${col}`
              const shelf = shelfMap[shelfId]
              const item = inventoryMap[shelfId]
              
              if (!shelf) {
                // Empty slot - can add new shelf
                return (
                  <Card key={shelfId} className="h-28 rounded-2xl bg-muted/40 border-2 border-dashed border-border">
                    <CardContent className="p-3 h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground font-mono font-medium mb-2">{shelfId}</div>
                        {editMode && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setNewShelfRow(String.fromCharCode(65 + rowIndex))
                              setNewShelfCol(colIndex + 1)
                              setNewShelfDialog(true)
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              const styling = getCellStyling(item)
              
              return (
                <Tooltip key={shelfId}>
                  <TooltipTrigger asChild>
                    <Card 
                      className={cn(
                        'h-28 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.03] relative',
                        styling.className,
                        styling.pulseClass
                      )}
                    >
                      <CardContent className="p-3 h-full flex flex-col items-center justify-center relative">
                        {/* Edit Mode Controls */}
                        {editMode && (
                          <div className="absolute top-1 right-1 flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 bg-white/80 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedShelf(shelf)
                                setNewShelfName(shelf.name)
                                setEditShelfDialog(true)
                              }}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 bg-white/80 hover:bg-red-100 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteShelf(shelf.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        
                        <div className="text-center space-y-1">
                          <div className="text-xs text-white font-mono font-medium">{shelf.id}</div>
                          <Package className={cn(
                            "h-4 w-4 mx-auto",
                            item && (calculateFefoStatus(item.expiry_date) === 'EXPIRED' || 
                                    calculateFefoStatus(item.expiry_date) === 'CRITICAL') 
                              ? "text-white" : "text-gray-800"
                          )} />
                          
                          {item ? (
                            <>
                              <div className={cn(
                                "text-xs font-semibold truncate max-w-full leading-tight",
                                (calculateFefoStatus(item.expiry_date) === 'EXPIRED' || 
                                 calculateFefoStatus(item.expiry_date) === 'CRITICAL') 
                                  ? "text-white" : "text-gray-800"
                              )}>
                                {(item.med_name ?? 'Unknown').split(' ')[0]}
                              </div>
                              <div className={cn(
                                "text-xs font-medium",
                                (calculateFefoStatus(item.expiry_date) === 'EXPIRED' || 
                                 calculateFefoStatus(item.expiry_date) === 'CRITICAL') 
                                  ? "text-white" : "text-gray-600"
                              )}>
                                {item.quantity} units
                              </div>
                              <div className={cn(
                                "text-xs font-bold",
                                (calculateFefoStatus(item.expiry_date) === 'EXPIRED' || 
                                 calculateFefoStatus(item.expiry_date) === 'CRITICAL') 
                                  ? "text-white" : "text-gray-800"
                              )}>
                                {styling.statusText}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-xs font-medium text-gray-600 truncate">
                                {shelf.name}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                Empty
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">{shelf.name}</p>
                      <p className="text-sm">Location: {shelf.id}</p>
                      {item && (
                        <>
                          <p className="text-sm font-medium">{item.med_name ?? 'Unknown Medicine'}</p>
                          <p className="text-sm">Batch: {item.batch_no ?? 'N/A'}</p>
                          {item.manufacturing_date && (
                            <p className="text-sm">Manufactured: {new Date(item.manufacturing_date).toLocaleDateString()}</p>
                          )}
                          <p className="text-sm">Expires: {new Date(item.expiry_date).toLocaleDateString()}</p>
                          <p className="text-sm">Quantity: {item.quantity} units</p>
                          <p className={cn(
                            "text-sm font-medium",
                            calculateFefoStatus(item.expiry_date) === 'EXPIRED' ? 'text-red-600' :
                            calculateFefoStatus(item.expiry_date) === 'CRITICAL' ? 'text-gray-600' :
                            calculateFefoStatus(item.expiry_date) === 'WARNING' ? 'text-red-600' :
                            calculateFefoStatus(item.expiry_date) === 'MODERATE' ? 'text-yellow-600' :
                            calculateFefoStatus(item.expiry_date) === 'HEALTHY' ? 'text-green-600' :
                            'text-emerald-600'
                          )}>
                            Status: {styling.statusText}
                          </p>
                          {(calculateFefoStatus(item.expiry_date) === 'EXPIRED' || 
                            calculateFefoStatus(item.expiry_date) === 'CRITICAL') && (
                            <div className="border-t pt-2">
                              <p className="text-sm font-medium text-red-600">
                                Action: {getExpiryActionLabel(item.expiry_date, item.has_return_policy ?? false)}
                              </p>
                              {item.has_return_policy && (
                                <p className="text-xs text-gray-600">
                                  Return Policy: {item.return_policy_days} days
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })
          )}
          </div>
        </div>



        {/* Enhanced FEFO Status Legend */}
        <Card className="p-6 rounded-xl shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Medicine Status Color System</h3>
              {mode !== 'inventory' && (
                <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  OCR Integrated
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded bg-black border-4 border-gray-800"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Expired</p>
                  <p className="text-xs text-gray-600">Return/Destroy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded bg-gray-600 border-4 border-gray-800"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Critical</p>
                  <p className="text-xs text-gray-600">≤ 30 days - Not for sale</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded bg-red-400 border-4 border-red-600"></div>
                <div>
                  <p className="text-sm font-semibold text-red-700">Warning</p>
                  <p className="text-xs text-gray-600">31-90 days - Near expiry</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded bg-yellow-400 border-4 border-yellow-600"></div>
                <div>
                  <p className="text-sm font-semibold text-yellow-700">Moderate</p>
                  <p className="text-xs text-gray-600">91-180 days - Good</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded bg-green-400 border-4 border-green-600"></div>
                <div>
                  <p className="text-sm font-semibold text-green-700">Healthy</p>
                  <p className="text-xs text-gray-600">181-365 days - Safe</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded bg-emerald-400 border-4 border-emerald-600"></div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Fresh</p>
                  <p className="text-xs text-gray-600">&gt; 365 days - New stock</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Shelf Dialog */}
        <Dialog open={editShelfDialog} onOpenChange={setEditShelfDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Shelf</DialogTitle>
              <DialogDescription>
                Update shelf name and category
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-shelf-name">Shelf Name</Label>
                <Input
                  id="edit-shelf-name"
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditShelfDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditShelf}>
                Update Shelf
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Inventory Entry Dialog */}
        <ManualInventoryEntry
          open={manualEntryDialog}
          onOpenChange={setManualEntryDialog}
          shelfId={selectedShelfForFilling}
          onItemAdded={handleItemAdded}
        />

        {/* OCR Scanner Dialog */}
        <SnapStockScanner
          open={ocrScannerDialog}
          onOpenChange={setOcrScannerDialog}
          onItemAdded={handleItemAdded}
          preselectedShelf={selectedShelfForFilling}
        />
      </div>
    </TooltipProvider>
  )
}