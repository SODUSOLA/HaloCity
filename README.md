# HaloCity — Smart City Operations Platform

A three-role real-time incident management system for a smart city (Redemption City). Citizens report incidents, mayors respond in the field, and command center administrators oversee the entire city.

---

## Tech Stack

**Backend** — Node.js, Express, Prisma (PostgreSQL), Redis, BullMQ, Socket.IO, Zod, JWT

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS v3, shadcn/ui, TanStack React Query, React Router, Socket.IO Client, Leaflet, Recharts

---

## Architecture

Three distinct applications sharing a single backend:

| App | Role | Route prefix |
|---|---|---|
| **Citizen App** | Report incidents, track own reports | `/app/*` |
| **Mayor App** | Respond to zone incidents, update status, GPS location | `/mayor/*` |
| **Command Center** | Full city overview, zone/mayor/incident management | `/command/*` |

### Data Flow

```
Citizen reports → Backend classifies severity, schedules escalation
                → WebSocket `incident:created` → Admin + zone mayors see it instantly
                → Escalation timer starts (BullMQ)

Mayor acknowledges → Cancels escalation, status moves forward
                    → WebSocket `incident:updated` → Citizen + zone + admin

Escalation fires (no acknowledgement) → Status → ESCALATED
                                       → Tier 1: Zone mayors notified
                                       → Tier 2: Admin notified (backstop)
```

### Room-Based WebSocket Architecture

| Room | Members | Receives |
|---|---|---|
| `admin` | All admins | Every event city-wide |
| `zone:{zoneId}` | Mayors + citizens in that zone | Zone-scoped incidents and alerts |
| `mayor:{mayorId}` | One mayor | Personal assignments and instructions |
| `citizen:{userId}` | One citizen | Own report updates only |

---

## Role Hierarchy

| Capability | Admin | Mayor | Citizen |
|---|---|---|---|
| View own incidents | ✅ | ✅ | ✅ |
| View zone-wide incidents | ✅ | ✅ (own zone) | ❌ |
| View city-wide incidents | ✅ | ❌ | ❌ |
| Create incident | ✅ | ✅ | ✅ |
| Progress incident (sequential) | ✅ (any) | ✅ (Ack→InProg→Resolved) | ❌ |
| Assign mayor to incident | ✅ | ❌ | ❌ |
| Assign mayor to zone | ✅ | ❌ | ❌ |
| Dispatch corridor alerts | ✅ | ❌ | ❌ |
| Update GPS location | — | ✅ | — |
| Zone CRUD | ✅ | ❌ (read own) | ❌ (read for selection) |
| Asset status update | ✅ | ✅ (own zone) | ❌ |
| Maintenance ticket CRUD | ✅ | ❌ | ❌ |
| Escalation rule CRUD | ✅ | ❌ | ❌ |
| Dashboard aggregates | ✅ | ❌ | ❌ |
| Receives tier-1 escalation | ❌ | ✅ | ❌ |
| Receives tier-2 escalation | ✅ | ❌ | ❌ |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL (via Docker or local)
- Redis (via Docker or local)
- Docker (recommended for PostgreSQL + Redis)

### 1. Clone and Install

```bash
# Backend
cd Backend
cp .env.example .env   # Edit with your credentials
npm install
npx prisma migrate deploy
npm run db:seed

# Frontend
cd ../halocity-frontend
cp .env.example .env   # Edit VITE_API_URL to point at your backend
npm install
```

### 2. Start Backend Dependencies

```bash
docker compose up -d   # Starts PostgreSQL + Redis
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend (port 5001)
cd Backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd halocity-frontend
npm run dev
```

### 4. Seeded Admin Account

| Field | Value |
|---|---|
| Email | `admin@halocity.ng` |
| Password | `HaloCity@2026` |

Register new Citizen or Mayor accounts from the app.

---

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `REDIS_URL` | ✅ | — | Redis connection string |
| `JWT_SECRET` | ✅ | — | JWT signing key (min 16 chars) |
| `JWT_EXPIRES_IN` | ❌ | `24h` | Token expiry duration |
| `PORT` | ❌ | `5000` | HTTP server port |
| `CLIENT_URL` | ❌ | `http://localhost:5173` | CORS origin |
| `CLOUDINARY_CLOUD_NAME` | ❌ | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ❌ | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ❌ | — | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | ❌ | — | Cloudinary unsigned upload preset |
| `TERMII_API_KEY` | ❌ | — | Termii SMS API key |
| `NODE_ENV` | ❌ | `development` | Environment mode |

### Frontend (`halocity-frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | ✅ | `http://localhost:5001/api/v1` | Backend REST API base URL |
| `VITE_WS_URL` | ✅ | `http://localhost:5001` | Backend WebSocket URL |
| `VITE_CLOUDINARY_CLOUD_NAME` | ❌ | — | Cloudinary cloud name for uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | ❌ | — | Cloudinary unsigned upload preset |

---

## Deployment

### Backend (Render / Railway)

1. Set build command: `npm install && npx prisma migrate deploy`
2. Set start command: `npm start`
3. Set environment variables (see above)
4. Ensure PostgreSQL + Redis are provisioned as add-ons

### Frontend (Vercel)

1. Import the `halocity-frontend` directory as a new project
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add `_redirects` in `public/` for SPA routing
5. Set environment variables (see above)

---

## Testing

```bash
# Backend — unit tests
cd Backend && npm test

# Backend — integration tests (requires running DB + Redis)
cd Backend && npm run test:integration

# Frontend
cd halocity-frontend && npm test
```

---

## API Documentation

See [Backend/README.md](./Backend/README.md) for the full API reference.
