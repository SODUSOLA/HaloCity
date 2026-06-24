import { Navigate, useRoutes } from 'react-router-dom'
import { useAuth } from '@/shared/stores/AuthContext'
import { ThemeProvider } from '@/shared/stores/ThemeContext'
import { CriticalBanner } from '@/shared/components/CriticalBanner'
import { OfflineBanner } from '@/shared/components/OfflineBanner'
import OnboardingTour from '@/shared/components/OnboardingTour'
import { useSocket } from '@/shared/hooks/useSocket'
import { BottomNav } from '@/shared/components/BottomNav'
import { Sidebar } from '@/shared/components/Sidebar'
import LandingPage from '@/features/landing/LandingPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import CitizenHome from '@/features/citizen-app/pages/HomePage'
import ReportWizardPage from '@/features/citizen-app/pages/ReportWizardPage'
import MyReportsPage from '@/features/citizen-app/pages/MyReportsPage'
import ReportDetailPage from '@/features/citizen-app/pages/ReportDetailPage'
import AlertsPage from '@/features/citizen-app/pages/AlertsPage'
import ProfilePage from '@/features/citizen-app/pages/ProfilePage'

/* marshal imports */
import MarshalDashboard from '@/features/marshal-app/pages/DashboardPage'
import AssignmentsPage from '@/features/marshal-app/pages/AssignmentsPage'
import AssignmentDetailPage from '@/features/marshal-app/pages/AssignmentDetailPage'
import MarshalMap from '@/features/marshal-app/pages/MapPage'
import MarshalNotifications from '@/features/marshal-app/pages/NotificationsPage'
import MarshalProfile from '@/features/marshal-app/pages/ProfilePage'

/* command center imports */
import CommandDashboard from '@/features/command-center/pages/DashboardPage'
import CommandIncidents from '@/features/command-center/pages/IncidentsPage'
import CommandMarshals from '@/features/command-center/pages/MarshalsPage'
import CommandZones from '@/features/command-center/pages/ZonesPage'
import CommandMaintenance from '@/features/command-center/pages/MaintenancePage'
import CommandEscalation from '@/features/command-center/pages/EscalationRulesPage'
import CommandIncidentMap from '@/features/command-center/pages/IncidentMapPage'

export default function App() {
  const { user, token, loading } = useAuth()
  const isAuthed = !!token && !!user

  const routing = useRoutes([
    {
      path: '/',
      element: isAuthed ? <RoleRedirect role={user!.role} /> : <LandingPage />,
    },
    {
      path: '/login',
      element: isAuthed ? <RoleRedirect role={user!.role} /> : <LoginPage />,
    },
    {
      path: '/register',
      element: isAuthed ? <RoleRedirect role={user!.role} /> : <RegisterPage />,
    },
    {
      path: '/app/*',
      element:
        token && user?.role === 'CITIZEN' ? (
          <>
            <OfflineBanner />
            <CriticalBanner />
            <OnboardingTour role="CITIZEN" />
            <main className="min-h-screen bg-[#F8FAFC] pb-16">
              <CitizenRoutes />
            </main>
            <BottomNav role="CITIZEN" />
          </>
        ) : (
          <Navigate to="/login" replace />
        ),
    },
    {
      path: '/marshal/*',
      element:
        token && user?.role === 'MAYOR' ? (
          <>
            <OfflineBanner />
            <CriticalBanner />
            <OnboardingTour role="MAYOR" />
            <main className="min-h-screen bg-[#F8FAFC] pb-16">
              <MarshalRoutes />
            </main>
            <BottomNav role="MAYOR" />
          </>
        ) : (
          <Navigate to="/login" replace />
        ),
    },
    {
      path: '/command/*',
      element:
        token && user?.role === 'ADMIN' ? (
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
              <CriticalBanner />
              <CommandRoutes />
            </main>
          </div>
        ) : (
          <Navigate to="/login" replace />
        ),
    },
    {
      path: '*',
      element: isAuthed ? <RoleRedirect role={user!.role} /> : <Navigate to="/" replace />,
    },
  ])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <ThemeProvider>
      <SocketManager token={token} />
      {routing}
    </ThemeProvider>
  )
}

function SocketManager({ token }: { token: string | null }) {
  useSocket(token)
  return null
}

function CitizenRoutes() {
  return useRoutes([
    { index: true, element: <CitizenHome /> },
    { path: 'report', element: <ReportWizardPage /> },
    { path: 'reports', element: <MyReportsPage /> },
    { path: 'reports/:id', element: <ReportDetailPage /> },
    { path: 'alerts', element: <AlertsPage /> },
    { path: 'profile', element: <ProfilePage /> },
  ])
}

function MarshalRoutes() {
  return useRoutes([
    { index: true, element: <MarshalDashboard /> },
    { path: 'assignments', element: <AssignmentsPage /> },
    { path: 'assignments/:id', element: <AssignmentDetailPage /> },
    { path: 'map', element: <MarshalMap /> },
    { path: 'notifications', element: <MarshalNotifications /> },
    { path: 'profile', element: <MarshalProfile /> },
  ])
}

function CommandRoutes() {
  return useRoutes([
    { index: true, element: <CommandDashboard /> },
    { path: 'incidents', element: <CommandIncidents /> },
    { path: 'marshals', element: <CommandMarshals /> },
    { path: 'zones', element: <CommandZones /> },
    { path: 'maintenance', element: <CommandMaintenance /> },
    { path: 'escalation-rules', element: <CommandEscalation /> },
    { path: 'map', element: <CommandIncidentMap /> },
  ])
}

function RoleRedirect({ role }: { role: string }) {
  if (role === 'ADMIN') return <Navigate to="/command" replace />
  if (role === 'MAYOR') return <Navigate to="/marshal" replace />
  return <Navigate to="/app" replace />
}
