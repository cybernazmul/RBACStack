import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const SERVICES = [
  { name: 'Web Application', status: 'operational', uptime: '99.98%' },
  { name: 'Authentication Service', status: 'operational', uptime: '100%' },
  { name: 'Database', status: 'operational', uptime: '99.95%' },
  { name: 'File Storage', status: 'degraded', uptime: '98.2%' },
]

const UPTIME_BARS = Array.from({ length: 90 }, (_, i) => {
  const r = Math.random()
  return r > 0.97 ? 'degraded' : r > 0.995 ? 'down' : 'up'
})

function StatusDot({ status }) {
  return (
    <span className={cn('inline-flex w-2 h-2 rounded-full', {
      'bg-green-500': status === 'operational',
      'bg-yellow-500': status === 'degraded',
      'bg-red-500': status === 'down',
    })} />
  )
}

function StatusIcon({ status }) {
  if (status === 'operational') return <CheckCircle2 className="w-4 h-4 text-green-500" />
  if (status === 'degraded') return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  return <XCircle className="w-4 h-4 text-red-500" />
}

export default function SystemStatus() {
  const allOperational = SERVICES.every((s) => s.status === 'operational')
  const hasDegraded = SERVICES.some((s) => s.status === 'degraded')

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">System Status</h3>
        <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', {
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': allOperational,
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': hasDegraded && !allOperational,
        })}>
          <StatusDot status={allOperational ? 'operational' : 'degraded'} />
          {allOperational ? 'All systems operational' : 'Partial degradation'}
        </span>
      </div>

      <div className="space-y-3">
        {SERVICES.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusIcon status={svc.status} />
              <span className="text-sm text-foreground">{svc.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{svc.uptime}</span>
              <span className={cn('text-xs font-medium capitalize', {
                'text-green-600 dark:text-green-400': svc.status === 'operational',
                'text-yellow-600 dark:text-yellow-400': svc.status === 'degraded',
                'text-red-600 dark:text-red-400': svc.status === 'down',
              })}>
                {svc.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 90-day uptime history */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">90-day history</span>
          <span className="text-xs font-medium text-green-600 dark:text-green-400">99.9% uptime</span>
        </div>
        <div className="flex gap-0.5">
          {UPTIME_BARS.map((status, i) => (
            <div
              key={i}
              title={status === 'up' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Down'}
              className={cn('flex-1 h-6 rounded-sm transition-opacity hover:opacity-70 cursor-default', {
                'bg-green-500': status === 'up',
                'bg-yellow-500': status === 'degraded',
                'bg-red-500': status === 'down',
              })}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">90 days ago</span>
          <span className="text-[10px] text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  )
}
