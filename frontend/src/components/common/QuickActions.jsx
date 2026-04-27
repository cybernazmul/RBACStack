import { useNavigate } from 'react-router-dom'
import { UserPlus, FileBarChart, Download, Plus, Shield, ScrollText } from 'lucide-react'

const ACTIONS = [
  { icon: UserPlus, label: 'Add User', color: 'bg-blue-500 hover:bg-blue-600', path: '/users' },
  { icon: Shield, label: 'Add Role', color: 'bg-purple-500 hover:bg-purple-600', path: '/roles' },
  { icon: FileBarChart, label: 'View Reports', color: 'bg-green-500 hover:bg-green-600', path: '/audit-logs' },
  { icon: ScrollText, label: 'Audit Logs', color: 'bg-orange-500 hover:bg-orange-600', path: '/audit-logs' },
  { icon: Download, label: 'Export Data', color: 'bg-teal-500 hover:bg-teal-600', path: '/audit-logs' },
  { icon: Plus, label: 'New Module', color: 'bg-pink-500 hover:bg-pink-600', path: '/settings' },
]

export default function QuickActions() {
  const navigate = useNavigate()
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map(({ icon: Icon, label, color, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-accent transition-all group"
          >
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
