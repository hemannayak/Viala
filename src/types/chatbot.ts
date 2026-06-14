/**
 * Centralized Chatbot Types
 * Prevents circular dependencies and ensures type consistency
 */

import type { InventoryItem, AuthUser } from '@/lib/db'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatbotContext {
  inventory: InventoryItem[]
  user: AuthUser
  currentDate: Date
}

export interface InventoryContext {
  currentStock?: number
  lowStockItems?: string[]
  expiringItems?: string[]
  pharmacyId?: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  inventoryContext?: InventoryContext
}

export interface ChatResponse {
  role: 'assistant'
  content: string
}

// Organized by functional categories for better maintainability
export type QueryType = 
  // Inventory Analysis
  | 'RED_ZONE_ANALYSIS'
  | 'EXPIRY_REPORT' 
  | 'LOW_STOCK_ANALYSIS'
  | 'INVENTORY_HEALTH'
  | 'SPECIFIC_MEDICINE'
  | 'STOCK_QUERY'
  
  // Operational Recommendations  
  | 'FEFO_RECOMMENDATIONS'
  | 'REORDER_SUGGESTIONS'
  | 'DONATION_ANALYSIS'
  | 'DEMAND_ANALYSIS'
  
  // Business Intelligence (Admin only)
  | 'FINANCIAL_ANALYSIS'
  
  // General
  | 'GENERAL_QUERY'
  | 'GENERAL_HELP'
  | 'RESTRICTED'

// RBAC-compliant query categorization
export const QueryCategories = {
  INVENTORY: ['RED_ZONE_ANALYSIS', 'EXPIRY_REPORT', 'LOW_STOCK_ANALYSIS', 'INVENTORY_HEALTH', 'SPECIFIC_MEDICINE', 'STOCK_QUERY'] as const,
  OPERATIONS: ['FEFO_RECOMMENDATIONS', 'REORDER_SUGGESTIONS', 'DONATION_ANALYSIS', 'DEMAND_ANALYSIS'] as const,
  ADMIN_ONLY: ['FINANCIAL_ANALYSIS'] as const,
  GENERAL: ['GENERAL_QUERY', 'GENERAL_HELP', 'RESTRICTED'] as const
} as const

export type QueryCategory = keyof typeof QueryCategories

export interface ResponseStrategy {
  name: string
  canHandle(queryType: QueryType, context: ChatbotContext): boolean
  generateResponse(query: string, context: ChatbotContext): string
}