# HaloCity Backend — API Reference

Base URL: `/api/v1`

Health: `GET /health` and `GET /api/v1/health`

---

## Authentication

All endpoints require the `Authorization: Bearer <token>` header unless marked as public.

### `POST /auth/register`

Public. Creates a new user account.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "password123",
  "role": "CITIZEN"
}
```

`role` accepts `CITIZEN` (default) or `MAYOR`. Admin accounts cannot be self-registered.

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "uuid", "name": "...", "email": "...", "phone": "...", "role": "CITIZEN", "zoneId": null, "createdAt": "...", "updatedAt": "..." },
    "token": "jwt..."
  }
}
```

**Errors:** `409` Email or phone already registered.

### `POST /auth/login`

Public. Authenticates and returns a JWT.

**Request body:**
```json
{ "email": "admin@halocity.ng", "password": "HaloCity@2026" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "name": "...", "email": "...", "phone": "...", "role": "ADMIN", "zoneId": null, "createdAt": "...", "updatedAt": "..." },
    "token": "jwt..."
  }
}
```

**Errors:** `401` Invalid credentials or deactivated account.

### `GET /auth/me`

Returns the authenticated user's profile (includes `zone` relation if set).

### `GET /auth/users`

Admin only. Paginated user list.

**Query params:** `page`, `limit`, `role`, `isActive`, `zoneId`, `search`

### `GET /auth/users/:id`

Admin only. Single user detail.

### `PATCH /auth/users/:id`

Admin only. Update any user. Fields: `name`, `email`, `phone`, `role`, `isActive`, `zoneId`, `password`.

---

## Incidents

### `POST /incidents`

Create a new incident. Any authenticated user.

**Request body:**
```json
{
  "title": "Burst pipe on Main Street",
  "type": "INFRASTRUCTURE",
  "description": "Water gushing from broken pipe near junction",
  "zoneId": "uuid",
  "locationLat": 6.5244,
  "locationLng": 3.3792,
  "mediaUrls": ["https://res.cloudinary.com/..."]
}
```

`type` must be one of: `MEDICAL`, `SECURITY`, `TRAFFIC`, `INFRASTRUCTURE`.

Title must be at least 5 characters. `zoneId` must reference an active zone.

Severity is auto-classified by the backend based on keywords in the title and description.

### `GET /incidents`

List incidents. Scoped by role:

| Role | Scope |
|---|---|
| Admin | All incidents city-wide |
| mayor | Incidents in assigned zone + personally assigned incidents |
| Citizen | Own reports only |

**Query params:** `page`, `limit`, `status`, `type`, `severity`, `zoneId`

### `GET /incidents/:id`

Single incident detail. Role-scoped:
- Admin: any incident
- mayor: incidents in own zone or personally assigned
- Citizen: own reports only

Includes `zone`, `reporter`, `assignee`, and `escalationLogs`.

### `PATCH /incidents/:id/status`

mayor or Admin. Update incident status.

**Request body:**
```json
{ "status": "ACKNOWLEDGED", "note": "En route" }
```

Status transitions:

| From | To |
|---|---|
| `PENDING` | `ACKNOWLEDGED`, `IN_PROGRESS` |
| `ACKNOWLEDGED` | `IN_PROGRESS`, `RESOLVED` |
| `IN_PROGRESS` | `RESOLVED` |
| `ESCALATED` | `ACKNOWLEDGED`, `IN_PROGRESS` |
| `RESOLVED` | `CLOSED` |

Admin can perform any transition (bypasses the transition table).

When moving to `RESOLVED`, `resolvedAt` is automatically set. When moving to `ACKNOWLEDGED`, pending escalation timers are cancelled.

### `PATCH /incidents/:id/assign`

Admin only. Assign a mayor to an incident.

**Request body:**
```json
{ "mayorId": "uuid-of-mayor-user" }
```

The mayor must have role `MAYOR`. Assignment triggers:
1. Incident status → `ACKNOWLEDGED` (if currently `PENDING`)
2. WebSocket `incident:updated` to admin, citizen, zone, and assigned mayor rooms
3. SMS + WebSocket notification to the assigned mayor

---

## Zones

### `GET /zones`

List all active zones. Any authenticated user.

### `GET /zones/:id`

Single zone detail. Any authenticated user.

### `POST /zones`

Admin only. Create zone.

**Request body:**
```json
{ "name": "Zone A", "code": "ZNA", "description": "Central district", "capacity": 10 }
```

### `PATCH /zones/:id`

Admin only. Update zone fields.

### `PATCH /zones/:id/status`

Admin only. Activate/deactivate zone.

**Request body:**
```json
{ "isActive": false }
```

---

## mayors

### `GET /mayors`

Admin only. List all MAYOR users with their current active assignment and location.

### `GET /mayors/active`

Admin only. List mayors with active zone assignments (enriched with location data).

### `GET /mayors/zone/:zoneId`

Admin or mayor. List mayors assigned to a specific zone.

### `POST /mayors/assign`

Admin only. Assign a mayor to a zone.

**Request body:**
```json
{ "mayorId": "uuid", "zoneId": "uuid", "instructions": "Cover Gate A" }
```

Creates a `mayorAssignment` record, updates the user's `zoneId`, and emits a `mayor:assigned` socket event.

### `PATCH /mayors/location`

mayor only. Update own GPS location.

**Request body:**
```json
{ "lat": 6.5244, "lng": 3.3792, "accuracy": 12 }
```

