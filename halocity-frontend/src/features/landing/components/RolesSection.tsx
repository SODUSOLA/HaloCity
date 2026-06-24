import { Link } from 'react-router-dom'
import { User, Shield, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

const roles = [
  {
    id: 'citizen',
    bg: 'bg-amber-50',
    accent: 'bg-amber',
    icon: User,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-800',
    name: 'Citizen / Visitor',
    tag: 'Mobile App',
    tagColor: 'text-amber',
    description: 'Residents and visitors report incidents in under 30 seconds. No training needed. Track your report status live as mayors respond.',
    bullets: [
      'Report Medical, Security, Traffic, or Infrastructure',
      'Auto-tagged to your zone and timestamped',
      'Watch your report status update live',
      'Receive zone safety alerts in real time',
    ],
    cta: { label: 'Register as Citizen →', to: '/register', style: 'outline-amber' as const },
  },
  {
    id: 'marshal',
    bg: 'bg-blue-50',
    accent: 'bg-primary',
    icon: Shield,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-800',
    name: 'Traffic Mayor',
    tag: 'Mobile Operations App',
    tagColor: 'text-primary',
    description: 'Field responders receive live zone assignments, see all incidents in their area, and coordinate through the system — not WhatsApp.',
    bullets: [
      'Receive personal assignment alerts instantly',
      'See every incident in your assigned zone',
      'Move incidents through Acknowledge → Resolve',
      'Live GPS location shared with command',
    ],
    cta: { label: 'Register as Mayor →', to: '/register', style: 'outline-blue' as const },
  },
  {
    id: 'commander',
    bg: 'bg-slate-900',
    accent: 'bg-emerald',
    icon: Monitor,
    iconBg: 'bg-slate-800',
    iconColor: 'text-white',
    name: 'City Commander',
    tag: 'Desktop Command Center',
    tagColor: 'text-emerald',
    description: 'City leadership gets a real-time operational view of every incident, every mayor, and every zone — in one command dashboard.',
    bullets: [
      'Live incident feed across all 10 zones',
      'Mayor positions and availability',
      'Auto-escalation backstop for critical events',
      'Configure escalation rules and zones',
    ],
    cta: { label: 'Admin Access', to: '/login', style: 'emerald' as const },
  },
]

const btnStyles: Record<string, string> = {
  'outline-amber': 'border-amber text-amber hover:bg-amber hover:text-white',
  'outline-blue': 'border-primary text-primary hover:bg-primary hover:text-white',
  'emerald': 'border-emerald text-emerald hover:bg-emerald hover:text-white',
}

export default function RolesSection() {
  return (
    <section id="roles" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-primary">
          THREE ROLES
        </div>
        <h2 className="text-center text-3xl font-semibold text-slate-900 sm:text-4xl">
          Every Stakeholder Has a Purpose-Built Experience
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {roles.map((r) => (
            <div key={r.id} className={`flex flex-col overflow-hidden rounded-lg ${r.bg} border border-transparent`}>
              <div className={`h-1 ${r.accent}`} />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${r.iconBg}`}>
                    <r.icon className={`h-5 w-5 ${r.iconColor}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${r.iconColor}`}>{r.name}</h3>
                    <span className={`text-xs ${r.tagColor}`}>{r.tag}</span>
                  </div>
                </div>

                <p className={`mt-4 text-xs leading-relaxed ${r.id === 'commander' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {r.description}
                </p>

                <ul className={`mt-4 space-y-2 ${r.id === 'commander' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Link to={r.cta.to}>
                    <Button
                      variant="outline"
                      className={`border text-xs font-medium transition-colors ${btnStyles[r.cta.style]}`}
                    >
                      {r.cta.label}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
