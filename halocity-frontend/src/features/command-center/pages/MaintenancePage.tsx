import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wrench } from 'lucide-react'
import { fetchZones } from '@/features/incidents/api/incidents.api'
import { TableSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { cn } from '@/shared/lib/utils'

type Tab = 'assets' | 'tickets'

export default function MaintenancePage() {
  const [tab, setTab] = useState<Tab>('assets')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
  })

  const zones: any[] = Array.isArray(data) ? data : []

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Maintenance</h1>
        <TableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Maintenance</h1>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Maintenance</h1>

      <div className="mb-6 flex gap-1 rounded-lg bg-surface-alt p-1">
        {(['assets', 'tickets'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-xs font-medium capitalize transition-colors',
              tab === t
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'assets' && (
        <div className="space-y-3">
          {zones.length > 0 ? (
            zones.map(
              (zone: { id: string; name: string; code?: string }) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {zone.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground/60">
                      {zone.code || '—'}
                    </p>
                  </div>
                </div>
              ),
            )
          ) : (
            <EmptyState
              icon={<Wrench className="h-12 w-12" />}
              title="No assets found"
              description="Assets will appear here once configured"
            />
          )}
        </div>
      )}

      {tab === 'tickets' && (
        <EmptyState
          icon={<Wrench className="h-12 w-12" />}
          title="No maintenance tickets"
          description="Tickets will appear here once created"
        />
      )}
    </div>
  )
}
