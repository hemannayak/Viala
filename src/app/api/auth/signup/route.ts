/**
 * Secure Sign Up API Route
 * Handles user registration with comprehensive validation
 */

import { NextRequest } from 'next/server'
import { AuthService } from '@/lib/auth'
import { ApiSecurity, ValidationSchemas } from '@/lib/api-security'

export async function POST(request: NextRequest) {
  return ApiSecurity.secureApiRoute(
    request,
    async (req) => {
      try {
        const body = await req.json()
        
        // Validate input
        const validation = ApiSecurity.validateInput(ValidationSchemas.signUp, body)
        if (!validation.valid) {
          return validation.response!
        }

        const userData = validation.data!

        // Create user account
        const result = await AuthService.signUp(userData)
        
        if (!result.success) {
          return ApiSecurity.createResponse(
            false,
            null,
            result.error,
            'Registration failed',
            400
          )
        }

        // Return success (user needs to verify email)
        const { user } = result
        const safeUser = {
          id: user!.id,
          email: user!.email,
          name: user!.name,
          role: user!.role,
          pharmacy_id: user!.pharmacy_id
        }

        return ApiSecurity.createResponse(
          true,
          { user: safeUser },
          undefined,
          'Registration successful. Please check your email to verify your account.',
          201
        )

      } catch (error) {
        console.error('Sign up API error:', error)
        return ApiSecurity.createResponse(
          false,
          null,
          'Internal server error',
          'An unexpected error occurred',
          500
        )
      }
    },
    { requireAuth: false, skipRateLimit: false }
  )
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}