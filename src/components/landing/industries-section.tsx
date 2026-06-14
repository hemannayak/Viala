'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { LucideIcon } from 'lucide-react'

interface Industry {
  title: string
  description: string
  icon: LucideIcon
}

interface IndustriesSectionProps {
  industries: Industry[]
}

export function IndustriesSection({ industries }: IndustriesSectionProps) {
  return (
    <section id="industries" className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Built for Pharmacy Workflows</h2>
            <p className="text-lg text-muted-foreground">Everything Viala does is focused on expiry control, FEFO execution, and waste reduction.</p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <ScrollReveal key={industry.title} delayMs={index * 50}>
              <Card className="group relative overflow-hidden border-border/60 bg-card/70 hover:bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
                </div>
                <div className="pointer-events-none absolute -inset-y-12 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 blur-md transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-[260%]" />
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/15">
                    <industry.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{industry.title}</h3>
                  <p className="text-sm text-muted-foreground">{industry.description}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
