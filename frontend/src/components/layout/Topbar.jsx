// TEMPLATE FILE — part of admin-template v1.0
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Moon, Sun, Bell, Search, ChevronDown,
  Settings, LogOut, User, CreditCard,
  CheckCircle2, AlertTriangle, Info, Menu,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/utils/formatDate'
import UserAvatar from '@/components/common/UserAvatar'
import ModernSearch from '@/components/common/ModernSearch'

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'success', title: 'Backup completed',  message: 'Database backup finished successfully.',    time: new Date(Date.now() - 5 * 60000),    read: false },
  { id: 2, type: 'warning', title: 'High CPU usage',    message: 'Server CPU exceeded 85% for 10 min.',      time: new Date(Date.now() - 32 * 60000),   read: false },
  { id: 3, type: 'info',    title: 'New user registered', message: 'Jane Smith created an account.',         time: new Date(Date.now() - 2 * 3600000),  read: true  },
  { id: 4, type: 'warning', title: 'Storage warning',   message: 'Disk usage at 90% — consider cleanup.',   time: new Date(Date.now() - 5 * 3600000),  read: true  },
]

function NotifIcon({ type }) {
  if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />
  if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  return <Info className="w-4 h-4 text-blue-500" />
}

export default function Topbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, toggleMobileMenu } = useUIStore()

  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  const unread = notifications.filter((n) => !n.read).length

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e) {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function markAllRead() {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })))
  }

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 gap-3 shrink-0">

        {/* Hamburger — mobile only */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 pl-3 pr-4 py-2 max-w-xs w-full bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors group"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Search pages, actions…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-background border border-border rounded font-medium ml-2 group-hover:border-primary/30 transition-colors">
            ⌘K
          </kbd>
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Dark mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false) }}
              className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-semibold text-sm text-foreground">Notifications</span>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => setNotifications((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                      className={cn('flex gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors', !n.read && 'bg-primary/5')}
                    >
                      <div className="mt-0.5 shrink-0"><NotifIcon type={n.type} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-xs font-medium truncate', !n.read ? 'text-foreground' : 'text-muted-foreground')}>{n.title}</p>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{formatRelativeTime(n.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-border">
                  <button className="text-xs text-primary hover:underline w-full text-center">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false) }}
              className="flex items-center gap-2 pl-1.5 pr-1 py-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <UserAvatar user={user} size="sm" status="online" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-foreground leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{user?.role?.name}</p>
              </div>
              <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
                <div className="flex items-center gap-3 px-3 py-3 border-b border-border mb-1">
                  <UserAvatar user={user} size="md" ring />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                {[
                  { icon: User,       label: 'My Profile', path: '/settings' },
                  { icon: CreditCard, label: 'Billing',    path: '/settings' },
                  { icon: Settings,   label: 'Settings',   path: '/settings' },
                ].map(({ icon: Icon, label, path }) => (
                  <button
                    key={label}
                    onClick={() => { navigate(path); setProfileOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => { logout(); setProfileOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cmd+K Search Modal */}
      <ModernSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
