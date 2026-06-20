import { cn } from '@/shared/lib/utils'
import type { IncidentStatus } from '@/shared/types'

const steps: { status: IncidentStatus; label: string }[] = [
  { status: 'PENDING', label: 'Reported' },
  { status: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
]

interface IncidentStatusTimelineProps {
  currentStatus: IncidentStatus
  resolvedAt?: string | null
}

export function IncidentStatusTimeline({
  currentStatus,
  resolvedAt,
}: IncidentStatusTimelineProps) {
  const statusOrder: IncidentStatus[] = ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const currentIdx = statusOrder.indexOf(currentStatus)

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isComplete = currentIdx >= statusOrder.indexOf(step.status)
        const isCurrent = step.status === currentStatus

        return (
          <div key={step.status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-medium',
                  isComplete
                    ? 'border-success bg-success text-white'
                    : 'border-border bg-white text-[#94A3B8]',
                  isCurrent && !isComplete && 'border-primary bg-primary text-white',
                )}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mt-1 h-6 w-0.5',
                    isComplete && currentIdx > index ? 'bg-success' : 'bg-border',
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  isComplete ? 'text-[#0F172A]' : 'text-[#94A3B8]',
                )}
              >
                {step.label}
              </p>
              {step.status === 'RESOLVED' && resolvedAt && isComplete && (
                <p className="text-xs text-[#64748B]">
                  {new Date(resolvedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
