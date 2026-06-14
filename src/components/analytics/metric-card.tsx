'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  iconColor?: string
  borderColor?: string
  bgColor?: string
  children?: React.ReactNode
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  borderColor = 'border-primary/20',
  bgColor = 'bg-primary/5',
  children
}: MetricCardProps) {
  return (
    <Card className={`${borderColor} ${bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`h-10 w-10 rounded-lg ${bgColor.replace('/5', '/10')} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <p className={`text-lg font-bold ${iconColor}`}>{value}</p>
            <p className={`text-xs font-medium ${iconColor.replace('text-', 'text-').replace('-600', '-700')}`}>
              {subtitle}
            </p>
          </div>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </CardContent>
    </Card>
  )
}