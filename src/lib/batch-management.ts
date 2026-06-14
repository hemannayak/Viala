// Viala Smart Shelf FEFO Logic & Batch Management
// Handles batch-specific expiry, vendor returns, and FEFO enforcement

import { db, type InventoryItem, calculateDaysToExpiry } from './db'
import { toast } from 'sonner'

export type BatchStatus = 'ACTIVE' | 'RETURNED_TO_VENDOR' | 'EXPIRED' | 'SOLD' | 'DONATED'
export type ReturnReason = 'NEAR_EXPIRY' | 'QUALITY_ISSUE' | 'OVERSTOCKED' | 'DAMAGED'

export interface BatchInfo {
  id: string
  med_name: string
  batch_no: string
  expiry_date: string
  quantity: number
  original_quantity: number
  price: number
  shelf_location: string
  category: string
  is_seasonal: boolean
  status: BatchStatus
  return_reason?: ReturnReason
  return_date?: string
  vendor_name?: string
  created_at: string
  updated_at: string
}

export interface ReturnTransaction {
  id: string
  batch_id: string
  med_name: string
  batch_no: string
  quantity_returned: number
  return_reason: ReturnReason
  return_date: string
  vendor_name: string
  estimated_recovery_value: number
  notes?: string
  processed_by: string
}

export interface SaleTransaction {
  id: string
  med_name: string
  batches_used: {
    batch_id: string
    batch_no: string
    quantity_sold: number
    expiry_date: string
  }[]
  total_quantity: number
  total_value: number
  sale_date: string
  customer_id?: string
  fefo_enforced: boolean
}

// FEFO Logic: Get batches sorted by expiry date (earliest first)
export async function getBatchesByFEFO(medName: string): Promise<BatchInfo[]> {
  const { data, error } = await db
    .from('inventory')
    .select('*')
    .eq('med_name', medName)
    .eq('status', 'ACTIVE')
    .gt('quantity', 0)
    .order('expiry_date', { ascending: true }) // FEFO: First Expiry, First Out

  if (error) {
    console.error('Error fetching FEFO batches:', error)
    return []
  }

  return data?.map((item: any) => ({
    ...item,
    status: 'ACTIVE' as BatchStatus,
    original_quantity: item.quantity,
    updated_at: new Date().toISOString()
  })) || []
}

// Check if item is in "Red Zone" (critical expiry)
export function isInRedZone(expiryDate: string, threshold: number = 15): boolean {
  const daysToExpiry = calculateDaysToExpiry(expiryDate)
  return daysToExpiry <= threshold && daysToExpiry > 0
}

// Calculate return eligibility and recovery value
export function calculateReturnEligibility(item: InventoryItem): {
  eligible: boolean
  reason: ReturnReason | null
  estimatedRecovery: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
} {
  const daysToExpiry = calculateDaysToExpiry(item.expiry_date)
  const totalValue = item.quantity * item.price

  // Red Zone: < 15 days to expiry
  if (daysToExpiry <= 15 && daysToExpiry > 0) {
    return {
      eligible: true,
      reason: 'NEAR_EXPIRY',
      estimatedRecovery: totalValue * 0.7, // 70% recovery for near-expiry returns
      urgency: daysToExpiry <= 7 ? 'CRITICAL' : daysToExpiry <= 10 ? 'HIGH' : 'MEDIUM'
    }
  }

  // Quality issues (manual trigger)
  // Overstocked (high quantity, slow movement)
  if (item.quantity > 200) {
    return {
      eligible: true,
      reason: 'OVERSTOCKED',
      estimatedRecovery: totalValue * 0.5, // 50% recovery for overstocked items
      urgency: 'LOW'
    }
  }

  return {
    eligible: false,
    reason: null,
    estimatedRecovery: 0,
    urgency: 'LOW'
  }
}

