/**
 * Rescue Matrix Logic for Viala
 * Categorizes inventory based on days_to_expiry and determines optimal rescue actions
 */

import { differenceInDays } from 'date-fns'

export type RescueAction = 'VENDOR_RETURN' | 'FLASH_SALE' | 'NGO_DONATION' | 'EXPIRED_WASTE'

export interface RescueRecommendation {
  action: RescueAction
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  recoveryPercentage: number
  description: string
  buttonText: string
  buttonColor: string
  co2SavedPerUnit: number // kg CO2 equivalent per unit
}

export interface InventoryWithRescue {
  id: string
  med_name: string
  batch_no: string
  expiry_date: string
  current_stock: number
  price: number
  batch_cost_price?: number
  is_returnable?: boolean
  vendor_name?: string
  return_deadline?: string
  shelf_location: string
  category: string
  daysToExpiry: number
  rescueRecommendation: RescueRecommendation
}

/**
 * Calculate days to expiry from current date
 */
export function calculateDaysToExpiry(expiryDate: string): number {
  const today = new Date()
  const expiry = new Date(expiryDate)
  return differenceInDays(expiry, today)
}

/**
 * Determine rescue action based on days to expiry and returnability
 */
export function determineRescueAction(
  daysToExpiry: number,
  isReturnable: boolean = false,
  hasReturnDeadline: boolean = false
): RescueRecommendation {
  // Vendor Return: If days > 60 and is_returnable is true
  if (daysToExpiry > 60 && isReturnable && hasReturnDeadline) {
    return {
      action: 'VENDOR_RETURN',
      priority: 'LOW',
      recoveryPercentage: 85, // 85% recovery for vendor returns
      description: 'Return to vendor for full credit',
      buttonText: 'Return to Vendor',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      co2SavedPerUnit: 2.5 // Prevents manufacturing waste
    }
  }

  // Flash Sale (30% Discount): If days are between 30 and 60
  if (daysToExpiry >= 30 && daysToExpiry <= 60) {
    return {
      action: 'FLASH_SALE',
      priority: 'MEDIUM',
      recoveryPercentage: 70, // 70% of cost price (30% discount)
      description: 'Offer 30% discount to customers',
      buttonText: 'Flash Sale (30% Off)',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      co2SavedPerUnit: 1.8 // Prevents disposal emissions
    }
  }

  // NGO Donation: If days < 30 (for tax/social benefit)
  if (daysToExpiry >= 0 && daysToExpiry < 30) {
    return {
      action: 'NGO_DONATION',
      priority: 'HIGH',
      recoveryPercentage: 40, // 40% tax benefit for NGO donations
      description: 'Donate to NGO for tax benefit',
      buttonText: 'Donate to NGO',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      co2SavedPerUnit: 3.2 // Maximum environmental benefit
    }
  }

  // Expired Waste: Already expired
  return {
    action: 'EXPIRED_WASTE',
    priority: 'HIGH',
    recoveryPercentage: 0,
    description: 'Expired - Proper disposal required',
    buttonText: 'Mark as Waste',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    co2SavedPerUnit: 0 // No recovery possible
  }
}

/**
 * Calculate financial recovery value
 */
export function calculateRecoveryValue(
  originalValue: number,
  recoveryPercentage: number
): number {
  return (originalValue * recoveryPercentage) / 100
}

/**
 * Calculate CO2 emissions saved
 */
export function calculateCO2Saved(
  quantity: number,
  co2SavedPerUnit: number
): number {
  return quantity * co2SavedPerUnit
}

/**
 * Get at-risk inventory items that need rescue actions
 */
export function getAtRiskInventory(inventory: any[]): InventoryWithRescue[] {
  return inventory
    .map(item => {
      const daysToExpiry = calculateDaysToExpiry(item.expiry_date)
      const rescueRecommendation = determineRescueAction(
        daysToExpiry,
        item.is_returnable,
        !!item.return_deadline
      )

      return {
        ...item,
        daysToExpiry,
        rescueRecommendation
      }
    })
    .filter(item => 
      // Only show items that need rescue action (less than 90 days or expired)
      item.daysToExpiry <= 90
    )
    .sort((a, b) => {
      // Sort by priority (HIGH first) then by days to expiry (ascending)
      const priorityOrder: Record<'HIGH' | 'MEDIUM' | 'LOW', number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      const aPriority = (a.rescueRecommendation.priority ?? 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW'
      const bPriority = (b.rescueRecommendation.priority ?? 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW'
      const priorityDiff = priorityOrder[aPriority] - priorityOrder[bPriority]
      if (priorityDiff !== 0) return priorityDiff
      return a.daysToExpiry - b.daysToExpiry
    })
}

/**
 * Process rescue action and create waste log entry
 */
export interface ProcessRescueActionParams {
  inventoryId: string
  action: RescueAction
  quantity: number
  originalValue: number
  recoveryPercentage: number
  co2Saved: number
  userId: string
  pharmacyId: string
  notes?: string
}

export function createWasteLogEntry(params: ProcessRescueActionParams) {
  const recoveredValue = calculateRecoveryValue(params.originalValue, params.recoveryPercentage)
  
  return {
    pharmacy_id: params.pharmacyId,
    inventory_id: params.inventoryId,
    action_type: params.action,
    original_quantity: params.quantity,
    processed_quantity: params.quantity,
    original_value: params.originalValue,
    recovered_value: recoveredValue,
    recovery_percentage: params.recoveryPercentage,
    co2_emissions_saved: params.co2Saved,
    processed_by: params.userId,
    notes: params.notes || null
  }
}