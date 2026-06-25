import { cn } from '@/shared/lib/utils'
import type { MarshalAvailability } from '@/shared/types'

interface AvailabilityIndicatorProps {
  availability: MarshalAvailability
  className?: string
}

const config: Record<MarshalAvailability, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-success' },
  busy: { label: 'Active', color: 'bg-warning' },
  offline: { label: 'Offline', color: 'bg-muted-foreground/40' },
}

export function AvailabilityIndicator({
  availability,
  className,
}: AvailabilityIndicatorProps) {
  const { label, color } = config[availability]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('h-2 w-2 rounded-full', color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
