// Chatbot Error Handling and Validation
import { type InventoryItem, type AuthUser } from './db'

export class ChatbotError extends Error {
  constructor(
    message: string,
    public code: string,
    public userFriendlyMessage: string
  ) {
    super(message)
    this.name = 'ChatbotError'
  }
}

export class ChatbotValidator {
  static validateInventory(inventory: InventoryItem[]): void {
    if (!Array.isArray(inventory)) {
      throw new ChatbotError(
        'Invalid inventory data type',
        'INVALID_INVENTORY_TYPE',
        'Unable to process inventory data. Please refresh and try again.'
      )
    }

    if (inventory.length === 0) {
      throw new ChatbotError(
        'Empty inventory',
        'EMPTY_INVENTORY',
        'No inventory data available. Please add some medicines to your inventory first.'
      )
    }

    // Validate each item
    inventory.forEach((item, index) => {
      this.validateInventoryItem(item, index)
    })
  }

  static validateInventoryItem(item: InventoryItem, index: number): void {
    if (!item.id || !item.med_name || !item.expiry_date) {
      throw new ChatbotError(
        `Invalid inventory item at index ${index}`,
        'INVALID_INVENTORY_ITEM',
        'Some inventory data is incomplete. Please check your inventory records.'
      )
    }

    // Validate expiry date
    const expiryDate = new Date(item.expiry_date)
    if (isNaN(expiryDate.getTime())) {
      throw new ChatbotError(
        `Invalid expiry date for item ${item.med_name}`,
        'INVALID_EXPIRY_DATE',
        `Invalid expiry date found for ${item.med_name}. Please update the inventory record.`
      )
    }

    // Validate quantity and price
    if (typeof item.quantity !== 'number' || item.quantity < 0) {
      throw new ChatbotError(
        `Invalid quantity for item ${item.med_name}`,
        'INVALID_QUANTITY',
        `Invalid quantity found for ${item.med_name}. Please check the inventory record.`
      )
    }

    if (typeof item.price !== 'number' || item.price < 0) {
      throw new ChatbotError(
        `Invalid price for item ${item.med_name}`,
        'INVALID_PRICE',
        `Invalid price found for ${item.med_name}. Please check the inventory record.`
      )
    }
  }

  static validateUser(user: AuthUser): void {
    if (!user || !user.id || !user.role) {
      throw new ChatbotError(
        'Invalid user data',
        'INVALID_USER',
        'User authentication error. Please log in again.'
      )
    }

    if (!['pharmacist', 'admin'].includes(user.role)) {
      throw new ChatbotError(
        `Invalid user role: ${user.role}`,
        'INVALID_USER_ROLE',
        'Invalid user permissions. Please contact your administrator.'
      )
    }
  }

  static validateQuery(query: string): void {
    if (!query || typeof query !== 'string') {
      throw new ChatbotError(
        'Invalid query',
        'INVALID_QUERY',
        'Please enter a valid question.'
      )
    }

    if (query.trim().length === 0) {
      throw new ChatbotError(
        'Empty query',
        'EMPTY_QUERY',
        'Please enter a question about your inventory.'
      )
    }

    if (query.length > 500) {
      throw new ChatbotError(
        'Query too long',
        'QUERY_TOO_LONG',
        'Please keep your question under 500 characters.'
      )
    }
  }
}

export function handleChatbotError(error: unknown): string {
  if (error instanceof ChatbotError) {
    return `❌ **Error**: ${error.userFriendlyMessage}`
  }

  if (error instanceof Error) {
    console.error('Chatbot error:', error)
    return `❌ **System Error**: Something went wrong while processing your request. Please try again or contact support if the issue persists.`
  }

  console.error('Unknown chatbot error:', error)
  return `❌ **Unknown Error**: An unexpected error occurred. Please refresh the page and try again.`
}