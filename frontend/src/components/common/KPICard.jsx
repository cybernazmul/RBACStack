import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

const colorMap = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
}

export default function KPICard({ title, value, subtitle, icon, color = 'blue', trend, trendLabel, loading }) {
  const Icon = Icons[icon] || Icons.BarChart2
  const positive = trend >= 0

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-muted rounded w-24" />
          <div className="w-9 h-9 rounded-lg bg-muted" />
        </div>
        <div className="h-7 bg-muted rounded w-20 mb-2" />
        <div className="h-3 bg-muted rounded w-32" />
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110', colorMap[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value ?? '—'}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {trendLabel && (
          <span className={cn('text-xs font-medium flex items-center gap-0.5', positive ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
            {positive ? '↑' : '↓'} {trendLabel}
          </span>
        )}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  )
}
