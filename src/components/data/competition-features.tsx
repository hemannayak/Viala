import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import type { CompetitionFeature } from '@/types/data-analytics'

interface CompetitionFeaturesProps {
  features: CompetitionFeature[]
}

export const CompetitionFeatures = memo(({ features }: CompetitionFeaturesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <Card key={feature.title} className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <feature.icon className="h-5 w-5 text-primary" />
                {feature.title}
              </CardTitle>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {feature.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Key Features:</h5>
              <ul className="space-y-1">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

CompetitionFeatures.displayName = 'CompetitionFeatures'