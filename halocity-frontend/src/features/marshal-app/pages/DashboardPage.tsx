import { ClipboardList } from 'lucide-react'
import { useAuth } from '@/shared/stores/AuthContext'
import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { AssignmentCard } from '@/features/marshals/components/AssignmentCard'
import { KPISkeleton } from '@/shared/components/LoadingSkeletons'
import { isToday } from '@/shared/lib/geo'

const greetings = ['Good morning', 'Good afternoon', 'Good evening']

function greet() {
  const h = new Date().getHours()
  if (h < 12) return greetings[0]
  if (h < 17) return greetings[1]
  return greetings[2]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: incidents, isLoading } = useIncidents()

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
        <h1 className="mb-4 text-lg font-semibold text-[#0F172A]">Dashboard</h1>
        <KPISkeleton count={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-lg font-semibold text-[#0F172A]">{greet()}, {user?.name?.split(' ')[0] || 'Mayor'}</h1>
        <p className="text-xs text-[#64748B]">Here's your current status</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-[#64748B]">Assigned</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{assigned?.length || 0}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-[#64748B]">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-warning">{inProgress?.length || 0}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-[#64748B]">Resolved Today</p>
          <p className="mt-1 text-2xl font-bold text-success">{resolvedToday?.length || 0}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          {currentAssignment ? 'Current Assignment' : 'No Active Assignments'}
        </h2>
        {currentAssignment ? (
          <AssignmentCard incident={currentAssignment} />
        ) : (
          <div className="rounded-lg border border-border p-6 text-center">
            <ClipboardList className="mx-auto mb-2 h-8 w-8 text-[#94A3B8]" />
            <p className="text-sm text-[#64748B]">No assignments yet</p>
          </div>
        )}
      </section>
    </div>
  )
}
