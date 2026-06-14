/**
 * Chat Message Formatting Utilities
 */

import React from 'react'

export function formatMessageContent(content: string) {
  return <div className="whitespace-pre-wrap">{content}</div>
}

export function generateWelcomeMessage(name: string, role: string) {
  return `Hi ${name}! I'm your Viala AI assistant. I can help you with inventory management, expiry tracking, and business insights. What would you like to know?`
}