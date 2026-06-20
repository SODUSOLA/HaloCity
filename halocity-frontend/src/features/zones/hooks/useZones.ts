import { useQuery } from '@tanstack/react-query'
import { fetchZonesList, fetchZoneDetail } from '@/features/zones/api/zones.api'

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: fetchZonesList,
  })
}

export function useZone(id: string) {
  return useQuery({
    queryKey: ['zones', id],
    queryFn: () => fetchZoneDetail(id),
    enabled: !!id,
  })
}
