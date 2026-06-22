import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { haversineDistance, formatDistance } from '@/shared/lib/geo'
import { useUpdateStatus } from '@/features/incidents/hooks/useIncidents'
import type { Incident } from '@/shared/types'

interface AssignmentCardProps {
  incident: Incident
  userLat?: number
  userLng?: number
  className?: string
}

const STATUS_BUTTONS: Record<string, { label: string; variant: 'default' | 'outline'; nextStatus: string }> = {
  PENDING: { label: 'Accept Assignment', variant: 'default', nextStatus: 'ACKNOWLEDGED' },
  ACKNOWLEDGED: { label: 'Mark En Route', variant: 'outline', nextStatus: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'Mark Resolved', variant: 'default', nextStatus: 'RESOLVED' },
}

export function AssignmentCard({
  incident,
  userLat,
  userLng,
  className,
}: AssignmentCardProps) {
  const navigate = useNavigate()
  const updateStatus = useUpdateStatus()
  const distance =
    userLat && userLng && incident.locationLat
      ? haversineDistance(userLat, userLng, incident.locationLat, incident.locationLng)
      : null

  const action = STATUS_BUTTONS[incident.status]

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!action) return
    try {
      await updateStatus.mutateAsync({ id: incident.id, status: action.nextStatus })
      toast.success(`Status updated to ${action.nextStatus.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (incident.locationLat && incident.locationLng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${incident.locationLat},${incident.locationLng}&travelmode=driving`,
        '_blank',
      )
    }
  }

  return (
    <div
      onClick={() => navigate(`/marshal/assignments/${incident.id}`)}
      className={cn(
        'block cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-surface-alt',
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-xs text-[#94A3B8]">{incident.referenceCode}</span>
        <Badge variant="severity" value={incident.severity} />
        <Badge variant="status" value={incident.status} />
      </div>
      <p className="mb-1 text-sm font-medium text-[#0F172A]">
        {incident.type.charAt(0) + incident.type.slice(1).toLowerCase().replace('_', ' ')}
      </p>
      {incident.description && (
        <p className="mb-2 line-clamp-2 text-xs text-[#64748B]">{incident.description}</p>
      )}
      <div className="mb-3 flex items-center gap-3 text-xs text-[#94A3B8]">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(incident.createdAt).toLocaleString()}
        </span>
        {distance !== null && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {formatDistance(distance)}
          </span>
        )}
      </div>

      {action && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={action.variant}
            className="flex-1"
            onClick={handleAction}
            disabled={updateStatus.isPending}
          >
            {action.label}
          </Button>
          {incident.locationLat && (
            <Button size="sm" variant="outline" onClick={handleDirections}>
              <Navigation className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
