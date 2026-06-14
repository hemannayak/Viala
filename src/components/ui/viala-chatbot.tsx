'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { usePharmacyChat } from '@/hooks/use-pharmacy-chat'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  MessageCircle,
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Move,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  Zap,
  Clock,
  Package,
  Heart,
  Loader2
} from 'lucide-react'
import { db, type InventoryItem } from '@/lib/db'
import { formatMessageContent, generateWelcomeMessage } from '@/lib/chat-formatting'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VialaChatbotProps {
  className?: string
}

interface QuickQuery {
  label: string
  query: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  roleRequired?: 'admin' | 'pharmacist' | 'manager'
}

const QUICK_QUERIES: QuickQuery[] = [
  {
    label: 'Red Zone Items',
    query: 'Show me all Red Zone items',
    icon: AlertTriangle,
    description: 'Critical expiry alerts',
    roleRequired: 'pharmacist'
  },
  {
    label: 'Revenue Analysis',
    query: "What's my revenue at risk?",
    icon: TrendingDown,
    description: 'Financial insights',
    roleRequired: 'admin'
  },
  {
    label: 'FEFO Guide',
    query: 'Which batches should I sell first?',
    icon: Zap,
    description: 'Batch prioritization',
    roleRequired: 'pharmacist'
  },
  {
    label: 'Stock Status',
    query: 'Show me low stock items',
    icon: Package,
    description: 'Reorder alerts',
    roleRequired: 'pharmacist'
  }
]

