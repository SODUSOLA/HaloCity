import { Link } from 'react-router-dom'
import { FileText, AlertTriangle, ClipboardList, Plus, Ambulance, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '@/shared/stores/AuthContext'
import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { IncidentRow } from '@/features/incidents/components/IncidentRow'
import { KPISkeleton } from '@/shared/components/LoadingSkeletons'
import { getGreeting } from '@/shared/lib/geo'
import { cn } from '@/shared/lib/utils'

const quickActions = [
  {
    label: 'Report Incident',
    icon: Plus,
    to: '/app/report',
    color: 'bg-primary-light text-primary-text border-primary/20',
  },
  {
    label: 'Emergency',
    icon: Ambulance,
    to: '/app/report?type=MEDICAL',
    color: 'bg-critical-light text-critical-text border-critical/20',
  },
  {
    label: 'View Reports',
    icon: ClipboardList,
    to: '/app/reports',
    color: 'bg-surface-alt text-[#64748B] border-border',
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const { data: incidents, isLoading } = useIncidents()

  const totalReports = incidents?.length || 0
  const pendingCount = incidents?.filter((i) => i.status === 'PENDING').length || 0
  const resolvedCount = incidents?.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length || 0

  const recentReports = incidents?.slice(0, 3) || []

  return (
    <div className="space-y-6 p-4">
      <section>
        <h1 className="text-xl font-semibold text-[#0F172A]">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          {user?.zone ? `Zone: ${user.zone.name}` : 'Stay informed about your community'}
        </p>
      </section>

      {isLoading ? (
        <KPISkeleton count={3} />
      ) : (
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-[#64748B]">
              <FileText className="h-3 w-3" />
              Total
            </div>
            <p className="text-2xl font-bold text-[#0F172A]">{totalReports}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-[#64748B]">
              <Clock className="h-3 w-3" />
              Pending
            </div>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-[#64748B]">
              <CheckCircle2 className="h-3 w-3" />
              Resolved
            </div>
            <p className="text-2xl font-bold text-success">{resolvedCount}</p>
          </div>
        </section>
      )}

      <section className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border p-4 text-center text-xs font-medium transition-colors hover:opacity-80',
              action.color,
            )}
          >
            <action.icon className="h-5 w-5" />
            {action.label}
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Recent Reports
          </h2>
          <Link
            to="/app/reports"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-border" />
            ))}
          </div>
        ) : recentReports.length > 0 ? (
          <div className="space-y-2">
            {recentReports.map((inc) => (
              <IncidentRow
                key={inc.id}
                incident={inc}
                linkTo={`/app/reports/${inc.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border p-6 text-center">
            <FileText className="mx-auto mb-2 h-8 w-8 text-[#94A3B8]" />
            <p className="text-sm text-[#64748B]">No reports yet</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Active Alerts
        </h2>
        <div className="rounded-lg border border-border p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-[#94A3B8]" />
          <p className="text-sm text-[#64748B]">No active alerts in your zone</p>
        </div>
      </section>
    </div>
  )
}
