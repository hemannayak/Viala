'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { TrendingUp, Eye, Search, Camera } from 'lucide-react'
import { useCallback, useMemo } from 'react'

interface QuickAction {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'outline'
  description?: string
  role?: 'pharmacist' | 'admin' | 'both'
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: 'demand-forecasting',
    label: 'AI Demand Forecasting',
    href: '/demand-forecasting',
    icon: TrendingUp,
    variant: 'default',
    description: 'Predict future demand patterns',
    role: 'both'
  },
  {
    id: 'shelf-heatmap',
    label: 'View Visual Shelf',
    href: '/shelf-heatmap',
    icon: Eye,
    variant: 'outline',
    description: 'Interactive shelf heatmap',
    role: 'both'
  },
  {
    id: 'inventory-audit',
    label: 'Run Inventory Audit',
    href: '/inventory',
    icon: Search,
    variant: 'outline',
    description: 'Comprehensive inventory check',
    role: 'both'
  },
  {
    id: 'medicine-scan',
    label: 'Scan Medicine (Snap-Stock)',
    href: '/inventory?mode=scan',
    icon: Camera,
    variant: 'outline',
    description: 'OCR-powered medicine scanning',
    role: 'both'
  }
] as const

interface QuickActionsProps {
  userRole?: 'pharmacist' | 'admin'
}

export function QuickActions({ userRole = 'pharmacist' }: QuickActionsProps) {
  const router = useRouter()

  const handleNavigation = useCallback((href: string) => {
    router.push(href)
  }, [router])

  const filteredActions = useMemo(() => 
    QUICK_ACTIONS.filter(action => 
      action.role === 'both' || action.role === userRole
    ), [userRole]
  )

  return (
    <Card className="shadow-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          {filteredActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant={action.variant}
                size="lg"
                className="flex items-center space-x-3 px-6 py-3 font-semibold hover:scale-105 transition-transform duration-200 ease-in-out"
                onClick={() => handleNavigation(action.href)}
                title={action.description}
                aria-label={`${action.label}: ${action.description}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{action.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}