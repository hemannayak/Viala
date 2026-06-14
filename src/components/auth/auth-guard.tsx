'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  // COMPLETELY DISABLED FOR DEMO - Just render children directly
  // This bypasses ALL authentication checks
  return <>{children}</>
}