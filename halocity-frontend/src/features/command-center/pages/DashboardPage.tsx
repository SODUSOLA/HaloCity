import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
  simulateIncident,
  clearAllIncidents,
  dispatchCorridor,
  fetchHourlyAnalytics,
  fetchZoneHeat,
  fetchResponseTimes,
} from '@/features/incidents/api/incidents.api'
import { fetchZones } from '@/features/incidents/api/incidents.api'
import { IncidentRow } from '@/features/incidents/components/IncidentRow'
import { KPISkeleton, CardSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import { isToday } from '@/shared/lib/geo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CHART_COLORS = {
  primary: '#1E40AF',
  success: '#059669',
  warning: '#D97706',
  critical: '#DC2626',
  slate: '#94A3B8',
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const [simulating, setSimulating] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [corridorOpen, setCorridorOpen] = useState(false)
  const [corridorZoneIds, setCorridorZoneIds] = useState<string[]>([])
  const [corridorMessage, setCorridorMessage] = useState('')
  const [corridorPriority, setCorridorPriority] = useState('HIGH')
  const [corridorSending, setCorridorSending] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const hourly = useQuery({
    queryKey: ['analytics', 'hourly'],
    queryFn: fetchHourlyAnalytics,
    enabled: showAnalytics,
  })

  const zoneHeat = useQuery({
    queryKey: ['analytics', 'zone-heat'],
    queryFn: fetchZoneHeat,
    enabled: showAnalytics,
  })

  const responseTimes = useQuery({
    queryKey: ['analytics', 'response-times'],
    queryFn: fetchResponseTimes,
    enabled: showAnalytics,
  })

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

  const isLoading = summary.isLoading || live.isLoading || zones.isLoading

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Command Dashboard</h1>
        <KPISkeleton />
      </div>
    )
  }

  if (summary.isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Command Dashboard</h1>
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

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const inc = await simulateIncident()
      toast.success(`Simulated ${inc.type} incident: ${inc.referenceCode}`)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    } catch {
      toast.error('Failed to simulate incident')
    } finally {
      setSimulating(false)
    }
  }

  const handleClearAll = async () => {
    setClearing(true)
    try {
      const res = await clearAllIncidents()
      toast.success(`Closed ${res.closed} active incidents`)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    } catch {
      toast.error('Failed to clear incidents')
    } finally {
      setClearing(false)
    }
  }

  const handleCorridorSend = async () => {
    if (!corridorMessage || corridorZoneIds.length === 0) return
    setCorridorSending(true)
    try {
      await dispatchCorridor({
        zoneIds: corridorZoneIds,
        message: corridorMessage,
        priority: corridorPriority,
      })
      toast.success('Corridor instruction dispatched')
      setCorridorOpen(false)
      setCorridorMessage('')
      setCorridorZoneIds([])
      setCorridorPriority('HIGH')
    } catch {
      toast.error('Failed to dispatch corridor instruction')
    } finally {
      setCorridorSending(false)
    }
  }

  const toggleZone = (id: string) => {
    setCorridorZoneIds((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id],
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold text-foreground">Command Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Active Incidents</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {s?.totalActiveIncidents ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 text-3xl font-bold text-warning">
            {liveIncidents.filter((i) => i.status === 'PENDING').length}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Resolved Today</p>
          <p className="mt-1 text-3xl font-bold text-success">
            {resolvedToday}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Online Mayors</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {s?.activeMarshals ?? 0}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleSimulate} disabled={simulating}>
          {simulating ? 'Simulating...' : 'Simulate Incident'}
        </Button>
        <Button size="sm" variant="outline" onClick={handleClearAll} disabled={clearing}>
          {clearing ? 'Clearing...' : 'Clear All'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setCorridorOpen(true)}>
          Clear Corridor
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
            <p className="text-sm text-muted-foreground/60">No data</p>
          )}
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
            <p className="text-sm text-muted-foreground/60">No data</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
            <p className="text-sm text-muted-foreground/60">No data</p>
          )}
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Zone Overview
          </h2>
          <div className="space-y-2">
            {zoneData.length > 0 ? (
              zoneData.slice(0, 6).map((zone: { id: string; name: string; code?: string }) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {zone.code || zone.name}
                  </span>
                  <span className="text-xs text-muted-foreground/60">{zone.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground/60">No zones loaded</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          City Activity
        </h2>
        {activityItems.length > 0 ? (
          <div className="space-y-2">
            {activityItems.map((inc: any) => (
              <IncidentRow key={inc.id} incident={inc} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/60">No recent activity</p>
        )}
      </div>

      <div className="rounded-lg border border-border p-4">
        <button
          onClick={() => setShowAnalytics((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Analytics
          </h2>
          <span className="text-xs text-muted-foreground">
            {showAnalytics ? 'Hide' : 'Show'}
          </span>
        </button>

        {showAnalytics && (
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                Incidents per Hour (24h)
              </h3>
              {hourly.isLoading ? (
                <CardSkeleton />
              ) : hourly.data ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={hourly.data as { hour: string; count: number }[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 9 }}
                      tickFormatter={(v: string) => v.slice(11, 16)}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground/60">No data</p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">Zone Heat</h3>
              {zoneHeat.isLoading ? (
                <CardSkeleton />
              ) : zoneHeat.data ? (
                <div className="space-y-1">
                  {(zoneHeat.data as { zoneName: string; heatIndex: number; activeIncidents: number }[])
                    .slice(0, 8)
                    .map((z) => (
                      <div key={z.zoneName} className="flex items-center gap-3">
                        <span className="w-24 text-xs text-muted-foreground truncate">{z.zoneName}</span>
                        <div className="flex-1 rounded-full bg-surface-alt h-2">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.min(100, z.heatIndex * 10)}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-muted-foreground/60">
                          {z.activeIncidents}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60">No data</p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                Response Times
              </h3>
              {responseTimes.isLoading ? (
                <CardSkeleton />
              ) : responseTimes.data ? (
                (() => {
                  const rt = responseTimes.data as { overall: { avg: number | null; min: number | null; max: number | null } }
                  return (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-md bg-surface-alt p-3 text-center">
                        <p className="text-lg font-bold text-foreground">
                          {rt.overall.avg !== null ? `${rt.overall.avg}m` : '--'}
                        </p>
                        <p className="text-xs text-muted-foreground">Average</p>
                      </div>
                      <div className="rounded-md bg-surface-alt p-3 text-center">
                        <p className="text-lg font-bold text-success">
                          {rt.overall.min !== null ? `${rt.overall.min}m` : '--'}
                        </p>
                        <p className="text-xs text-muted-foreground">Fastest</p>
                      </div>
                      <div className="rounded-md bg-surface-alt p-3 text-center">
                        <p className="text-lg font-bold text-warning">
                          {rt.overall.max !== null ? `${rt.overall.max}m` : '--'}
                        </p>
                        <p className="text-xs text-muted-foreground">Slowest</p>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <p className="text-xs text-muted-foreground/60">No resolved incidents yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={corridorOpen} onOpenChange={setCorridorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear Corridor</DialogTitle>
            <DialogDescription>
              Dispatch an alert to selected zones. All mayors and citizens in the zone will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Target Zones
              </label>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {zoneData.map((zone: { id: string; name: string; code?: string }) => (
                  <label
                    key={zone.id}
                    className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface-alt cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={corridorZoneIds.includes(zone.id)}
                      onChange={() => toggleZone(zone.id)}
                      className="rounded border-border"
                    />
                    {zone.code || zone.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Message
              </label>
              <Textarea
                placeholder="e.g. All mayors report to sector 4..."
                value={corridorMessage}
                onChange={(e) => setCorridorMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Priority
              </label>
              <Select value={corridorPriority} onValueChange={setCorridorPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCorridorOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCorridorSend}
              disabled={corridorSending || corridorZoneIds.length === 0 || !corridorMessage.trim()}
            >
              {corridorSending ? 'Dispatching...' : 'Dispatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
