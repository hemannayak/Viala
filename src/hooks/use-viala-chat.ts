'use client'

import { useState, useCallback } from 'react'
import { usePharmacyChat, type ChatMessage as PharmacyChatMessage } from './use-pharmacy-chat'

export interface VialaChatOptions {
  welcomeMessage?: string
  userRole?: 'admin' | 'pharmacist' | 'manager'
}

export function useVialaChat(options: VialaChatOptions = {}) {
  const { welcomeMessage, userRole } = options
  
  const initialMessages: PharmacyChatMessage[] = welcomeMessage ? [{
    id: '1',
    role: 'assistant',
    content: welcomeMessage,
    timestamp: new Date()
  }] : []

  const chat = usePharmacyChat({ 
    initialMessages,
    onError: (error) => {
      console.error('Viala Chat Error:', error)
    }
  })

  const sendQuickQuery = useCallback((query: string) => {
    return chat.sendMessage(query)
  }, [chat.sendMessage])

  const getWelcomeMessage = useCallback(() => {
    const roleSpecificContent = userRole === 'admin' 
      ? '\n• **Environmental Impact** - Waste prevention, sustainability metrics'
      : ''

    return `👋 Hello! I'm Viala AI, your pharmacy intelligence assistant.

I can help you with:
• **Inventory Analysis** - Stock levels, expiry tracking, FEFO recommendations
• **Financial Insights** - Revenue at risk, recovery potential${userRole === 'admin' ? ', profit metrics' : ''}
• **Operational Support** - Batch prioritization, vendor returns, rescue actions
• **Demand Forecasting** - Seasonal patterns, reorder recommendations${roleSpecificContent}

Ask me anything about your pharmacy operations!`
  }, [userRole])

  return {
    ...chat,
    sendQuickQuery,
    getWelcomeMessage
  }
}

// Legacy export for backward compatibility
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface UseChatOptions {
  api: string
  body?: any
  onError?: (error: Error) => void
  onResponse?: (response: Response) => void
}

export function useLegacyVialaChat({ api, body, onError, onResponse }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          ...body
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      onResponse?.(response)

      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        if (data.role === 'assistant' && data.content) {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.content
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } else {
        // Handle streaming response
        const reader = response.body?.getReader()
        if (reader) {
          let assistantMessage = ''
          const assistantId = (Date.now() + 1).toString()
          
          setMessages(prev => [...prev, {
            id: assistantId,
            role: 'assistant',
            content: ''
          }])

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = new TextDecoder().decode(value)
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') break
                  
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.choices?.[0]?.delta?.content) {
                      assistantMessage += parsed.choices[0].delta.content
                      setMessages(prev => prev.map(msg => 
                        msg.id === assistantId 
                          ? { ...msg, content: assistantMessage }
                          : msg
                      ))
                    }
                  } catch (parseError) {
                    // Ignore parsing errors for streaming
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      onError?.(error as Error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, isLoading, api, body, onError, onResponse])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages
  }
}