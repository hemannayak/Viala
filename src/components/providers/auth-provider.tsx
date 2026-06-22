'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// ── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer' | 'pharmacist'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name?: string
  pharmacy_id?: string
  organization_id?: string
}

interface AuthContextType {
  user: AuthUser | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error?: string }>
}

// ── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ── Map Supabase User → AuthUser ─────────────────────────────────────────────
function mapUser(supabaseUser: User): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    role: (supabaseUser.user_metadata?.role as UserRole) ?? 'viewer',
    full_name: supabaseUser.user_metadata?.full_name,
    organization_id: supabaseUser.user_metadata?.organization_id,
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const role = user?.role ?? null

  // Restore session on mount and subscribe to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapUser(session.user) : null)
      setLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? mapUser(session.user) : null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Sign In (Email / Password) ──────────────────────────────────────────────
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  // ── Sign In (Google OAuth) ──────────────────────────────────────────────────
  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) return { error: error.message }
    return {}
  }

  // ── Sign Out ────────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

