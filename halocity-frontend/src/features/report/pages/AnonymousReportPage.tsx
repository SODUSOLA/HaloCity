import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { createIncidentSchema } from '@/features/incidents/types'
import { createIncident } from '@/features/incidents/api/incidents.api'
import { fetchZones } from '@/features/incidents/api/incidents.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, MapPin, Crosshair } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const incidentTypes = [
  { value: 'MEDICAL' as const, label: 'Medical', desc: 'Injury, illness, or health emergency' },
  { value: 'SECURITY' as const, label: 'Security', desc: 'Theft, fight, suspicious activity' },
  { value: 'TRAFFIC' as const, label: 'Traffic', desc: 'Accident, gridlock, obstruction' },
  { value: 'INFRASTRUCTURE' as const, label: 'Infrastructure', desc: 'Power, water, road, structure' },
]

export default function AnonymousReportPage() {
  const navigate = useNavigate()
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'capturing' | 'captured' | 'denied'>('idle')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('denied')
      return
    }
    setGpsStatus('capturing')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsStatus('captured')
      },
      () => {
        setGpsStatus('denied')
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }, [])

  const form = useForm({
    resolver: zodResolver(createIncidentSchema) as any,
    defaultValues: {
      type: '' as any,
      title: '',
      description: '',
      zoneId: '',
      locationLat: undefined,
      locationLng: undefined,
      reporterPhone: '',
      mediaUrls: [],
    },
  })

  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (values: Record<string, unknown>) => {
    setPending(true)
    setError('')
    try {
      const payload = {
        ...values,
        locationLat: coords?.lat ?? undefined,
        locationLng: coords?.lng ?? undefined,
      }
      const result = await createIncident(payload as any)
      const refCode =
        (result as any)?.referenceCode ||
        (result as any)?.data?.referenceCode ||
        ''
      navigate('/report/confirmation', { state: { referenceCode: refCode } })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit report'
      setError(message)
    } finally {
      setPending(false)
    }
  }

  const zonesList = Array.isArray(zones) ? zones : (zones as any)?.data ?? []

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-lg">
        <Link
          to="/report"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-xl font-semibold text-foreground">Report as Guest</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          No account needed. Your report will be anonymous.
        </p>

        {/* GPS Status */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-sm">
          {gpsStatus === 'capturing' && (
            <>
              <Crosshair className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-muted-foreground">Capturing your location...</span>
            </>
          )}
          {gpsStatus === 'captured' && (
            <>
              <MapPin className="h-4 w-4 text-success" />
              <span className="text-success">Location captured</span>
            </>
          )}
          {gpsStatus === 'denied' && (
            <>
              <MapPin className="h-4 w-4 text-warning" />
              <span className="text-muted-foreground">
                Location not available — zone selection will be used for dispatch
              </span>
            </>
          )}
          {gpsStatus === 'idle' && (
            <>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Requesting location...</span>
            </>
          )}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {/* Incident Type */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Incident Type <span className="text-destructive">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {incidentTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => form.setValue('type', t.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left text-sm transition-colors',
                    form.watch('type') === t.value
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-card hover:border-primary/50',
                  )}
                >
                  <span className="font-medium text-foreground">{t.label}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
            {form.formState.errors.type && (
              <p className="mt-1 text-xs text-destructive">{(form.formState.errors.type as any).message}</p>
            )}
          </fieldset>

          {/* Zone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Zone <span className="text-destructive">*</span>
            </label>
            <select
              value={form.watch('zoneId')}
              onChange={(e) => form.setValue('zoneId', e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a zone</option>
              {zonesList.map((z: any) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
            {form.formState.errors.zoneId && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.zoneId.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Brief description of the incident"
              className="h-11 rounded-lg bg-input-background px-3"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
            <textarea
              placeholder="Provide more details (optional)"
              className="h-24 w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...form.register('description')}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Phone Number <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              placeholder="In case responders need to reach you"
              className="h-11 rounded-lg bg-input-background px-3"
              {...form.register('reporterPhone')}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Optional — your number won't be shared publicly.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive-light p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-lg font-semibold"
            disabled={pending}
          >
            {pending ? 'Submitting...' : 'Report Incident'}
          </Button>
        </form>
      </div>
    </div>
  )
}
