'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type ScenarioMode = 'normal' | string

interface ScenarioContextType {
  currentScenario: ScenarioMode
  setCurrentScenario: (scenario: ScenarioMode) => void
  isActive: boolean
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined)

export function useScenario() {
  const context = useContext(ScenarioContext)
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider')
  }
  return context
}

interface ScenarioProviderProps {
  children: React.ReactNode
  defaultScenario?: ScenarioMode
}

export function ScenarioProvider({ children, defaultScenario = 'normal' }: ScenarioProviderProps) {
  const [currentScenario, setCurrentScenarioState] = useState<ScenarioMode>(defaultScenario)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem('viala-scenario')
    if (saved && saved.trim()) {
      setCurrentScenarioState(saved)
    }
  }, [])

  const setCurrentScenario = (scenario: ScenarioMode) => {
    setCurrentScenarioState(scenario)
    if (typeof window !== 'undefined') {
      localStorage.setItem('viala-scenario', scenario)
    }
  }

  const value = useMemo(
    () => ({
      currentScenario,
      setCurrentScenario,
      isActive: currentScenario !== 'normal'
    }),
    [currentScenario]
  )

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}