// Process vendor return
export async function processVendorReturn(
  itemId: string,
  returnReason: ReturnReason,
  quantityToReturn: number,
  vendorName: string = 'Default Vendor',
  notes?: string
): Promise<{ success: boolean; transaction?: ReturnTransaction; error?: string }> {
  try {
    // Get current item data
    const { data: item, error: fetchError } = await db
      .from('inventory')
      .select('*')
      .eq('id', itemId)
      .single()

    if (fetchError || !item) {
      return { success: false, error: 'Item not found' }
    }

    // Validate return quantity
    if (quantityToReturn > item.quantity) {
      return { success: false, error: 'Return quantity exceeds available stock' }
    }

    // Calculate recovery value
    const estimatedRecovery = quantityToReturn * item.price * 0.7 // 70% recovery rate

    // Update inventory quantity
    const newQuantity = item.quantity - quantityToReturn
    const { error: updateError } = await db
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        status: newQuantity === 0 ? 'RETURNED_TO_VENDOR' : 'ACTIVE'
      })
      .eq('id', itemId)

    if (updateError) {
      return { success: false, error: 'Failed to update inventory' }
    }

    // Create return transaction record
    const returnTransaction: Omit<ReturnTransaction, 'id'> = {
      batch_id: itemId,
      med_name: item.med_name ?? 'Unknown',
      batch_no: item.batch_no,
      quantity_returned: quantityToReturn,
      return_reason: returnReason,
      return_date: new Date().toISOString(),
      vendor_name: vendorName,
      estimated_recovery_value: estimatedRecovery,
      notes,
      processed_by: 'current_user' // In production, get from auth context
    }

    // In a real implementation, you'd store this in a returns table
    // For demo purposes, we'll just log it
    console.log('Return transaction processed:', returnTransaction)

    return {
      success: true,
      transaction: {
        id: `return_${Date.now()}`,
        ...returnTransaction
      }
    }
  } catch (error) {
    console.error('Error processing vendor return:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

// FEFO-enforced sale processing
export async function processFEFOSale(
  medName: string,
  quantityRequested: number
): Promise<{ success: boolean; transaction?: SaleTransaction; error?: string }> {
  try {
    // Get batches sorted by FEFO
    const availableBatches = await getBatchesByFEFO(medName)
    
    if (availableBatches.length === 0) {
      return { success: false, error: 'No stock available for this medicine' }
    }

    // Check total available quantity
    const totalAvailable = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0)
    if (quantityRequested > totalAvailable) {
      return { success: false, error: `Only ${totalAvailable} units available` }
    }

    // Process sale using FEFO logic
    const batchesUsed: SaleTransaction['batches_used'] = []
    let remainingQuantity = quantityRequested
    let totalValue = 0

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break

      const quantityFromThisBatch = Math.min(remainingQuantity, batch.quantity)
      const batchValue = quantityFromThisBatch * batch.price

      // Update batch quantity
      const newQuantity = batch.quantity - quantityFromThisBatch
      await db
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', batch.id)

      // Record batch usage
      batchesUsed.push({
        batch_id: batch.id,
        batch_no: batch.batch_no,
        quantity_sold: quantityFromThisBatch,
        expiry_date: batch.expiry_date
      })

      totalValue += batchValue
      remainingQuantity -= quantityFromThisBatch
    }

    // Create sale transaction
    const saleTransaction: SaleTransaction = {
      id: `sale_${Date.now()}`,
      med_name: medName,
      batches_used: batchesUsed,
      total_quantity: quantityRequested,
      total_value: totalValue,
      sale_date: new Date().toISOString(),
      fefo_enforced: true
    }

    console.log('FEFO sale processed:', saleTransaction)

    return { success: true, transaction: saleTransaction }
  } catch (error) {
    console.error('Error processing FEFO sale:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

// Get return recommendations for all inventory
export async function getReturnRecommendations(): Promise<{
  item: InventoryItem
  eligibility: ReturnType<typeof calculateReturnEligibility>
}[]> {
  const { data: inventory, error } = await db
    .from('inventory')
    .select('*')
    .gt('quantity', 0)

  if (error || !inventory) {
    console.error('Error fetching inventory for return recommendations:', error)
    return []
  }

  return inventory
    .map((item: any) => ({
      item,
      eligibility: calculateReturnEligibility(item)
    }))
    .filter(({ eligibility }: any) => eligibility.eligible)
    .sort((a: any, b: any) => {
      // Sort by urgency (CRITICAL first) then by estimated recovery value
      const urgencyOrder: any = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      const urgencyDiff = urgencyOrder[b.eligibility.urgency] - urgencyOrder[a.eligibility.urgency]
      if (urgencyDiff !== 0) return urgencyDiff
      return b.eligibility.estimatedRecovery - a.eligibility.estimatedRecovery
    })
}

// Utility functions for UI
export function getReturnUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200'
    case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getReturnReasonLabel(reason: ReturnReason): string {
  switch (reason) {
    case 'NEAR_EXPIRY': return 'Near Expiry'
    case 'QUALITY_ISSUE': return 'Quality Issue'
    case 'OVERSTOCKED': return 'Overstocked'
    case 'DAMAGED': return 'Damaged'
    default: return 'Unknown'
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Demo functions for testing
export const batchDemos = {
  async simulateReturn(medName: string = 'Paracetamol 500mg') {
    const batches = await getBatchesByFEFO(medName)
    if (batches.length > 0) {
      const batch = batches[0]
      const result = await processVendorReturn(
        batch.id,
        'NEAR_EXPIRY',
        Math.min(batch.quantity, 10),
        'Demo Vendor',
        'Demo return for testing'
      )
      
      if (result.success) {
        toast.success('Vendor Return Processed', {
          description: `${result.transaction?.quantity_returned} units returned to vendor`
        })
      } else {
        toast.error('Return Failed', { description: result.error })
      }
    }
  },

  async simulateFEFOSale(medName: string = 'Paracetamol 500mg', quantity: number = 5) {
    const result = await processFEFOSale(medName, quantity)
    
    if (result.success) {
      toast.success('FEFO Sale Processed', {
        description: `${quantity} units sold using earliest expiry batches`
      })
    } else {
      toast.error('Sale Failed', { description: result.error })
    }
  }
}

// Make demo functions available globally
if (typeof window !== 'undefined') {
  (window as any).batchDemos = batchDemos
  console.log('Batch Management Demo Functions Available:')
  console.log('- batchDemos.simulateReturn()')
  console.log('- batchDemos.simulateFEFOSale()')
}