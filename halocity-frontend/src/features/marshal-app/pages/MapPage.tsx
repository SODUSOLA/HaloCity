import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { CardSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import { Badge } from '@/shared/components/Badge'
import type { Incident } from '@/shared/types'

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = defaultIcon

const DEFAULT_ZOOM = 12

export default function MapPage() {
  const { data: incidents, isLoading, isError, refetch } = useIncidents()

  const withCoords = useMemo(
    () => (incidents || []).filter((i) => i.locationLat != null && i.locationLng != null),
    [incidents],
  )

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-lg font-semibold text-foreground">Map</h1>
        <CardSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4">
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-foreground">Map</h1>

      <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface-alt p-3 text-xs text-muted-foreground">
        <span>{withCoords.length} incident(s) with location data</span>
      </div>

      {withCoords.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {(() => {
            const first = withCoords[0]!
            const center: [number, number] = [first.locationLat!, first.locationLng!]
            return (
              <MapContainer
                center={center}
                zoom={DEFAULT_ZOOM}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                  {withCoords.map((inc: Incident) => (
                  <Marker key={inc.id} position={[inc.locationLat!, inc.locationLng!]}>
                    <Popup>
                      <div className="min-w-[180px] space-y-2">
                        <p className="text-xs font-mono text-muted-foreground">{inc.referenceCode}</p>
                        <p className="text-sm font-medium text-foreground">
                          {inc.type.charAt(0) + inc.type.slice(1).toLowerCase().replace('_', ' ')}
                        </p>
                        <div className="flex gap-1">
                          <Badge variant="severity" value={inc.severity} />
                          <Badge variant="status" value={inc.status} />
                        </div>
                        {inc.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{inc.description}</p>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${inc.locationLat},${inc.locationLng}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                        >
                          <MapPin className="h-3 w-3" />
                          Get Directions
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )
          })()}
        </div>
      ) : (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No incidents with location data</p>
        </div>
      )}
    </div>
  )
}
