/**
 * Get Current User API Route
 * Returns current authenticated user information
 */

import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/with-auth'
import { ApiSecurity } from '@/lib/api-security'

export const GET = withAuth(
  async (req, user) => {
    try {
      // Return user data (without sensitive info)
      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        pharmacy_id: user.pharmacy_id,
        created_at: user.created_at,
        last_login: user.last_login,
        is_active: user.is_active
      }

      return ApiSecurity.createResponse(
        true,
        { user: safeUser },
        undefined,
        'User data retrieved successfully'
      )

    } catch (error) {
      console.error('Get user API error:', error)
      return ApiSecurity.createResponse(
        false,
        null,
        'Internal server error',
        'An unexpected error occurred',
        500
      )
    }
  },
  { requireAuth: true, skipRateLimit: true }
)

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}