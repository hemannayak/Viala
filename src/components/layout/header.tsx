'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MobileSidebar } from './sidebar'
import { Brand } from '@/components/layout/brand'
import { SeasonalModeSelector } from '@/components/ui/seasonal-mode-selector'
import { useAuth } from '@/components/providers/auth-provider'
import { useAlerts } from '@/components/providers/alerts-provider'
import { useForecastingMode } from '@/components/providers/forecasting-provider'
import { Bell, ChevronRight, Moon, PanelLeft, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { getAlertSeverityColor, getAlertTypeIcon } from '@/lib/alerts'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function Header({ title, sidebarCollapsed = false, onToggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { alerts, acknowledgeAlert, clearAlert } = useAlerts()
  const { seasonalMode, setSeasonalMode } = useForecastingMode()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const unreadAlerts = alerts.filter((a) => !a.acknowledged)
  const notificationCount = unreadAlerts.length
  const badgeText = notificationCount > 9 ? '9+' : notificationCount.toString()

  return (
    <header className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 border-b border-border/50 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <MobileSidebar />

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden md:inline-flex h-10 w-10 rounded-xl hover:bg-accent/50"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="md:hidden">
          <Brand compact />
        </div>
        <div className="hidden md:block min-w-0">
          <div className="text-sm text-muted-foreground font-medium">{title}</div>
          <div className="text-lg font-semibold text-foreground tracking-tight truncate">Viala Workspace</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Mode Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">Live Demo</span>
        </div>
        
        <SeasonalModeSelector 
          currentMode={seasonalMode}
          onModeChange={setSeasonalMode}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-xl hover:bg-accent/50"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-semibold flex items-center justify-center">
                  {badgeText}
                </span>
              )}
              <span className="sr-only">Open notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-96 p-2 shadow-lg border-border/50" align="end" forceMount sideOffset={8}>
            <DropdownMenuLabel className="font-normal px-2 py-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">Notifications</div>
                <div className="text-xs text-muted-foreground">{notificationCount} active</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />

            {unreadAlerts.length === 0 ? (
              <div className="px-2 py-6 text-sm text-muted-foreground text-center">
                No active alerts.
              </div>
            ) : (
              <div className="max-h-[420px] overflow-auto">
                {unreadAlerts.slice(0, 20).map((a) => (
                  <div key={a.id} className="px-2 py-2">
                    <div className="rounded-lg border border-border/60 bg-card px-3 py-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{getAlertTypeIcon(a.type)}</span>
                            <div className="text-sm font-semibold text-foreground truncate">
                              {a.title}
                            </div>
                            <span className={cn('text-[11px] px-2 py-0.5 rounded-full border', getAlertSeverityColor(a.severity))}>
                              {a.severity}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {(a.medName || 'Unknown medicine')} • {a.shelfLocation || 'Unknown shelf'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {a.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {a.actionRequired}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => acknowledgeAlert(a.id)}
                          >
                            Ack
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => clearAlert(a.id)}
                            title="Clear"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Eco Mode'}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105 focus-ring"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold shadow-sm">
                  {user ? getInitials(user.email) : 'PV'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 p-2 shadow-lg border-border/50" 
            align="end" 
            forceMount
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold leading-none text-foreground">{user?.email}</p>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <p className="text-xs leading-none text-muted-foreground capitalize font-medium">
                    {user?.role} Account
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem 
              onClick={signOut}
              className="p-3 rounded-lg cursor-pointer hover:bg-destructive/5 hover:text-destructive transition-colors focus:bg-destructive/5 focus:text-destructive"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}