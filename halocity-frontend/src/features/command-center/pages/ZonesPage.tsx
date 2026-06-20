import { useQuery } from '@tanstack/react-query'
import { fetchZones } from '@/features/incidents/api/incidents.api'
import { TableSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'

export default function ZonesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
  })

  const zones: any[] = Array.isArray(data) ? data : []

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Zones</h1>
        <TableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Zones</h1>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Zones</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#64748B]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone: { id: string; name: string; code?: string; isActive: boolean }) => (
              <tr
                key={zone.id}
                className="border-b border-border transition-colors hover:bg-surface-alt"
              >
                <td className="px-4 py-3 text-sm text-[#0F172A]">{zone.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#64748B]">
                  {zone.code || '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                      zone.isActive
                        ? 'bg-success-light text-success-text'
                        : 'bg-surface-alt text-[#64748B]'
                    }`}
                  >
                    {zone.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {zones.length === 0 && (
        <div className="mt-6 text-center text-sm text-[#64748B]">No zones found</div>
      )}
    </div>
  )
}
