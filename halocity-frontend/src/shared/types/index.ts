export type Role = 'CITIZEN' | 'MAYOR' | 'ADMIN'

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type IncidentStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED'

export type IncidentType = 'MEDICAL' | 'SECURITY' | 'TRAFFIC' | 'INFRASTRUCTURE'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  zoneId?: string | null
  zone?: Zone | null
  createdAt: string
  updatedAt: string
}

export interface Zone {
  id: string
  name: string
  code: string
  description?: string | null
  isActive: boolean
  lat?: number | null
  lng?: number | null
  createdAt: string
  updatedAt: string
}

export interface Incident {
  id: string
  referenceCode: string
  type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  title?: string
  description: string
  locationLat: number
  locationLng: number
  mediaUrls: string[]
  reporterId?: string | null
  reporter?: User | null
  assignedToId?: string | null
  assignedTo?: User | null
  zoneId?: string | null
  zone?: Zone | null
  resolvedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Marshal {
  id: string
  user: User
  zoneId: string
  zone: Zone
  isActive: boolean
  lastLocationLat?: number | null
  lastLocationLng?: number | null
  lastLocationAt?: string | null
  currentIncidentId?: string | null
}

export type MarshalAvailability = 'available' | 'busy' | 'offline'

export interface Asset {
  id: string
  name: string
  type: string
  status: string
  zoneId: string
  zone: Zone
}

export interface MaintenanceTicket {
  id: string
  ticketCode: string
  assetId: string
  asset: Asset
  priority: string
  status: string
  description: string
  assignedTeam?: string | null
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  readAt?: string | null
  createdAt: string
}

export interface DashboardSummary {
  activeIncidents: number
  pendingIncidents: number
  resolvedToday: number
  onlineMarshals: number
  incidentsByType: { type: string; count: number }[]
  incidentsBySeverity: { severity: string; count: number }[]
}

export interface ZoneDensity {
  zoneId: string
  zoneName: string
  incidentCount: number
  marshalCount: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface AuthResponse {
  user: User
  token: string
}
