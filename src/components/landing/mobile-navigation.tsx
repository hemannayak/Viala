'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface NavigationItem {
  href: string
  label: string
}

interface MobileNavigationProps {
  navigationItems: NavigationItem[]
}

export function MobileNavigation({ navigationItems }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <div className="fixed right-0 top-0 h-full w-64 bg-card border-l border-border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={closeSidebar} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-4">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={closeSidebar}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/login" onClick={closeSidebar}>Sign In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/login" onClick={closeSidebar}>Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}