'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface HydrationSafeContextType {
  isMounted: boolean
  isReady: boolean
}

const HydrationSafeContext = createContext<HydrationSafeContextType>({
  isMounted: false,
  isReady: false
})

export function useHydrationSafe() {
  return useContext(HydrationSafeContext)
}

interface HydrationSafeProviderProps {
  children: ReactNode
}

export function HydrationSafeProvider({ children }: HydrationSafeProviderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Small delay to ensure all providers are initialized
    const timer = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <HydrationSafeContext.Provider value={{ isMounted, isReady }}>
      {children}
    </HydrationSafeContext.Provider>
  )
}

// Hydration-safe wrapper component
interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const { isMounted } = useHydrationSafe()
  
  if (!isMounted) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}