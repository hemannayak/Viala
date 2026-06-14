import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface UsePharmayChatOptions {
  initialMessages?: ChatMessage[]
  onError?: (error: Error) => void
}

export function usePharmacyChat(options: UsePharmayChatOptions = {}) {
  const { initialMessages = [], onError } = options
  const { user } = useAuth()
  
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      abortControllerRef.current = new AbortController()
      const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 30000)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userRole: user?.role || 'pharmacist' // Include user role for proper responses
        }),
        signal: abortControllerRef.current.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content, // Fixed: API returns data.content, not data.data.content
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      let errorMessage = '❌ Sorry, I encountered an error. Please try again.'
      
      if (err.name === 'AbortError') {
        errorMessage = '⏱️ Request timed out. Please try a shorter question.'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = '🌐 Network error. Please check your connection and try again.'
      }
      
      toast.error('Failed to get response from AI assistant')
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])

      if (onError) {
        onError(err)
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [messages, isLoading, onError, user?.role])

  const clearMessages = useCallback(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    cancelRequest
  }
}