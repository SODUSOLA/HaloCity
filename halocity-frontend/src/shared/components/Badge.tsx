import type { IncidentSeverity, IncidentStatus } from '@/shared/types'
import { cn } from '@/shared/lib/utils'

const severityColors: Record<IncidentSeverity, string> = {
  CRITICAL: 'bg-critical-light text-critical-text border-critical/20',
  HIGH: 'bg-warning-light text-warning-text border-warning/20',
  MEDIUM: 'bg-primary-light text-primary-text border-primary/20',
  LOW: 'bg-success-light text-success-text border-success/20',
}

const statusColors: Record<IncidentStatus, string> = {
  PENDING: 'bg-warning-light text-warning-text border-warning/20',
  ACKNOWLEDGED: 'bg-primary-light text-primary-text border-primary/20',
  IN_PROGRESS: 'bg-primary-light text-primary-text border-primary/20',
  ESCALATED: 'bg-critical-light text-critical-text border-critical/20',
  RESOLVED: 'bg-success-light text-success-text border-success/20',
  CLOSED: 'bg-surface-alt text-[#64748B] border-border',
}

interface BadgeProps {
  variant: 'severity' | 'status'
  value: IncidentSeverity | IncidentStatus
  className?: string
}

export function Badge({ variant, value, className }: BadgeProps) {
  const colorClass =
    variant === 'severity'
      ? severityColors[value as IncidentSeverity]
      : statusColors[value as IncidentStatus]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className,
      )}
    >
      {value === 'IN_PROGRESS' ? 'In Progress' : value.charAt(0) + value.slice(1).toLowerCase()}
    </span>
  )
}
