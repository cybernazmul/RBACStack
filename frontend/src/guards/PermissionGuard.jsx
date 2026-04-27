// TEMPLATE FILE — part of admin-template v1.0
import { usePermission } from '@/hooks/usePermission'

export default function PermissionGuard({ permission, fallback = null, children }) {
  const allowed = usePermission(permission)
  return allowed ? children : fallback
}
