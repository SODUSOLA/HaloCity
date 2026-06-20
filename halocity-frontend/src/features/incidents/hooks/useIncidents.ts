import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIncidents,
  fetchIncident,
  createIncident,
  updateIncidentStatus,
  assignIncident,
  type IncidentsListParams,
} from '@/features/incidents/api/incidents.api'
import type { CreateIncidentInput } from '@/features/incidents/types'

export function useIncidents(params?: IncidentsListParams) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => fetchIncidents(params),
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: () => fetchIncident(id),
    enabled: !!id,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateIncidentInput) => createIncident(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateIncidentStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents', id] })
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useAssignIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, mayorId }: { id: string; mayorId: string }) =>
      assignIncident(id, mayorId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents', id] })
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
