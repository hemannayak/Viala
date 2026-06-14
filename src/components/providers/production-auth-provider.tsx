/**
 * Production Authentication Provider
 * Replaces demo auth with proper JWT-based authentication
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { AuthUser, UserRole } from '@/lib/auth-types'
import { logger } from '@/lib/error-monitoring'
import { toast } from 'sonner'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  signUp: (userData: {
    email: string
    password: string
    name: string
    role: UserRole
    pharmacy_id: string
    phone?: string
  }) => Promise<{ success: boolean; error?: string }>
  hasRole: (roles: UserRole[]) => boolean
  canAccessPharmacy: (pharmacyId: string) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function ProductionAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      logger.time('auth_initialization')
      
      // Check if user is already authenticated
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          setUser(data.data.user)
          logger.performance('auth_initialization', logger.timeEnd('auth_initialization'), 'ms', {
            success: true,
            userId: data.data.user.id
          })
        }
      }
    } catch (error) {
      logger.error('Auth initialization failed', error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      logger.time('user_signin')
      setLoading(true)

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (data.success && data.data?.user) {
        setUser(data.data.user)
        toast.success('Successfully signed in')
        
        logger.performance('user_signin', logger.timeEnd('user_signin'), 'ms', {
          success: true,
          userId: data.data.user.id,
          userRole: data.data.user.role
        })
        
        return { success: true }
      } else {
        const error = data.error || 'Sign in failed'
        toast.error(error)
        
        logger.warn('Sign in failed', {
          email,
          error,
          responseStatus: response.status
        })
        
        return { success: false, error }
      }
    } catch (error) {
      const errorMessage = 'Network error during sign in'
      toast.error(errorMessage)
      
      logger.error('Sign in network error', error instanceof Error ? error : new Error(String(error)), {
        email
      })
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: {
    email: string
    password: string
    name: string
    role: UserRole
    pharmacy_id: string
    phone?: string
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      logger.time('user_signup')
      setLoading(true)

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Account created successfully! Please check your email to verify your account.')
        
        logger.performance('user_signup', logger.timeEnd('user_signup'), 'ms', {
          success: true,
          email: userData.email,
          role: userData.role
        })
        
        return { success: true }
      } else {
        const error = data.error || 'Sign up failed'
        toast.error(error)
        
        logger.warn('Sign up failed', {
          email: userData.email,
          error,
          responseStatus: response.status
        })
        
        return { success: false, error }
      }
    } catch (error) {
      const errorMessage = 'Network error during sign up'
      toast.error(errorMessage)
      
      logger.error('Sign up network error', error instanceof Error ? error : new Error(String(error)), {
        email: userData.email
      })
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      logger.time('user_signout')
      setLoading(true)

      const currentUser = user
      
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      setUser(null)
      toast.success('Successfully signed out')
      
      logger.performance('user_signout', logger.timeEnd('user_signout'), 'ms', {
        success: true,
        userId: currentUser?.id
      })

      // Redirect to login page
      window.location.href = '/login'
      
    } catch (error) {
      logger.error('Sign out error', error instanceof Error ? error : new Error(String(error)), {
        userId: user?.id
      })
      
      // Even if the API call fails, clear local state
      setUser(null)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const canAccessPharmacy = (pharmacyId: string): boolean => {
    if (!user) return false
    return user.pharmacy_id === pharmacyId || user.role === 'admin'
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          setUser(data.data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      logger.error('User refresh failed', error instanceof Error ? error : new Error(String(error)))
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    hasRole,
    canAccessPharmacy,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a ProductionAuthProvider')
  }
  return context
}

/**
 * Auth Guard Component for protecting routes
 */
interface AuthGuardProps {
  children: ReactNode
  requiredRoles?: UserRole[]
  fallback?: ReactNode
}

export function AuthGuard({ children, requiredRoles, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Hook for checking permissions
 */
export function usePermissions() {
  const { user, hasRole, canAccessPharmacy } = useAuth()

  return {
    isPharmacist: hasRole(['pharmacist']),
    isAdmin: hasRole(['admin']),
    isManager: hasRole(['manager']),
    canManageInventory: hasRole(['pharmacist', 'admin', 'manager']),
    canViewAnalytics: hasRole(['admin', 'manager']),
    canApproveRequests: hasRole(['admin', 'manager']),
    canAccessPharmacy,
    user
  }
}