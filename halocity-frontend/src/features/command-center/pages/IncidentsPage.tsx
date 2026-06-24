import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { Badge } from '@/shared/components/Badge'
import { IncidentDetailSheet } from './IncidentDetailSheet'
import { TableSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import type { Incident } from '@/shared/types'

const columnHelper = createColumnHelper<Incident>()

const columns = [
  columnHelper.accessor('referenceCode', {
    header: 'ID',
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    cell: (info) => (
      <span className="text-sm text-foreground">
        {info.getValue().charAt(0) + info.getValue().slice(1).toLowerCase().replace('_', ' ')}
      </span>
    ),
  }),
  columnHelper.accessor('severity', {
    header: 'Severity',
    cell: (info) => <Badge variant="severity" value={info.getValue()} />,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <Badge variant="status" value={info.getValue()} />,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    cell: (info) => (
      <span className="text-xs text-muted-foreground">
        {new Date(info.getValue()).toLocaleDateString()}
      </span>
    ),
  }),
]

export default function IncidentsPage() {
  const { data: incidents, isLoading, isError, refetch } = useIncidents()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: incidents || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Incidents</h1>
        <TableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">Incidents</h1>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Incidents</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-surface-alt">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-b border-border transition-colors hover:bg-surface-alt"
                onClick={() => setSelectedId(row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {incidents?.length === 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">No incidents found</div>
      )}

      {selectedId && (
        <IncidentDetailSheet
          incidentId={selectedId}
          open={!!selectedId}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
        />
      )}
    </div>
  )
}
