import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Upload, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateIncident } from '@/features/incidents/hooks/useIncidents'
import { createIncidentSchema } from '@/features/incidents/types'
import { fetchZones, uploadFile } from '@/features/incidents/api/incidents.api'
import { extractErrorMessage } from '@/shared/lib/api'
import { cn } from '@/shared/lib/utils'
import type { IncidentType, Zone } from '@/shared/types'

type FormData = z.input<typeof createIncidentSchema>

const incidentTypes: { value: IncidentType; label: string; description: string }[] = [
  { value: 'MEDICAL', label: 'Medical', description: 'Injury, accident, health emergency' },
  { value: 'SECURITY', label: 'Security', description: 'Theft, vandalism, suspicious activity' },
  { value: 'TRAFFIC', label: 'Traffic', description: 'Accident, road blockage, congestion' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure', description: 'Road damage, power, water issue' },
]

const steps = ['Type', 'Title & Description', 'Location', 'Photos', 'Review']

export default function ReportWizardPage() {
  const [step, setStep] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const createIncident = useCreateIncident()

  const { data: zones } = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      type: (searchParams.get('type') as IncidentType) || undefined,
      title: '',
      description: '',
      zoneId: undefined,
      locationLat: undefined,
      locationLng: undefined,
      mediaUrls: [],
    },
  })

  const watchType = form.watch('type')
  const watchTitle = form.watch('title')
  const watchDescription = form.watch('description')
  const watchMediaUrls = form.watch('mediaUrls')
  const watchZoneId = form.watch('zoneId')

  useEffect(() => {
    if (watchType && !watchTitle) {
      const label = incidentTypes.find((t) => t.value === watchType)?.label || watchType
      form.setValue('title', `${label} incident`)
    }
  }, [watchType, watchTitle, form])

  const handleNext = async () => {
    if (step === 0) {
      const ok = await form.trigger('type')
      if (!ok) return
    }
    if (step === 1) {
      const ok = await form.trigger(['title', 'description'])
      if (!ok) return
    }
    if (step === 2) {
      const ok = await form.trigger(['zoneId'])
      if (!ok) return
    }
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleFileSelect = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if ((form.getValues('mediaUrls')?.length || 0) >= 5) {
      toast.error('Maximum 5 photos')
      return
    }
    setUploading(true)
    try {
      const url = await uploadFile(file)
      form.setValue('mediaUrls', [...(form.getValues('mediaUrls') || []), url])
      toast.success('Photo uploaded')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const currentUrls = form.getValues('mediaUrls') || []
    form.setValue(
      'mediaUrls',
      currentUrls.filter((_, i) => i !== index),
    )
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not available on this device')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue('locationLat', pos.coords.latitude)
        form.setValue('locationLng', pos.coords.longitude)
        toast.success('Location detected')
      },
      (err) => {
        if (err.code === 1) toast.error('Location permission denied. Select a zone manually.')
        else toast.error('Could not detect location')
      },
    )
  }

  const onSubmit = async (values: FormData) => {
    try {
      const result = await createIncident.mutateAsync(values as any)
      toast.success('Incident reported successfully')
      navigate(`/app/reports/${result.id}`)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button onClick={handleBack} className="p-1" aria-label="Go back">
            <ArrowLeft className="h-5 w-5 text-[#64748B]" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A]">Report Incident</h1>
          <p className="text-xs text-[#64748B]">
            Step {step + 1} of {steps.length}: {steps[step]}
          </p>
        </div>
      </div>

      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-primary' : 'bg-border')}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[#64748B]">What type of incident are you reporting?</p>
          {incidentTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => form.setValue('type', type.value)}
              className={cn(
                'w-full rounded-lg border p-4 text-left transition-colors',
                watchType === type.value
                  ? 'border-primary bg-primary-light'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <p className="text-sm font-medium text-[#0F172A]">{type.label}</p>
              <p className="text-xs text-[#64748B]">{type.description}</p>
            </button>
          ))}
          {form.formState.errors.type && (
            <p className="text-xs text-critical">{form.formState.errors.type.message}</p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#64748B]">Title</label>
            <input
              className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Brief title for the incident"
              value={watchTitle}
              onChange={(e) => form.setValue('title', e.target.value)}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-critical">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#64748B]">Description (optional)</label>
            <div className="relative">
              <textarea
                className="min-h-[120px] w-full rounded-lg border border-border p-3 pr-10 text-sm focus:border-primary focus:outline-none"
                placeholder="Provide details about what happened"
                value={watchDescription || ''}
                onChange={(e) => form.setValue('description', e.target.value || undefined)}
              />
              <VoiceInput
                onResult={(text) => form.setValue('description', text)}
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-[#64748B]">Where did this happen?</p>

          <Button variant="outline" className="w-full" onClick={handleDetectLocation}>
            Detect my location
          </Button>

          {(form.watch('locationLat') || form.watch('locationLng')) && (
            <div className="rounded-lg border border-border bg-surface-alt p-3 text-xs text-[#64748B]">
              Lat: {form.watch('locationLat')?.toFixed(6)}, Lng: {form.watch('locationLng')?.toFixed(6)}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <label className="mb-2 block text-xs font-medium text-[#64748B]">Zone</label>
            <select
              className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:outline-none"
              value={watchZoneId || ''}
              onChange={(e) => form.setValue('zoneId', e.target.value || undefined as any)}
            >
              <option value="">Select a zone...</option>
              {(Array.isArray(zones) ? zones : []).map((z: Zone) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
            {form.formState.errors.zoneId && (
              <p className="mt-1 text-xs text-critical">{form.formState.errors.zoneId.message}</p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-sm text-[#64748B]">Add photos (max 5)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" className="w-full" onClick={handleFileSelect} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload photos'}
          </Button>
          {(watchMediaUrls?.length ?? 0) > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {watchMediaUrls!.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt={`Upload ${i + 1}`} className="h-16 w-full rounded-md object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-critical text-xs text-white"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#64748B]">Type</p>
            <p className="text-sm text-[#0F172A]">
              {watchType ? incidentTypes.find((t) => t.value === watchType)?.label || watchType : 'Not selected'}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#64748B]">Title</p>
            <p className="text-sm text-[#0F172A]">{watchTitle || '—'}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#64748B]">Description</p>
            <p className="text-sm text-[#0F172A]">{watchDescription || 'No description'}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#64748B]">Zone</p>
            <p className="text-sm text-[#0F172A]">
              {watchZoneId
                ? (Array.isArray(zones) ? zones : []).find((z: Zone) => z.id === watchZoneId)?.name || watchZoneId
                : 'Not selected'}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#64748B]">Location</p>
            <p className="text-sm text-[#0F172A]">
              {form.watch('locationLat')
                ? `${form.watch('locationLat')?.toFixed(4)}, ${form.watch('locationLng')?.toFixed(4)}`
                : 'Not detected'}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#64748B]">Photos</p>
            <p className="text-sm text-[#0F172A]">
              {watchMediaUrls && watchMediaUrls.length > 0 ? `${watchMediaUrls.length} photo(s)` : 'No photos'}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {step < steps.length - 1 ? (
          <Button className="flex-1" onClick={handleNext}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createIncident.isPending}
          >
            {createIncident.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        )}
      </div>
    </div>
  )
}

function VoiceInput({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const supported = !!SpeechRecognitionCtor

  if (!supported) return null

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition: any = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.lang = 'en-NG'
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
      setListening(false)
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`absolute bottom-2 right-2 rounded-full p-1.5 transition-colors ${
        listening ? 'bg-critical text-white animate-pulse' : 'text-[#94A3B8] hover:text-[#64748B]'
      }`}
      aria-label={listening ? 'Stop recording' : 'Start voice input'}
    >
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  )
}
