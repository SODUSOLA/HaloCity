import { useNavigate } from 'react-router-dom'
import { ClipboardList, PlusCircle, MapPin } from 'lucide-react'
import { useAuth } from '@/shared/stores/AuthContext'
import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { AssignmentCard } from '@/features/marshals/components/AssignmentCard'
import { KPISkeleton } from '@/shared/components/LoadingSkeletons'
import { isToday } from '@/shared/lib/geo'
import { fetchMyAssignment } from '@/features/marshals/api/marshals.api'
import { useQuery } from '@tanstack/react-query'

const greetings = ['Good morning', 'Good afternoon', 'Good evening']

function greet() {
  const h = new Date().getHours()
  if (h < 12) return greetings[0]
  if (h < 17) return greetings[1]
  return greetings[2]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: incidents, isLoading } = useIncidents()
  const { data: assignment } = useQuery({
    queryKey: ['myAssignment'],
    queryFn: fetchMyAssignment,
    enabled: !!user,
  })

  const assigned = incidents?.filter(
    (i) => i.status === 'PENDING' || i.status === 'ACKNOWLEDGED',
  )
  const resolvedToday = incidents?.filter(
    (i) => i.status === 'RESOLVED' && isToday(i.resolvedAt || i.updatedAt),
  )
  const inProgress = incidents?.filter((i) => i.status === 'IN_PROGRESS')

  const currentAssignment = inProgress?.[0] || assigned?.[0]

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-lg font-semibold text-foreground">Dashboard</h1>
        <KPISkeleton count={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{greet()}, {user?.name?.split(' ')[0] || 'Mayor'}</h1>
        <p className="text-xs text-muted-foreground">Here's your current status</p>
      </div>

      {assignment?.zone && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-alt p-3 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Assigned Zone:</span>
          <span className="text-muted-foreground">{assignment.zone.name} ({assignment.zone.code})</span>
        </div>
      )}

      <button
        onClick={() => navigate('/marshal/report')}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        <PlusCircle className="h-4 w-4" />
        Report Incident
      </button>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted-foreground">Assigned</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{assigned?.length || 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-warning">{inProgress?.length || 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted-foreground">Resolved Today</p>
          <p className="mt-1 text-2xl font-bold text-success">{resolvedToday?.length || 0}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {currentAssignment ? 'Current Assignment' : 'No Active Assignments'}
        </h2>
        {currentAssignment ? (
          <AssignmentCard incident={currentAssignment} />
        ) : (
          <div className="rounded-lg border border-border bg-surface p-6 text-center">
            <ClipboardList className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No assignments yet</p>
          </div>
        )}
      </section>
    </div>
  )
}
