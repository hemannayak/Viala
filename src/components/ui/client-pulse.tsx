'use client'

import { useEffect, useState } from 'react'

interface ClientPulseProps {
  className?: string
  children?: React.ReactNode
}

export function ClientPulse({ className = '', children }: ClientPulseProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return static version for SSR
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  // Return animated version for client
  return (
    <div className={`${className} animate-pulse`}>
      {children}
    </div>
  )
}

interface StatusIndicatorProps {
  color?: 'emerald' | 'primary' | 'accent' | 'red' | 'blue' | 'amber' | 'teal'
  size?: 'sm' | 'md'
}

export function StatusIndicator({ color = 'primary', size = 'sm' }: StatusIndicatorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClass = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
  const colorClass = {
    emerald: 'bg-emerald-500',
    primary: 'bg-primary',
    accent: 'bg-accent',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    teal: 'bg-teal-500'
  }[color]

  const baseClass = `${sizeClass} rounded-full ${colorClass}`

  if (!mounted) {
    return <div className={baseClass}></div>
  }

  return <div className={`${baseClass} animate-pulse`}></div>
}