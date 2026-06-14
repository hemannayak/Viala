'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delayMs?: number
  once?: boolean
}

export function ScrollReveal({ children, className, delayMs = 0, once = true }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [once])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 will-change-transform',
        visible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-4 blur-[1px]',
        className
      )}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}
