'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface IntegrationsSectionProps {
  integrations: string[]
}

export function IntegrationsSection({ integrations }: IntegrationsSectionProps) {
  return (
    <section id="integrations" className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Integrations That Make Your Business Flow</h2>
            <p className="text-lg text-muted-foreground">Connect payments, messaging, and analytics to keep operations smooth.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {integrations.map((name, index) => (
            <ScrollReveal key={name} delayMs={index * 35}>
              <Card className="group relative overflow-hidden border-border/60 bg-card/70 hover:bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                </div>
                <div className="pointer-events-none absolute -inset-y-10 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 blur-md transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-[260%]" />
                <CardContent className="p-4 flex items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wide transition-colors duration-300 group-hover:text-foreground">
                    {name}
                  </span>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
