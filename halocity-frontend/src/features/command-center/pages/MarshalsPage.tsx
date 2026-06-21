import { useState } from 'react'
import { toast } from 'sonner'
import { useMarshals, useAssignMarshalToZone, useEndMarshalAssignment } from '@/features/marshals/hooks/useMarshals'
import { useZones } from '@/features/zones/hooks/useZones'
import { AvailabilityIndicator } from '@/features/marshals/components/AvailabilityIndicator'
import { TableSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { MarshalAvailability } from '@/shared/types'

function deriveAvailability(
  lastLocationAt: string | null | undefined,
  hasIncident: boolean,
): MarshalAvailability {
  if (hasIncident) return 'busy'
  if (lastLocationAt) return 'available'
  return 'offline'
}

export default function MarshalsPage() {
  const { data, isLoading, isError, refetch } = useMarshals()
  const { data: zones } = useZones()
  const assignMutation = useAssignMarshalToZone()
  const endMutation = useEndMarshalAssignment()

  const marshals: any[] = Array.isArray(data) ? data : []
  const zoneList: any[] = Array.isArray(zones) ? zones : []

  const [assignModal, setAssignModal] = useState<{ open: boolean; mayorId: string; mayorName: string }>({
    open: false, mayorId: '', mayorName: '',
  })
  const [selectedZoneId, setSelectedZoneId] = useState('')

  const handleAssign = async () => {
    if (!selectedZoneId) return
    try {
      await assignMutation.mutateAsync({ mayorId: assignModal.mayorId, zoneId: selectedZoneId })
      toast.success(`${assignModal.mayorName} assigned to zone`)
      setAssignModal({ open: false, mayorId: '', mayorName: '' })
      setSelectedZoneId('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign'
      toast.error(msg)
    }
  }

  const handleEndAssignment = async (assignmentId: string, name: string) => {
    try {
      await endMutation.mutateAsync(assignmentId)
      toast.success(`${name} unassigned from zone`)
    } catch {
      toast.error('Failed to end assignment')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Mayors</h1>
        <TableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Mayors</h1>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Mayors</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">Zone</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">Last Active</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {marshals.map((m: {
              id: string
              name: string
              email: string
              phone: string
              isActive: boolean
              updatedAt?: string | null
              zone?: { name: string; code: string } | null
              currentAssignment?: { id: string } | null
              location?: { lat: number; lng: number; updatedAt: string } | null
            }) => (
              <tr key={m.id} className="border-b border-border transition-colors hover:bg-surface-alt">
                <td className="px-4 py-3 text-sm text-[#0F172A]">{m.name || 'Unknown'}</td>
                <td className="px-4 py-3 text-sm text-[#64748B]">{m.zone?.name || m.zone?.code || 'Unassigned'}</td>
                <td className="px-4 py-3">
                  <AvailabilityIndicator availability={deriveAvailability(m.location?.updatedAt, !!m.zone)} />
                </td>
                <td className="px-4 py-3 text-xs text-[#94A3B8]">
                  {m.location?.updatedAt
                    ? new Date(m.location.updatedAt).toLocaleString()
                    : m.updatedAt
                      ? new Date(m.updatedAt).toLocaleString()
                      : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAssignModal({ open: true, mayorId: m.id, mayorName: m.name })
                        setSelectedZoneId(m.zone?.code ? '' : '')
                      }}
                    >
                      Assign Zone
                    </Button>
                    {m.currentAssignment?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-critical hover:bg-critical-light"
                        onClick={() => handleEndAssignment(m.currentAssignment!.id, m.name)}
                        disabled={endMutation.isPending}
                      >
                        Unassign
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {marshals.length === 0 && (
        <div className="mt-6 text-center text-sm text-[#64748B]">No mayors found</div>
      )}

      <Dialog open={assignModal.open} onOpenChange={(open) => setAssignModal({ ...assignModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {assignModal.mayorName} to Zone</DialogTitle>
            <DialogDescription>Select a zone to assign this mayor to.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a zone..." />
              </SelectTrigger>
              <SelectContent>
                {zoneList.map((z: { id: string; name: string; code: string }) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name} ({z.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModal({ open: false, mayorId: '', mayorName: '' })}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedZoneId || assignMutation.isPending}>
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}