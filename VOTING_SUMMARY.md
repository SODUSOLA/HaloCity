# HaloCity — Public Voting Summary

**What is HaloCity?**

HaloCity is a real-time smart city operations platform built for Redemption city. It connects three roles — citizens, field responders (mayors), and command center administrators — into a single incident response pipeline.

**How it works**

A citizen reports an incident (medical, security, traffic, or infrastructure) in under 30 seconds. The backend auto-classifies severity from keywords and starts an escalation timer. Mayors in the zone receive a live push notification and can acknowledge, progress, and resolve the incident through a structured status chain. If no mayor acknowledges within the configured window, the incident auto-escalates — first to all zone mayors, then to the command center. No report falls through the cracks.

**What makes it different**

- **Three distinct roles** — citizen, mayors, admin — each with its own app and data scope
- **Real-time throughout** — Socket.IO push for every status change, location ping, and alert
- **Auto-escalation engine** — BullMQ-based configurable timers that escalate unacknowledged incidents through two tiers
- **Zone-scoped architecture** — Mayors see only their zone, citizens see only their reports, admin sees everything
- **Live GPS tracking** — Mayor positions stream independently of incident status for a real-time command map
- **SMS fallback** — Termii integration for notifications when internet is unavailable

**Built with**

Node.js, Express, PostgreSQL, Redis, Socket.IO, BullMQ, React 18, TypeScript, Tailwind CSS, shadcn/ui, Leaflet, deployed on Render + Vercel.

**Why it matters**

In Redemption city, reporting an incident means making a phone call that may or may not be answered. There is no tracking, no accountability, and no escalation. HaloCity gives every citizen a direct line into their city's operations and ensures every report is seen, tracked, and resolved — or escalated until someone responds.
