// TEMPLATE FILE — part of admin-template v1.0
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Users, Key } from 'lucide-react'
import { getRoles, deleteRole } from './rolesApi'
import RoleFormModal from './RoleFormModal'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Badge from '@/components/common/Badge'
import PermissionGuard from '@/guards/PermissionGuard'

export default function RolesPage() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(null)
  const [modal, setModal] = useState({ open: false, role: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })

  const { data: roles = [], isLoading } = useQuery({ queryKey: ['roles'], queryFn: getRoles })

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => { toast.success('Role deleted'); qc.invalidateQueries(['roles']); setConfirm({ open: false, id: null }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete'),
  })

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Manage roles and their permissions"
        actions={
          <PermissionGuard permission="roles.create">
            <button onClick={() => setModal({ open: true, role: null })} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Add Role
            </button>
          </PermissionGuard>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 animate-pulse bg-muted rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{role.name}</h3>
                  <div className="flex gap-1">
                    <PermissionGuard permission="roles.edit">
                      <button onClick={() => setModal({ open: true, role })} className="p-1.5 rounded hover:bg-accent text-muted-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="roles.delete">
                      <button onClick={() => setConfirm({ open: true, id: role.id })} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
                {role.description && <p className="text-xs text-muted-foreground mb-3">{role.description}</p>}
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{role._count?.users} users</span>
                  <span className="flex items-center gap-1"><Key className="w-3 h-3" />{role._count?.permissions} permissions</span>
                </div>
              </div>
              <button
                onClick={() => setExpanded(expanded === role.id ? null : role.id)}
                className="w-full px-5 py-2 border-t border-border text-xs text-muted-foreground hover:bg-muted/30 flex items-center justify-between"
              >
                View permissions
                {expanded === role.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {expanded === role.id && (
                <div className="px-5 pb-4 pt-2">
                  <RolePermissionChips roleId={role.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <RoleFormModal
        open={modal.open}
        role={modal.role}
        onClose={() => setModal({ open: false, role: null })}
        onSuccess={() => { setModal({ open: false, role: null }); qc.invalidateQueries(['roles']) }}
      />
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={() => deleteMutation.mutate(confirm.id)}
        loading={deleteMutation.isPending}
        title="Delete Role"
        description="Roles with assigned users cannot be deleted."
      />
    </div>
  )
}

function RolePermissionChips({ roleId }) {
  const { data: role } = useQuery({ queryKey: ['role', roleId], queryFn: () => import('./rolesApi').then(m => m.getRole(roleId)) })
  if (!role) return <div className="animate-pulse h-8 bg-muted rounded" />
  const byModule = {}
  for (const rp of role.permissions || []) {
    const m = rp.permission.module
    if (!byModule[m]) byModule[m] = []
    byModule[m].push(rp.permission.name)
  }
  return (
    <div className="space-y-2">
      {Object.entries(byModule).map(([mod, perms]) => (
        <div key={mod}>
          <p className="text-xs font-medium text-muted-foreground mb-1">{mod}</p>
          <div className="flex flex-wrap gap-1">
            {perms.map((p) => <Badge key={p} variant="info">{p.split('.')[1]}</Badge>)}
          </div>
        </div>
      ))}
      {Object.keys(byModule).length === 0 && <p className="text-xs text-muted-foreground">No permissions assigned</p>}
    </div>
  )
}
