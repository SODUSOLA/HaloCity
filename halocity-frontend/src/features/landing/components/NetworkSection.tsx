import { CloudOff, Feather, Phone } from 'lucide-react'

const layers = [
  { icon: CloudOff, title: 'Layer 1: Offline-First PWA', desc: 'App shell loads with no internet. Reports queue locally and sync automatically on reconnect.' },
  { icon: Feather, title: 'Layer 2: Lightweight API', desc: 'Under 10KB per response. Gzip compression. No media through the API — Cloudinary handles it.' },
  { icon: Phone, title: 'Layer 3: USSD Fallback', desc: 'Emergency incidents reportable via USSD — zero mobile data required. Same escalation engine.' },
]

export default function NetworkSection() {
  return (
    <section id="resilience" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
          BUILT FOR REDEMPTION CITY'S CONDITIONS
        </div>
        <h2 className="max-w-xl text-3xl font-semibold text-slate-900 sm:text-4xl">
          Designed to Work When the Network Doesn't
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <p className="text-sm leading-relaxed text-slate-600">
            During the Holy Ghost Congress, Redemption City's cell towers experience
            severe congestion from hundreds of thousands of simultaneous connections.
            HaloCity is engineered with three layers of resilience to stay operational
            under these conditions.
          </p>

          <div className="relative space-y-4">
            {layers.map((l, i) => (
              <div
                key={l.title}
                className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                style={{ marginTop: i > 0 ? '-0.5rem' : undefined }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <l.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{l.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-600">{l.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
