import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIncidents,
  fetchIncident,
  createIncident,
  updateIncidentStatus,
  assignIncident,
  fetchEscalationRules,
  createEscalationRule,
  updateEscalationRule,
  deleteEscalationRule,
  type IncidentsListParams,
} from '@/features/incidents/api/incidents.api'
import type { CreateIncidentInput } from '@/features/incidents/types'

export function useIncidents(params?: IncidentsListParams) {
  return useQuery({
    queryKey: params ? ['incidents', params] : ['incidents'],
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

export function useEscalationRules() {
  return useQuery({
    queryKey: ['escalation-rules'],
    queryFn: fetchEscalationRules,
  })
}

export function useCreateEscalationRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createEscalationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] })
    },
  })
}

export function useUpdateEscalationRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      updateEscalationRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] })
    },
  })
}

export function useDeleteEscalationRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEscalationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] })
    },
  })
}
