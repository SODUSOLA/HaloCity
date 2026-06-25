import { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { fetchLiveIncidents, fetchMarshalMap } from '@/features/incidents/api/incidents.api'
import { CardSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import type { Incident } from '@/shared/types'

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH: '#D97706',
  MEDIUM: '#2563EB',
  LOW: '#059669',
}

const SEVERITY_LABELS: Record<string, string> = { CRITICAL: 'Crit', HIGH: 'High', MEDIUM: 'Med', LOW: 'Low' }

function createSeverityIcon(severity: string) {
  const color = SEVERITY_COLORS[severity] || '#94A3B8'
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:700;line-height:1">${SEVERITY_LABELS[severity] || '?'}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function createMayorIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="background:#6366F1;width:20px;height:20px;border-radius:4px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700">M</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

function FitBounds({ items }: { items: { lat: number; lng: number }[] }) {
  const map = useMap()
  useEffect(() => {
    if (items.length === 0) return
    const bounds = L.latLngBounds(items.map((p) => [p.lat, p.lng]))
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [items, map])
  return null
}

export default function IncidentMapPage() {
  const [showMayors, setShowMayors] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null)

  const live = useQuery({
    queryKey: ['dashboard', 'incidents', 'live'],
    queryFn: fetchLiveIncidents,
  })

  const marshalQuery = useQuery({
    queryKey: ['dashboard', 'marshals', 'map'],
    queryFn: fetchMarshalMap,
    enabled: showMayors,
  })

  if (live.isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Incident Map</h1>
        <CardSkeleton />
      </div>
    )
  }

  if (live.isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Incident Map</h1>
        <ErrorState onRetry={() => live.refetch()} />
      </div>
    )
  }

  const rawIncidents: Incident[] = (live.data as any)?.data ?? live.data ?? []
  const mayors = (marshalQuery.data as any[]) ?? []

  const withCoords = rawIncidents.filter(
    (i): i is Incident & { locationLat: number; locationLng: number } =>
      i.locationLat != null && i.locationLng != null,
  )

  const filtered = filterSeverity
    ? withCoords.filter((i) => i.severity === filterSeverity)
    : withCoords

  const visibleMayors = showMayors
    ? mayors.filter((m: any) => m.lat != null && m.lng != null)
    : []

  const center: [number, number] =
    filtered.length > 0
      ? [filtered[0]!.locationLat!, filtered[0]!.locationLng!]
      : [6.4531, 3.3958]

  const severityCounts = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => ({
    severity: s,
    count: withCoords.filter((i) => i.severity === s).length,
  }))

  const mayorPoints = useMemo(
    () => visibleMayors.map((m: any) => ({ lat: m.lat, lng: m.lng })),
    [visibleMayors],
  )

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Incident Map</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {severityCounts.map(({ severity, count }) => (
            <button
              key={severity}
              onClick={() =>
                setFilterSeverity(filterSeverity === severity ? null : severity)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterSeverity === severity
                  ? 'bg-foreground text-background'
                  : 'bg-surface-alt text-muted-foreground hover:bg-border'
              }`}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[severity] }}
              />
              {severity} ({count})
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-surface-alt">
          <input
            type="checkbox"
            checked={showMayors}
            onChange={() => setShowMayors((v) => !v)}
            className="h-3.5 w-3.5"
          />
          Show Mayors ({mayors.length})
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds
              items={[
                ...filtered.map((i) => ({ lat: i.locationLat, lng: i.locationLng })),
                ...mayorPoints,
              ]}
            />

            {filtered.map((inc) => (
              <Marker
                key={inc.id}
                position={[inc.locationLat, inc.locationLng]}
                icon={createSeverityIcon(inc.severity)}
              >
                <Popup>
                  <div className="min-w-[200px] space-y-1.5">
                    <p className="text-xs font-mono text-muted-foreground">{inc.referenceCode}</p>
                    <p className="text-sm font-medium text-foreground">{inc.title || inc.type.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{inc.zone?.name || 'Unknown zone'}</p>
                    <div className="flex flex-wrap gap-1">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: SEVERITY_COLORS[inc.severity] || '#94A3B8' }}
                      >
                        {inc.severity}
                      </span>
                      <span className="rounded bg-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {inc.status.replace('_', ' ')}
                      </span>
                    </div>
                    {(inc as any).assignee?.name && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="inline-block h-1.5 w-1.5 rounded-sm bg-indigo-400" />
                        {(inc as any).assignee.name}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {visibleMayors.map((m: any) => (
              <Marker key={m.mayorId} position={[m.lat, m.lng]} icon={createMayorIcon()}>
                <Popup>
                  <div className="min-w-[160px] space-y-1">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.zoneName}</p>
                    {m.lastSeen && (
                      <p className="text-[10px] text-muted-foreground/60">
                        Updated {new Date(m.lastSeen).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="rounded-lg border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {withCoords.length === 0
              ? 'No incidents with location data'
              : 'No incidents match the selected filter'}
          </p>
        </div>
      )}
    </div>
  )
}
