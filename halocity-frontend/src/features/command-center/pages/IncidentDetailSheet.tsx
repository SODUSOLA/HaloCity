import { useState } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/shared/components/Badge'
import { useIncident, useUpdateStatus, useAssignIncident } from '@/features/incidents/hooks/useIncidents'
import { useMarshals } from '@/features/marshals/hooks/useMarshals'
import { CardSkeleton } from '@/shared/components/LoadingSkeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { IncidentStatusTimeline } from '@/features/incidents/components/IncidentStatusTimeline'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface IncidentDetailSheetProps {
  incidentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IncidentDetailSheet({
  incidentId,
  open,
  onOpenChange,
}: IncidentDetailSheetProps) {
  const { data: incident, isLoading } = useIncident(incidentId)
  const { data: marshals, isLoading: marshalsLoading } = useMarshals()
  const updateStatus = useUpdateStatus()
  const assignIncident = useAssignIncident()
  const [assignTo, setAssignTo] = useState('')

  const handleAssign = async () => {
    if (!assignTo) return
    try {
      await assignIncident.mutateAsync({ id: incidentId, mayorId: assignTo })
      toast.success('Mayor assigned')
      setAssignTo('')
    } catch {
      toast.error('Failed to assign mayor')
    }
  }

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: incidentId, status })
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Incident Detail</SheetTitle>
          <SheetDescription>
            {incident?.referenceCode || 'Loading...'}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-6">
            <CardSkeleton />
          </div>
        ) : incident ? (
          <div className="mt-6 space-y-6">
            <div className="flex gap-2">
              <Badge variant="severity" value={incident.severity} />
              <Badge variant="status" value={incident.status} />
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Type
              </p>
              <p className="text-sm text-foreground">
                {incident.type.charAt(0) +
                  incident.type.slice(1).toLowerCase().replace('_', ' ')}
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <p className="text-sm text-foreground">{incident.description}</p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Reporter
              </p>
              <p className="text-sm text-foreground">
                {incident.reporter?.name || 'Anonymous'}
              </p>
              {incident.reporter?.phone && (
                <p className="text-xs text-muted-foreground">{incident.reporter.phone}</p>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status Timeline
              </p>
              <IncidentStatusTimeline
                currentStatus={incident.status}
                resolvedAt={incident.resolvedAt}
                createdAt={incident.createdAt}
                escalationLogs={(incident as any).escalationLogs}
              />
            </div>

            {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </p>

                <div className="flex items-center gap-2">
                  {marshalsLoading ? (
                    <Skeleton className="h-10 flex-1 rounded-md" />
                  ) : (
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Assign mayor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(marshals) &&
                        marshals.map(
                          (m: { id: string; name: string }) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ),
                        )}
                    </SelectContent>
                  </Select>
                  )}
                  <Button
                    size="sm"
                    onClick={handleAssign}
                    disabled={!assignTo || assignIncident.isPending}
                  >
                    Assign
                  </Button>
                </div>

                <div className="flex gap-2">
                  {incident.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate('ACKNOWLEDGED')}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {incident.status === 'IN_PROGRESS' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate('RESOLVED')}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            )}

            {incident.mediaUrls.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Evidence ({incident.mediaUrls.length})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {incident.mediaUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Evidence ${i + 1}`}
                      className="rounded-lg border border-border object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Incident not found</p>
        )}
      </SheetContent>
    </Sheet>
  )
}
