// TEMPLATE FILE — part of admin-template v1.0
import { usePermissionStore } from '@/stores/permissionStore'

export const usePermission = (name) =>
  usePermissionStore((state) => state.hasPermission(name))
