import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { IncidentRow } from '@/features/incidents/components/IncidentRow'
import { ListSkeleton } from '@/shared/components/LoadingSkeletons'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ClipboardList } from 'lucide-react'

export default function MyReportsPage() {
  const { data: incidents, isLoading, isError, refetch } = useIncidents()

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-lg font-semibold text-foreground">My Reports</h1>
        <ListSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-lg font-semibold text-foreground">My Reports</h1>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-foreground">My Reports</h1>
      {incidents && incidents.length > 0 ? (
        <div className="space-y-2">
          {incidents.map((inc) => (
            <IncidentRow
              key={inc.id}
              incident={inc}
              linkTo={`/app/reports/${inc.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="No reports yet"
          description="Reports you submit will appear here"
        />
      )}
    </div>
  )
}
