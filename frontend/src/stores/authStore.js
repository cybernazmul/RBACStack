// TEMPLATE FILE — part of admin-template v1.0
import { create } from 'zustand'
import axiosClient from '@/api/axiosClient'
import { setAccessToken, clearAccessToken } from '@/api/tokenStore'
import { usePermissionStore } from './permissionStore'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  init: async () => {
    try {
      const res = await axiosClient.post('/auth/refresh')
      const { accessToken, user } = res.data.data
      setAccessToken(accessToken)
      usePermissionStore.getState().setPermissions(user.permissions || [])
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      clearAccessToken()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password })
    const { accessToken, user } = res.data.data
    setAccessToken(accessToken)
    usePermissionStore.getState().setPermissions(user.permissions || [])
    set({ user, isAuthenticated: true })
    return user
  },

  logout: async () => {
    try {
      await axiosClient.post('/auth/logout')
    } catch {}
    clearAccessToken()
    usePermissionStore.getState().clearPermissions()
    set({ user: null, isAuthenticated: false })
    window.location.href = '/login'
  },

  setAccessToken: (token) => {
    setAccessToken(token)
  },
}))
