import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import { Badge } from '@/shared/components/Badge'
import { cn } from '@/shared/lib/utils'
import { haversineDistance, formatDistance } from '@/shared/lib/geo'
import type { Incident } from '@/shared/types'

interface AssignmentCardProps {
  incident: Incident
  userLat?: number
  userLng?: number
  className?: string
}

export function AssignmentCard({
  incident,
  userLat,
  userLng,
  className,
}: AssignmentCardProps) {
  const distance =
    userLat && userLng && incident.locationLat
      ? haversineDistance(userLat, userLng, incident.locationLat, incident.locationLng)
      : null

  return (
    <Link
      to={`/marshal/assignments/${incident.id}`}
      className={cn(
        'block rounded-lg border border-border p-4 transition-colors hover:bg-surface-alt',
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
      <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
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
    </Link>
  )
}
