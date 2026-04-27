// TEMPLATE FILE — part of admin-template v1.0
import { create } from 'zustand'

const savedTheme = localStorage.getItem('theme')

export const useUIStore = create((set) => ({
  darkMode: savedTheme === 'dark',
  sidebarCollapsed: false,
  mobileMenuOpen: false,

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return { darkMode: next }
    }),

  setDarkMode: (value) => {
    localStorage.setItem('theme', value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', value)
    set({ darkMode: value })
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}))
