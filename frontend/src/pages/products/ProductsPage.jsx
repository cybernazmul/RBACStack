/**
 * TEMPLATE MODULE — admin-template v1.0
 * To adapt: replace 'Product'/'product'/'products' with your entity name.
 * Update table columns, search fields, and API calls to match your model.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { getProducts, deleteProduct } from './productsApi'
import ProductFormModal from './ProductFormModal'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Badge from '@/components/common/Badge'
import PermissionGuard from '@/guards/PermissionGuard'
import { formatDate } from '@/utils/formatDate'
import { useDebounce } from '@/hooks/useDebounce'

export default function ProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [modal, setModal] = useState({ open: false, product: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, debouncedSearch],
    queryFn: () => getProducts({ page, limit: 10, search: debouncedSearch }),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries(['products']); setConfirm({ open: false, id: null }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete'),
  })

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <PermissionGuard permission="products.create">
            <button onClick={() => setModal({ open: true, product: null })} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </PermissionGuard>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 animate-pulse bg-muted rounded" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No products found</td></tr>
              )}
              {data?.data?.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">${Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.category || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={product.isActive ? 'success' : 'danger'}>{product.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(product.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <PermissionGuard permission="products.edit">
                        <button onClick={() => setModal({ open: true, product })} className="p-1.5 rounded hover:bg-accent text-muted-foreground">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="products.delete">
                        <button onClick={() => setConfirm({ open: true, id: product.id })} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
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

      <ProductFormModal
        open={modal.open}
        product={modal.product}
        onClose={() => setModal({ open: false, product: null })}
        onSuccess={() => { setModal({ open: false, product: null }); qc.invalidateQueries(['products']) }}
      />
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={() => deleteMutation.mutate(confirm.id)}
        loading={deleteMutation.isPending}
        title="Delete Product"
        description="This will permanently delete the product."
      />
    </div>
  )
}
