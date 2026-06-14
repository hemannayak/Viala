/**
 * Production Authentication System
 * Replaces demo auth with proper JWT-based authentication
 */

import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import * as jwt from 'jsonwebtoken'
import type { AuthUser, JWTPayload, UserRole } from './auth-types'
import { db as mockDb } from './db'

const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key'

// Production Database client (replaced with mock client)
export const db = mockDb

// Server-side admin client (replaced with mock client)
const dbAdmin = mockDb

// User types
export type { AuthUser, JWTPayload, UserRole }

/**
 * Server-side authentication utilities
 */
export class AuthService {
  
  /**
   * Authenticate user with email and password
   */
  static async signIn(email: string, password: string): Promise<{
    success: boolean
    user?: AuthUser
    token?: string
    error?: string
  }> {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
      }

      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' }
      }

      // Authenticate with Database
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Authentication failed' }
      }

      if (!dbAdmin) {
        // Without a service role key, the profile lookup would be subject to RLS and may fail.
        return { success: false, error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing' }
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await dbAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found' }
      }

      // Update last login
      await dbAdmin
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)

      // Generate JWT token
      const token = this.generateJWT({
        userId: profile.id,
        email: profile.email,
        role: profile.role,
        pharmacyId: profile.pharmacy_id
      })

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name,
        pharmacy_id: profile.pharmacy_id,
        created_at: profile.created_at,
        last_login: new Date().toISOString(),
        is_active: profile.is_active
      }

      return { success: true, user, token }

    } catch (error) {
      console.error('Authentication error:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Create new user account
   */
  static async signUp(userData: {
    email: string
    password: string
    name: string
    role: UserRole
    pharmacy_id: string
  }): Promise<{
    success: boolean
    user?: AuthUser
    error?: string
  }> {
    try {
      // Input validation
      const validation = this.validateSignUpData(userData)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Create auth user
      const { data, error } = await db.auth.signUp({
        email: userData.email,
        password: userData.password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Failed to create user' }
      }

      // Create user profile
      const { data: profile, error: profileError } = await db
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          pharmacy_id: userData.pharmacy_id,
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        return { success: false, error: 'Failed to create user profile' }
      }

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name,
        pharmacy_id: profile.pharmacy_id,
        created_at: profile.created_at,
        last_login: profile.last_login,
        is_active: profile.is_active
      }

      return { success: true, user }

    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Verify JWT token and get user
   */
  static async verifyToken(token: string): Promise<{
    valid: boolean
    user?: AuthUser
    error?: string
  }> {
    try {
      // Verify JWT
      const payload = jwt.verify(token, jwtSecret) as JWTPayload

      // Get fresh user data
      const { data: profile, error } = await db
        .from('user_profiles')
        .select('*')
        .eq('id', payload.userId)
        .eq('is_active', true)
        .single()

      if (error || !profile) {
        return { valid: false, error: 'User not found or inactive' }
      }

      const user: AuthUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name,
        pharmacy_id: profile.pharmacy_id,
        created_at: profile.created_at,
        last_login: profile.last_login,
        is_active: profile.is_active
      }

      return { valid: true, user }

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' }
      }
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' }
      }
      console.error('Token verification error:', error)
      return { valid: false, error: 'Token verification failed' }
    }
  }

  /**
   * Get user from request (server-side)
   */
  static async getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
    try {
      const token = this.extractTokenFromRequest(request)
      if (!token) return null

      const { valid, user } = await this.verifyToken(token)
      return valid ? user! : null

    } catch (error) {
      console.error('Get user from request error:', error)
      return null
    }
  }

  /**
   * Check if user has required role
   */
  static hasRole(user: AuthUser, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(user.role)
  }

  /**
   * Check if user can access pharmacy data
   */
  static canAccessPharmacy(user: AuthUser, pharmacyId: string): boolean {
    return user.pharmacy_id === pharmacyId || user.role === 'admin'
  }

  // Private helper methods
  private static generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(
      payload,
      jwtSecret,
      { 
        expiresIn: '24h',
        issuer: 'viala',
        audience: 'viala-users'
      }
    )
  }

  private static extractTokenFromRequest(request: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    // Try cookie
    const token = request.cookies.get('auth-token')?.value
    return token || null
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static validateSignUpData(data: {
    email: string
    password: string
    name: string
    role: UserRole
    pharmacy_id: string
  }): { valid: boolean; error?: string } {
    if (!data.email || !this.isValidEmail(data.email)) {
      return { valid: false, error: 'Valid email is required' }
    }

    if (!data.password || data.password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' }
    }

    if (!data.name || data.name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' }
    }

    if (!['pharmacist', 'admin', 'manager'].includes(data.role)) {
      return { valid: false, error: 'Invalid role' }
    }

    if (!data.pharmacy_id || data.pharmacy_id.trim().length === 0) {
      return { valid: false, error: 'Pharmacy ID is required' }
    }

    return { valid: true }
  }
}

/**
 * Client-side auth hook
 */
export function useAuth() {
  // This will be implemented in the auth provider
  // For now, return basic structure
  return {
    user: null,
    loading: true,
    signIn: async (email: string, password: string) => {},
    signOut: async () => {},
    hasRole: (roles: UserRole[]) => false
  }
}