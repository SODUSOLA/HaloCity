import { useQuery, useMutation } from '@tanstack/react-query'
import {
  fetchMarshals,
  fetchActiveMarshals,
  fetchMarshalsByZone,
  updateMarshalLocation,
} from '@/features/marshals/api/marshals.api'

export function useMarshals() {
  return useQuery({
    queryKey: ['marshals'],
    queryFn: fetchMarshals,
  })
}

export function useActiveMarshals() {
  return useQuery({
    queryKey: ['marshals', 'active'],
    queryFn: fetchActiveMarshals,
  })
}

export function useMarshalsByZone(zoneId: string) {
  return useQuery({
    queryKey: ['marshals', 'zone', zoneId],
    queryFn: () => fetchMarshalsByZone(zoneId),
    enabled: !!zoneId,
  })
}

export function useUpdateLocation() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      updateMarshalLocation(lat, lng),
  })
}
