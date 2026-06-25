import { Link } from 'react-router-dom'
import { ShieldAlert, LogIn, Search } from 'lucide-react'

const options = [
  {
    to: '/report/anonymous',
    icon: ShieldAlert,
    title: 'Report as Guest',
    desc: 'No account needed. You\'ll get a code to track your report.',
  },
  {
    to: '/login',
    icon: LogIn,
    title: 'Login to Report',
    desc: 'Registered citizens can track all reports from their account.',
  },
  {
    to: '/track',
    icon: Search,
    title: 'Track My Report',
    desc: 'Already reported? Use your reference code to check status.',
  },
]

export default function ReportSelectorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Report an Incident</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose how you'd like to proceed</p>
        </div>

        <div className="space-y-3">
          {options.map((opt) => (
            <Link
              key={opt.to}
              to={opt.to}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-surface"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light">
                <opt.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{opt.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{opt.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Emergency? Call the command centre directly.
        </p>
      </div>
    </div>
  )
}
