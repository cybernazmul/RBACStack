// TEMPLATE FILE — part of admin-template v1.0
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Search, X, Loader2, AlertTriangle } from 'lucide-react'
import axiosClient from '@/api/axiosClient'
import PageHeader from '@/components/common/PageHeader'
import Modal from '@/components/common/Modal'
import PermissionGuard from '@/guards/PermissionGuard'
import { usePermission } from '@/hooks/usePermission'
import { cn } from '@/lib/utils'

// ── Unchanged data fetcher ────────────────────────────────────────────────────
function getMatrix() {
  return axiosClient.get('/permissions/matrix').then((r) => r.data.data)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function humanizePermission(name) {
  const parts = name.split('.')
  if (parts.length < 2) return name
  const action = parts[parts.length - 1]
  const module = parts.slice(0, -1).join('.')
  const actionMap = {
    view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete',
    export: 'Export', reset_password: 'Reset Password', publish: 'Publish',
    upload: 'Upload',
  }
  const actionLabel = actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const moduleLabel = module.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return `${actionLabel} ${moduleLabel}`
}

function Highlight({ text = '', query = '' }) {
  if (!query.trim()) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-700/60 text-amber-900 dark:text-amber-100 rounded-sm px-0.5 not-italic font-medium">
            {part}
          </mark>
        ) : part
      )}
    </>
  )
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
        checked ? 'bg-primary' : 'bg-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer'
      )}
    >
      <span className={cn(
        'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-1'
      )} />
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PermissionsPage() {
  const qc = useQueryClient()
  const canEdit = usePermission('permissions.edit')

  // ── Existing state (unchanged) ───────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false)
  const [newPerm, setNewPerm] = useState({ name: '', module: '', description: '' })

  // ── New UI state ─────────────────────────────────────────────────────────
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [search, setSearch] = useState('')
  // pendingChanges: { [`${roleId}::${permId}`]: boolean }
  const [pendingChanges, setPendingChanges] = useState({})
  const searchRef = useRef(null)

  // ── Existing queries (unchanged API calls) ───────────────────────────────
  const { data, isLoading } = useQuery({ queryKey: ['permissions-matrix'], queryFn: getMatrix })

  // Unchanged add mutation
  const addMutation = useMutation({
    mutationFn: (data) => axiosClient.post('/permissions', data).then((r) => r.data),
    onSuccess: () => {
      toast.success('Permission added')
      qc.invalidateQueries(['permissions-matrix'])
      setAddOpen(false)
      setNewPerm({ name: '', module: '', description: '' })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  // Save mutation — calls the same PATCH endpoint for each actual change
  const saveMutation = useMutation({
    mutationFn: async () => {
      const toApply = Object.entries(pendingChanges).filter(([key, desired]) => {
        const [roleId, permId] = key.split('::')
        const original = roles.find((r) => r.id === roleId)
          ?.permissions.some((rp) => rp.permissionId === permId) ?? false
        return original !== desired
      })
      await Promise.all(
        toApply.map(([key]) => {
          const [roleId, permissionId] = key.split('::')
          // Same endpoint as the original toggleMutation
          return axiosClient.patch(`/roles/${roleId}/permissions/${permissionId}`)
        })
      )
      return toApply.length
    },
    onSuccess: (count) => {
      qc.invalidateQueries(['permissions-matrix'])
      setPendingChanges({})
      toast.success(`${count} change${count !== 1 ? 's' : ''} saved`)
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to save changes'),
  })

  const { roles = [], permissions = [] } = data || {}

  // Auto-select first role when data loads
  useEffect(() => {
    if (roles.length && !selectedRoleId) setSelectedRoleId(roles[0].id)
  }, [roles])

  // ── Derived state ─────────────────────────────────────────────────────────
  // Effective assignment: pending changes override API state
  const isAssigned = (roleId, permId) => {
    const key = `${roleId}::${permId}`
    if (key in pendingChanges) return pendingChanges[key]
    return roles.find((r) => r.id === roleId)
      ?.permissions.some((rp) => rp.permissionId === permId) ?? false
  }

  // Count only changes that actually differ from original DB state
  const actualChangeCount = Object.entries(pendingChanges).filter(([key, desired]) => {
    const [roleId, permId] = key.split('::')
    const original = roles.find((r) => r.id === roleId)
      ?.permissions.some((rp) => rp.permissionId === permId) ?? false
    return original !== desired
  }).length

  // Group permissions by module
  const byModule = {}
  for (const p of permissions) {
    if (!byModule[p.module]) byModule[p.module] = []
    byModule[p.module].push(p)
  }

  // Filter by search
  const q = search.toLowerCase().trim()
  const filteredModules = Object.entries(byModule)
    .map(([mod, perms]) => ({
      module: mod,
      perms: q
        ? perms.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              mod.toLowerCase().includes(q) ||
              (p.description || '').toLowerCase().includes(q)
          )
        : perms,
    }))
    .filter(({ perms }) => perms.length > 0)

  const totalResults = filteredModules.reduce((s, { perms }) => s + perms.length, 0)

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleToggle(permId) {
    if (!canEdit || !selectedRoleId) return
    const key = `${selectedRoleId}::${permId}`
    setPendingChanges((prev) => ({ ...prev, [key]: !isAssigned(selectedRoleId, permId) }))
  }

  function handleGrantAll(perms) {
    if (!canEdit || !selectedRoleId) return
    setPendingChanges((prev) => ({
      ...prev,
      ...Object.fromEntries(perms.map((p) => [`${selectedRoleId}::${p.id}`, true])),
    }))
  }

  function handleRevokeAll(perms) {
    if (!canEdit || !selectedRoleId) return
    setPendingChanges((prev) => ({
      ...prev,
      ...Object.fromEntries(perms.map((p) => [`${selectedRoleId}::${p.id}`, false])),
    }))
  }

  function handleDiscard() {
    setPendingChanges({})
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-10 bg-muted rounded-xl w-1/2" />
        <div className="animate-pulse h-12 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-48 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Top bar (unchanged) ── */}
      <PageHeader
        title="Permissions"
        description="Toggle permissions per role"
        actions={
          <PermissionGuard permission="permissions.edit">
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Permission
            </button>
          </PermissionGuard>
        }
      />

      {/* ── 1. Role filter chips ── */}
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => {
          const count = permissions.filter((p) => isAssigned(role.id, p.id)).length
          const active = selectedRoleId === role.id
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150',
                active
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              )}
            >
              {role.name}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold leading-none',
                active ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Unsaved changes bar ── */}
      {actualChangeCount > 0 && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {actualChangeCount} unsaved change{actualChangeCount !== 1 ? 's' : ''} across roles
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDiscard}
              className="px-3 py-1.5 text-sm border border-amber-300 dark:border-amber-600 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Search bar ── */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by permission name, code or module..."
            className="w-full pl-10 pr-10 py-2.5 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); searchRef.current?.focus() }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Result count */}
        {q && (
          <p className="text-sm text-muted-foreground pl-1">
            <span className="font-semibold text-foreground">{totalResults}</span>{' '}
            result{totalResults !== 1 ? 's' : ''} for{' '}
            <span className="text-amber-600 dark:text-amber-400 font-medium">"{search}"</span>
          </p>
        )}
      </div>

      {/* ── 3. Module boxes ── */}
      {filteredModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No permissions match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredModules.map(({ module, perms }) => {
            const granted = perms.filter((p) => isAssigned(selectedRoleId, p.id)).length
            const total = perms.length
            const percent = total ? Math.round((granted / total) * 100) : 0
            const allGranted = granted === total
            const noneGranted = granted === 0

            return (
              <div key={module} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Module header */}
                <div className="px-5 pt-4 pb-3 border-b border-border">
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <Highlight text={module} query={search} />
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {granted}/{total} granted
                      </span>
                      {canEdit && (
                        <>
                          {!allGranted && (
                            <button
                              onClick={() => handleGrantAll(perms)}
                              className="text-[11px] font-medium text-primary border border-primary/30 hover:bg-primary/10 px-2 py-0.5 rounded-full transition-colors"
                            >
                              Grant all
                            </button>
                          )}
                          {!noneGranted && (
                            <button
                              onClick={() => handleRevokeAll(perms)}
                              className="text-[11px] font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 px-2 py-0.5 rounded-full transition-colors"
                            >
                              Revoke all
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Permission rows */}
                <div className="divide-y divide-border">
                  {perms.map((perm) => {
                    const assigned = isAssigned(selectedRoleId, perm.id)
                    const rowMatches = q && (
                      perm.name.toLowerCase().includes(q) ||
                      (perm.description || '').toLowerCase().includes(q)
                    )

                    return (
                      <div
                        key={perm.id}
                        className={cn(
                          'flex items-center justify-between gap-4 px-5 py-3.5 transition-colors',
                          rowMatches
                            ? 'bg-amber-50/80 dark:bg-amber-900/10'
                            : 'hover:bg-muted/30'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            <Highlight text={humanizePermission(perm.name)} query={search} />
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            <Highlight text={perm.name} query={search} />
                          </p>
                        </div>
                        <Toggle
                          checked={assigned}
                          onChange={() => handleToggle(perm.id)}
                          disabled={!canEdit}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Permission modal (unchanged logic) ── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Permission" size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Permission Name</label>
            <input
              value={newPerm.name}
              onChange={(e) => setNewPerm((p) => ({ ...p, name: e.target.value }))}
              placeholder="module.action"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Module</label>
            <input
              value={newPerm.module}
              onChange={(e) => setNewPerm((p) => ({ ...p, module: e.target.value }))}
              placeholder="Products"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <input
              value={newPerm.description}
              onChange={(e) => setNewPerm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => addMutation.mutate(newPerm)}
              disabled={addMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {addMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Permission
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
