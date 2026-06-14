import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface QuickQueryButtonProps {
  label: string
  description: string
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
}

export function QuickQueryButton({ 
  label, 
  description, 
  icon: Icon, 
  onClick, 
  disabled = false 
}: QuickQueryButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-auto p-2 text-xs justify-start hover:bg-primary/5"
    >
      <Icon className="h-3 w-3 mr-2 text-primary" />
      <div className="flex flex-col items-start">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground truncate">
          {description}
        </span>
      </div>
    </Button>
  )
}