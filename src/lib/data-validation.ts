/**
 * Comprehensive Data Validation System
 * Server-side validation for all data inputs and business logic
 */

import { z } from 'zod'

/**
 * Base validation utilities
 */
export class DataValidator {
  
  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate date format and future dates
   */
  static isValidFutureDate(dateString: string): boolean {
    try {
      const date = new Date(dateString)
      const now = new Date()
      return date > now && !isNaN(date.getTime())
    } catch {
      return false
    }
  }

  /**
   * Validate medicine batch number format
   */
  static isValidBatchNumber(batchNo: string): boolean {
    // Batch numbers should be alphanumeric, 3-20 characters
    const batchRegex = /^[A-Z0-9]{3,20}$/i
    return batchRegex.test(batchNo)
  }

  /**
   * Validate shelf location format
   */
  static isValidShelfLocation(location: string): boolean {
    // Format: Letter + Number (e.g., A1, B2, C10)
    const shelfRegex = /^[A-Z]\d{1,2}$/i
    return shelfRegex.test(location)
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  /**
   * Validate price range
   */
  static isValidPrice(price: number): boolean {
    return price > 0 && price <= 100000 && Number.isFinite(price)
  }

  /**
   * Validate quantity range
   */
  static isValidQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity >= 0 && quantity <= 100000
  }
}

/**
 * Medicine and Inventory Validation Schemas
 */
export const InventorySchemas = {
  
  // Complete inventory item validation
  inventoryItem: z.object({
    id: z.string().uuid('Invalid inventory ID').optional(),
    med_name: z.string()
      .min(2, 'Medicine name must be at least 2 characters')
      .max(200, 'Medicine name too long')
      .refine(val => DataValidator.sanitizeString(val).length > 0, 'Medicine name cannot be empty'),
    
    batch_no: z.string()
      .min(3, 'Batch number must be at least 3 characters')
      .max(20, 'Batch number too long')
      .refine(val => DataValidator.isValidBatchNumber(val), 'Invalid batch number format'),
    
    expiry_date: z.string()
      .refine(val => {
        // Accept either full ISO datetime or YYYY-MM-DD date strings
        const d = new Date(val)
        if (!isNaN(d.getTime())) return true
        return /^\d{4}-\d{2}-\d{2}$/.test(val)
      }, 'Invalid date format')
      .refine(val => DataValidator.isValidFutureDate(val), 'Expiry date must be in the future'),

    manufacturing_date: z.string().optional(),
    
    quantity: z.number()
      .int('Quantity must be an integer')
      .min(0, 'Quantity cannot be negative')
      .max(100000, 'Quantity too large')
      .refine(val => DataValidator.isValidQuantity(val), 'Invalid quantity'),
    
    price: z.number()
      .positive('Price must be positive')
      .max(100000, 'Price too high')
      .refine(val => DataValidator.isValidPrice(val), 'Invalid price'),
    
    shelf_location: z.string()
      .min(2, 'Shelf location required')
      .max(10, 'Shelf location too long')
      .refine(val => DataValidator.isValidShelfLocation(val), 'Invalid shelf location format'),
    
    category: z.enum([
      'Analgesic', 'Antibiotic', 'Antacid', 'Vitamin', 'Cough/Cold', 
      'Diabetes', 'Cardiac', 'Hydration', 'Antiseptic', 'Other'
    ]),
    
    is_seasonal: z.boolean().default(false),

    has_return_policy: z.boolean().optional(),
    return_policy_days: z.number().int().min(1).max(365).nullable().optional(),
    
    pharmacy_id: z.string().uuid('Invalid pharmacy ID'),
    
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional()
  }),

  // Inventory update (partial)
  inventoryUpdate: z.object({
    id: z.string().uuid('Invalid inventory ID'),
    quantity: z.number().int().min(0).max(100000).optional(),
    price: z.number().positive().max(100000).optional(),
    shelf_location: z.string().min(2).max(10).optional(),
    expiry_date: z.string().datetime().optional()
  }).refine(data => {
    // At least one field must be provided for update
    return data.quantity !== undefined || 
           data.price !== undefined || 
           data.shelf_location !== undefined || 
           data.expiry_date !== undefined
  }, 'At least one field must be provided for update'),

  // Batch operations
  batchOperation: z.object({
    batch_ids: z.array(z.string().uuid()).min(1, 'At least one batch ID required'),
    operation: z.enum(['vendor_return', 'fefo_sale', 'ngo_donation', 'disposal']),
    quantity_per_batch: z.record(z.string(), z.number().int().positive()).optional(),
    notes: z.string().max(500).optional()
  })
}

/**
 * User and Authentication Validation Schemas
 */
export const AuthSchemas = {
  
  // User registration
  userRegistration: z.object({
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email too long')
      .refine(val => DataValidator.isValidEmail(val), 'Invalid email format'),
    
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name too long')
      .refine(val => DataValidator.sanitizeString(val).length > 0, 'Name cannot be empty'),
    
    role: z.enum(['pharmacist', 'admin', 'manager']),
    
    pharmacy_id: z.string().uuid('Invalid pharmacy ID'),
    
    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format')
      .optional()
  }),

  // User login
  userLogin: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  }),

  // Password change
  passwordChange: z.object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
  }),

  // Profile update
  profileUpdate: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,15}$/).optional(),
    email: z.string().email().optional()
  })
}

