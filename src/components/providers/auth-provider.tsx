'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type AuthUser, type UserRole } from '@/lib/db'

interface AuthContextType {
  user: AuthUser | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Demo users — backend integration comes later
const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 'admin-001',
    email: 'admin@viala.com',
    password: 'admin123',
    role: 'admin',
    pharmacy_id: 'pharm-1',
  },
  {
    id: 'pharm-001',
    email: 'pharmacist@viala.com',
    password: 'pharm123',
    role: 'pharmacist',
    pharmacy_id: 'pharm-1',
  },
]

const SESSION_KEY = 'viala_session_user'

function loadStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const role = user?.role || null

  useEffect(() => {
    // Restore session from localStorage on mount
    const stored = loadStoredUser()
    setUser(stored)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const match = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!match) {
      return { error: 'Invalid email or password. Try admin@viala.com / admin123' }
    }

    const { password: _, ...userWithoutPassword } = match
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword))
    setUser(userWithoutPassword)
    return {}
  }

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    // Demo mode: Google Sign-In is not available yet
    return { error: 'Google Sign-In will be available after backend integration. Use admin@viala.com / admin123 for now.' }
  }

  const signOut = async () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}