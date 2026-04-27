// TEMPLATE FILE — part of admin-template v1.0
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, ChevronDown, ChevronUp, Plus, X, ShieldAlert } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { createUser, updateUser } from './usersApi'
import axiosClient from '@/api/axiosClient'
import { cn } from '@/lib/utils'

// ─── Schemas (UNCHANGED) ──────────────────────────────────────────────────────
const baseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  roleId: z.string().min(1, 'Role is required'),
  isActive: z.boolean().optional(),
})

const createSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[A-Z]/, 'Must contain an uppercase letter'),
})

const editSchema = baseSchema.extend({
  password: z.string().min(8).optional().or(z.literal('')),
})

// ─── NEW: Permission Overrides Section ───────────────────────────────────────
function PermissionOverrides({ userId }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedPermId, setSelectedPermId] = useState('')
  const [selectedType, setSelectedType] = useState('grant')

  // Fetch current overrides for this user
  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: () => axiosClient.get(`/users/${userId}/permissions`).then((r) => r.data.data),
    enabled: !!userId && open,
  })

  // Fetch all permissions for the picker
  const { data: allPerms = [] } = useQuery({
    queryKey: ['permissions-list'],
    queryFn: () => axiosClient.get('/permissions').then((r) => r.data.data),
    enabled: open,
  })

  const setMutation = useMutation({
    mutationFn: ({ permissionId, type }) =>
      axiosClient.post(`/users/${userId}/permissions`, { permissionId, type }),
    onSuccess: () => {
      qc.invalidateQueries(['user-permissions', userId])
      setAdding(false)
      setSelectedPermId('')
      toast.success('Override applied')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const removeMutation = useMutation({
    mutationFn: (permissionId) =>
      axiosClient.delete(`/users/${userId}/permissions/${permissionId}`),
    onSuccess: () => {
      qc.invalidateQueries(['user-permissions', userId])
      toast.success('Override removed')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const clearMutation = useMutation({
    mutationFn: () => axiosClient.delete(`/users/${userId}/permissions`),
    onSuccess: () => {
      qc.invalidateQueries(['user-permissions', userId])
      toast.success('All overrides cleared')
    },
  })

  // Permissions not already overridden
  const overriddenIds = overrides.map((o) => o.permissionId)
  const available = allPerms.filter((p) => !overriddenIds.includes(p.id))

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium text-foreground"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Permission Overrides
          {overrides.length > 0 && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">
              {overrides.length}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 py-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            Grant or revoke individual permissions for this user on top of their role.
          </p>

          {/* Existing overrides */}
          {isLoading ? (
            <div className="animate-pulse h-8 bg-muted rounded" />
          ) : overrides.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No overrides set — using role permissions only.</p>
          ) : (
            <div className="space-y-1.5">
              {overrides.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded', {
                      'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400': o.type === 'grant',
                      'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400': o.type === 'revoke',
                    })}>
                      {o.type}
                    </span>
                    <span className="text-xs font-mono text-foreground">{o.permission.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(o.permissionId)}
                    disabled={removeMutation.isPending}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="text-xs text-destructive hover:underline mt-1"
              >
                Clear all overrides
              </button>
            </div>
          )}

          {/* Add override */}
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add override
            </button>
          ) : (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Permission</label>
                <select
                  value={selectedPermId}
                  onChange={(e) => setSelectedPermId(e.target.value)}
                  className="w-full px-2 py-1.5 border border-input rounded-lg bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select...</option>
                  {available.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-2 py-1.5 border border-input rounded-lg bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="grant">Grant</option>
                  <option value="revoke">Revoke</option>
                </select>
              </div>
              <button
                type="button"
                disabled={!selectedPermId || setMutation.isPending}
                onClick={() => setMutation.mutate({ permissionId: selectedPermId, type: selectedType })}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90"
              >
                {setMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="px-2 py-1.5 text-xs border border-border rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main modal (EXISTING CODE UNCHANGED) ────────────────────────────────────
export default function UserFormModal({ open, user, onClose, onSuccess }) {
  const isEdit = Boolean(user)
  const schema = isEdit ? editSchema : createSchema

  const { data: roles } = useQuery({
    queryKey: ['roles-list'],
    queryFn: () => axiosClient.get('/roles').then((r) => r.data.data),
    enabled: open,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset(
        user
          ? { name: user.name, email: user.email, roleId: user.roleId, isActive: user.isActive, password: '' }
          : { name: '', email: '', roleId: '', isActive: true, password: '' }
      )
    }
  }, [open, user])

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateUser(user.id, data) : createUser(data),
    onSuccess: () => {
      toast.success(isEdit ? 'User updated' : 'User created')
      onSuccess()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  function onSubmit(data) {
    if (isEdit && !data.password) delete data.password
    mutation.mutate(data)
  }

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name].message}</p>}
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Add User'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── All existing fields — UNCHANGED ── */}
        <Field label="Full Name" name="name" placeholder="Jane Smith" />
        <Field label="Email" name="email" type="email" placeholder="jane@example.com" />
        <Field label={isEdit ? 'New Password (leave blank to keep)' : 'Password'} name="password" type="password" placeholder="••••••••" />

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
          <select
            {...register('roleId')}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a role...</option>
            {roles?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {errors.roleId && <p className="mt-1 text-xs text-destructive">{errors.roleId.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" {...register('isActive')} className="rounded" />
          <label htmlFor="isActive" className="text-sm text-foreground">Active account</label>
        </div>

        {/* ── NEW: Permission overrides — only shown when editing ── */}
        {isEdit && user?.id && (
          <PermissionOverrides userId={user.id} />
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Cancel</button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
