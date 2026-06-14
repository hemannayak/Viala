'use client'

import { AuthProvider } from '@/components/providers/auth-provider'
import { AlertsProvider } from '@/components/providers/alerts-provider'
import { ForecastingProvider } from '@/components/providers/forecasting-provider'
import { ScenarioProvider } from '@/components/providers/scenario-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <AuthProvider>
        <AlertsProvider>
          <ForecastingProvider>
            <ScenarioProvider>{children}</ScenarioProvider>
          </ForecastingProvider>
        </AlertsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
