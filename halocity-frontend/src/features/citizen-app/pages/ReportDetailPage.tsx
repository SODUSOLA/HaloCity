import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar } from 'lucide-react'
import { useIncident } from '@/features/incidents/hooks/useIncidents'
import { Badge } from '@/shared/components/Badge'
import { IncidentStatusTimeline } from '@/features/incidents/components/IncidentStatusTimeline'
import { CardSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'


export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: incident, isLoading, isError, refetch } = useIncident(id!)

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
        <ErrorState
          title="Could not load report"
          message="This report may not exist or has been removed."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const googleMapsUrl = incident.locationLat
    ? `https://www.google.com/maps/dir/?api=1&destination=${incident.locationLat},${incident.locationLng}`
    : null

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Link to="/app/reports" className="p-1" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Report Detail</h1>
          <p className="font-mono text-xs text-muted-foreground/60">{incident.referenceCode}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Badge variant="severity" value={incident.severity} />
        <Badge variant="status" value={incident.status} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</p>
        <p className="text-sm text-foreground">
          {incident.type.charAt(0) + incident.type.slice(1).toLowerCase().replace('_', ' ')}
        </p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
        <p className="text-sm text-foreground">{incident.description}</p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Location</p>
        {incident.locationLat ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {incident.locationLat.toFixed(4)}, {incident.locationLng.toFixed(4)}
            </p>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                Get directions
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/60">No location data</p>
        )}
      </div>

      {incident.mediaUrls.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Photos ({incident.mediaUrls.length})
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
          Status Timeline
        </p>
        <IncidentStatusTimeline
          currentStatus={incident.status}
          resolvedAt={incident.resolvedAt}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface-alt p-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Reported {new Date(incident.createdAt).toLocaleString()}
        </p>
        {incident.updatedAt !== incident.createdAt && (
          <p className="mt-1 flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Updated {new Date(incident.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
