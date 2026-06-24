import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  FileText,
  Bell,
  User,
  ClipboardList,
  Map,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { Role } from '@/shared/types'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

const citizenNav: NavItem[] = [
  { to: '/app', label: 'Home', icon: <Home className="h-5 w-5" />, end: true },
  { to: '/app/report', label: 'Report', icon: <FileText className="h-5 w-5" /> },
  { to: '/app/reports', label: 'Reports', icon: <ClipboardList className="h-5 w-5" /> },
  { to: '/app/alerts', label: 'Alerts', icon: <Bell className="h-5 w-5" /> },
  { to: '/app/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
]

const marshalNav: NavItem[] = [
  { to: '/marshal', label: 'Dashboard', icon: <Home className="h-5 w-5" />, end: true },
  { to: '/marshal/assignments', label: 'Tasks', icon: <ClipboardList className="h-5 w-5" /> },
  { to: '/marshal/map', label: 'Map', icon: <Map className="h-5 w-5" /> },
  { to: '/marshal/notifications', label: 'Alerts', icon: <Bell className="h-5 w-5" /> },
  { to: '/marshal/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
]

const navMap: Record<Role, NavItem[]> = {
  CITIZEN: citizenNav,
  MAYOR: marshalNav,
  ADMIN: [],
}

interface BottomNavProps {
  role: Role
}

export function BottomNav({ role }: BottomNavProps) {
  const nav = navMap[role]
  if (nav.length === 0) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background">
      <div className="mx-auto flex max-w-lg justify-around">
        {nav.map((item) => (
            <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground/50 hover:text-muted-foreground',
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
