import { Link } from 'react-router-dom'
import { FileText, AlertTriangle, ClipboardList, Plus, Ambulance, CheckCircle2, Clock, ShieldAlert, ShieldCheck, Shield, Activity } from 'lucide-react'
import { useAuth } from '@/shared/stores/AuthContext'
import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { IncidentRow } from '@/features/incidents/components/IncidentRow'
import { KPISkeleton } from '@/shared/components/LoadingSkeletons'
import { getGreeting } from '@/shared/lib/geo'
import { cn } from '@/shared/lib/utils'

export default function HomePage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const { data: incidents, isLoading } = useIncidents()

  const zoneActiveCount = incidents?.filter(
    (i) => i.zoneId === user?.zoneId && i.status !== 'RESOLVED' && i.status !== 'CLOSED',
  ).length || 0

  const totalReports = incidents?.length || 0
  const pendingCount = incidents?.filter((i) => i.status === 'PENDING').length || 0
  const resolvedCount = incidents?.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length || 0

  const recentReports = incidents?.slice(0, 3) || []

  const safetyBanner = () => {
    if (!user?.zoneId) return null
    let icon = ShieldCheck
    let color = 'text-success bg-success/10 border-success/20'
    let text = 'Your Zone is Clear'
    if (zoneActiveCount >= 1 && zoneActiveCount <= 2) {
      icon = Shield
      color = 'text-warning bg-warning/10 border-warning/20'
      text = 'Low Activity in Your Zone'
    } else if (zoneActiveCount >= 3 && zoneActiveCount <= 5) {
      icon = Activity
      color = 'text-orange-500 bg-orange-50 border-orange-200'
      text = 'Moderate Activity in Your Zone'
    } else if (zoneActiveCount >= 6) {
      icon = ShieldAlert
      color = 'text-critical bg-critical-light border-critical/20'
      text = 'High Activity — Stay Alert'
    }
    const Icon = icon
    return (
      <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium', color)}>
        <Icon className="h-4 w-4" />
        {text} ({zoneActiveCount} active)
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <section>
        <h1 className="text-xl font-semibold text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.zone ? `Zone: ${user.zone.name}` : 'Stay informed about your community'}
        </p>
      </section>

      {safetyBanner()}

      {isLoading ? (
        <KPISkeleton count={3} />
      ) : (
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              Total
            </div>
            <p className="text-2xl font-bold text-foreground">{totalReports}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Pending
            </div>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              Resolved
            </div>
            <p className="text-2xl font-bold text-success">{resolvedCount}</p>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <Link
          to="/app/report?type=MEDICAL"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-critical/20 bg-critical-light p-4 text-sm font-semibold text-critical-text transition-colors hover:opacity-90"
        >
          <Ambulance className="h-6 w-6" />
          EMERGENCY
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/app/report"
            className="flex flex-col items-center gap-2 rounded-lg border border-primary/20 bg-primary-light p-4 text-center text-xs font-medium text-primary-text transition-colors hover:opacity-80"
          >
            <Plus className="h-5 w-5" />
            Report Incident
          </Link>
          <Link
            to="/app/reports"
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-alt p-4 text-center text-xs font-medium text-muted-foreground transition-colors hover:opacity-80"
          >
            <ClipboardList className="h-5 w-5" />
            View Reports
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
            <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">No reports yet</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Active Alerts
        </h2>
        <div className="rounded-lg border border-border p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">No active alerts in your zone</p>
        </div>
      </section>
    </div>
  )
}
