import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { fetchNotifications } from '@/features/incidents/api/incidents.api'
import { ListSkeleton } from '@/shared/components/LoadingSkeletons'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import type { Notification } from '@/shared/types'

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const notifications: Notification[] = data || []

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-lg font-semibold text-foreground">Notifications</h1>
        <ListSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-lg font-semibold text-foreground">Notifications</h1>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-foreground">Notifications</h1>
      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No notifications"
          description="You'll see notifications here when they arrive"
        />
      )}
    </div>
  )
}
