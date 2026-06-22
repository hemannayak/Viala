'use client'

import { Heart, Shield, Zap } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { Brand } from '@/components/layout/brand'

export function Footer() {
  const { user } = useAuth()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Brand and mission */}
          <div className="flex items-center space-x-3">
            <Brand />
          </div>

          {/* Center - Key features */}
          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-primary" />
              <span>FEFO Protected</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3 text-emerald-500" />
              <span>Real-time Alerts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3 text-red-500" />
              <span>Waste Prevention</span>
            </div>
          </div>

          {/* Right side - Contact and company info */}
          <div className="flex flex-col items-center md:items-end space-y-1">
            {user && (
              <div className="text-xs text-muted-foreground">
                Logged in as <span className="font-medium text-foreground capitalize">{user.role}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              © {currentYear} Viala Technologies Pvt. Ltd.
            </div>
            <div className="text-xs text-muted-foreground">
              viala.health@gmail.com | +91-40-1234-5678 | Hyderabad, India
            </div>
          </div>
        </div>

        {/* Bottom section - Demo notice */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <span className="text-xs font-medium text-amber-700">
                Demo Environment - Sample data for demonstration purposes
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}