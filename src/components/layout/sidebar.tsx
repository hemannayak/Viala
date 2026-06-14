'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Brand } from '@/components/layout/brand'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/components/providers/auth-provider'
import {
  LayoutDashboard,
  Package,
  Leaf,
  Users,
  Eye,
  Menu,
  X,
  Brain,
  Database,
  BarChart3,
  TrendingUp,
  Activity,
  CreditCard,
} from 'lucide-react'

const allNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['pharmacist', 'admin'],
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['pharmacist', 'admin'],
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    roles: ['pharmacist', 'admin'],
  },
  {
    name: 'Visual Shelf',
    href: '/shelf-heatmap',
    icon: Eye,
    roles: ['pharmacist', 'admin'],
  },
  {
    name: 'Live Audit',
    href: '/live-audit',
    icon: Activity,
    roles: ['pharmacist', 'admin'],
  },
  {
    name: 'Demand Forecasting',
    href: '/demand-forecasting',
    icon: TrendingUp,
    roles: ['pharmacist', 'admin'], // Core ML feature - available to all
  },
  {
    name: 'Intelligent Pharmacy',
    href: '/intelligent-pharmacy',
    icon: Brain,
    roles: ['pharmacist', 'admin'],
  },
  {
    name: 'AI Analytics',
    href: '/ai-analytics',
    icon: BarChart3,
    roles: ['admin'], // Admin only - Competition feature
  },
  {
    name: 'NGO Rescue Network',
    href: '/ngo-network',
    icon: Users,
    roles: ['admin'], // Admin only
  },
  {
    name: 'Eco Analytics',
    href: '/eco-analytics',
    icon: Leaf,
    roles: ['admin'], // Admin only
  },
]

interface SidebarProps {
  className?: string
  collapsed?: boolean
}

export function Sidebar({ className, collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { role } = useAuth()

  // Filter navigation based on user role
  const navigation = role
    ? allNavigation.filter((item) => item.roles.includes(role))
    : allNavigation

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200',
        collapsed ? 'w-20' : 'w-72',
        className
      )}
    >
      <div className={collapsed ? 'h-16 px-4 flex items-center justify-center border-b border-sidebar-border/60' : 'h-16 px-6 flex items-center border-b border-sidebar-border/60'}>
        <Brand className="text-sidebar-foreground" compact={collapsed} />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className={collapsed ? 'px-3 py-6 space-y-1' : 'px-4 py-6 space-y-1'}>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  collapsed
                    ? 'group flex items-center justify-center px-3 py-3 rounded-xl text-sm font-medium transition-colors'
                    : 'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? '' : 'opacity-90')} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Role Badge */}
      {role && !collapsed && (
        <div className="px-4 pb-6">
          <div className="px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-xs text-muted-foreground font-medium mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-primary capitalize">{role}</p>
          </div>
          <div className="mt-3 px-4 text-[11px] text-muted-foreground">
            Built for fast operations, minimal waste.
          </div>
        </div>
      )}
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { role } = useAuth()

  // Filter navigation based on user role
  const navigation = allNavigation.filter((item) => 
    role && item.roles.includes(role)
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent/50 transition-colors">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
            <Brand />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
              className="hover:bg-accent/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.01] hover:shadow-sm'
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Role Badge */}
          {role && (
            <div className="px-4 pb-6">
              <div className="px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium mb-1">Logged in as</p>
                <p className="text-sm font-semibold text-primary capitalize">{role}</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}