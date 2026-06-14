 'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Footer } from './footer'
// import { VialaChatbot } from '@/components/ui/viala-chatbot'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <div
        className={
          sidebarCollapsed
            ? 'hidden md:flex w-20 transition-[width] duration-200 ease-in-out'
            : 'hidden md:flex w-72 transition-[width] duration-200 ease-in-out'
        }
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col transition-[width] duration-200 ease-in-out">
        <div className="sticky top-0 z-40">
          <Header
            title={title}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          />
        </div>

        <main className="flex-1 min-w-0 bg-background">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>

        <Footer />
      </div>
      
      {/* AI Chatbot - Temporarily disabled */}
      {/* <VialaChatbot /> */}
    </div>
  )
}