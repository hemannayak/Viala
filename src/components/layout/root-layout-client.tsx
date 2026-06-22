'use client'

import { usePathname } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { VialaChatbot } from '@/components/ui/viala-chatbot'
import AppProviders from '@/components/providers/app-providers'

// Pages that don't need the AppLayout wrapper
const STANDALONE_PAGES = [
  '/',
  '/login',
  '/emergency-login',
  '/direct-login',
  '/quick-login',
  '/test-login',
  '/logout',
  '/features',
  '/impact',
  '/how-it-works',
  '/comparison',
  '/pricing',
  '/about',
  '/careers',
  '/outcomes',
  '/get-started'
]

// Route groups that have their own layouts
const ROUTE_GROUPS_WITH_LAYOUT = [
  '/billing',
  '/enhanced-alerts',
  '/patient-notifications',
  '/system-validation'
]

// Get page title from pathname
function getPageTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/inventory': 'Inventory Management',
    '/shelf-heatmap': 'Visual Shelf Heatmap',
    '/demand-forecasting': 'Demand Forecasting',
    '/intelligent-pharmacy': 'Intelligent Pharmacy',
    '/ai-analytics': 'AI Analytics',
    '/data-management': 'Dataset Analytics',
    '/ngo-network': 'NGO Rescue Network',
    '/eco-analytics': 'Eco Analytics',
    '/network': 'Network Management',
    '/edge-cases': 'Edge Cases',
    '/demo': 'Demo Mode',
    '/test-ml': 'ML Testing',
    '/test-simple': 'Simple Testing'
  }
  
  return titleMap[pathname] || 'Viala'
}

interface RootLayoutClientProps {
  children: React.ReactNode
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname()
  const isStandalonePage = STANDALONE_PAGES.includes(pathname) ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/documentation') ||
    pathname.startsWith('/security') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/terms-of-service') ||
    pathname.startsWith('/cookie-policy')
  const hasOwnLayout = ROUTE_GROUPS_WITH_LAYOUT.some(route => pathname.startsWith(route))
  const pageTitle = getPageTitle(pathname)

  return (
    <AppProviders>
      {isStandalonePage || hasOwnLayout ? (
        // Standalone pages or pages with their own layouts render directly
        <>
          {children}
          {pathname !== '/' && pathname !== '/login' && <VialaChatbot />}
        </>
      ) : (
        // App pages use AuthGuard and AppLayout
        <AuthGuard>
          <AppLayout title={pageTitle}>
            {children}
          </AppLayout>
          <VialaChatbot />
        </AuthGuard>
      )}
    </AppProviders>
  )
}