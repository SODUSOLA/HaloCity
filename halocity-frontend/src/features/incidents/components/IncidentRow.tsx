import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import { Badge } from '@/shared/components/Badge'
import { cn } from '@/shared/lib/utils'
import type { Incident } from '@/shared/types'

interface IncidentRowProps {
  incident: Incident
  linkTo?: string
  className?: string
}

export function IncidentRow({ incident, linkTo, className }: IncidentRowProps) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-surface-alt',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-muted-foreground/60">{incident.referenceCode}</span>
          <Badge variant="severity" value={incident.severity} />
          <Badge variant="status" value={incident.status} />
        </div>
        <p className="text-sm font-medium text-foreground truncate">
          {incident.type.charAt(0) + incident.type.slice(1).toLowerCase().replace('_', ' ')}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(incident.createdAt).toLocaleDateString()}
          </span>
          {incident.zone && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {incident.zone.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>
  }

  return content
}
