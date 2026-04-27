// TEMPLATE FILE — part of admin-template v1.0
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

// 17-color deterministic palette — same user always gets same color
const PALETTE = [
  { bg: 'bg-blue-500',    ring: 'ring-blue-200 dark:ring-blue-800' },
  { bg: 'bg-violet-500',  ring: 'ring-violet-200 dark:ring-violet-800' },
  { bg: 'bg-rose-500',    ring: 'ring-rose-200 dark:ring-rose-800' },
  { bg: 'bg-amber-500',   ring: 'ring-amber-200 dark:ring-amber-800' },
  { bg: 'bg-emerald-500', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  { bg: 'bg-cyan-500',    ring: 'ring-cyan-200 dark:ring-cyan-800' },
  { bg: 'bg-pink-500',    ring: 'ring-pink-200 dark:ring-pink-800' },
  { bg: 'bg-indigo-500',  ring: 'ring-indigo-200 dark:ring-indigo-800' },
  { bg: 'bg-teal-500',    ring: 'ring-teal-200 dark:ring-teal-800' },
  { bg: 'bg-orange-500',  ring: 'ring-orange-200 dark:ring-orange-800' },
  { bg: 'bg-lime-500',    ring: 'ring-lime-200 dark:ring-lime-800' },
  { bg: 'bg-fuchsia-500', ring: 'ring-fuchsia-200 dark:ring-fuchsia-800' },
  { bg: 'bg-sky-500',     ring: 'ring-sky-200 dark:ring-sky-800' },
  { bg: 'bg-red-500',     ring: 'ring-red-200 dark:ring-red-800' },
  { bg: 'bg-green-500',   ring: 'ring-green-200 dark:ring-green-800' },
  { bg: 'bg-yellow-500',  ring: 'ring-yellow-200 dark:ring-yellow-800' },
  { bg: 'bg-purple-500',  ring: 'ring-purple-200 dark:ring-purple-800' },
]

const STATUS_COLORS = {
  online:  'bg-green-500',
  away:    'bg-yellow-500',
  busy:    'bg-red-500',
  offline: 'bg-gray-400',
}

const SIZES = {
  xs:  { outer: 'w-6 h-6',   text: 'text-[10px]', icon: 'w-3 h-3',   dot: 'w-1.5 h-1.5 border' },
  sm:  { outer: 'w-7 h-7',   text: 'text-xs',     icon: 'w-3.5 h-3.5', dot: 'w-2 h-2 border' },
  md:  { outer: 'w-8 h-8',   text: 'text-sm',     icon: 'w-4 h-4',   dot: 'w-2 h-2 border' },
  lg:  { outer: 'w-10 h-10', text: 'text-base',   icon: 'w-5 h-5',   dot: 'w-2.5 h-2.5 border-2' },
  xl:  { outer: 'w-12 h-12', text: 'text-lg',     icon: 'w-6 h-6',   dot: 'w-3 h-3 border-2' },
  '2xl': { outer: 'w-16 h-16', text: 'text-2xl',  icon: 'w-7 h-7',   dot: 'w-3.5 h-3.5 border-2' },
}

function hashString(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function getColor(identifier = '') {
  return PALETTE[hashString(identifier) % PALETTE.length]
}

function getInitials(user = {}) {
  if (user.name) {
    const parts = user.name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  if (user.email) return user.email[0].toUpperCase()
  return '?'
}

/**
 * UserAvatar — deterministic color avatar
 *
 * Props:
 *   user       — { name?, email?, avatar? }
 *   size       — 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 *   status     — 'online' | 'away' | 'busy' | 'offline' | null
 *   className  — extra classes on the wrapper
 *   ring       — show a color ring matching the avatar color
 */
export default function UserAvatar({ user = {}, size = 'md', status = null, className = '', ring = false }) {
  const s = SIZES[size] || SIZES.md
  const color = getColor(user?.email || user?.name || '')
  const initials = getInitials(user)

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || 'User'}
          onError={(e) => { e.target.style.display = 'none' }}
          className={cn('rounded-full object-cover', s.outer, ring && `ring-2 ${color.ring}`)}
        />
      ) : (
        <div className={cn(
          'rounded-full flex items-center justify-center font-semibold text-white select-none',
          s.outer,
          color.bg,
          ring && `ring-2 ${color.ring}`
        )}>
          {initials !== '?' ? (
            <span className={s.text}>{initials}</span>
          ) : (
            <User className={s.icon} />
          )}
        </div>
      )}

      {status && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full border-white dark:border-card',
          s.dot,
          STATUS_COLORS[status] || STATUS_COLORS.offline
        )} />
      )}
    </div>
  )
}