export function VialaChatbot({ className }: VialaChatbotProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoadingInventory, setIsLoadingInventory] = useState(false)
  const hasLoadedInventory = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const DOCK_MARGIN = 24
  const getPanelSize = useCallback(() => {
    return {
      width: isMinimized ? 320 : 384,
      height: isMinimized ? 56 : 500,
    }
  }, [isMinimized])

  const dockToBottomRight = useCallback(() => {
    if (typeof window === 'undefined') return
    const { width, height } = getPanelSize()
    setPosition({
      x: Math.max(DOCK_MARGIN, window.innerWidth - width - DOCK_MARGIN),
      y: Math.max(DOCK_MARGIN, window.innerHeight - height - DOCK_MARGIN),
    })
  }, [getPanelSize])

  const { messages, isLoading, sendMessage } = usePharmacyChat({
    initialMessages: user ? [{
      id: 'welcome',
      role: 'assistant' as const,
      content: `Hi ${user.email.split('@')[0]}! I'm your Viala AI assistant. I can help you with inventory management, expiry tracking, and business insights. What would you like to know?`,
      timestamp: new Date()
    }] : [],
    onError: () => {
      toast.error('Chat Error', {
        description: 'Failed to get response from Viala AI'
      })
    }
  })
  
  const [input, setInput] = useState('')

  // Dragging functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (chatRef.current) {
      const rect = chatRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const { width, height } = getPanelSize()
      const newX = Math.max(
        DOCK_MARGIN,
        Math.min(window.innerWidth - width - DOCK_MARGIN, e.clientX - dragOffset.x)
      )
      const newY = Math.max(
        DOCK_MARGIN,
        Math.min(window.innerHeight - height - DOCK_MARGIN, e.clientY - dragOffset.y)
      )
      setPosition({ x: newX, y: newY })
    }
  }, [isDragging, dragOffset, getPanelSize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const loadInventoryData = useCallback(async () => {
    if (hasLoadedInventory.current) return
    
    setIsLoadingInventory(true)
    try {
      const { data } = await db
        .from('inventory')
        .select('*')
        .order('expiry_date', { ascending: true })

      const normalizedInventory: InventoryItem[] = (data || []).map((item: any) => ({
        ...item,
        med_name: item.med_name ?? 'Unknown',
        category: item.category ?? 'General',
        is_seasonal: item.is_seasonal ?? false,
        created_at: item.created_at ?? new Date().toISOString(),
        manufacturing_date: item.manufacturing_date ?? undefined,
        has_return_policy: item.has_return_policy ?? undefined,
        return_policy_days: item.return_policy_days ?? undefined,
      }))

      setInventory(normalizedInventory)
      hasLoadedInventory.current = true
      
      if (data && data.length > 0) {
        toast.success('Connected', {
          description: `AI ready with ${data.length} items`
        })
      }
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Connection Failed', {
        description: 'Unable to load inventory data'
      })
    } finally {
      setIsLoadingInventory(false)
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }, [input, isLoading, sendMessage])

  const handleQuickQuery = useCallback(async (query: string) => {
    if (isLoading) return
    await sendMessage(query)
  }, [isLoading, sendMessage])

  useEffect(() => {
    if (isOpen && !hasLoadedInventory.current) {
      loadInventoryData()
    }
  }, [isOpen, loadInventoryData])

  useEffect(() => {
    if (!isOpen) return
    dockToBottomRight()
  }, [isOpen, isMinimized, dockToBottomRight])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const availableQueries = useMemo(() => 
    QUICK_QUERIES.filter(query => 
      !query.roleRequired || 
      query.roleRequired === user?.role || 
      user?.role === 'admin'
    ), [user?.role]
  )

  if (!user) return null

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="h-10 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-teal-600 hover:bg-teal-700 group border border-teal-500/20"
          aria-label="Open Viala AI Assistant"
        >
          <MessageCircle className="h-4 w-4 mr-2 text-white" />
          <span className="text-white font-medium">AI Assistant</span>
          <Sparkles className="h-3 w-3 ml-2 text-emerald-300" />
        </Button>
      </div>
    )
  }

  return (
    <div 
      ref={chatRef}
      className="fixed z-50 select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <Card className={cn(
        "shadow-2xl border-border/30 transition-all duration-300 bg-white/98 backdrop-blur-sm",
        isMinimized ? "w-80 h-14" : "w-96 h-[500px]",
        isDragging && "shadow-3xl scale-105"
      )}>
        {/* Draggable Header */}
        <CardHeader 
          className="pb-2 border-b border-border/30 bg-gradient-to-r from-teal-50 to-emerald-50 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Viala AI</span>
                <span className="text-xs text-gray-600">Pharmacy Intelligence</span>
              </div>
              <Move className="h-4 w-4 text-gray-400" />
            </CardTitle>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-7 w-7"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <div className="flex items-center justify-between text-xs mt-1">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Access
              </Badge>
              {isLoadingInventory && (
                <div className="flex items-center space-x-1">
                  <Loader2 className="h-3 w-3 animate-spin text-teal-600" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <CardContent className="p-0 flex-1 flex flex-col h-[380px]">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start space-x-2 max-w-full",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="h-3 w-3 text-teal-600" />
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm leading-relaxed break-words",
                          message.role === 'user'
                            ? "bg-teal-600 text-white max-w-[280px]"
                            : "bg-gray-100 text-gray-900 max-w-[320px]"
                        )}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start space-x-2">
                      <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Loader2 className="h-3 w-3 animate-spin text-teal-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[320px]">
                        <span className="text-sm text-gray-600">
                          Analyzing your pharmacy data...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="p-3 border-t border-border/50 bg-gray-50/50">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Quick Actions:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {availableQueries.map((query) => {
                      const Icon = query.icon
                      return (
                        <Button
                          key={query.label}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickQuery(query.query)}
                          disabled={isLoading}
                          className="h-auto p-2 text-xs justify-start hover:bg-teal-50 border-gray-200"
                        >
                          <Icon className="h-3 w-3 mr-1.5 text-teal-600" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-gray-900">{query.label}</span>
                            <span className="text-xs text-gray-500 truncate">
                              {query.description}
                            </span>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-border/50">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about inventory, expiry dates, revenue..."
                    disabled={isLoading}
                    className="flex-1 text-sm h-9"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !input.trim()}
                    className="h-9 w-9 bg-teal-600 hover:bg-teal-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}