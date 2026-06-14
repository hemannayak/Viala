// Optimized Inventory Processing with Memoization
import { type InventoryItem, calculateDaysToExpiry, calculateFefoStatus } from './db'

export interface ProcessedInventoryItem extends InventoryItem {
  daysToExpiry: number
  fefoStatus: string
  isExpired: boolean
  isCritical: boolean
  isWarning: boolean
  isHealthy: boolean
  itemValue: number
}

export interface InventoryMetrics {
  totalItems: number
  totalValue: number
  expiredItems: ProcessedInventoryItem[]
  criticalItems: ProcessedInventoryItem[]
  warningItems: ProcessedInventoryItem[]
  healthyItems: ProcessedInventoryItem[]
  lowStockItems: ProcessedInventoryItem[]
  redZoneItems: ProcessedInventoryItem[]
}

export class InventoryProcessor {
  private cache = new Map<string, ProcessedInventoryItem>()
  private metricsCache: InventoryMetrics | null = null
  private lastProcessedHash: string = ''

  processInventory(inventory: InventoryItem[]): InventoryMetrics {
    // Create hash of inventory for cache invalidation
    const inventoryHash = this.createInventoryHash(inventory)
    
    if (this.metricsCache && this.lastProcessedHash === inventoryHash) {
      return this.metricsCache
    }

    // Process each item with caching
    const processedItems = inventory.map(item => this.processItem(item))
    
    // Calculate metrics once
    const metrics: InventoryMetrics = {
      totalItems: processedItems.length,
      totalValue: processedItems.reduce((sum, item) => sum + item.itemValue, 0),
      expiredItems: processedItems.filter(item => item.isExpired),
      criticalItems: processedItems.filter(item => item.isCritical),
      warningItems: processedItems.filter(item => item.isWarning),
      healthyItems: processedItems.filter(item => item.isHealthy),
      lowStockItems: processedItems.filter(item => item.quantity <= 20),
      redZoneItems: processedItems.filter(item => item.daysToExpiry <= 15 && item.daysToExpiry > 0)
    }

    // Cache results
    this.metricsCache = metrics
    this.lastProcessedHash = inventoryHash
    
    return metrics
  }

  private processItem(item: InventoryItem): ProcessedInventoryItem {
    const cacheKey = `${item.id}-${item.expiry_date}-${item.quantity}-${item.price}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const daysToExpiry = calculateDaysToExpiry(item.expiry_date)
    const fefoStatus = calculateFefoStatus(item.expiry_date)
    
    const processedItem: ProcessedInventoryItem = {
      ...item,
      daysToExpiry,
      fefoStatus,
      isExpired: daysToExpiry < 0,
      isCritical: daysToExpiry >= 0 && daysToExpiry <= 30,
      isWarning: daysToExpiry > 30 && daysToExpiry <= 90,
      isHealthy: daysToExpiry > 90,
      itemValue: item.price * item.quantity
    }

    this.cache.set(cacheKey, processedItem)
    return processedItem
  }

  private createInventoryHash(inventory: InventoryItem[]): string {
    return inventory
      .map(item => `${item.id}-${item.expiry_date}-${item.quantity}`)
      .join('|')
  }

  clearCache(): void {
    this.cache.clear()
    this.metricsCache = null
    this.lastProcessedHash = ''
  }
}

// Singleton instance for global use
export const inventoryProcessor = new InventoryProcessor()