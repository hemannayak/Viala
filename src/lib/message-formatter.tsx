import React from 'react'

export interface MessageFormatterOptions {
  enableCurrency?: boolean
  enableBold?: boolean
  enableLists?: boolean
}

/**
 * Safely formats chat messages with markdown-like syntax
 * Avoids dangerouslySetInnerHTML for security
 */
export function formatChatMessage(
  content: string, 
  options: MessageFormatterOptions = {}
): React.ReactNode[] {
  const { 
    enableCurrency = true, 
    enableBold = true, 
    enableLists = true 
  } = options

  return content
    .split('\n')
    .map((line, index) => {
      // Handle headers (bold text wrapped in **)
      if (enableBold && line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={index} className="font-semibold text-foreground mb-2">
            {line.replace(/\*\*/g, '')}
          </div>
        )
      }
      
      // Handle bullet points
      if (enableLists && (line.startsWith('• ') || line.startsWith('- '))) {
        return (
          <div key={index} className="ml-4 mb-1 text-muted-foreground">
            {formatInlineText(line, { enableCurrency, enableBold })}
          </div>
        )
      }
      
      // Handle numbered lists
      if (enableLists && /^\d+\./.test(line)) {
        return (
          <div key={index} className="ml-4 mb-1 text-muted-foreground">
            {formatInlineText(line, { enableCurrency, enableBold })}
          </div>
        )
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />
      }
      
      // Regular text with inline formatting
      return (
        <div key={index} className="mb-1 text-muted-foreground">
          {formatInlineText(line, { enableCurrency, enableBold })}
        </div>
      )
    })
}

/**
 * Format inline text elements like bold and currency
 */
function formatInlineText(
  text: string, 
  options: Pick<MessageFormatterOptions, 'enableCurrency' | 'enableBold'>
): React.ReactNode[] {
  const { enableCurrency = true, enableBold = true } = options
  
  // Create regex pattern based on enabled options
  const patterns: string[] = []
  if (enableBold) patterns.push('\\*\\*.*?\\*\\*')
  if (enableCurrency) patterns.push('₹\\d+(?:,\\d+)*')
  
  if (patterns.length === 0) {
    return [text]
  }
  
  const regex = new RegExp(`(${patterns.join('|')})`, 'g')
  const parts = text.split(regex)
  
  return parts.map((part, index) => {
    if (enableBold && part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    
    if (enableCurrency && part.match(/₹\d+(?:,\d+)*/)) {
      return <span key={index} className="font-mono text-primary">{part}</span>
    }
    
    return part
  })
}

/**
 * Extract plain text from formatted message (useful for accessibility)
 */
export function extractPlainText(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/₹(\d+(?:,\d+)*)/g, '₹$1') // Keep currency as-is
    .trim()
}

/**
 * Validate message content for safety
 */
export function validateMessageContent(content: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check length
  if (content.length > 10000) {
    errors.push('Message too long (max 10,000 characters)')
  }
  
  // Check for potentially dangerous content
  if (content.includes('<script>') || content.includes('javascript:')) {
    errors.push('Potentially unsafe content detected')
  }
  
  // Check for excessive formatting
  const boldCount = (content.match(/\*\*/g) || []).length
  if (boldCount > 50) {
    errors.push('Excessive formatting detected')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Truncate message content while preserving formatting
 */
export function truncateMessage(content: string, maxLength: number = 500): string {
  if (content.length <= maxLength) {
    return content
  }
  
  // Try to truncate at word boundary
  const truncated = content.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}