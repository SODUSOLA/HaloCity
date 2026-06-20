import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  MapPin,
  Wrench,
  GitBranch,
  LogOut,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/shared/stores/AuthContext'

const navItems = [
  { to: '/command', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/command/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/command/marshals', label: 'Marshals', icon: Users },
  { to: '/command/zones', label: 'Zones', icon: MapPin },
  { to: '/command/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/command/escalation-rules', label: 'Escalation', icon: GitBranch },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
          HC
        </div>
        <span className="text-sm font-semibold text-[#0F172A]">HaloCity</span>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-light text-primary-text'
                  : 'text-[#64748B] hover:bg-surface-alt hover:text-[#0F172A]',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <div className="mb-2 px-3 text-xs text-[#94A3B8]">
          {user?.name}
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#64748B] hover:bg-surface-alt hover:text-[#0F172A]"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
