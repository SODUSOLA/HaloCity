import { X, Check } from 'lucide-react'

const beforeItems = [
  'Walkie-talkies and physical hand signals',
  'Fragmented WhatsApp updates to leadership',
  'No real-time situational awareness',
  'Reports fall through the cracks',
]

const afterItems = [
  'Live GPS-tracked mayor coordination',
  'Real-time command dashboard, city-wide',
  'Auto-escalation if no one acknowledges in time',
  'Every report tracked from report to resolution',
]

export default function SolutionSection() {
  return (
    <section id="solution" className="bg-[#F8FAFC] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-primary">
          THE SOLUTION
        </div>
        <h2 className="text-center text-3xl font-semibold text-slate-900 sm:text-4xl">
          One Platform. Three Roles. Zero Blind Spots.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-slate-600">
          HaloCity is a real-time smart city operations platform built for Redemption City.
           It unifies incident reporting, automatic escalation, and mayor coordination —
          so every incident from a broken gate to a medical emergency is tracked from
          report to resolution.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-500">Without HaloCity</h3>
            <ul className="space-y-3">
              {beforeItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-primary p-6 text-white">
            <h3 className="mb-4 text-sm font-semibold text-blue-300">With HaloCity</h3>
            <ul className="space-y-3">
              {afterItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
