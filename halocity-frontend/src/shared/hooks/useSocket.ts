import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { connectSocket, getSocket } from '@/shared/lib/socket'
import { showBanner } from '@/shared/components/CriticalBanner'

export function useSocket(token: string | null) {
  const queryClient = useQueryClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!token) return

    const socket = connectSocket(token)

    const handleIncidentCreated = (data: { severity?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      if (data?.severity === 'CRITICAL') {
        showBanner({
          title: 'Critical Incident Reported',
          message: 'A new critical incident requires immediate attention.',
          type: 'incident',
        })
      } else {
        toast.info('New incident reported')
      }
    }

    const handleIncidentUpdated = (data: { id?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['incidents', data.id] })
      }
    }

    const handleIncidentEscalated = () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      showBanner({
        title: 'Incident Escalated',
        message: 'An incident has been escalated to a higher priority.',
        type: 'escalation',
      })
    }

    const handleMarshalAssigned = (data: { zoneId?: string; zone?: { id?: string } }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['marshals', 'active'] })
      const zoneId = data?.zoneId || data?.zone?.id
      if (zoneId) {
        getSocket()?.emit('join:zone', { zoneId })
      }
      toast.info('Zone assignment received', {
        description: 'You have been assigned to a new zone.',
      })
    }

    const handleMarshalLocation = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['marshals', 'active'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      }, 2000)
    }

    const handleZoneAlert = (data: { title?: string; message?: string; zoneId?: string }) => {
      showBanner({
        title: data?.title || 'Zone Alert',
        message: data?.message || 'Alert in your zone',
        type: 'alert',
      })
    }

    const handleDashboardStats = (data: unknown) => {
      queryClient.setQueryData(['dashboard', 'summary'], data)
    }

    socket.on('incident:created', handleIncidentCreated)
    socket.on('incident:updated', handleIncidentUpdated)
    socket.on('incident:escalated', handleIncidentEscalated)
    socket.on('marshal:assigned', handleMarshalAssigned)
    socket.on('marshal:location_updated', handleMarshalLocation)
    socket.on('zone:alert', handleZoneAlert)
    socket.on('dashboard:stats', handleDashboardStats)

    return () => {
      socket.off('incident:created', handleIncidentCreated)
      socket.off('incident:updated', handleIncidentUpdated)
      socket.off('incident:escalated', handleIncidentEscalated)
      socket.off('marshal:assigned', handleMarshalAssigned)
      socket.off('marshal:location_updated', handleMarshalLocation)
      socket.off('zone:alert', handleZoneAlert)
      socket.off('dashboard:stats', handleDashboardStats)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [token, queryClient])
}
