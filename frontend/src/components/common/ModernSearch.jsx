// TEMPLATE FILE — part of admin-template v1.0
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { modulesConfig } from '@/config/modules.config'
import { usePermissionStore } from '@/stores/permissionStore'
import { cn } from '@/lib/utils'

// ── Search data ───────────────────────────────────────────────────────────────
function buildSearchItems(hasPermission) {
  const nav = modulesConfig
    .filter((m) => hasPermission(m.permissions[0]))
    .map((m) => ({
      id: `nav-${m.key}`,
      group: 'Navigate',
      label: m.label,
      description: m.path,
      icon: m.icon,
      path: m.path,
    }))

  const actions = [
    { id: 'act-add-user',   group: 'Actions', label: 'Add User',        description: 'Create a new user account',    icon: 'UserPlus',    path: '/users' },
    { id: 'act-add-role',   group: 'Actions', label: 'Add Role',        description: 'Create a new role',            icon: 'ShieldPlus',  path: '/roles' },
    { id: 'act-export',     group: 'Actions', label: 'Export Audit Log', description: 'Download CSV of audit logs',  icon: 'Download',    path: '/audit-logs' },
    { id: 'act-perms',      group: 'Actions', label: 'Manage Permissions', description: 'Edit role permissions',     icon: 'Key',         path: '/permissions' },
    { id: 'act-settings',   group: 'Actions', label: 'Profile Settings', description: 'Update your profile & theme', icon: 'Settings',   path: '/settings' },
  ]

  return [...nav, ...actions]
}

export default function ModernSearch({ open, onClose }) {
  const navigate = useNavigate()
  const hasPermission = usePermissionStore((s) => s.hasPermission)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const allItems = buildSearchItems(hasPermission)

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.group.toLowerCase().includes(query.toLowerCase())
      )
    : allItems

  // Group items
  const groups = filtered.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  // Flat list for keyboard navigation
  const flatList = filtered

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleSelect = useCallback((item) => {
    navigate(item.path)
    onClose()
  }, [navigate, onClose])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatList.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatList[activeIndex]) handleSelect(flatList[activeIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [flatList, activeIndex, handleSelect, onClose])

  // Reset active index when query changes
  useEffect(() => { setActiveIndex(0) }, [query])

  if (!open) return null

  let flatIdx = -1

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Icons.Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <Icons.X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Icons.SearchX className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No results for "<span className="text-foreground font-medium">{query}</span>"</p>
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group}
                </p>
                {items.map((item) => {
                  flatIdx++
                  const myIdx = flatIdx
                  const Icon = Icons[item.icon] || Icons.Circle
                  const isActive = activeIndex === myIdx

                  return (
                    <button
                      key={item.id}
                      data-active={isActive}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(myIdx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isActive ? 'bg-white/20' : 'bg-muted'
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className={cn('text-xs truncate', isActive ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                          {item.description}
                        </p>
                      </div>
                      {isActive && <Icons.CornerDownLeft className="w-3.5 h-3.5 shrink-0 opacity-60" />}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="kbd">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="kbd">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="kbd">Esc</kbd> close</span>
          <span className="ml-auto opacity-60">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>,
    document.body
  )
}
