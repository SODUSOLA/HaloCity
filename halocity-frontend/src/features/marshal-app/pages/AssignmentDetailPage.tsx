import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, User, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useIncident, useUpdateStatus } from '@/features/incidents/hooks/useIncidents'
import { Badge } from '@/shared/components/Badge'
import { CardSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/components/ui/button'
import { IncidentStatusTimeline } from '@/features/incidents/components/IncidentStatusTimeline'

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ACKNOWLEDGED'],
  ACKNOWLEDGED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
  CLOSED: [],
  ESCALATED: [],
}

const transitionLabels: Record<string, string> = {
  ACKNOWLEDGED: 'Accept Assignment',
  IN_PROGRESS: 'Mark In Progress',
  RESOLVED: 'Resolve Incident',
}

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

  const allowed = ALLOWED_TRANSITIONS[incident.status] || []
  const googleMapsUrl = incident.locationLat
    ? `https://www.google.com/maps/dir/?api=1&destination=${incident.locationLat},${incident.locationLng}`
    : null

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Link to="/marshal/assignments" className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-[#64748B]" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A]">Assignment</h1>
          <p className="font-mono text-xs text-[#94A3B8]">{incident.referenceCode}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Badge variant="severity" value={incident.severity} />
        <Badge variant="status" value={incident.status} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-2 text-sm font-medium text-[#0F172A]">
          {incident.type.charAt(0) + incident.type.slice(1).toLowerCase().replace('_', ' ')}
        </p>
        <p className="text-sm text-[#64748B]">{incident.description}</p>
      </div>

      {incident.reporter && (
        <div className="rounded-lg border border-border p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#64748B]">
            Reporter
          </p>
          <div className="space-y-2 text-sm text-[#0F172A]">
            <p className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#64748B]" />
              {incident.reporter.name}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#64748B]" />
              {incident.reporter.phone}
            </p>
          </div>
        </div>
      )}

      {incident.locationLat ? (
        <div className="rounded-lg border border-border p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#64748B]">
            Location
          </p>
          <p className="mb-2 flex items-center gap-2 text-sm text-[#0F172A]">
            <MapPin className="h-4 w-4 text-[#64748B]" />
            {incident.locationLat.toFixed(4)}, {incident.locationLng.toFixed(4)}
          </p>
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline"
            >
              Get directions (Google Maps)
            </a>
          )}
        </div>
      ) : null}

      {incident.mediaUrls.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#64748B]">
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
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#64748B]">
          Status Timeline
        </p>
        <IncidentStatusTimeline
          currentStatus={incident.status}
          resolvedAt={incident.resolvedAt}
        />
      </div>

      {allowed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
            Actions
          </p>
          {allowed.map((s) => (
            <Button
              key={s}
              className="w-full"
              variant={s === 'RESOLVED' ? 'default' : 'outline'}
              onClick={() => handleTransition(s)}
              disabled={updateStatus.isPending}
            >
              {transitionLabels[s] || s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface-alt p-3 text-xs text-[#64748B]">
        <p className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Assigned {new Date(incident.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
