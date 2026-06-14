'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, dbFS } from '@/lib/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
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

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const role = user?.role || null

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check Firestore user_profiles collection for this user
          const docRef = doc(dbFS, 'user_profiles', firebaseUser.uid)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const profile = docSnap.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: (profile.role as UserRole) || 'pharmacist',
              pharmacy_id: profile.pharmacy_id || 'pharm-1'
            })
          } else {
            // Document doesn't exist, create one
            const email = firebaseUser.email || ''
            // Assign admin role if email matches the admin list, otherwise pharmacist
            const defaultRole: UserRole = (email.endsWith('@viala.ai') || email === 'admin@viala.com') ? 'admin' : 'pharmacist'
            
            const newProfile = {
              id: firebaseUser.uid,
              email: email,
              name: firebaseUser.displayName || email.split('@')[0] || 'User',
              role: defaultRole,
              pharmacy_id: 'pharm-1',
              is_active: true,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            }

            await setDoc(docRef, newProfile)
            
            setUser({
              id: firebaseUser.uid,
              email: email,
              role: defaultRole,
              pharmacy_id: 'pharm-1'
            })
          }
        } catch (error) {
          console.error('Error synchronizing user profile:', error)
        }
      } else {
        setUser(null)
      }
      setUser(user); // Force state trigger if needed, but standard is fine
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return {}
    } catch (error: any) {
      console.error('Firebase signIn error:', error)
      return { error: error.message || 'Invalid login credentials' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      return {}
    } catch (error: any) {
      console.error('Firebase Google Sign-In error:', error)
      return { error: error.message || 'Google Sign-In failed' }
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signIn,
        signOut,
        signInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}