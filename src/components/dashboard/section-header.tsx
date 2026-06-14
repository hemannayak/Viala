'use client'

import { StatusIndicator } from '@/components/ui/client-pulse'

interface SectionHeaderProps {
  title: string
  color?: 'emerald' | 'primary' | 'accent' | 'red' | 'blue' | 'amber' | 'teal'
}

export function SectionHeader({ title, color = 'primary' }: SectionHeaderProps) {
  return (
    <div className="flex items-center space-x-3">
      <StatusIndicator color={color} />
      <h2 className="text-lg font-semibold text-muted-foreground">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
    </div>
  )
}