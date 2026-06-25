import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { trackIncident } from '@/features/incidents/api/incidents.api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/shared/components/Badge'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export default function TrackReportPage() {
  const [searchParams] = useSearchParams()
  const prefillCode = searchParams.get('code') || ''
  const [code, setCode] = useState(prefillCode)
  const [submittedCode, setSubmittedCode] = useState(prefillCode)

  const query = useQuery({
    queryKey: ['track-incident', submittedCode],
    queryFn: () => trackIncident(submittedCode),
    enabled: submittedCode.length > 0,
    retry: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      setSubmittedCode(code.trim())
    }
  }

  const result = query.data as any

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <Link
          to="/report"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-xl font-semibold text-foreground">Track Your Report</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the reference code you received after reporting.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input
            placeholder="HC-20260624-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-11 flex-1 rounded-lg bg-input-background px-3 font-mono text-sm uppercase"
          />
          <Button
            type="submit"
            className="h-11 rounded-lg px-5"
            disabled={!code.trim() || query.isFetching}
          >
            {query.isFetching ? (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Check
              </span>
            ) : (
              'Check Status'
            )}
          </Button>
        </form>

        {/* Result */}
        <div className="mt-6">
          {query.isPending && submittedCode && !query.isFetching && (
            <div className="rounded-lg border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Enter a code and click Check Status</p>
            </div>
          )}

          {query.isFetching && (
            <div className="rounded-lg border border-border p-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-2 text-sm text-muted-foreground">Looking up your report...</p>
            </div>
          )}

          {query.isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive-light p-6 text-center">
              <FileQuestion className="mx-auto h-8 w-8 text-destructive/60" />
              <p className="mt-2 text-sm font-medium text-destructive">Report not found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please check your reference code and try again.
              </p>
            </div>
          )}

          {result && !query.isFetching && !query.isError && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-sm font-medium text-foreground">
                  {result.referenceCode}
                </span>
                <Badge variant="status" value={result.status} />
              </div>

              <div className="space-y-3 text-sm">
                <Row label="Type" value={result.type.replace('_', ' ')} />
                <Row label="Severity" value={result.severity} />
                <Row label="Zone" value={result.zone?.name || '—'} />
                <Row
                  label="Reported"
                  value={new Date(result.createdAt).toLocaleString()}
                />
                {result.resolvedAt && (
                  <Row
                    label="Resolved"
                    value={new Date(result.resolvedAt).toLocaleString()}
                  />
                )}
                {result.resolutionNote && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-1 text-xs text-muted-foreground">Resolution Note</p>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{result.resolutionNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize text-foreground">{value.toLowerCase()}</span>
    </div>
  )
}
