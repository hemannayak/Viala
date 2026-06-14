'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { ChatbotInterface } from './chatbot-interface'
import { useAuth } from '@/components/providers/auth-provider'

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  if (!user) return null

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 group"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform" />
            
            {/* AI Indicator */}
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
            </div>
          </div>
        </Button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-16 right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Ask Viala AI
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}

        {/* New Feature Badge */}
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -left-2 bg-emerald-500 text-white text-xs px-2 py-1 animate-bounce"
        >
          AI
        </Badge>
      </div>

      {/* Chatbot Interface */}
      <ChatbotInterface 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}