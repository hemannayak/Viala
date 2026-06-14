/**
 * Secure Sign Out API Route
 * Handles user logout and token cleanup
 */

import { NextRequest } from 'next/server'
import { ApiSecurity } from '@/lib/api-security'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  return ApiSecurity.secureApiRoute(
    request,
    async (req, user) => {
      try {
        // Clear the auth cookie
        const cookieStore = await cookies()
        cookieStore.delete('auth-token')

        // In a production system, you might also want to:
        // 1. Add the token to a blacklist
        // 2. Log the logout event
        // 3. Clear any session data

        return ApiSecurity.createResponse(
          true,
          null,
          undefined,
          'Successfully signed out'
        )

      } catch (error) {
        console.error('Sign out API error:', error)
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
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}