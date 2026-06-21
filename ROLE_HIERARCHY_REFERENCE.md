# HaloCity — Role Hierarchy Reference

> Identity, data scope, permissions, real-time channels, and explicit boundaries for each role.

---

## Admin (Command Dashboard)

### Identity & Access

Admin accounts are seeded or internally created only — never self-registered. This is a deliberate security boundary: if registration allowed an "Admin" option, anyone could self-elevate to full city visibility.

**JWT payload:** `{ id, role: ADMIN, zoneId: null }` — admin isn't tied to any single zone, by design.

### Data Visibility

No `WHERE` filter on anything. Every incident, every zone, every mayor, every maintenance ticket, every escalation rule, city-wide, with no scoping at all.

### Permissions by Module

| Module | Capability |
|---|---|
| Incidents | View all, update any status transition (not just the sequential ones mayors are limited to), assign a mayor to any incident |
| Zones | Full CRUD — create, edit, activate/deactivate |
| mayors | Assign mayors to zones, assign mayors to specific incidents, dispatch corridor alerts to one or more zones |
| Maintenance | Full CRUD on assets and tickets |
| Escalation Rules | Full CRUD — controls the timing windows that drive the entire auto-escalation engine |
| Dashboard | Only role with access to all 6 aggregation endpoints (summary, live feed, mayor map, zone density, infrastructure status, pending escalations) |

### Real-Time Channel

Joins the `admin` room only — but that one room receives everything: every `incident:created`, every `incident:updated`, every `incident:escalated`, mayor location pings, corridor dispatch confirmations.

**Receives:** Tier-2 escalation notices — the backstop. If a mayor doesn't acknowledge an incident in time, it doesn't just sit there; it routes specifically to admin.

### Explicit Boundaries

None within the system — admin is the superuser. The only restriction is at the account-creation layer: the role can't be self-assigned through public registration.

---

## Mayor

### Identity & Access

Self-registerable (role selector: Citizen or mayor) or admin-assigned.

**JWT payload:** `{ id, role: MAYOR, zoneId }` — zoneId populates once admin assigns them to a zone; before that, it's effectively unset.

### Data Visibility

Zone-scoped: `WHERE zoneId = user.zoneId`. A mayor sees every incident in their assigned zone, not just ones personally assigned to them — zone visibility and personal assignment are two separate, stacked layers of access.

### Permissions by Module

| Module | Capability |
|---|---|
| Incidents | View zone incidents, move status forward (Acknowledge → In Progress → Resolved) — cannot assign mayors, cannot view incidents in other zones |
| Zones | Read-only view of their own zone's detail |
| Location | Continuously updates own GPS position — independent of any incident |
| Maintenance | Can update asset status within their zone; cannot create tickets manually (those are either admin-created or auto-generated from infrastructure incidents) |
| Escalation Rules | No access |
| Dashboard | No access — mayors have no aggregate/city-wide view at all |

### Real-Time Channels

Two, simultaneously: `mayor:{mayorId}` (personal — assignment notices, direct instructions) and `zone:{zoneId}` (shared with every other mayor in that zone — new incidents, corridor alerts).

**Receives:** Tier-1 escalation notices (zone-scoped, the first line of response), personal assignment notifications, corridor-clearing instructions.

### Explicit Boundaries

Cannot see incidents outside their zone, cannot see the maintenance ticket list (only individual asset status), cannot see any dashboard aggregate, cannot manage other users, cannot assign other mayors, cannot skip status transitions (the backend enforces the sequence — a mayor can't jump straight from Pending to Resolved).

---

## Citizen

### Identity & Access

Self-registerable, default role.

**JWT payload:** `{ id, role: CITIZEN, zoneId: null }` — citizens are never permanently tied to a zone; they select or auto-detect a zone per individual report instead.

### Data Visibility

Strictly their own: `WHERE reporterId = user.id`. Zero visibility into anyone else's reports, any zone-wide data, or any mayor/admin activity beyond what's reflected back on their own report's status.

### Permissions by Module

| Module | Capability |
|---|---|
| Incidents | Create (4 types), view own report status/timeline — cannot update status, cannot acknowledge their own report, cannot cancel it, cannot reassign or escalate it manually |
| Zones | Read access only, to populate the zone selector on the report form |
| Everything else | No access — no mayors module, no maintenance, no escalation rules, no dashboard |

### Real-Time Channel

Joins `citizen:{userId}` only — a private channel that receives nothing but updates to their own reports, plus general zone alerts admin broadcasts.

**Receives:** Status change notifications on their own reports, general zone alerts (not personally targeted — same broadcast every citizen in that zone gets).

### Explicit Boundaries

Cannot see who's assigned to handle their incident, only that it's been acknowledged/is in progress/resolved. Cannot see other citizens' reports even in the same zone. Cannot influence severity classification — that's entirely backend logic, no manual override available to a citizen.

---

## Full Permission Matrix

| Capability | Admin | mayor | Citizen |
|---|---|---|---|
| View own incidents | ✅ | ✅ | ✅ |
| View zone-wide incidents | ✅ | ✅ (own zone only) | ❌ |
| View city-wide incidents | ✅ | ❌ | ❌ |
| Create incident | ✅ | ✅ | ✅ |
| Acknowledge / progress incident | ✅ (any) | ✅ (sequential only) | ❌ |
| Assign mayor to incident | ✅ | ❌ | ❌ |
| Assign mayor to zone | ✅ | ❌ | ❌ |
| Dispatch corridor alert | ✅ | ❌ | ❌ |
| Update own location | — | ✅ | — |
| Zone CRUD | ✅ | ❌ (read own only) | ❌ (read for selection) |
| Asset status update | ✅ | ✅ (own zone) | ❌ |
| Maintenance ticket CRUD | ✅ | ❌ | ❌ |
| Escalation rule CRUD | ✅ | ❌ | ❌ |
| Dashboard aggregates | ✅ | ❌ | ❌ |
| Receives tier-1 escalation | ❌ | ✅ | ❌ |
| Receives tier-2 escalation | ✅ | ❌ | ❌ |

---

## The Pattern Worth Noticing

Authority strictly narrows as you go down — admin sees everything, mayor sees a slice, citizen sees only their own slice of that slice.

But each role also has at least one capability none of the others have:
- **Admin** configures the system itself (zones, rules, assignments)
- **mayors** are the only ones who continuously report live position
- **Citizens** are the only ones who originate an incident in the first place

None of the three roles is just a "smaller version" of the one above it — each is structurally necessary for the pipeline to function at all.
