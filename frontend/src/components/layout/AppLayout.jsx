// TEMPLATE FILE — part of admin-template v1.0
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import PageMotion from '@/components/common/PageMotion'
import { useUIStore } from '@/stores/uiStore'

export default function AppLayout() {
  const location = useLocation()
  const { mobileMenuOpen, closeMobileMenu } = useUIStore()

  // Close mobile menu on route change
  useEffect(() => { closeMobileMenu() }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar — static on md+, drawer on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:static md:z-auto md:flex md:shrink-0
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
          <PageMotion key={location.pathname}>
            <Outlet />
          </PageMotion>
        </main>
      </div>
    </div>
  )
}
