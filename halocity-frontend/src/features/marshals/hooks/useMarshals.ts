import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMarshals,
  fetchActiveMarshals,
  fetchMarshalsByZone,
  updateMarshalLocation,
  assignMarshalToZone,
  endMarshalAssignment,
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

export function useAssignMarshalToZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ mayorId, zoneId }: { mayorId: string; zoneId: string }) =>
      assignMarshalToZone(mayorId, zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marshals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useEndMarshalAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: string) => endMarshalAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marshals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
