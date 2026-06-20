import { Bell, AlertTriangle, Info, Wrench, Car } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'

const alertIcons: Record<string, React.ReactNode> = {
  Emergency: <AlertTriangle className="h-5 w-5 text-critical" />,
  Medical: <AlertTriangle className="h-5 w-5 text-critical" />,
  Security: <AlertTriangle className="h-5 w-5 text-critical" />,
  Traffic: <Car className="h-5 w-5 text-warning" />,
  Infrastructure: <Wrench className="h-5 w-5 text-warning" />,
  General: <Info className="h-5 w-5 text-primary" />,
}

export default function AlertsPage() {
  const alerts: { type: string; title: string; message: string; time: string }[] = []

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-[#0F172A]">Alerts</h1>
      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <div className="mt-1 shrink-0">
                {alertIcons[alert.type] || <Bell className="h-5 w-5 text-[#64748B]" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0F172A]">{alert.title}</p>
                <p className="mt-0.5 text-xs text-[#64748B]">{alert.message}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No alerts"
          description="You'll see alerts and notifications here when they arrive"
        />
      )}
    </div>
  )
}