/**
 * Business Operations Validation Schemas
 */
export const BusinessSchemas = {
  
  // Stock request
  stockRequest: z.object({
    medicine_name: z.string()
      .min(2, 'Medicine name required')
      .max(200, 'Medicine name too long'),
    
    current_stock: z.number()
      .int('Current stock must be an integer')
      .min(0, 'Current stock cannot be negative'),
    
    requested_quantity: z.number()
      .int('Requested quantity must be an integer')
      .positive('Requested quantity must be positive')
      .max(10000, 'Requested quantity too large'),
    
    urgency_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    
    justification: z.string()
      .min(10, 'Justification must be at least 10 characters')
      .max(500, 'Justification too long'),
    
    pharmacy_id: z.string().uuid('Invalid pharmacy ID')
  }),

  // NGO donation request
  ngoRequest: z.object({
    ngo_id: z.string().uuid('Invalid NGO ID'),
    inventory_items: z.array(z.object({
      inventory_id: z.string().uuid(),
      quantity: z.number().int().positive()
    })).min(1, 'At least one item required'),
    pickup_date: z.string().datetime('Invalid pickup date'),
    notes: z.string().max(1000).optional()
  }),

  // Vendor return
  vendorReturn: z.object({
    inventory_items: z.array(z.object({
      inventory_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      return_reason: z.enum(['near_expiry', 'damaged', 'overstocked'])
    })).min(1, 'At least one item required'),
    vendor_id: z.string().uuid('Invalid vendor ID').optional(),
    expected_credit_percentage: z.number().min(0).max(100).default(70)
  }),

  // FEFO sale transaction
  fefoSale: z.object({
    items: z.array(z.object({
      inventory_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      unit_price: z.number().positive()
    })).min(1, 'At least one item required'),
    customer_id: z.string().optional(),
    payment_method: z.enum(['cash', 'card', 'upi', 'credit']),
    discount_applied: z.number().min(0).max(100).default(0),
    pharmacy_id: z.string().uuid()
  })
}

/**
 * API Request Validation Schemas
 */
export const ApiSchemas = {
  
  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sort_by: z.string().optional(),
    sort_order: z.enum(['asc', 'desc']).default('asc')
  }),

  // Search and filtering
  inventoryFilter: z.object({
    category: z.string().optional(),
    expiry_status: z.enum(['healthy', 'warning', 'critical', 'expired']).optional(),
    shelf_location: z.string().optional(),
    search_term: z.string().max(100).optional(),
    min_quantity: z.number().int().min(0).optional(),
    max_quantity: z.number().int().min(0).optional(),
    pharmacy_id: z.string().uuid()
  }),

  // Date range queries
  dateRange: z.object({
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    pharmacy_id: z.string().uuid()
  }).refine(data => {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return start < end
  }, 'End date must be after start date')
}

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: string[]
}

/**
 * Main validation function
 */
export function validateData<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

/**
 * Business logic validation
 */
export class BusinessValidator {
  
  /**
   * Validate FEFO compliance
   */
  static validateFEFOCompliance(batches: Array<{ expiry_date: string; quantity: number }>): {
    compliant: boolean
    issues: string[]
  } {
    const issues: string[] = []
    
    // Sort by expiry date
    const sortedBatches = [...batches].sort((a, b) => 
      new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    )
    
    // Check if earliest expiry batch has stock
    if (sortedBatches[0] && sortedBatches[0].quantity === 0) {
      issues.push('Earliest expiry batch is out of stock but later batches have stock')
    }
    
    // Check for expired batches
    const now = new Date()
    const expiredBatches = sortedBatches.filter(batch => 
      new Date(batch.expiry_date) < now
    )
    
    if (expiredBatches.length > 0) {
      issues.push(`${expiredBatches.length} expired batches found`)
    }
    
    return {
      compliant: issues.length === 0,
      issues
    }
  }

  /**
   * Validate stock levels
   */
  static validateStockLevels(
    currentStock: number, 
    minStock: number, 
    maxStock: number
  ): {
    valid: boolean
    warnings: string[]
  } {
    const warnings: string[] = []
    
    if (currentStock < minStock) {
      warnings.push('Stock below minimum threshold')
    }
    
    if (currentStock > maxStock) {
      warnings.push('Stock above maximum threshold')
    }
    
    if (currentStock === 0) {
      warnings.push('Item is out of stock')
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    }
  }

  /**
   * Validate transaction amounts
   */
  static validateTransaction(
    items: Array<{ quantity: number; price: number }>,
    maxTransactionAmount: number = 100000
  ): {
    valid: boolean
    totalAmount: number
    issues: string[]
  } {
    const issues: string[] = []
    
    const totalAmount = items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    )
    
    if (totalAmount > maxTransactionAmount) {
      issues.push(`Transaction amount (₹${totalAmount}) exceeds maximum allowed (₹${maxTransactionAmount})`)
    }
    
    if (totalAmount <= 0) {
      issues.push('Transaction amount must be positive')
    }
    
    // Check for unrealistic prices
    items.forEach((item, index) => {
      if (item.price > 10000) {
        issues.push(`Item ${index + 1} has unusually high price (₹${item.price})`)
      }
    })
    
    return {
      valid: issues.length === 0,
      totalAmount,
      issues
    }
  }
}