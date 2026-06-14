/**
 * Server-side authentication wrapper for API routes
 * Replaces middleware-based authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService, AuthUser } from '../auth'

export interface AuthOptions {
  requiredRoles?: string[]
  requireAuth?: boolean
  skipRateLimit?: boolean
}

export function withAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse | Response>,
  options: AuthOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    try {
      // Rate limiting (simple in-memory for demo)
      if (!options.skipRateLimit) {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
        // Simple rate limiting logic here if needed
      }

      // Authentication check
      if (options.requireAuth !== false) {
        const user = await AuthService.getUserFromRequest(req)
        
        if (!user) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Authentication required',
              message: 'Please provide a valid authentication token'
            },
            { status: 401 }
          )
        }

        if (!user.is_active) {
          return NextResponse.json(
            {
              success: false,
              error: 'Account inactive', 
              message: 'Your account has been deactivated'
            },
            { status: 403 }
          )
        }

        // Role-based access control
        if (options.requiredRoles && options.requiredRoles.length > 0) {
          if (!options.requiredRoles.includes(user.role)) {
            return NextResponse.json(
              {
                success: false,
                error: 'Insufficient permissions',
                message: `Required roles: ${options.requiredRoles.join(', ')}`
              },
              { status: 403 }
            )
          }
        }

        return handler(req, user)
      }

      // For public routes, pass null user
      return handler(req, null as any)

    } catch (error) {
      console.error('Auth wrapper error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Security headers for all responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY', 
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}