Stored in both PostgreSQL (`mayorLocation`) and Redis (5-minute TTL). Emits `mayor:location_updated` to admin room.

### `GET /mayors/me`

mayor only. Get own active assignment details, zone info, and location.

### `POST /mayors/corridor`

Admin only. Dispatch a corridor alert to one or more zones.

**Request body:**
```json
{
  "message": "Clear Gate A for emergency vehicle",
  "zoneIds": ["uuid1", "uuid2"],
  "priority": "HIGH",
  "incidentId": "uuid"
}
```

Notifies mayors (SMS + WebSocket) and citizens in affected zones (WebSocket). Also emits `zone:alert` socket event.

### `PATCH /mayors/:assignmentId/end`

Admin only. End a mayor's zone assignment. Clears `User.zoneId`, removes from Redis sets.

---

## Maintenance

### `GET /maintenance/assets`

Admin or mayor. List all assets.

### `GET /maintenance/assets/:id`

Admin or mayor. Single asset detail.

### `POST /maintenance/assets`

Admin only. Create asset.

**Request body:**
```json
{
  "name": "Gate A Barrier",
  "type": "GATE",
  "zoneId": "uuid",
  "code": "GT-001",
  "description": "Main entrance gate"
}
```

### `PATCH /maintenance/assets/:id/status`

Admin or mayor. Update asset operational status.

**Request body:**
```json
{ "status": "UNDER_MAINTENANCE", "note": "Scheduled repair" }
```

### `GET /maintenance/tickets`

Admin only. List maintenance tickets.

### `GET /maintenance/tickets/:id`

Admin only. Single ticket detail.

### `POST /maintenance/tickets`

Admin only. Create maintenance ticket.

**Request body:**
```json
{
  "assetId": "uuid",
  "title": "Gate motor failure",
  "description": "Motor not responding to remote",
  "priority": "HIGH",
  "assignedToId": "uuid"
}
```

Tickets are also auto-created from `INFRASTRUCTURE` incidents.

### `PATCH /maintenance/tickets/:id`

Admin or mayor. Update ticket fields or status.

---

## Escalation Rules

### `GET /escalation/rules`

Admin only. List all escalation rules.

### `POST /escalation/rules`

Admin only. Create rule.

**Request body:**
```json
{
  "incidentType": "SECURITY",
  "severity": "CRITICAL",
  "windowSeconds": 120,
  "escalateTo": "MAYOR",
  "notifyVia": ["SMS", "WEBSOCKET"]
}
```

### `PATCH /escalation/rules/:id`

Admin only. Update rule.

### `DELETE /escalation/rules/:id`

Admin only. Delete rule.

---

## Dashboard

### `GET /dashboard/summary`

Admin only. City-wide stats: active incidents, pending, resolved today, online mayors, incidents by type, by severity.

### `GET /dashboard/incidents/live`

Admin only. Live incident feed with status, zone, and response time info.

### `GET /dashboard/mayors/map`

Admin only. mayor positions for the map view.

### `GET /dashboard/zones/density`

Admin only. Incident density by zone.

### `GET /dashboard/infrastructure`

Admin only. Infrastructure status summary (assets by zone and status).

### `GET /dashboard/escalations`

Admin only. Pending escalations.

All dashboard endpoints are Redis-cached (30-second TTL).

---

## Notifications

### `GET /notifications`

Any authenticated user. List own notifications (paginated).

### `PATCH /notifications/:id/read`

Any authenticated user. Mark one notification as read.

### `POST /notifications/read-all`

Any authenticated user. Mark all notifications as read.

---

## Upload

### `POST /upload`

Any authenticated user. Upload an image.

**Request:** `multipart/form-data` with field `file`.

Accepted formats: `jpg`, `jpeg`, `png`, `gif`, `webp`. Max size: 5MB.

**Response:**
```json
{ "success": true, "message": "Upload successful", "data": { "url": "https://res.cloudinary.com/...", "publicId": "...", "width": 800, "height": 600, "format": "jpg" } }
```

---

## WebSocket Events

Connection: Socket.IO at the server URL, auth via `{ token }`.

### Server → Client

| Event | Payload | Recipients | When |
|---|---|---|---|
| `incident:created` | `{ id, type, severity, zoneId, status, referenceCode, title, createdAt }` | Admin room + zone room | New incident reported |
| `incident:updated` | `{ id, status, assignedTo, updatedAt }` | Admin + citizen + zone + assigned mayor | Status change or assignment |
| `incident:escalated` | `{ id, previousStatus, escalatedTo, tier }` | Admin (all tiers) + zone/mayor (tier 1) | Escalation timer fires |
| `mayor:assigned` | Assignment object | Assigned mayor only | Zone assignment created |
| `mayor:location_updated` | `{ mayorId, zoneId, lat, lng }` | Admin room | mayor reports GPS |
| `zone:alert` | `{ zoneId, message, priority }` | Admin room + zone room | Corridor dispatch |

### Client → Server

| Event | Payload | Purpose |
|---|---|---|
| `join:zone` | `{ zoneId }` | Dynamically join a zone room |
| `leave:zone` | `{ zoneId }` | Leave a zone room |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [{ "field": "email", "message": "Must be a valid email" }]
}
```

| Status | Meaning |
|---|---|
| `400` | Validation error |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email/phone) |
| `429` | Rate limited |
| `500` | Internal server error |

---

## Queue Monitoring

Bull Board UI available at `/admin/queues` (no auth — restrict in production via firewall or VPN).
