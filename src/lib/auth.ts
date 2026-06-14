/**
 * Server-side Authentication Utilities
 * JWT-based — no external database required.
 * Backend/database integration will be added later.
 */

import { NextRequest } from 'next/server'
import * as jwt from 'jsonwebtoken'
import type { AuthUser, JWTPayload, UserRole } from './auth-types'

const jwtSecret = process.env.JWT_SECRET || 'viala_dev_secret_2026'

export type { AuthUser, JWTPayload, UserRole }

// Demo credentials (same as client-side demo auth)
const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 'admin-001',
    email: 'admin@viala.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    pharmacy_id: 'pharm-1',
    created_at: '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
    is_active: true,
  },
  {
    id: 'pharm-001',
    email: 'pharmacist@viala.com',
    password: 'pharm123',
    name: 'Demo Pharmacist',
    role: 'pharmacist',
    pharmacy_id: 'pharm-1',
    created_at: '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
    is_active: true,
  },
]

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  /**
   * Register a new user (demo: not persisted — backend integration coming soon)
   */
  static async signUp(_userData: {
    email: string
    password: string
    name?: string
    role?: string
    pharmacy_id?: string
    [key: string]: unknown
  }): Promise<{
    success: boolean
    user?: AuthUser & { name?: string }
    error?: string
  }> {
    // In the demo mode, registration is not supported yet.
    return {
      success: false,
      error: 'Registration is not yet available. Please use the demo credentials to sign in.',
    }
  }

  static async signIn(email: string, password: string): Promise<{
    success: boolean
    user?: AuthUser
    token?: string
    error?: string
  }> {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' }
    }

    const match = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!match) {
      return { success: false, error: 'Invalid credentials' }
    }

    const { password: _, ...user } = match
    const token = this.generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      pharmacyId: user.pharmacy_id || 'pharm-1',
    })

    return { success: true, user, token }
  }

  /**
   * Verify JWT token and return user
   */
  static async verifyToken(token: string): Promise<{
    valid: boolean
    user?: AuthUser
    error?: string
  }> {
    try {
      const payload = jwt.verify(token, jwtSecret) as JWTPayload
      const user = DEMO_USERS.find((u) => u.id === payload.userId)
      if (!user) return { valid: false, error: 'User not found' }
      const { password: _, ...safeUser } = user
      return { valid: true, user: safeUser }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' }
      }
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' }
      }
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
    } catch {
      return null
    }
  }

  static hasRole(user: AuthUser, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(user.role)
  }

  static canAccessPharmacy(user: AuthUser, pharmacyId: string): boolean {
    return user.pharmacy_id === pharmacyId || user.role === 'admin'
  }

  static generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, jwtSecret, {
      expiresIn: '24h',
      issuer: 'viala',
      audience: 'viala-users',
    })
  }

  private static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    return request.cookies.get('auth-token')?.value || null
  }
}

/** Client-side stub — real implementation is in auth-provider.tsx */
export function useAuth() {
  return {
    user: null,
    loading: true,
    signIn: async (_email: string, _password: string) => {},
    signOut: async () => {},
    hasRole: (_roles: UserRole[]) => false,
  }
}