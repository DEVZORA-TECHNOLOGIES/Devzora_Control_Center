import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  FileText,
  Calendar,
  BarChart3,
  RefreshCw,
  Settings,
  DollarSign
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/budgets', label: 'Budgets', icon: DollarSign },
  { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { path: '/renewals', label: 'Renewals', icon: RefreshCw },
  { path: '/invoices', label: 'Invoices', icon: FileText },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Devzora</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Control Center</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <span className="text-gray-700 font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate font-medium">{user?.role}</p>
          </div>
          <button
            onClick={() => toast('Settings coming soon!', { icon: '⚙️' })}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}


