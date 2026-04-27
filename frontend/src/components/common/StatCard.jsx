// TEMPLATE FILE — part of admin-template v1.0
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StatCard({ title, value, icon, trend, trendLabel, danger }) {
  const Icon = Icons[icon] || Icons.BarChart2
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={cn('p-2 rounded-lg', danger ? 'bg-destructive/10' : 'bg-primary/10')}>
          <Icon className={cn('w-4 h-4', danger ? 'text-destructive' : 'text-primary')} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value ?? '—'}</div>
      {trendLabel && (
        <div className={cn('text-xs mt-1', trend >= 0 ? 'text-green-500' : 'text-red-500')}>
          {trend >= 0 ? '↑' : '↓'} {trendLabel}
        </div>
      )}
    </div>
  )
}
