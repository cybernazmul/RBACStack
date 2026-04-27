// TEMPLATE FILE — part of admin-template v1.0
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, RefreshCw, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import axiosClient from '@/api/axiosClient'
import PageHeader from '@/components/common/PageHeader'
import Badge from '@/components/common/Badge'
import PermissionGuard from '@/guards/PermissionGuard'
import { formatDateTime } from '@/utils/formatDate'
import { modulesConfig } from '@/config/modules.config'

const MODULES = ['Auth', ...modulesConfig.map((m) => m.label)]

const defaultFilters = { userId: '', module: '', status: '', startDate: '', endDate: '' }

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(defaultFilters)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters, page],
    queryFn: () => axiosClient.get('/audit-logs', { params: { ...filters, page, limit: 10 } }).then((r) => r.data),
    keepPreviousData: true,
    refetchInterval: autoRefresh ? 30000 : false,
  })

  function updateFilter(key, val) {
    setFilters((f) => ({ ...f, [key]: val }))
    setPage(1)
  }

  function resetFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  function exportCsv() {
    const params = new URLSearchParams({ ...filters })
    window.open(`${axiosClient.defaults.baseURL}/audit-logs/export?${params}`)
  }

  const logs = data?.data || []

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Complete history of all system actions"
        actions={
          <PermissionGuard permission="logs.export">
            <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </PermissionGuard>
        }
      />

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select value={filters.module} onChange={(e) => updateFilter('module', e.target.value)} className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">All Modules</option>
            {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <input type="date" value={filters.startDate} onChange={(e) => updateFilter('startDate', e.target.value)} className="px-3 py-2 border border-input rounded-lg bg-background text-sm" />
          <input type="date" value={filters.endDate} onChange={(e) => updateFilter('endDate', e.target.value)} className="px-3 py-2 border border-input rounded-lg bg-background text-sm" />

          <button onClick={resetFilters} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent text-muted-foreground">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>

          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${autoRefresh ? 'border-primary text-primary bg-primary/10' : 'border-border hover:bg-accent text-muted-foreground'}`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 animate-pulse bg-muted rounded" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Module</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No logs found</td></tr>
              )}
              {logs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-foreground">{log.user?.name || <span className="text-muted-foreground">System</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.module}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{log.ipAddress || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={log.status === 'success' ? 'success' : 'danger'}>{log.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      {expanded === log.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr key={`${log.id}-meta`} className="bg-muted/10">
                      <td colSpan={8} className="px-6 py-3">
                        <pre className="text-xs text-foreground overflow-auto max-h-40 font-mono">
                          {JSON.stringify(log.meta, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
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
              <span className="px-3 py-1">{page} / {data.totalPages}</span>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-accent">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
