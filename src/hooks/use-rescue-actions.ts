import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { 
  getAtRiskInventory, 
  type InventoryWithRescue,
  createWasteLogEntry,
  calculateCO2Saved
} from '@/lib/rescue-matrix'

interface UseRescueActionsProps {
  userId?: string
  pharmacyId?: string
  onActionComplete?: () => void
}

export function useRescueActions({ userId, pharmacyId, onActionComplete }: UseRescueActionsProps) {
  const [atRiskItems, setAtRiskItems] = useState<InventoryWithRescue[]>([])
  const [loading, setLoading] = useState(true)
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set())

  const loadAtRiskInventory = useCallback(async () => {
    try {
      setLoading(true)
      const { data: inventory, error } = await db
        .from('inventory')
        .select('*')
        .gt('current_stock', 0)
        .order('expiry_date', { ascending: true })

      if (error) throw error

      const atRisk = getAtRiskInventory(inventory || [])
      setAtRiskItems(atRisk)
    } catch (error) {
      console.error('Error loading at-risk inventory:', error)
      toast.error('Failed to load at-risk inventory')
    } finally {
      setLoading(false)
    }
  }, [])

  const executeRescueAction = useCallback(async (item: InventoryWithRescue) => {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const originalValue = (item.batch_cost_price || item.price) * item.current_stock
    const co2Saved = calculateCO2Saved(item.current_stock, item.rescueRecommendation.co2SavedPerUnit)

    const wasteLogData = createWasteLogEntry({
      inventoryId: item.id,
      action: item.rescueRecommendation.action,
      quantity: item.current_stock,
      originalValue,
      recoveryPercentage: item.rescueRecommendation.recoveryPercentage,
      co2Saved,
      userId,
      pharmacyId: pharmacyId || 'demo-pharmacy',
      notes: `${item.rescueRecommendation.description} - Processed via Rescue Action Center`
    })

    // Insert waste log
    const { error: wasteLogError } = await db
      .from('waste_logs')
      .insert(wasteLogData)

    if (wasteLogError) throw wasteLogError

    // Update inventory stock to 0
    const { error: inventoryError } = await db
      .from('inventory')
      .update({ current_stock: 0 })
      .eq('id', item.id)

    if (inventoryError) throw inventoryError

    return { originalValue, co2Saved }
  }, [userId, pharmacyId])

  const processRescueAction = useCallback(async (item: InventoryWithRescue) => {
    if (!userId) {
      toast.error('User not authenticated')
      return
    }

    setProcessingItems(prev => new Set(prev).add(item.id))

    try {
      const { originalValue, co2Saved } = await executeRescueAction(item)
      
      // Update UI state
      setAtRiskItems(prev => prev.filter(i => i.id !== item.id))
      
      // Show success notification
      const recoveredValue = (originalValue * item.rescueRecommendation.recoveryPercentage) / 100
      toast.success(`${item.rescueRecommendation.buttonText} completed!`, {
        description: `Recovered ₹${recoveredValue.toFixed(2)} • Saved ${co2Saved.toFixed(1)} kg CO₂`
      })
      
      // Trigger parent refresh
      onActionComplete?.()

    } catch (error) {
      console.error('Error processing rescue action:', error)
      toast.error('Failed to process rescue action')
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    }
  }, [userId, executeRescueAction, onActionComplete])

  useEffect(() => {
    loadAtRiskInventory()
  }, [loadAtRiskInventory])

  return {
    atRiskItems,
    loading,
    processingItems,
    processRescueAction,
    refetch: loadAtRiskInventory
  }
}