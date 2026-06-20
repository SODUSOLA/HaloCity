import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface Banner {
  id: string
  title: string
  message: string
  type?: 'incident' | 'escalation' | 'alert'
}

let bannerListeners: ((banners: Banner[]) => void)[] = []
let banners: Banner[] = []

function notifyListeners() {
  bannerListeners.forEach((fn) => fn([...banners]))
}

export function showBanner(b: Omit<Banner, 'id'>) {
  const id = Date.now().toString()
  banners = [...banners, { ...b, id }]
  notifyListeners()
  return id
}

export function dismissBanner(id: string) {
  banners = banners.filter((b) => b.id !== id)
  notifyListeners()
}

export function CriticalBanner() {
  const [items, setItems] = useState<Banner[]>([])

  useEffect(() => {
    bannerListeners.push(setItems)
    return () => {
      bannerListeners = bannerListeners.filter((fn) => fn !== setItems)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex flex-col">
      {items.map((banner) => (
        <div
          key={banner.id}
          className={cn(
            'flex items-start gap-3 border-b px-4 py-3 text-sm',
            'bg-critical-light text-critical-text border-critical/20',
          )}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{banner.title}</p>
            <p className="mt-0.5 text-critical-text/80">{banner.message}</p>
          </div>
          <button
            onClick={() => dismissBanner(banner.id)}
            className="shrink-0 rounded-md p-1 hover:bg-critical/10"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
