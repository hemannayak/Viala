'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  stats: Array<{ value: string; label: string }>
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(15, 118, 110, 0.10), transparent 55%), radial-gradient(circle at 80% 30%, rgba(15, 118, 110, 0.06), transparent 60%), radial-gradient(circle at 55% 80%, rgba(15, 118, 110, 0.08), transparent 55%)',
            animation: 'pv-mesh 14s ease-in-out infinite',
          }}
        />

        <div
          className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          style={{ animation: 'pv-float 10s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-muted/60 blur-3xl"
          style={{ animation: 'pv-float-alt 12s ease-in-out infinite' }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              Viala • FEFO-first pharmacy operations
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight">
              Reduce Medicine Expiry
              <span className="text-primary"> Losses</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Viala helps pharmacies track expiries, run FEFO, forecast demand, and rescue near-expiry stock—reducing waste and protecting margins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
              <Link href="/login" className="flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}