// TEMPLATE FILE — part of admin-template v1.0
import { create } from 'zustand'

export const usePermissionStore = create((set, get) => ({
  permissions: [],

  setPermissions: (list) => set({ permissions: list }),

  clearPermissions: () => set({ permissions: [] }),

  hasPermission: (name) => get().permissions.includes(name),
}))
