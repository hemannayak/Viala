'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: ReactNode
  description: string
  icon: LucideIcon
  variant?: 'primary' | 'warning' | 'success' | 'info'
  tooltip?: string
}

const variantStyles = {
  primary: {
    card: 'border-primary/20 bg-primary/5',
    icon: 'bg-primary/10 text-primary',
    value: 'text-primary'
  },
  warning: {
    card: 'border-amber-200 bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-600'
  },
  success: {
    card: 'border-emerald-200 bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    value: 'text-emerald-600'
  },
  info: {
    card: 'border-teal-200 bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
    value: 'text-teal-600'
  }
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = 'primary',
  tooltip 
}: MetricCardProps) {
  const styles = variantStyles[variant]
  
  return (
    <Card 
      className={`card-hover ${styles.card} shadow-lg group`} 
      title={tooltip}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`h-12 w-12 rounded-2xl ${styles.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`text-4xl font-bold ${styles.value} mb-2`}>
          {value}
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          {description}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          Live data will appear here
        </div>
      </CardContent>
    </Card>
  )
}