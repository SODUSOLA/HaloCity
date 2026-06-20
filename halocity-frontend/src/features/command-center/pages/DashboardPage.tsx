import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  fetchDashboardSummary,
  fetchLiveIncidents,
} from '@/features/incidents/api/incidents.api'
import { fetchZones } from '@/features/incidents/api/incidents.api'
import { IncidentRow } from '@/features/incidents/components/IncidentRow'
import { KPISkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import { isToday } from '@/shared/lib/geo'

const CHART_COLORS = {
  primary: '#1E40AF',
  success: '#059669',
  warning: '#D97706',
  critical: '#DC2626',
  slate: '#94A3B8',
}

export default function DashboardPage() {
  const summary = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
  })

  const live = useQuery({
    queryKey: ['dashboard', 'incidents', 'live'],
    queryFn: fetchLiveIncidents,
  })

  const zones = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
  })

  const isLoading = summary.isLoading || live.isLoading

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Command Dashboard</h1>
        <KPISkeleton />
      </div>
    )
  }

  if (summary.isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Command Dashboard</h1>
        <ErrorState onRetry={() => summary.refetch()} />
      </div>
    )
  }

  const s = summary.data as {
    totalActiveIncidents?: number
    activeMarshals?: number
    openTickets?: number
    byType?: { type: string; _count: { id: number } }[]
    bySeverity?: { severity: string; _count: { id: number } }[]
  } | undefined
  const liveIncidents: any[] = Array.isArray(live.data) ? live.data : []
  const zoneData: any[] = Array.isArray(zones.data) ? zones.data : []

  const resolvedToday = liveIncidents.filter(
    (i) => i.status === 'RESOLVED' && isToday(i.resolvedAt || i.updatedAt),
  ).length

  const byStatus = [
    { name: 'Pending', count: liveIncidents.filter((i) => i.status === 'PENDING').length },
    { name: 'In Progress', count: liveIncidents.filter((i) => i.status === 'IN_PROGRESS').length },
    { name: 'Resolved', count: liveIncidents.filter((i) => i.status === 'RESOLVED').length },
    { name: 'Escalated', count: liveIncidents.filter((i) => i.status === 'ESCALATED').length },
  ].filter((d) => d.count > 0)

  const byType = (s?.byType || []).map((item) => ({
    type: item.type,
    count: item._count.id,
  }))
  const bySeverity = (s?.bySeverity || []).map((item) => ({
    severity: item.severity,
    count: item._count.id,
  }))

  const activityItems = liveIncidents
    .filter((i) => i.status !== 'CLOSED')
    .slice(0, 5)

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold text-[#0F172A]">Command Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-[#64748B]">Active Incidents</p>
          <p className="mt-1 text-3xl font-bold text-[#0F172A]">
            {s?.totalActiveIncidents ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-[#64748B]">Pending</p>
          <p className="mt-1 text-3xl font-bold text-warning">
            {liveIncidents.filter((i) => i.status === 'PENDING').length}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-[#64748B]">Resolved Today</p>
          <p className="mt-1 text-3xl font-bold text-success">
            {resolvedToday}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-[#64748B]">Online Marshals</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {s?.activeMarshals ?? 0}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            By Type
          </h2>
          {byType.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#94A3B8]">No data</p>
          )}
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            By Severity
          </h2>
          {bySeverity.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bySeverity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="severity" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {bySeverity.map((entry: { severity: string }) => {
                    let color = CHART_COLORS.primary
                    if (entry.severity === 'CRITICAL') color = CHART_COLORS.critical
                    else if (entry.severity === 'HIGH') color = CHART_COLORS.warning
                    else if (entry.severity === 'LOW') color = CHART_COLORS.success
                    return <Cell key={entry.severity} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#94A3B8]">No data</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            By Status
          </h2>
          {byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {byStatus.map((entry: { name: string }) => {
                    let color = CHART_COLORS.slate
                    if (entry.name === 'Pending') color = CHART_COLORS.warning
                    else if (entry.name === 'In Progress') color = CHART_COLORS.primary
                    else if (entry.name === 'Resolved') color = CHART_COLORS.success
                    else if (entry.name === 'Escalated') color = CHART_COLORS.critical
                    return <Cell key={entry.name} fill={color} />
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#94A3B8]">No data</p>
          )}
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Zone Overview
          </h2>
          <div className="space-y-2">
            {zoneData.length > 0 ? (
              zoneData.slice(0, 6).map((zone: { id: string; name: string; code?: string }) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2"
                >
                  <span className="font-mono text-xs text-[#64748B]">
                    {zone.code || zone.name}
                  </span>
                  <span className="text-xs text-[#94A3B8]">{zone.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#94A3B8]">No zones loaded</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          City Activity
        </h2>
        {activityItems.length > 0 ? (
          <div className="space-y-2">
            {activityItems.map((inc: any) => (
              <IncidentRow key={inc.id} incident={inc} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#94A3B8]">No recent activity</p>
        )}
      </div>
    </div>
  )
}
