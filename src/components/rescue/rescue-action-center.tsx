'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRescueActions } from '@/hooks/use-rescue-actions'
import { RescueItemCard } from './rescue-item-card'
import { RescueLoadingState, RescueEmptyState } from './rescue-states'

interface RescueActionCenterProps {
  onActionComplete?: () => void
}

export function RescueActionCenter({ onActionComplete }: RescueActionCenterProps) {
  const { user } = useAuth()
  const { 
    atRiskItems, 
    loading, 
    processingItems, 
    processRescueAction 
  } = useRescueActions({
    userId: user?.id,
    pharmacyId: user?.pharmacy_id,
    onActionComplete
  })

  if (loading) {
    return <RescueLoadingState />
  }

  if (atRiskItems.length === 0) {
    return <RescueEmptyState />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Rescue Action Center
          <Badge variant="secondary" className="ml-2">
            {atRiskItems.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {atRiskItems.map((item) => (
            <RescueItemCard
              key={item.id}
              item={item}
              isProcessing={processingItems.has(item.id)}
              onProcess={processRescueAction}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}