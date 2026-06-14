import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }
  formatContent: (content: string) => React.ReactNode
}

export function MessageBubble({ message, formatContent }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start space-x-3",
        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      )}
    >
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
        message.role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      )}>
        {message.role === 'user' ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      
      <div className={cn(
        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
        message.role === 'user'
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground"
      )}>
        {message.role === 'user' ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="space-y-1">
            {formatContent(message.content)}
          </div>
        )}
      </div>
      
      {message.role === 'user' && (
        <div className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}