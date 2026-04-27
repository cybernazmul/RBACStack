// TEMPLATE FILE — part of admin-template v1.0
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { RefreshCw, TrendingUp, Users, DollarSign, Activity, Zap } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

import axiosClient from '@/api/axiosClient'
import KPICard from '@/components/common/KPICard'
import SystemStatus from '@/components/common/SystemStatus'
import QuickActions from '@/components/common/QuickActions'
import DataTable from '@/components/common/DataTable'
import Badge from '@/components/common/Badge'
import { formatDate, formatRelativeTime } from '@/utils/formatDate'

const STALE = 5 * 60 * 1000
const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

// Mock data for extended widgets
const SALES_DATA = [
  { region: 'North', sales: 4200, target: 4000 },
  { region: 'South', sales: 3800, target: 4200 },
  { region: 'East', sales: 5100, target: 4500 },
  { region: 'West', sales: 4700, target: 4800 },
  { region: 'Central', sales: 3200, target: 3500 },
]

const TRAFFIC_DATA = [
  { name: 'Direct', value: 35 },
  { name: 'Organic', value: 28 },
  { name: 'Referral', value: 18 },
  { name: 'Social', value: 12 },
  { name: 'Email', value: 7 },
]

const AI_INSIGHTS = [
  { icon: TrendingUp, color: 'text-green-500', text: 'User growth is up 23% vs last month — peak signups on Tuesdays.' },
  { icon: Zap, color: 'text-yellow-500', text: 'Login failure rate increased 4× this week — consider adding CAPTCHA.' },
  { icon: Activity, color: 'text-blue-500', text: 'Dashboard module accounts for 42% of all page views.' },
]

const TABLE_COLUMNS = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'role', label: 'Role', sortable: true, render: (v) => <Badge variant="info">{v}</Badge> },
  { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'Active' ? 'success' : 'danger'}>{v}</Badge> },
  { key: 'logins', label: 'Logins', sortable: true },
  { key: 'lastSeen', label: 'Last Seen', sortable: true, render: (v) => <span className="text-muted-foreground text-xs">{v}</span> },
]

const TABLE_DATA = [
  { name: 'Super Admin', role: 'Admin', status: 'Active', logins: 142, lastSeen: '2 min ago' },
  { name: 'Jane Smith', role: 'Editor', status: 'Active', logins: 87, lastSeen: '1 hr ago' },
  { name: 'Bob Johnson', role: 'Viewer', status: 'Active', logins: 34, lastSeen: '3 hrs ago' },
  { name: 'Alice Brown', role: 'Moderator', status: 'Inactive', logins: 12, lastSeen: '2 days ago' },
  { name: 'Charlie Davis', role: 'Editor', status: 'Active', logins: 65, lastSeen: '5 hrs ago' },
  { name: 'Eve Wilson', role: 'Viewer', status: 'Active', logins: 9, lastSeen: '1 day ago' },
  { name: 'Frank Miller', role: 'Admin', status: 'Active', logins: 201, lastSeen: '30 min ago' },
]

function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  )
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

  const { data: roleDistribution = [] } = useQuery({
    queryKey: ['analytics', 'role-distribution'],
    queryFn: () => axiosClient.get('/analytics/role-distribution').then((r) => r.data.data),
    staleTime: STALE,
  })

  const { data: logsPage } = useQuery({
    queryKey: ['audit-logs', 'recent'],
    queryFn: () => axiosClient.get('/audit-logs?limit=8').then((r) => r.data),
    staleTime: 60000,
  })

  const recentLogs = logsPage?.data || []

  return (
    <div className="space-y-5 max-w-[1600px]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(new Date())} · Overview of your system</p>
        </div>
        <button
          onClick={() => setAutoRefresh((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            autoRefresh
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-card border-border text-muted-foreground hover:bg-accent'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
          {autoRefresh ? 'Live' : 'Auto Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value="$48,295"
          icon="DollarSign"
          color="green"
          trend={12.5}
          trendLabel="12.5% vs last month"
          subtitle=""
          loading={false}
        />
        <KPICard
          title="Active Users"
          value={stats?.activeUsers ?? '—'}
          icon="Users"
          color="blue"
          trend={stats?.newUsersThisWeek}
          trendLabel={`+${stats?.newUsersThisWeek ?? 0} this week`}
          loading={statsLoading}
        />
        <KPICard
          title="New Signups"
          value={stats?.newUsersThisWeek ?? '—'}
          icon="UserPlus"
          color="purple"
          trend={8}
          trendLabel="8% vs last week"
          loading={statsLoading}
        />
        <KPICard
          title="System Uptime"
          value="99.9%"
          icon="Activity"
          color="teal"
          subtitle="All services operational"
          loading={false}
        />
      </div>

      {/* AI Insights banner */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent border border-primary/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI-Generated Insights</span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium ml-auto">3 new</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AI_INSIGHTS.map(({ icon: Icon, color, text }, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-background/50 rounded-xl p-3">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
              <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="User Growth"
          subtitle="Monthly new registrations"
          className="lg:col-span-2"
          action={<span className="text-xs text-muted-foreground">Last 12 months</span>}
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#grad1)" strokeWidth={2} name="Users" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Traffic Sources" subtitle="Current distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={TRAFFIC_DATA} cx="50%" cy="45%" innerRadius={52} outerRadius={75} dataKey="value" paddingAngle={3}>
                {TRAFFIC_DATA.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Sales by Region" subtitle="Actual vs target">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SALES_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="region" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="sales" fill="#3b82f6" name="Sales" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#e2e8f0" name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Login Activity" subtitle="Success vs failed (30 days)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={loginActivity.slice(-14)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={2} dot={false} name="Success" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={false} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sortable data table */}
        <div className="xl:col-span-2">
          <DataTable
            title="User Activity"
            columns={TABLE_COLUMNS}
            data={TABLE_DATA}
            pageSize={5}
            searchable
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <QuickActions />

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
              <Link to="/audit-logs" className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {recentLogs.length === 0 && (
                <p className="text-xs text-muted-foreground">No recent activity.</p>
              )}
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {log.user?.name || 'System'}
                      <span className="font-normal text-muted-foreground"> · {log.action}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{formatRelativeTime(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Status — full width */}
      <SystemStatus />
    </div>
  )
}
