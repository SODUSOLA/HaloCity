import { useNavigate } from 'react-router-dom'
import { Mail, Phone, MapPin, LogOut } from 'lucide-react'
import { useAuth } from '@/shared/stores/AuthContext'
import { useIncidents } from '@/features/incidents/hooks/useIncidents'
import { AvailabilityIndicator } from '@/features/marshals/components/AvailabilityIndicator'
import { Skeleton } from '@/components/ui/skeleton'
import ThemeToggle from '@/shared/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import type { MarshalAvailability } from '@/shared/types'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: incidents, isLoading: loadingIncidents } = useIncidents()

  const hasActiveIncident = (incidents || []).some(
    (i) => i.status === 'IN_PROGRESS' && (i.assignedToId === user?.id || i.assignedTo?.id === user?.id),
  )

  const availability: MarshalAvailability = hasActiveIncident ? 'busy' : 'available'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-lg font-semibold text-[#0F172A]">Profile</h1>

      <div className="flex flex-col items-center py-6">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h2 className="text-lg font-semibold text-[#0F172A]">{user?.name}</h2>
        {loadingIncidents ? (
          <Skeleton className="mt-1 h-4 w-20" />
        ) : (
          <AvailabilityIndicator availability={availability} className="mt-1" />
        )}
        <p className="mt-1 text-xs text-[#64748B]">Mayor</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Mail className="h-4 w-4 text-[#64748B]" />
          <div>
            <p className="text-xs text-[#94A3B8]">Email</p>
            <p className="text-sm text-[#0F172A]">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Phone className="h-4 w-4 text-[#64748B]" />
          <div>
            <p className="text-xs text-[#94A3B8]">Phone</p>
            <p className="text-sm text-[#0F172A]">{user?.phone}</p>
          </div>
        </div>
        {user?.zone && (
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <MapPin className="h-4 w-4 text-[#64748B]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Zone</p>
              <p className="text-sm text-[#0F172A]">{user.zone.name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <ThemeToggle className="w-full" />
      </div>

      <Button
        variant="outline"
        className="w-full text-critical hover:bg-critical-light"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}
