// TEMPLATE FILE — part of admin-template v1.0
import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { modulesConfig } from '@/config/modules.config'
import { appConfig } from '@/config/app.config'
import { usePermissionStore } from '@/stores/permissionStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const GROUP_META = {
  'user-management': {
    label: 'User Management',
    icon: 'UsersRound',
  },
}

// Flyout submenu shown in collapsed mode
function CollapsedGroupFlyout({ group, visibleChildren, onClose }) {
  const flyoutRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  return (
    <div
      ref={flyoutRef}
      className="fixed z-50 ml-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-left-2 duration-150"
    >
      {/* Group label header */}
      <div className="px-3 py-2.5 border-b border-border bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {group.label}
        </p>
      </div>
      {/* Child links */}
      <div className="py-1">
        {visibleChildren.map((child) => {
          const ChildIcon = Icons[child.icon] || Icons.Circle
          return (
            <NavLink
              key={child.key}
              to={child.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <ChildIcon className="w-4 h-4 shrink-0" />
                  {child.label}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const hasPermission = usePermissionStore((s) => s.hasPermission)
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  // Which group is expanded (expanded mode)
  const [openGroup, setOpenGroup] = useState(null)

  // Collapsed flyout state: { groupKey, top, left }
  const [flyout, setFlyout] = useState(null)
  const groupBtnRefs = useRef({})

  // Auto-open the group that contains the active route
  useEffect(() => {
    const active = modulesConfig.find((m) => m.group && location.pathname.startsWith(m.path))
    if (active?.group) setOpenGroup(active.group)
  }, [location.pathname])

  // Close flyout when sidebar expands
  useEffect(() => {
    if (!sidebarCollapsed) setFlyout(null)
  }, [sidebarCollapsed])

  // Build nav order: insert group placeholder at first child's position
  const orderedNav = []
  const seenGroups = new Set()
  for (const mod of modulesConfig) {
    if (!mod.group) {
      orderedNav.push({ type: 'item', mod })
    } else if (!seenGroups.has(mod.group)) {
      seenGroups.add(mod.group)
      orderedNav.push({ type: 'group', groupKey: mod.group })
    }
  }

  const groups = Object.keys(GROUP_META).map((key) => ({
    key,
    ...GROUP_META[key],
    children: modulesConfig.filter((m) => m.group === key),
  }))

  function handleStandaloneClick() {
    setOpenGroup(null)
    setFlyout(null)
  }

  function toggleGroup(key) {
    setOpenGroup((prev) => (prev === key ? null : key))
  }

  function isGroupActive(groupKey) {
    return (
      groups
        .find((g) => g.key === groupKey)
        ?.children.some((c) => location.pathname.startsWith(c.path)) ?? false
    )
  }

  function openFlyout(groupKey) {
    const btn = groupBtnRefs.current[groupKey]
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setFlyout({ groupKey, top: rect.top, left: rect.right + 4 })
  }

  return (
    <>
      <aside
        className={cn(
          'flex flex-col min-h-screen bg-card border-r border-border transition-all duration-300 ease-in-out relative shrink-0',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center border-b border-border h-16 px-4 shrink-0',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Icons.LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-foreground truncate text-sm">{appConfig.appName}</span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors z-10 shadow-sm"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <Icons.ChevronRight className="w-3 h-3" />
            : <Icons.ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {orderedNav.map((entry) => {
            /* ── Standalone nav item ── */
            if (entry.type === 'item') {
              const { mod } = entry
              if (!hasPermission(mod.permissions[0])) return null
              const Icon = Icons[mod.icon] || Icons.Circle
              return (
                <NavLink
                  key={mod.key}
                  to={mod.path}
                  onClick={handleStandaloneClick}
                  title={sidebarCollapsed ? mod.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                      sidebarCollapsed && 'justify-center',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('shrink-0 transition-transform', sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4', !isActive && 'group-hover:scale-110')} />
                      {!sidebarCollapsed && <span className="truncate">{mod.label}</span>}
                    </>
                  )}
                </NavLink>
              )
            }

            /* ── Group ── */
            const group = groups.find((g) => g.key === entry.groupKey)
            if (!group) return null
            const visibleChildren = group.children.filter((c) => hasPermission(c.permissions[0]))
            if (visibleChildren.length === 0) return null

            const GroupIcon = Icons[group.icon] || Icons.Folder
            const active = isGroupActive(group.key)
            const open = openGroup === group.key
            const flyoutOpen = flyout?.groupKey === group.key

            return (
              <div key={group.key}>
                {/* Group header button */}
                <button
                  ref={(el) => { groupBtnRefs.current[group.key] = el }}
                  onClick={() => {
                    if (sidebarCollapsed) {
                      // Toggle flyout in collapsed mode
                      flyoutOpen ? setFlyout(null) : openFlyout(group.key)
                    } else {
                      toggleGroup(group.key)
                    }
                  }}
                  title={sidebarCollapsed ? group.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                    sidebarCollapsed ? 'justify-center' : 'justify-between',
                    // Active styling when a child route is active
                    (active && !open) || flyoutOpen
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className={cn('shrink-0 transition-transform group-hover:scale-110', sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4')} />
                    {!sidebarCollapsed && <span className="truncate">{group.label}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <Icons.ChevronDown
                      className={cn('w-3.5 h-3.5 shrink-0 transition-transform duration-200', open && 'rotate-180')}
                    />
                  )}
                  {/* Small dot indicator in collapsed mode when a child is active */}
                  {sidebarCollapsed && active && (
                    <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>

                {/* Expanded inline children (only in expanded sidebar) */}
                {!sidebarCollapsed && (
                  <div className={cn(
                    'overflow-hidden transition-all duration-200 ease-in-out',
                    open ? 'max-h-60 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
                  )}>
                    <div className="ml-3 pl-3 border-l border-border space-y-0.5 mb-0.5">
                      {visibleChildren.map((child) => {
                        const ChildIcon = Icons[child.icon] || Icons.Circle
                        return (
                          <NavLink
                            key={child.key}
                            to={child.path}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group/child',
                                isActive
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <ChildIcon className={cn('w-3.5 h-3.5 shrink-0', !isActive && 'group-hover/child:scale-110 transition-transform')} />
                                <span className="truncate">{child.label}</span>
                              </>
                            )}
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            v{appConfig.appVersion}
          </div>
        )}
      </aside>

      {/* Collapsed flyout — rendered outside aside to avoid clipping */}
      {flyout && sidebarCollapsed && (() => {
        const group = groups.find((g) => g.key === flyout.groupKey)
        if (!group) return null
        const visibleChildren = group.children.filter((c) => hasPermission(c.permissions[0]))
        return (
          <div style={{ position: 'fixed', top: flyout.top, left: flyout.left, zIndex: 50 }}>
            <CollapsedGroupFlyout
              group={group}
              visibleChildren={visibleChildren}
              onClose={() => setFlyout(null)}
            />
          </div>
        )
      })()}
    </>
  )
}
