'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { ArrowRight, LucideIcon } from 'lucide-react'

interface ModuleItem {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

interface ModulesSectionProps {
  modules: ModuleItem[]
}

export function ModulesSection({ modules }: ModulesSectionProps) {
  return (
    <section id="modules" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Viala Platform</h2>
            <p className="text-lg text-muted-foreground">Core modules that power expiry control, FEFO execution, forecasting, and rescue actions.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, index) => (
            <ScrollReveal key={m.title} delayMs={index * 60}>
              <Card className="group relative overflow-hidden border-border/60 bg-card/70 hover:bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
                </div>
                <div className="pointer-events-none absolute -inset-y-12 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 blur-md transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-[260%]" />
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-primary/15">
                      <m.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button asChild variant="ghost" className="px-0 group/cta">
                      <Link href={m.href} className="inline-flex items-center text-sm font-semibold">
                        Explore More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1 group-hover/cta:-rotate-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
