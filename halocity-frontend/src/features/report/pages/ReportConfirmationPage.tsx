import { useCallback } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, Copy, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReportConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const referenceCode = (location.state as any)?.referenceCode || ''

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(referenceCode).catch(() => {})
  }, [referenceCode])

  const isMissing = !referenceCode

  if (isMissing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <p className="text-muted-foreground">No reference code found.</p>
          <Button className="mt-4" onClick={() => navigate('/report', { replace: true })}>
            Report an Incident
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-light">
          <CheckCircle className="h-7 w-7 text-success" />
        </div>

        <h1 className="mt-4 text-xl font-semibold text-foreground">Incident Reported</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your reference code:
        </p>

        <div className="mt-4 rounded-xl border-2 border-dashed border-primary/40 bg-surface p-4">
          <p className="select-all text-center text-2xl font-bold tracking-widest text-primary">
            {referenceCode}
          </p>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Screenshot or write this down. Use it to track your report status.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button variant="outline" className="w-full gap-2" onClick={copyCode}>
            <Copy className="h-4 w-4" />
            Copy Code
          </Button>
          <Button
            className="w-full gap-2"
            onClick={() => navigate(`/track?code=${encodeURIComponent(referenceCode)}`)}
          >
            <Search className="h-4 w-4" />
            Track This Report
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate('/report/anonymous', { replace: true })}
          >
            <Plus className="h-4 w-4" />
            Report Another Incident
          </Button>
        </div>

        <Link
          to="/report"
          className="mt-6 block text-sm text-muted-foreground hover:text-foreground"
        >
          Back to report options
        </Link>
      </div>
    </div>
  )
}
