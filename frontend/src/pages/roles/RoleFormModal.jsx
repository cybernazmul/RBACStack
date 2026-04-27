// TEMPLATE FILE — part of admin-template v1.0
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { createRole, updateRole, getRole } from './rolesApi'
import axiosClient from '@/api/axiosClient'

export default function RoleFormModal({ open, role, onClose, onSuccess }) {
  const isEdit = Boolean(role)
  const [selectedPerms, setSelectedPerms] = useState([])

  const { data: allPerms = [] } = useQuery({
    queryKey: ['permissions-list'],
    queryFn: () => axiosClient.get('/permissions').then((r) => r.data.data),
    enabled: open,
  })

  const { data: roleData } = useQuery({
    queryKey: ['role', role?.id],
    queryFn: () => getRole(role.id),
    enabled: open && isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (open) {
      reset({ name: role?.name || '', description: role?.description || '' })
      if (roleData) {
        setSelectedPerms(roleData.permissions.map((rp) => rp.permissionId))
      } else {
        setSelectedPerms([])
      }
    }
  }, [open, roleData])

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateRole(role.id, data) : createRole(data),
    onSuccess: () => { toast.success(isEdit ? 'Role updated' : 'Role created'); onSuccess() },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  function onSubmit(data) {
    mutation.mutate({ ...data, permissionIds: selectedPerms })
  }

  const toggle = (id) => setSelectedPerms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  // Group permissions by module
  const byModule = {}
  for (const perm of allPerms) {
    if (!byModule[perm.module]) byModule[perm.module] = []
    byModule[perm.module].push(perm)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Role' : 'Add Role'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Role Name</label>
          <input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
          <textarea {...register('description')} rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Permissions</label>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {Object.entries(byModule).map(([mod, perms]) => (
              <div key={mod}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{mod}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const ids = perms.map((p) => p.id)
                      const allSelected = ids.every((id) => selectedPerms.includes(id))
                      setSelectedPerms((prev) => allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])])
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {perms.every((p) => selectedPerms.includes(p.id)) ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {perms.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(perm.id)}
                        onChange={() => toggle(perm.id)}
                        className="rounded"
                      />
                      <span className="text-foreground">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
