import { GitBranch } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'

export default function EscalationRulesPage() {
  const rules: { id: string; name: string; description?: string }[] = []

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-[#0F172A]">Escalation Rules</h1>

      {rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-lg border border-border p-4"
            >
              <p className="text-sm font-medium text-[#0F172A]">{rule.name}</p>
              {rule.description && (
                <p className="mt-1 text-xs text-[#64748B]">{rule.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<GitBranch className="h-12 w-12" />}
          title="No escalation rules"
          description="Escalation rules will appear here once configured"
        />
      )}
    </div>
  )
}
