// TEMPLATE FILE — part of admin-template v1.0
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp, Activity, Zap, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

import axiosClient from '@/api/axiosClient'
import KPICard from '@/components/common/KPICard'
import Badge from '@/components/common/Badge'
import DataTable from '@/components/common/DataTable'
import { formatDate, formatRelativeTime } from '@/utils/formatDate'
import { staggerContainer, fadeUp } from '@/components/common/PageMotion'
import { cn } from '@/lib/utils'

const STALE = 5 * 60 * 1000
const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

const SALES_DATA = [
  { region: 'North', sales: 4200, target: 4000 },
  { region: 'South', sales: 3800, target: 4200 },
  { region: 'East',  sales: 5100, target: 4500 },
  { region: 'West',  sales: 4700, target: 4800 },
  { region: 'Cntrl', sales: 3200, target: 3500 },
]

const TRAFFIC_DATA = [
  { name: 'Direct',   value: 35 },
  { name: 'Organic',  value: 28 },
  { name: 'Referral', value: 18 },
  { name: 'Social',   value: 12 },
  { name: 'Email',    value: 7  },
]

const AI_INSIGHTS = [
  { icon: TrendingUp, color: 'text-green-500', text: 'User growth up 23% — peak signups on Tuesdays.' },
  { icon: Zap,        color: 'text-yellow-500', text: 'Login failure rate 4× higher this week.' },
  { icon: Activity,   color: 'text-blue-500',  text: 'Dashboard is 42% of all page views.' },
]

const SYSTEM_SERVICES = [
  { name: 'Web Application',        status: 'operational', uptime: '99.98%' },
  { name: 'Authentication Service', status: 'operational', uptime: '100%'   },
  { name: 'Database',               status: 'operational', uptime: '99.95%' },
  { name: 'File Storage',           status: 'degraded',    uptime: '98.2%'  },
]

const TABLE_COLUMNS = [
  { key: 'name',    label: 'User',   sortable: true },
  { key: 'role',    label: 'Role',   sortable: true, render: (v) => <Badge variant="info">{v}</Badge> },
  { key: 'logins',  label: 'Logins', sortable: true },
  { key: 'lastSeen',label: 'Last Seen', render: (v) => <span className="text-xs text-muted-foreground">{v}</span> },
]
const TABLE_DATA = [
  { name: 'Super Admin',  role: 'Admin',     logins: 201, lastSeen: '30 min ago' },
  { name: 'Jane Smith',   role: 'Editor',    logins: 87,  lastSeen: '1 hr ago'   },
  { name: 'Bob Johnson',  role: 'Viewer',    logins: 34,  lastSeen: '3 hrs ago'  },
  { name: 'Alice Brown',  role: 'Moderator', logins: 12,  lastSeen: '2 days ago' },
  { name: 'Charlie Davis',role: 'Editor',    logins: 65,  lastSeen: '5 hrs ago'  },
]

const Tooltip_ = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function StatusIcon({ status }) {
  if (status === 'operational') return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
  if (status === 'degraded')    return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
  return <XCircle className="w-3.5 h-3.5 text-red-500" />
}

