import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { LogOut, Search, Bell, Menu } from 'lucide-react'

export default function Header() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm transition-all hover:bg-gray-100 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}


