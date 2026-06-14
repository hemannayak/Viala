'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { forecastingEngine, type SeasonalMode } from '@/lib/forecasting'

interface ForecastingContextType {
  seasonalMode: SeasonalMode
  setSeasonalMode: (mode: SeasonalMode) => void
  isActive: boolean
}

const ForecastingContext = createContext<ForecastingContextType | undefined>(undefined)

export function useForecastingMode() {
  const context = useContext(ForecastingContext)
  if (context === undefined) {
    throw new Error('useForecastingMode must be used within a ForecastingProvider')
  }
  return context
}

interface ForecastingProviderProps {
  children: React.ReactNode
}

export function ForecastingProvider({ children }: ForecastingProviderProps) {
  const [seasonalMode, setSeasonalModeState] = useState<SeasonalMode>('normal')

  // Load saved mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('viala-seasonal-mode') as SeasonalMode
      if (savedMode && ['normal', 'monsoon', 'summer', 'winter'].includes(savedMode)) {
        setSeasonalModeState(savedMode)
        forecastingEngine.setSeasonalMode(savedMode)
      }
    }
  }, [])

  const setSeasonalMode = (mode: SeasonalMode) => {
    setSeasonalModeState(mode)
    forecastingEngine.setSeasonalMode(mode)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('viala-seasonal-mode', mode)
    }
  }

  const isActive = seasonalMode !== 'normal'

  const value = {
    seasonalMode,
    setSeasonalMode,
    isActive
  }

  return (
    <ForecastingContext.Provider value={value}>
      {children}
    </ForecastingContext.Provider>
  )
}