// TEMPLATE FILE — part of admin-template v1.0
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, KeyRound } from 'lucide-react'
import { getUsers, deleteUser } from './usersApi'
import UserFormModal from './UserFormModal'
import UserAvatar from '@/components/common/UserAvatar'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Badge from '@/components/common/Badge'
import PermissionGuard from '@/guards/PermissionGuard'
import { formatDateTime } from '@/utils/formatDate'
import { useDebounce } from '@/hooks/useDebounce'

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded" />
      ))}
    </div>
  )
}

export default function UsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [modal, setModal] = useState({ open: false, user: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, debouncedSearch],
    queryFn: () => getUsers({ page, limit: 10, search: debouncedSearch }),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('User deleted')
      qc.invalidateQueries(['users'])
      setConfirm({ open: false, id: null })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete'),
  })

  const openAdd = () => setModal({ open: true, user: null })
  const openEdit = (user) => setModal({ open: true, user })
  const closeModal = () => setModal({ open: false, user: null })

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts and role assignments"
        actions={
          <PermissionGuard permission="users.create">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </PermissionGuard>
        }
      />

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search users..."
          className="w-full pl-9 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6"><Skeleton /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Login</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No users found</td></tr>
              )}
              {data?.data?.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={user} size="sm" />
                      <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{user.role?.name}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <PermissionGuard permission="users.edit">
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="users.delete">
                        <button onClick={() => setConfirm({ open: true, id: user.id })} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
            <span>Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} of {data.total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-accent">Prev</button>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-accent">Next</button>
            </div>
          </div>
        )}
      </div>

      <UserFormModal
        open={modal.open}
        user={modal.user}
        onClose={closeModal}
        onSuccess={() => { closeModal(); qc.invalidateQueries(['users']) }}
      />

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={() => deleteMutation.mutate(confirm.id)}
        loading={deleteMutation.isPending}
        title="Delete User"
        description="This will permanently delete the user. This action cannot be undone."
      />
    </div>
  )
}
