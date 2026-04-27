/**
 * TEMPLATE MODULE — admin-template v1.0
 * To adapt: replace 'Product'/'product' with your entity.
 * Update fields and Zod schema to match your model.
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { createProduct, updateProduct } from './productsApi'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
})

export default function ProductFormModal({ open, product, onClose, onSuccess }) {
  const isEdit = Boolean(product)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset(product
        ? { name: product.name, price: product.price, description: product.description || '', category: product.category || '', isActive: product.isActive }
        : { name: '', price: '', description: '', category: '', isActive: true }
      )
    }
  }, [open, product])

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateProduct(product.id, data) : createProduct(data),
    onSuccess: () => { toast.success(isEdit ? 'Product updated' : 'Product created'); onSuccess() },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input type={type} {...register(name)} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name].message}</p>}
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Field label="Product Name" name="name" placeholder="Widget Pro" />
        <Field label="Price" name="price" type="number" placeholder="29.99" />
        <Field label="Category" name="category" placeholder="Electronics" />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
          <textarea {...register('description')} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" {...register('isActive')} className="rounded" />
          <label htmlFor="isActive" className="text-sm text-foreground">Active product</label>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
