// TEMPLATE FILE — part of admin-template v1.0
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import AuthGuard from '@/guards/AuthGuard'
import PermissionGuard from '@/guards/PermissionGuard'
import { modulesConfig } from '@/config/modules.config'

const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-6 h-6 animate-spin text-primary" />
  </div>
)

// Core page imports
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const UsersPage = lazy(() => import('@/pages/users/UsersPage'))
const RolesPage = lazy(() => import('@/pages/roles/RolesPage'))
const PermissionsPage = lazy(() => import('@/pages/permissions/PermissionsPage'))
const AuditLogsPage = lazy(() => import('@/pages/audit-logs/AuditLogsPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))

// Dynamic routes for non-core modules
const customModuleRoutes = modulesConfig
  .filter((m) => !m.core)
  .map((mod) => {
    const key = mod.key
    const label = key.replace(/-./g, (x) => x[1].toUpperCase())
    const PageComponent = lazy(() =>
      import(`@/pages/${key}/${label.charAt(0).toUpperCase() + label.slice(1)}Page.jsx`)
    )
    return {
      path: mod.path.replace(/^\//, ''),
      element: (
        <PermissionGuard permission={mod.permissions[0]} fallback={<Navigate to="/dashboard" replace />}>
          <Suspense fallback={<Loading />}>
            <PageComponent />
          </Suspense>
        </PermissionGuard>
      ),
    }
  })

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <PermissionGuard permission="analytics.view" fallback={<Navigate to="/settings" replace />}>
            <Suspense fallback={<Loading />}><DashboardPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <PermissionGuard permission="users.view" fallback={<Navigate to="/dashboard" replace />}>
            <Suspense fallback={<Loading />}><UsersPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'roles',
        element: (
          <PermissionGuard permission="roles.view" fallback={<Navigate to="/dashboard" replace />}>
            <Suspense fallback={<Loading />}><RolesPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'permissions',
        element: (
          <PermissionGuard permission="permissions.view" fallback={<Navigate to="/dashboard" replace />}>
            <Suspense fallback={<Loading />}><PermissionsPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <PermissionGuard permission="logs.view" fallback={<Navigate to="/dashboard" replace />}>
            <Suspense fallback={<Loading />}><AuditLogsPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <PermissionGuard permission="settings.view" fallback={<Navigate to="/dashboard" replace />}>
            <Suspense fallback={<Loading />}><SettingsPage /></Suspense>
          </PermissionGuard>
        ),
      },
      ...customModuleRoutes,
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default router
