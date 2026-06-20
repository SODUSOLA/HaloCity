import { useMarshals } from '@/features/marshals/hooks/useMarshals'
import { AvailabilityIndicator } from '@/features/marshals/components/AvailabilityIndicator'
import { TableSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
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
  const marshals: any[] = Array.isArray(data) ? data : []

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Marshals</h1>
        <TableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Marshals</h1>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Marshals</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">
                Zone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody>
            {marshals.map((m: {
              id: string
              name: string
              email: string
              phone: string
              isActive: boolean
              zone?: { name: string; code: string } | null
              location?: { lat: number; lng: number; updatedAt: string } | null
            }) => (
              <tr key={m.id} className="border-b border-border transition-colors hover:bg-surface-alt">
                <td className="px-4 py-3 text-sm text-[#0F172A]">
                  {m.name || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-sm text-[#64748B]">
                  {m.zone?.name || m.zone?.code || 'Unassigned'}
                </td>
                <td className="px-4 py-3">
                  <AvailabilityIndicator
                    availability={deriveAvailability(m.location?.updatedAt, !!m.zone)}
                  />
                </td>
                <td className="px-4 py-3 text-xs text-[#94A3B8]">
                  {m.location?.updatedAt
                    ? new Date(m.location.updatedAt).toLocaleString()
                    : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {marshals.length === 0 && (
        <div className="mt-6 text-center text-sm text-[#64748B]">No marshals found</div>
      )}
    </div>
  )
}
