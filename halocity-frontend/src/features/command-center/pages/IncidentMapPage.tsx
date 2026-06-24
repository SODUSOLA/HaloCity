import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { fetchLiveIncidents } from '@/features/incidents/api/incidents.api'
import { CardSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import type { Incident } from '@/shared/types'

function CenterOnIncidents({ incidents }: { incidents: Incident[] }) {
  const map = useMap()
  useMemo(() => {
    if (incidents.length === 0) return
    const bounds = L.latLngBounds(
      incidents.map((i) => [i.locationLat!, i.locationLng!]),
    )
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
  }, [incidents, map])
  return null
}

function SeverityIcon({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    CRITICAL: '#DC2626',
    HIGH: '#D97706',
    MEDIUM: '#1E40AF',
    LOW: '#059669',
  }
  return L.divIcon({
    className: '',
    html: `<div style="background:${colors[severity] || '#94A3B8'};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold">!</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function IncidentMarkers({ incidents }: { incidents: Incident[] }) {
  return (
    <>
      {incidents.map((inc) => (
        <Marker
          key={inc.id}
          position={[inc.locationLat!, inc.locationLng!]}
          icon={SeverityIcon({ severity: inc.severity })}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1.5">
              <p className="text-xs font-mono text-muted-foreground">{inc.referenceCode}</p>
              <p className="text-sm font-medium text-foreground">{inc.title || inc.type.replace('_', ' ')}</p>
              <p className="text-xs text-muted-foreground">{inc.zone?.name || 'Unknown'}</p>
              <div className="flex gap-1">
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">{inc.severity}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{inc.status.replace('_', ' ')}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default function IncidentMapPage() {
  const [showMayors, setShowMayors] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null)

  const live = useQuery({
    queryKey: ['dashboard', 'incidents', 'live'],
    queryFn: fetchLiveIncidents,
  })

  const isLoading = live.isLoading

  if (isLoading) {
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

  const allIncidents: Incident[] = (live.data as any)?.data || []

  const withCoords = allIncidents.filter(
    (i) => i.locationLat != null && i.locationLng != null,
  )

  const filtered = filterSeverity
    ? withCoords.filter((i) => i.severity === filterSeverity)
    : withCoords

  const center: [number, number] =
    filtered.length > 0
      ? [filtered[0]!.locationLat!, filtered[0]!.locationLng!]
      : [6.5244, 3.3792]

  const severityCounts = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => ({
    severity: s,
    count: withCoords.filter((i) => i.severity === s).length,
  }))

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
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-surface-alt text-muted-foreground hover:bg-border'
              }`}
            >
              {severity} ({count})
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showMayors}
            onChange={() => setShowMayors((v) => !v)}
          />
          Show Mayors
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
            <CenterOnIncidents incidents={filtered} />
            <IncidentMarkers incidents={filtered} />
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
