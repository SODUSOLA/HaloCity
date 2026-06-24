import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'halocity_onboarding_done'

interface TourStep {
  title: string
  body: string
}

const citizenSteps: TourStep[] = [
  { title: 'Report an Incident', body: 'Tap the red EMERGENCY button or use "Report Incident" to quickly submit a report. Choose Medical, Security, Traffic, or Infrastructure.' },
  { title: 'Track Your Reports', body: 'Go to "Reports" in the bottom nav to see the status of every incident you\'ve reported — updated in real time.' },
  { title: 'Zone Safety Alerts', body: 'Your home screen shows a safety banner for your zone — green when clear, red when active incidents are nearby.' },
  { title: 'Get Notified', body: 'The Alerts tab keeps you updated on your reports and zone safety announcements.' },
]

const mayorSteps: TourStep[] = [
  { title: 'Your Assignments', body: 'When an incident is assigned to you, it appears on your Dashboard. Tap it to see details and take action.' },
  { title: 'Update Status', body: 'Move incidents through Acknowledge → En Route → Resolve as you respond. Each update is visible to command in real time.' },
  { title: 'Navigate with GPS', body: 'The Map tab shows all incidents in your zone. Tap a marker for details and "Get Directions" to navigate via Google Maps.' },
  { title: 'Report an Incident', body: 'See something that needs attention? Tap "Report Incident" on your dashboard to submit a report directly.' },
]

interface OnboardingTourProps {
  role: 'CITIZEN' | 'MAYOR'
}

export default function OnboardingTour({ role }: OnboardingTourProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const steps = role === 'CITIZEN' ? citizenSteps : mayorSteps

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      const timer = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setOpen(false)
  }

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      dismiss()
    }
  }

  if (!open) return null

  const s = steps[step]
  if (!s) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-16 sm:items-center sm:pb-0">
      <div className="mx-4 w-full max-w-sm rounded-xl bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium text-primary">
            {step + 1} of {steps.length}
          </span>
          <button onClick={dismiss} aria-label="Close tour">
            <X className="h-4 w-4 text-muted-foreground/60" />
          </button>
        </div>
        <h3 className="mt-3 text-base font-semibold text-foreground">{s.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === step ? 'bg-primary' : 'bg-border'}`}
              />
            ))}
          </div>
          <Button size="sm" onClick={next}>
            {step < steps.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </div>
      </div>
    </div>
  )
}
