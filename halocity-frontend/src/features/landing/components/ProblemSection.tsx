import { Car, AlertTriangle, EyeOff, ParkingSquare } from 'lucide-react'

const painPoints = [
  { icon: Car, title: 'Vehicle gridlock', desc: 'No communication layer between Christ Marshals during peak programs' },
  { icon: AlertTriangle, title: 'Emergencies in gridlock', desc: 'Response vehicles cannot reach scenes in time — lives at risk' },
  { icon: EyeOff, title: 'No command visibility', desc: 'City leadership receives only fragmented WhatsApp updates' },
  { icon: ParkingSquare, title: 'Parking overflow', desc: 'No real-time data, no pre-arrival routing — cascading gridlock' },
]

export default function ProblemSection() {
  return (
    <section id="problem" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
          THE PROBLEM
        </div>
        <h2 className="max-w-2xl text-3xl font-semibold text-slate-900 sm:text-4xl">
          Redemption City Has No Digital Coordination Infrastructure
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-7xl font-bold text-critical sm:text-8xl">3 million+</p>
            <p className="mt-2 max-w-xs text-sm text-slate-600">
              pilgrims during the Holy Ghost Congress — coordinated today via walkie-talkies and WhatsApp groups
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {painPoints.map((p) => (
              <div key={p.title} className="rounded-lg border border-slate-200 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <p.icon className="h-5 w-5 text-critical" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
