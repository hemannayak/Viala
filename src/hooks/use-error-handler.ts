'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { ErrorRecovery } from '@/lib/error-recovery'

export function useErrorHandler() {
  
  const handleError = useCallback((error: any, context: string, fallbackData?: any) => {
    console.error(`Error in ${context}:`, error)
    
    // Handle different types of errors
    if (error?.status === 401 || error?.message?.includes('auth')) {
      ErrorRecovery.handleAuthError(error, context)
      return null
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      toast.error('Network error. Please check your connection and try again.')
      return ErrorRecovery.handleDatabaseError(error, fallbackData)
    }
    
    if (error?.message?.includes('database') || error?.message?.includes('db')) {
      toast.error('Database connection issue. Using cached data.')
      return ErrorRecovery.handleDatabaseError(error, fallbackData)
    }
    
    // Generic error handling
    toast.error('An unexpected error occurred. Please try again.')
    return fallbackData || null
  }, [])
  
  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context: string,
    fallbackData?: any,
    maxRetries = 3
  ) => {
    try {
      return await asyncFn()
    } catch (error) {
      return handleError(error, context, fallbackData)
    }
  }, [handleError])
  
  const handleChatError = useCallback((error: any, query: string) => {
    const fallbackMessage = ErrorRecovery.handleChatbotError(error, query)
    toast.error('Chatbot temporarily unavailable')
    return fallbackMessage
  }, [])
  
  const handleOCRError = useCallback((error: any) => {
    const result = ErrorRecovery.handleOCRError(error)
    toast.error(result.error)
    if (result.suggestion) {
      toast.info(result.suggestion)
    }
    return result
  }, [])
  
  return {
    handleError,
    handleAsyncError,
    handleChatError,
    handleOCRError
  }
}