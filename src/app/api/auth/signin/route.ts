/**
 * Secure Sign In API Route
 * Handles user authentication with proper validation and security
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { ApiSecurity } from '@/lib/api-security'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Validation schema for sign in
const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = signInSchema.safeParse(body)
    if (!validation.success) {
      return ApiSecurity.createResponse(
        false,
        null,
        'Validation error',
        validation.error.issues.map(e => e.message).join(', '),
        400
      )
    }

    const { email, password } = validation.data

    // Authenticate user
    const result = await AuthService.signIn(email, password)
    
    if (!result.success) {
      return ApiSecurity.createResponse(
        false,
        null,
        result.error,
        'Authentication failed',
        401
      )
    }

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    // Return user data (without sensitive info)
    const { user } = result
    const safeUser = {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role,
      pharmacy_id: user!.pharmacy_id,
      last_login: user!.last_login
    }

    return ApiSecurity.createResponse(
      true,
      { user: safeUser },
      undefined,
      'Authentication successful'
    )

  } catch (error) {
    console.error('Sign in API error:', error)
    return ApiSecurity.createResponse(
      false,
      null,
      'Internal server error',
      'An unexpected error occurred',
      500
    )
  }
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