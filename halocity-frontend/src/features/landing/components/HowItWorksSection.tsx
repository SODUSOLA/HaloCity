import { Smartphone, Tag, UserCheck, Clock, CheckCircle } from 'lucide-react'

const steps = [
  { icon: Smartphone, title: 'Citizen Reports', desc: 'Any visitor or resident reports Medical, Security, Traffic, or Infrastructure in under 30 seconds' },
  { icon: Tag, title: 'Auto-Classified', desc: 'Backend auto-tags severity and zone from keywords — no manual triage needed' },
  { icon: UserCheck, title: 'Mayor Notified', desc: 'The nearest available mayor receives a live alert via WebSocket and SMS simultaneously' },
  { icon: Clock, title: 'Acknowledge or Escalate', desc: 'If no acknowledgement within the configured window, the system auto-escalates to city leadership' },
  { icon: CheckCircle, title: 'Resolved, Tracked', desc: 'Every status change is logged. Citizen sees live updates. Admin sees the full audit trail' },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-primary">
          HOW IT WORKS
        </div>
        <h2 className="text-center text-3xl font-semibold text-slate-900 sm:text-4xl">
          From Report to Resolution — Automatically
        </h2>

        <div className="mt-16 grid gap-8 md:grid-cols-5 md:gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl font-semibold text-blue-500">{(i + 1).toString().padStart(2, '0')}</span>
                <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden items-center md:absolute md:right-[-1rem] md:top-1/3 md:flex">
                  <span className="text-2xl text-slate-300">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
