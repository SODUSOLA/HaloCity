import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, User, Phone, Check, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useIncident, useUpdateStatus } from '@/features/incidents/hooks/useIncidents'
import { Badge } from '@/shared/components/Badge'
import { CardSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/components/ui/button'
import { IncidentStatusTimeline } from '@/features/incidents/components/IncidentStatusTimeline'
import { cn } from '@/shared/lib/utils'

const STATUS_FLOW = [
  { status: 'PENDING', label: 'Reported' },
  { status: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
]

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: incident, isLoading, isError, refetch } = useIncident(id!)
  const updateStatus = useUpdateStatus()

  const handleTransition = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: id!, status })
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <CardSkeleton />
      </div>
    )
  }

  if (isError || !incident) {
    return (
      <div className="p-4">
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  const statusOrder = STATUS_FLOW.map((s) => s.status)
  const currentIdx = statusOrder.indexOf(incident.status)
  const nextStatus = currentIdx < statusOrder.length - 1 ? statusOrder[currentIdx + 1] : null
  const googleMapsUrl = incident.locationLat
    ? `https://www.google.com/maps/dir/?api=1&destination=${incident.locationLat},${incident.locationLng}`
    : null

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Link to="/marshal/assignments" className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Assignment</h1>
          <p className="font-mono text-xs text-muted-foreground/60">{incident.referenceCode}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Badge variant="severity" value={incident.severity} />
        <Badge variant="status" value={incident.status} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-2 text-sm font-medium text-foreground">
          {incident.type.charAt(0) + incident.type.slice(1).toLowerCase().replace('_', ' ')}
        </p>
        <p className="text-sm text-muted-foreground">{incident.description}</p>
      </div>

      {incident.reporter && (
        <div className="rounded-lg border border-border p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reporter
          </p>
          <div className="space-y-2 text-sm text-foreground">
            <p className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {incident.reporter.name}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {incident.reporter.phone}
            </p>
          </div>
        </div>
      )}

      {incident.locationLat ? (
        <div className="rounded-lg border border-border p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Location
          </p>
          <p className="mb-2 flex items-center gap-2 text-sm text-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {incident.locationLat.toFixed(4)}, {incident.locationLng.toFixed(4)}
          </p>
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <MapPin className="h-3 w-3" />
              Get directions (Google Maps)
            </a>
          )}
        </div>
      ) : null}

      {incident.mediaUrls.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Evidence ({incident.mediaUrls.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {incident.mediaUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Evidence ${i + 1}`}
                className="rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Status Flow
        </p>
        <div className="space-y-2">
          {STATUS_FLOW.map((step, i) => {
            const isPast = i < currentIdx
            const isCurrent = i === currentIdx
            const isFuture = i > currentIdx

            return (
              <div key={step.status} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                    isPast && 'border-success bg-success text-white',
                    isCurrent && 'border-primary bg-primary text-white',
                    isFuture && 'border-border bg-white text-muted-foreground/60',
                  )}
                >
                  {isPast ? <Check className="h-4 w-4" /> : <span className="text-xs font-medium">{i + 1}</span>}
                </div>
                <span
                  className={cn(
                    'text-sm',
                    isPast && 'text-success line-through',
                    isCurrent && 'font-medium text-foreground',
                    isFuture && 'text-muted-foreground/60',
                  )}
                >
                  {step.label}
                </span>
                {isCurrent && nextStatus && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {nextStatus && incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
        <Button
          className="w-full"
          variant={nextStatus === 'RESOLVED' ? 'default' : 'default'}
          size="lg"
          onClick={() => handleTransition(nextStatus)}
          disabled={updateStatus.isPending}
        >
          {nextStatus === 'ACKNOWLEDGED' && 'Accept Assignment'}
          {nextStatus === 'IN_PROGRESS' && 'Mark En Route'}
          {nextStatus === 'RESOLVED' && 'Resolve Incident'}
        </Button>
      )}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Status Timeline
        </p>
        <IncidentStatusTimeline
          currentStatus={incident.status}
          resolvedAt={incident.resolvedAt}
          createdAt={incident.createdAt}
          escalationLogs={(incident as any).escalationLogs}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface-alt p-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Assigned {new Date(incident.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
