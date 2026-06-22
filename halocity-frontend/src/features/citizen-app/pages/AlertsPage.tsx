import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, AlertTriangle, Info, Car, ExternalLink } from 'lucide-react'
import { fetchNotifications } from '@/features/incidents/api/incidents.api'
import { EmptyState } from '@/shared/components/EmptyState'
import { ListSkeleton } from '@/shared/components/LoadingSkeletons'

const typeIcons: Record<string, React.ReactNode> = {
  INCIDENT_UPDATE: <AlertTriangle className="h-5 w-5 text-critical" />,
  ASSIGNMENT: <Car className="h-5 w-5 text-warning" />,
  ALERT: <AlertTriangle className="h-5 w-5 text-warning" />,
  ESCALATION: <AlertTriangle className="h-5 w-5 text-critical" />,
  SYSTEM: <Info className="h-5 w-5 text-primary" />,
}

export default function AlertsPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const notifications: any[] = data?.data || []

  const handleClick = (n: any) => {
    if (n.referenceId && n.referenceType === 'incident') {
      navigate(`/app/reports/${n.referenceId}`)
    }
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-[#0F172A]">Alerts</h1>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                n.referenceId ? 'cursor-pointer hover:bg-surface-alt' : ''
              }`}
            >
              <div className="mt-1 shrink-0">
                {typeIcons[n.type] || <Bell className="h-5 w-5 text-[#64748B]" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0F172A]">{n.title}</p>
                <p className="mt-0.5 text-xs text-[#64748B]">{n.body}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {n.referenceId && n.referenceType === 'incident' && (
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-[#94A3B8]" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No alerts"
          description="You'll see alerts and notifications here when they arrive"
        />
      )}
    </div>
  )
}
