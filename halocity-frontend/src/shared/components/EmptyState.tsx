import { Inbox } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 text-[#94A3B8]">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="mb-1 text-sm font-medium text-[#0F172A]">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-[#64748B]">{description}</p>
      )}
      {action}
    </div>
  )
}
