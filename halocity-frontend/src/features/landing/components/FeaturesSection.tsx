import { Smartphone, Zap, Shield, LayoutDashboard, Wrench, BarChart3 } from 'lucide-react'

const modules = [
  { icon: Smartphone, title: 'Citizen & Visitor Reporting', desc: '30-second incident reporting with auto-zone tagging and media upload', tag: 'React + Cloudinary' },
  { icon: Zap, title: 'Intelligent Escalation Engine', desc: 'BullMQ delayed jobs auto-escalate unacknowledged incidents through tiers', tag: 'BullMQ + Redis' },
  { icon: Shield, title: 'Mayor Coordination & Routing', desc: 'Live GPS tracking, zone assignments, and corridor alerts for field responders', tag: 'Socket.io + Leaflet' },
  { icon: LayoutDashboard, title: 'Command Operations Dashboard', desc: 'Real-time city-wide view: incidents, mayors, zones, charts — for city leadership', tag: 'Recharts + Redis' },
  { icon: Wrench, title: 'Infrastructure Maintenance Tracker', desc: 'Auto-generated tickets from infrastructure incidents, tracked to closure', tag: 'Prisma + PostgreSQL' },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-primary">
          CORE MODULES
        </div>
        <h2 className="text-center text-3xl font-semibold text-slate-900 sm:text-4xl">
          Five Integrated Modules. One Operational Picture.
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div key={m.title} className="rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <m.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{m.title}</h3>
              <p className="mt-1 text-xs text-slate-600">{m.desc}</p>
              <span className="mt-3 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">{m.tag}</span>
            </div>
          ))}

          <div className="flex flex-col justify-center rounded-lg bg-primary p-5 text-white">
            <BarChart3 className="mb-3 h-8 w-8 text-blue-300" />
            <p className="text-5xl font-bold">11</p>
            <p className="mt-1 text-sm">backend modules built — auth through deployment, fully integrated end to end</p>
          </div>
        </div>
      </div>
    </section>
  )
}
