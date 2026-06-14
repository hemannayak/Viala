'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandProps {
  className?: string
  compact?: boolean
}

export function Brand({ className, compact = false }: BrandProps) {
  return (
    <Link
      href="/dashboard"
      className={cn('flex items-center gap-3 rounded-xl focus-ring', className)}
    >
      <div className="h-9 w-9 shrink-0 flex items-center justify-center">
        <Image src="/logo/viala-icon-logo.png" alt="VIALA Logo" width={36} height={36} className="h-full w-full object-contain" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="text-base font-bold tracking-tight text-foreground truncate">VIALA</div>
          <div className="text-xs text-muted-foreground font-medium truncate">
            Medicine Lifecycle Intelligence
          </div>
        </div>
      )}
    </Link>
  )
}
