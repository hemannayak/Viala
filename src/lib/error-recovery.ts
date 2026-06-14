/**
 * Centralized Error Recovery System
 * Handles common errors and provides fallback mechanisms
 */

// Type definitions for better type safety
interface ApiError {
  status?: number
  name?: string
  message?: string
}

interface DatabaseResult<T = any> {
  data: T[]
  error?: string
  isOffline?: boolean
}

interface OCRErrorResult {
  error: string
  suggestion: string
}

interface RetryableFunction {
  (): Promise<any>
}

// Error type guards
const isNetworkError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'NetworkError'
}

const hasStatus = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'status' in error
}

const hasMessage = (error: unknown): error is { message: string } => {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string'
}

export class ErrorRecovery {
  
  /**
   * Handle authentication errors with graceful fallback
   */
  static handleAuthError(error: unknown, context: string): void {
    console.error(`Auth error in ${context}:`, error)
    
    // Clear potentially corrupted auth state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo-auth-user')
      localStorage.removeItem('auth-token')
    }
    
    // Redirect to login with context
    if (typeof window !== 'undefined') {
      const url = new URL('/login', window.location.origin)
      url.searchParams.set('error', 'session_expired')
      url.searchParams.set('context', context)
      window.location.href = url.toString()
    }
  }
  
  /**
   * Handle API errors with retry logic and exponential backoff
   */
  static async handleApiError(
    error: unknown, 
    retryFn?: RetryableFunction, 
    maxRetries = 3,
    currentAttempt = 0
  ): Promise<{ error: string }> {
    console.error('API error:', error)
    
    // If it's a network error and we have retries left
    if (isNetworkError(error) && retryFn && currentAttempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, currentAttempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      
      try {
        await retryFn()
        return { error: '' } // Success after retry
      } catch (retryError) {
        return this.handleApiError(retryError, retryFn, maxRetries, currentAttempt + 1)
      }
    }
    
    // Return user-friendly error message based on status
    if (hasStatus(error)) {
      switch (error.status) {
        case 401:
          return { error: 'Session expired. Please log in again.' }
        case 403:
          return { error: 'You do not have permission to perform this action.' }
        case 404:
          return { error: 'The requested resource was not found.' }
        case 429:
          return { error: 'Too many requests. Please wait a moment and try again.' }
        default:
          if (typeof error.status === 'number' && error.status >= 500) {
            return { error: 'Server error. Please try again later.' }
          }
      }
    }
    
    return { error: 'An unexpected error occurred. Please try again.' }
  }
  
  /**
   * Handle database connection errors with typed fallback data
   */
  static handleDatabaseError<T = any>(error: unknown, fallbackData?: T[]): DatabaseResult<T> {
    console.error('Database error:', error)
    
    // Return fallback data if available
    if (fallbackData) {
      console.log('Using fallback data due to database error')
      return {
        data: fallbackData,
        error: 'Using cached data due to connection issues.',
        isOffline: true
      }
    }
    
    // Return empty state with error flag
    return {
      data: [],
      error: 'Unable to connect to database. Please check your connection.',
      isOffline: true
    }
  }
  
  /**
   * Handle chatbot errors with contextual fallback responses
   */
  static handleChatbotError(error: unknown, query: string): string {
    console.error('Chatbot error:', error)
    
    const normalizedQuery = query.toLowerCase().trim()
    
    // Define query patterns and their fallback responses
    const queryPatterns = [
      {
        patterns: ['red zone', 'critical', 'expire', 'expiry'],
        response: `I'm having trouble accessing real-time data right now. Please check the Visual Shelf Heatmap page for critical items, or try asking again in a moment.`
      },
      {
        patterns: ['inventory', 'stock', 'items', 'medicines'],
        response: `I can't access inventory data at the moment. Please visit the Inventory page directly, or try refreshing and asking again.`
      },
      {
        patterns: ['revenue', 'profit', 'financial', 'money'],
        response: `Financial data is temporarily unavailable. Please check the Dashboard for revenue insights, or try again shortly.`
      },
      {
        patterns: ['fefo', 'batch', 'sell first', 'priority'],
        response: `Batch prioritization data is currently unavailable. Please check the Visual Shelf Heatmap for FEFO guidance.`
      }
    ]
    
    // Find matching pattern
    const matchedPattern = queryPatterns.find(pattern =>
      pattern.patterns.some(p => normalizedQuery.includes(p))
    )
    
    if (matchedPattern) {
      return matchedPattern.response
    }
    
    // Default fallback
    return `I'm experiencing a temporary issue. Please try rephrasing your question or visit the relevant page directly. The system should be back to normal shortly.`
  }
  
  /**
   * Handle OCR processing errors with specific guidance
   */
  static handleOCRError(error: unknown): OCRErrorResult {
    console.error('OCR error:', error)
    
    const errorMessage = hasMessage(error) ? error.message.toLowerCase() : ''
    
    // Camera-related errors
    if (errorMessage.includes('camera') || errorMessage.includes('permission')) {
      return {
        error: 'Camera access denied. Please allow camera permissions or try uploading an image instead.',
        suggestion: 'Use the "Upload Image" option or check your browser permissions.'
      }
    }
    
    // Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('time')) {
      return {
        error: 'OCR processing timed out. The image might be too large or unclear.',
        suggestion: 'Try a smaller, clearer image or use the "Simulate Scan" option for demo purposes.'
      }
    }
    
    // File format errors
    if (errorMessage.includes('format') || errorMessage.includes('type')) {
      return {
        error: 'Unsupported image format. Please use JPG, PNG, or WebP images.',
        suggestion: 'Convert your image to a supported format and try again.'
      }
    }
    
    // Network/loading errors
    if (errorMessage.includes('network') || errorMessage.includes('load')) {
      return {
        error: 'Unable to load OCR engine. Please check your internet connection.',
        suggestion: 'Refresh the page and try again, or use manual entry as an alternative.'
      }
    }
    
    // Default OCR error
    return {
      error: 'Unable to process the image. Please try again with a clearer photo.',
      suggestion: 'Ensure the medicine packaging is clearly visible and well-lit.'
    }
  }
}