import api from '@/shared/lib/api'
import type { Incident } from '@/shared/types'
import type { CreateIncidentInput } from '@/features/incidents/types'

export interface IncidentsListParams {
  page?: number
  limit?: number
  status?: string
  type?: string
  severity?: string
  zoneId?: string
}

export async function fetchIncidents(params?: IncidentsListParams): Promise<Incident[]> {
  const { data } = await api.get<Incident[]>('/incidents', { params })
  return data
}

export async function fetchIncident(id: string): Promise<Incident> {
  const { data } = await api.get<Incident>(`/incidents/${id}`)
  return data
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  const { data } = await api.post<Incident>('/incidents', input)
  return data
}

export async function updateIncidentStatus(id: string, status: string): Promise<Incident> {
  const { data } = await api.patch<Incident>(`/incidents/${id}/status`, { status })
  return data
}

export async function assignIncident(id: string, mayorId: string): Promise<Incident> {
  const { data } = await api.patch<Incident>(`/incidents/${id}/assign`, { mayorId })
  return data
}

export async function fetchDashboardSummary() {
  const { data } = await api.get('/dashboard/summary')
  return data
}

export async function fetchLiveIncidents() {
  const { data } = await api.get('/dashboard/incidents/live')
  return data
}

export async function fetchNotifications() {
  const { data } = await api.get('/notifications', { params: { channel: 'WEBSOCKET' } })
  return data
}

export async function fetchZones() {
  const { data } = await api.get('/zones')
  return data
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<{ url: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

// Escalation Rules
export async function fetchEscalationRules() {
  const { data } = await api.get('/escalation/rules')
  return data
}

export async function createEscalationRule(rule: {
  incidentType?: string | null
  severity?: string | null
  windowSeconds: number
  escalateTo: string
  notifyVia?: string[]
  isActive?: boolean
}) {
  const { data } = await api.post('/escalation/rules', rule)
  return data
}

export async function updateEscalationRule(id: string, rule: Record<string, unknown>) {
  const { data } = await api.patch(`/escalation/rules/${id}`, rule)
  return data
}

export async function deleteEscalationRule(id: string) {
  const { data } = await api.delete(`/escalation/rules/${id}`)
  return data
}

// Analytics
export async function fetchHourlyAnalytics() {
  const { data } = await api.get('/analytics/hourly')
  return data
}

export async function fetchZoneHeat() {
  const { data } = await api.get('/analytics/zone-heat')
  return data
}

export async function fetchResponseTimes() {
  const { data } = await api.get('/analytics/response-times')
  return data
}

// Demo / Simulation
export async function simulateIncident() {
  const { data } = await api.post('/demo/simulate-incident')
  return data
}

export async function clearAllIncidents() {
  const { data } = await api.post('/demo/clear')
  return data
}

// Corridor dispatch
export async function dispatchCorridor(payload: {
  zoneIds: string[]
  message: string
  priority?: string
  incidentId?: string
}) {
  const { data } = await api.post('/marshals/corridor', payload)
  return data
}