export default function DashboardPage() {
  const [autoRefresh, setAutoRefresh] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics', 'stats'],
    queryFn: () => axiosClient.get('/analytics/stats').then((r) => r.data.data),
    staleTime: STALE,
    refetchInterval: autoRefresh ? 30000 : false,
  })
  const { data: growth = [] } = useQuery({
    queryKey: ['analytics', 'user-growth'],
    queryFn: () => axiosClient.get('/analytics/user-growth').then((r) => r.data.data),
    staleTime: STALE,
  })
  const { data: loginActivity = [] } = useQuery({
    queryKey: ['analytics', 'login-activity'],
    queryFn: () => axiosClient.get('/analytics/login-activity').then((r) => r.data.data),
    staleTime: STALE,
  })
  const { data: logsPage } = useQuery({
    queryKey: ['audit-logs', 'recent'],
    queryFn: () => axiosClient.get('/audit-logs?limit=6').then((r) => r.data),
    staleTime: 60000,
    refetchInterval: autoRefresh ? 30000 : false,
  })
  const recentLogs = logsPage?.data || []

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── Row 1: Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">{formatDate(new Date())} · System overview</p>
        </div>
        <button
          onClick={() => setAutoRefresh((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            autoRefresh
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-card border-border text-muted-foreground hover:bg-accent'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
          {autoRefresh ? 'Live' : 'Auto Refresh'}
        </button>
      </div>

      {/* ── Row 2: KPI Cards ── */}
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0"
      >
        {[
          { title: 'Total Revenue',  value: '$48,295',                icon: 'DollarSign', color: 'green',  trend: 12.5, trendLabel: '+12.5% this month' },
          { title: 'Active Users',   value: stats?.activeUsers,       icon: 'Users',      color: 'blue',   trend: 1, trendLabel: `+${stats?.newUsersThisWeek ?? 0} this week`, loading: statsLoading },
          { title: 'New Signups',    value: stats?.newUsersThisWeek,  icon: 'UserPlus',   color: 'purple', trend: 8, trendLabel: '+8% vs last week',      loading: statsLoading },
          { title: 'System Uptime',  value: '99.9%',                  icon: 'Activity',   color: 'teal',   subtitle: 'All systems operational' },
        ].map((card, i) => (
          <motion.div key={i} variants={fadeUp}>
            <KPICard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Row 3: Main content — 3 columns ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">

        {/* Left: 2 charts stacked */}
        <div className="xl:col-span-1 flex flex-col gap-4 min-h-0">
          <ChartCard title="User Growth" subtitle="Last 12 months">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={growth} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tooltip_ />} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2} name="Users" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Traffic Sources">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={TRAFFIC_DATA} cx="50%" cy="45%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={3}>
                  {TRAFFIC_DATA.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<Tooltip_ />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Centre: 2 charts stacked */}
        <div className="xl:col-span-1 flex flex-col gap-4 min-h-0">
          <ChartCard title="Sales by Region" subtitle="Actual vs target">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={SALES_DATA} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tooltip_ />} />
                <Bar dataKey="sales"  fill="#3b82f6" name="Sales"  radius={[3,3,0,0]} />
                <Bar dataKey="target" fill="#e2e8f0" name="Target" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Login Activity" subtitle="30 days">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={loginActivity.slice(-14)} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tooltip_ />} />
                <Line type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={2} dot={false} name="Success" />
                <Line type="monotone" dataKey="failed"  stroke="#ef4444" strokeWidth={2} dot={false} name="Failed"  />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Right: AI insights + Quick Actions + Activity */}
        <div className="xl:col-span-1 flex flex-col gap-4 min-h-0">

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-transparent border border-primary/20 rounded-2xl p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI Insights</span>
              </div>
              <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">3 new</span>
            </div>
            <div className="space-y-2">
              {AI_INSIGHTS.map(({ icon: Icon, color, text }, i) => (
                <div key={i} className="flex items-start gap-2 bg-background/50 rounded-lg p-2">
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${color}`} />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card border border-border rounded-2xl p-4 shrink-0 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">System Status</p>
              <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                99.9% uptime
              </span>
            </div>
            <div className="space-y-2">
              {SYSTEM_SERVICES.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={s.status} />
                    <span className="text-xs text-foreground">{s.name}</span>
                  </div>
                  <span className={cn('text-[11px] font-medium capitalize', {
                    'text-green-600 dark:text-green-400': s.status === 'operational',
                    'text-yellow-600 dark:text-yellow-400': s.status === 'degraded',
                  })}>
                    {s.uptime}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <p className="text-xs font-semibold text-foreground">Recent Activity</p>
              <Link to="/audit-logs" className="text-[11px] text-primary hover:underline">View all →</Link>
            </div>
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {recentLogs.length === 0 && (
                <p className="text-xs text-muted-foreground">No recent activity.</p>
              )}
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {log.user?.name || 'System'}
                      <span className="font-normal text-muted-foreground"> · {log.action}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatRelativeTime(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Full-width Data Table ── */}
      <div className="shrink-0">
        <DataTable
          title="User Activity"
          columns={TABLE_COLUMNS}
          data={TABLE_DATA}
          pageSize={4}
          searchable
        />
      </div>
    </div>
  )
}
