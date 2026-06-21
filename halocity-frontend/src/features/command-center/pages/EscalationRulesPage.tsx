import { useState } from 'react'
import { toast } from 'sonner'
import { GitBranch, Plus, Trash2 } from 'lucide-react'
import { useEscalationRules, useCreateEscalationRule, useDeleteEscalationRule } from '@/features/incidents/hooks/useIncidents'
import { EmptyState } from '@/shared/components/EmptyState'
import { ListSkeleton } from '@/shared/components/LoadingSkeletons'
import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const INCIDENT_TYPES = ['MEDICAL', 'SECURITY', 'TRAFFIC', 'INFRASTRUCTURE']
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const ESCALATE_TO = ['MAYOR', 'ADMIN']

export default function EscalationRulesPage() {
  const { data: rules, isLoading, isError, refetch } = useEscalationRules()
  const createMutation = useCreateEscalationRule()
  const deleteMutation = useDeleteEscalationRule()

  const ruleList: any[] = Array.isArray(rules) ? rules : []

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    incidentType: '',
    severity: '',
    windowSeconds: 60,
    escalateTo: 'MAYOR',
    notifyVia: ['SMS', 'WEBSOCKET'] as string[],
  })

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        incidentType: form.incidentType || null,
        severity: form.severity || null,
        windowSeconds: form.windowSeconds,
        escalateTo: form.escalateTo,
        notifyVia: form.notifyVia,
      })
      toast.success('Escalation rule created')
      setCreateOpen(false)
      setForm({ incidentType: '', severity: '', windowSeconds: 60, escalateTo: 'MAYOR', notifyVia: ['SMS', 'WEBSOCKET'] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create rule'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Rule deleted')
    } catch {
      toast.error('Failed to delete rule')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Escalation Rules</h1>
        <ListSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Escalation Rules</h1>
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#0F172A]">Escalation Rules</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Rule
        </Button>
      </div>

      {ruleList.length > 0 ? (
        <div className="space-y-3">
          {ruleList.map((rule: {
            id: string
            incidentType?: string | null
            severity?: string | null
            windowSeconds: number
            escalateTo: string
            notifyVia: string[]
            isActive: boolean
            createdBy?: { name: string }
          }) => (
            <div key={rule.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#0F172A]">
                    {rule.incidentType || 'Any Type'} / {rule.severity || 'Any Severity'}
                    {!rule.isActive && <span className="ml-2 text-xs text-[#94A3B8]">(Inactive)</span>}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Escalate to {rule.escalateTo} after {rule.windowSeconds}s · Via {Array.isArray(rule.notifyVia) ? rule.notifyVia.join(', ') : rule.notifyVia}
                  </p>
                  {rule.createdBy && (
                    <p className="text-xs text-[#94A3B8]">Created by {rule.createdBy.name}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-critical hover:bg-critical-light"
                  onClick={() => handleDelete(rule.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<GitBranch className="h-12 w-12" />}
          title="No escalation rules"
          description="Create your first escalation rule to automate incident escalation"
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Escalation Rule</DialogTitle>
            <DialogDescription>Configure when and how incidents should escalate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="mb-1 text-xs font-medium text-[#64748B]">Incident Type (optional)</p>
              <Select
                value={form.incidentType}
                onValueChange={(v) => setForm({ ...form, incidentType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-[#64748B]">Severity (optional)</p>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm({ ...form, severity: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-[#64748B]">Window (seconds)</p>
              <Input
                type="number"
                min={10}
                value={form.windowSeconds}
                onChange={(e) => setForm({ ...form, windowSeconds: parseInt(e.target.value) || 60 })}
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-[#64748B]">Escalate To</p>
              <Select
                value={form.escalateTo}
                onValueChange={(v) => setForm({ ...form, escalateTo: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESCALATE_TO.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}