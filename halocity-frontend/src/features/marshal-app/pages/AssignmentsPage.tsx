import { useState } from 'react'
import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { AssignmentCard } from '@/features/marshals/components/AssignmentCard'
import { ListSkeleton } from '@/shared/components/LoadingSkeletons'
import { EmptyState } from '@/shared/components/EmptyState'
import { cn } from '@/shared/lib/utils'

const tabs = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('assigned')
  const { data: incidents, isLoading } = useIncidents()

  const filtered =
    incidents?.filter((i) => {
      if (activeTab === 'assigned') return i.status === 'PENDING' || i.status === 'ACKNOWLEDGED'
      if (activeTab === 'in-progress') return i.status === 'IN_PROGRESS'
      return i.status === 'RESOLVED' || i.status === 'CLOSED'
    }) || []

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-foreground">Assignments</h1>

      <div className="mb-4 flex gap-1 rounded-lg bg-surface-alt p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((inc) => (
            <AssignmentCard key={inc.id} incident={inc} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${activeTab} assignments`}
        />
      )}
    </div>
  )
}
