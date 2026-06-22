import { cn } from '@/shared/lib/utils'
import { Check, Clock, AlertTriangle, XCircle, ArrowUp } from 'lucide-react'
import type { IncidentStatus } from '@/shared/types'

interface EscalationEvent {
  id: string
  fromStatus?: string | null
  toStatus: string
  triggeredAt: string
  reason?: string | null
  rule?: { id: string } | null
}

interface IncidentStatusTimelineProps {
  currentStatus: IncidentStatus
  resolvedAt?: string | null
  escalationLogs?: EscalationEvent[]
  createdAt?: string
}

const statusOrder: IncidentStatus[] = ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

interface StatusStep {
  status: IncidentStatus
  label: string
  icon: typeof Clock
}

const STATUS_STEPS: StatusStep[] = [
  { status: 'PENDING', label: 'Reported', icon: Clock },
  { status: 'ACKNOWLEDGED', label: 'Acknowledged', icon: Check },
  { status: 'IN_PROGRESS', label: 'In Progress', icon: ArrowUp },
  { status: 'RESOLVED', label: 'Resolved', icon: Check },
  { status: 'CLOSED', label: 'Closed', icon: XCircle },
]

export function IncidentStatusTimeline({
  currentStatus,
  resolvedAt,
  escalationLogs,
  createdAt,
}: IncidentStatusTimelineProps) {
  const currentIdx = statusOrder.indexOf(currentStatus)
  const hasEscalations = escalationLogs && escalationLogs.some((l) => l.toStatus === 'ESCALATED')

  return (
    <div>
      {STATUS_STEPS.map((step, i) => {
        const idx = statusOrder.indexOf(step.status)
        const isComplete = currentIdx >= idx
        const isCurrent = step.status === currentStatus
        const dotKind = isComplete ? (isCurrent ? 'current' : 'complete') : 'pending'

        return (
          <div key={step.status}>
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2',
                    dotKind === 'complete' && 'border-success bg-success text-white',
                    dotKind === 'current' && 'border-primary bg-primary text-white',
                    dotKind === 'pending' && 'border-border bg-white text-[#94A3B8]',
                  )}
                >
                  <step.icon className="h-3.5 w-3.5" />
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={cn('mt-1 h-6 w-0.5', currentIdx > idx ? 'bg-success' : 'bg-border')}
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
                {step.status === 'PENDING' && createdAt && isComplete && (
                  <p className="text-xs text-[#64748B]">{new Date(createdAt).toLocaleString()}</p>
                )}
                {step.status === 'RESOLVED' && resolvedAt && isComplete && (
                  <p className="text-xs text-[#64748B]">{new Date(resolvedAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            {step.status === 'IN_PROGRESS' && hasEscalations && (
              <div className="ml-[18px] mt-1 space-y-3 border-l-2 border-warning pl-6 pb-3">
                {escalationLogs!
                  .filter((l) => l.toStatus === 'ESCALATED')
                  .map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <div>
                        <p className="text-sm font-medium text-warning">Escalated</p>
                        <p className="text-xs text-[#64748B]">
                          {log.reason || 'Escalated to higher authority'}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {new Date(log.triggeredAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
