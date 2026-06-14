/**
 * API Security Middleware and Utilities
 * Handles authentication, authorization, rate limiting, and validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService, AuthUser, UserRole } from './auth'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'

/**
 * Rate limiting configuration
 */
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export class ApiSecurity {
  
  /**
   * Create standardized API response
   */
  static createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    message?: string,
    status: number = 200
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success,
      data,
      error,
      message,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status })
  }

  /**
   * Authentication middleware
   */
  static async authenticate(request: NextRequest): Promise<{
    authenticated: boolean
    user?: AuthUser
    response?: NextResponse
  }> {
    try {
      const user = await AuthService.getUserFromRequest(request)
      
      if (!user) {
        return {
          authenticated: false,
          response: this.createResponse(
            false,
            null,
            'Authentication required',
            'Please provide a valid authentication token',
            401
          )
        }
      }

      if (!user.is_active) {
        return {
          authenticated: false,
          response: this.createResponse(
            false,
            null,
            'Account inactive',
            'Your account has been deactivated',
            403
          )
        }
      }

      return { authenticated: true, user }

    } catch (error) {
      console.error('Authentication middleware error:', error)
      return {
        authenticated: false,
        response: this.createResponse(
          false,
          null,
          'Authentication error',
          'Failed to authenticate request',
          500
        )
      }
    }
  }

  /**
   * Authorization middleware
   */
  static authorize(requiredRoles: UserRole[]) {
    return (user: AuthUser): { authorized: boolean; response?: NextResponse } => {
      if (!AuthService.hasRole(user, requiredRoles)) {
        return {
          authorized: false,
          response: this.createResponse(
            false,
            null,
            'Insufficient permissions',
            `Required roles: ${requiredRoles.join(', ')}`,
            403
          )
        }
      }

      return { authorized: true }
    }
  }

  /**
   * Rate limiting middleware
   */
  static rateLimit(request: NextRequest): { allowed: boolean; response?: NextResponse } {
    const ip = this.getClientIP(request)
    const now = Date.now()
    const windowMs = rateLimitConfig.windowMs
    const maxRequests = rateLimitConfig.max

    // Get or create rate limit entry
    let entry = rateLimitStore.get(ip)
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs
      }
      rateLimitStore.set(ip, entry)
      return { allowed: true }
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        response: this.createResponse(
          false,
          null,
          'Rate limit exceeded',
          rateLimitConfig.message,
          429
        )
      }
    }

    // Increment count
    entry.count++
    rateLimitStore.set(ip, entry)
    
    return { allowed: true }
  }

  /**
   * Input validation middleware
   */
  static validateInput<T>(schema: z.ZodSchema<T>, data: any): {
    valid: boolean
    data?: T
    response?: NextResponse
  } {
    try {
      const validatedData = schema.parse(data)
      return { valid: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ')
        
        return {
          valid: false,
          response: this.createResponse(
            false,
            null,
            'Validation error',
            `Invalid input: ${errorMessages}`,
            400
          )
        }
      }

      return {
        valid: false,
        response: this.createResponse(
          false,
          null,
          'Validation error',
          'Failed to validate input data',
          400
        )
      }
    }
  }

  /**
   * Pharmacy access control
   */
  static checkPharmacyAccess(user: AuthUser, pharmacyId: string): {
    allowed: boolean
    response?: NextResponse
  } {
    if (!AuthService.canAccessPharmacy(user, pharmacyId)) {
      return {
        allowed: false,
        response: this.createResponse(
          false,
          null,
          'Access denied',
          'You do not have access to this pharmacy data',
          403
        )
      }
    }

    return { allowed: true }
  }

  /**
   * CORS headers
   */
  static setCORSHeaders(response: NextResponse): NextResponse {
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return response
  }

  /**
   * Security headers
   */
  static setSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    return response
  }

  /**
   * Complete API middleware wrapper
   */
  static async secureApiRoute(
    request: NextRequest,
    handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse | Response>,
    options: {
      requiredRoles?: UserRole[]
      requireAuth?: boolean
      skipRateLimit?: boolean
    } = {}
  ): Promise<NextResponse | Response> {
    try {
      // Rate limiting
      if (!options.skipRateLimit) {
        const rateLimitResult = this.rateLimit(request)
        if (!rateLimitResult.allowed) {
          return this.setSecurityHeaders(rateLimitResult.response!)
        }
      }

      // Authentication
      let user: AuthUser | undefined
      if (options.requireAuth !== false) {
        const authResult = await this.authenticate(request)
        if (!authResult.authenticated) {
          return this.setSecurityHeaders(authResult.response!)
        }
        user = authResult.user!

        // Authorization
        if (options.requiredRoles && options.requiredRoles.length > 0) {
          const authzResult = this.authorize(options.requiredRoles)(user)
          if (!authzResult.authorized) {
            return this.setSecurityHeaders(authzResult.response!)
          }
        }
      }

      // Call the actual handler
      const response = await handler(request, user!)
      
      // Handle streaming responses (don't modify them)
      if (response instanceof Response && !response.headers.get('content-type')?.includes('application/json')) {
        return response
      }
      
      // Add security headers for regular responses
      if (response instanceof NextResponse) {
        return this.setSecurityHeaders(this.setCORSHeaders(response))
      }
      
      return response

    } catch (error) {
      console.error('API security middleware error:', error)
      const errorResponse = this.createResponse(
        false,
        null,
        'Internal server error',
        'An unexpected error occurred',
        500
      )
      return this.setSecurityHeaders(errorResponse)
    }
  }

  // Private helper methods
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return 'unknown'
  }
}

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // User authentication
  signIn: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  }),

  signUp: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['pharmacist', 'admin', 'manager']),
    pharmacy_id: z.string().min(1, 'Pharmacy ID is required')
  }),

  // Inventory operations
  updateInventory: z.object({
    id: z.string().uuid('Invalid inventory ID'),
    quantity: z.number().int().min(0, 'Quantity must be non-negative'),
    price: z.number().positive('Price must be positive'),
    expiry_date: z.string().datetime('Invalid expiry date format')
  }),

  addInventory: z.object({
    med_name: z.string().min(1, 'Medicine name is required'),
    batch_no: z.string().min(1, 'Batch number is required'),
    expiry_date: z.string().datetime('Invalid expiry date format'),
    quantity: z.number().int().positive('Quantity must be positive'),
    price: z.number().positive('Price must be positive'),
    shelf_location: z.string().min(1, 'Shelf location is required'),
    category: z.string().min(1, 'Category is required'),
    pharmacy_id: z.string().uuid('Invalid pharmacy ID')
  }),

  // Stock requests
  stockRequest: z.object({
    medicine_name: z.string().min(1, 'Medicine name is required'),
    current_stock: z.number().int().min(0, 'Current stock must be non-negative'),
    requested_quantity: z.number().int().positive('Requested quantity must be positive'),
    urgency_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    notes: z.string().optional()
  }),

  // Pharmacy operations
  pharmacyId: z.object({
    pharmacy_id: z.string().uuid('Invalid pharmacy ID')
  })
}

/**
 * API route helper for common patterns
 */
export function createSecureApiRoute(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
  options: {
    requiredRoles?: UserRole[]
    requireAuth?: boolean
    skipRateLimit?: boolean
  } = {}
) {
  return async (request: NextRequest) => {
    return ApiSecurity.secureApiRoute(request, handler, options)
  }
}

/**
 * Simplified secure API route wrapper
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
  options: {
    requiredRoles?: UserRole[]
    requireAuth?: boolean
    skipRateLimit?: boolean
  } = {}
) {
  return (request: NextRequest) => {
    return ApiSecurity.secureApiRoute(request, handler, options)
  }
}