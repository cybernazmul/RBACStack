// TEMPLATE FILE — part of admin-template v1.0
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import axiosClient from '@/api/axiosClient'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { usePermission } from '@/hooks/usePermission'
import PageHeader from '@/components/common/PageHeader'

function Card({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-base font-semibold text-foreground mb-5">{title}</h2>
      {children}
    </div>
  )
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[A-Z]/, 'Must contain an uppercase letter'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { darkMode, toggleDarkMode } = useUIStore()
  const canEdit = usePermission('settings.edit')

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: '', email: '' } })
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name, email: user.email })
  }, [user])

  const profileMutation = useMutation({
    mutationFn: (data) => axiosClient.put('/users/me', data),
    onSuccess: () => toast.success('Profile updated'),
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data) => axiosClient.put('/users/me/password', data),
    onSuccess: () => { toast.success('Password updated'); passwordForm.reset() },
    onError: (e) => toast.error(e.response?.data?.error || 'Incorrect current password'),
  })

  const Field = ({ label, name, type = 'text', form, disabled }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        type={type}
        disabled={disabled}
        {...form.register(name)}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {form.formState.errors[name] && (
        <p className="mt-1 text-xs text-destructive">{form.formState.errors[name].message}</p>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and appearance" />
      <div className="space-y-6 max-w-2xl">

        {/* Profile */}
        <Card title="Profile">
          <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
            <Field label="Full Name" name="name" form={profileForm} disabled={!canEdit} />
            <Field label="Email" name="email" type="email" form={profileForm} disabled={!canEdit} />
            {canEdit && (
              <button type="submit" disabled={profileMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {profileMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Profile
              </button>
            )}
          </form>
        </Card>

        {/* Security */}
        <Card title="Security">
          <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
            <Field label="Current Password" name="currentPassword" type="password" form={passwordForm} disabled={!canEdit} />
            <Field label="New Password" name="newPassword" type="password" form={passwordForm} disabled={!canEdit} />
            <Field label="Confirm New Password" name="confirmPassword" type="password" form={passwordForm} disabled={!canEdit} />
            {canEdit && (
              <button type="submit" disabled={passwordMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {passwordMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Update Password
              </button>
            )}
          </form>
        </Card>

        {/* Appearance */}
        <Card title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle between light and dark theme</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
