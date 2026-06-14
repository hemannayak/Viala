'use client'

import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number | string
  prefix?: string
  suffix?: string
  duration?: number
}

export function AnimatedCounter({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 1500 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? value : 0)
  
  useEffect(() => {
    if (typeof value !== 'number') return
    
    let animationFrame: number
    let startTime: number
    const startValue = displayValue
    const endValue = value

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart)
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, 200)
    
    return () => {
      clearTimeout(timer)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  return (
    <span>
      {prefix}{typeof value === 'number' ? displayValue.toLocaleString() : value}{suffix}
    </span>
  )
}