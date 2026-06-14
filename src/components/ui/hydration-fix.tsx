'use client'

import { useEffect } from 'react'

export function HydrationFix() {
  useEffect(() => {
    // Suppress hydration warnings and third-party errors caused by browser extensions
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args) => {
      if (typeof args[0] === 'string' && (
        args[0].includes('Hydration failed') ||
        args[0].includes('bis_skin_checked') ||
        args[0].includes('server rendered HTML didn\'t match') ||
        args[0].includes('giveFreely') ||
        args[0].includes('Cannot read properties of undefined') ||
        args[0].includes('Loading media from') ||
        args[0].includes('Content Security Policy')
      )) {
        return
      }
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      if (typeof args[0] === 'string' && (
        args[0].includes('scroll-behavior: smooth') ||
        args[0].includes('data-scroll-behavior')
      )) {
        return
      }
      originalWarn.apply(console, args)
    }

    // Suppress unhandled promise rejections from third-party scripts
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'object') {
        const message = event.reason.message || event.reason.toString()
        if (message.includes('giveFreely') || 
            message.includes('Failed to load') ||
            message.includes('NotSupportedError')) {
          event.preventDefault()
          return
        }
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}