'use client'

import { useState } from 'react'
import { Cloud, Sun, Snowflake, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { SeasonalMode } from '@/lib/forecasting'

interface SeasonalModeSelectorProps {
  currentMode: SeasonalMode
  onModeChange: (mode: SeasonalMode) => void
  className?: string
}

const SEASONAL_MODES = {
  normal: {
    label: 'Normal Operations',
    description: 'Standard demand patterns',
    icon: Calendar,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    badgeColor: 'bg-gray-500'
  },
  monsoon: {
    label: 'Monsoon Season',
    description: 'High demand for cold, flu & hydration medicines',
    icon: Cloud,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeColor: 'bg-blue-500'
  },
  summer: {
    label: 'Summer Season',
    description: 'Peak demand for hydration & heat-related medicines',
    icon: Sun,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    badgeColor: 'bg-orange-500'
  },
  winter: {
    label: 'Winter Season',
    description: 'Cold & flu season with immunity boosters',
    icon: Snowflake,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    badgeColor: 'bg-cyan-500'
  }
} as const

export function SeasonalModeSelector({ 
  currentMode, 
  onModeChange, 
  className = '' 
}: SeasonalModeSelectorProps) {
  const currentConfig = SEASONAL_MODES[currentMode]
  const CurrentIcon = currentConfig.icon

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">
        Forecast Mode:
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`h-9 px-3 ${currentConfig.color} hover:opacity-80 transition-all duration-200`}
          >
            <CurrentIcon className="h-4 w-4 mr-2" />
            <span className="font-medium">{currentConfig.label}</span>
            {currentMode !== 'normal' && (
              <Badge 
                className={`ml-2 h-5 px-2 text-xs ${currentConfig.badgeColor} text-white border-0`}
              >
                Active
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          {Object.entries(SEASONAL_MODES).map(([mode, config]) => {
            const Icon = config.icon
            const isActive = mode === currentMode
            
            return (
              <DropdownMenuItem
                key={mode}
                onClick={() => onModeChange(mode as SeasonalMode)}
                className={`p-4 cursor-pointer ${isActive ? 'bg-muted' : ''}`}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{config.label}</span>
                      {isActive && (
                        <Badge className={`h-5 px-2 text-xs ${config.badgeColor} text-white border-0`}>
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}