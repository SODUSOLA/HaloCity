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
  const { data } = await api.get('/notifications')
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
