import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { apiService } from '@/services/apiService'
import toast from 'react-hot-toast'
import { ArrowRight, Lock, Mail, BarChart3, Users, TrendingUp } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.login(email, password)
      setAuth(response.user, response.token)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img
              src="/src/assets/logo.jpg"
              alt="Devzora Logo"
              className="w-12 h-12 rounded-lg object-cover shadow-sm"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">Devzora</h2>
              <p className="text-white/80 text-sm">Control Center</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Manage Your Business<br />With Confidence
              </h1>
              <p className="text-white/80 text-lg">
                Streamline client relationships, track projects, and manage subscriptions all in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Users className="w-8 h-8 text-white mb-2" />
                <p className="text-white font-semibold">Client Management</p>
                <p className="text-white/70 text-sm mt-1">Track all your clients</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <BarChart3 className="w-8 h-8 text-white mb-2" />
                <p className="text-white font-semibold">Project Tracking</p>
                <p className="text-white/70 text-sm mt-1">Monitor progress</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <TrendingUp className="w-8 h-8 text-white mb-2" />
                <p className="text-white font-semibold">Revenue Insights</p>
                <p className="text-white/70 text-sm mt-1">Track your growth</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Lock className="w-8 h-8 text-white mb-2" />
                <p className="text-white font-semibold">Secure & Reliable</p>
                <p className="text-white/70 text-sm mt-1">Enterprise-grade</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            © 2025 Devzora Technologies. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src="/src/assets/logo.jpg"
              alt="Devzora Logo"
              className="w-10 h-10 rounded-lg object-cover shadow-sm"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Devzora</h2>
              <p className="text-gray-500 text-sm">Control Center</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="admin@devzora.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Demo Credentials</p>
              <p className="text-sm text-blue-700">
                <span className="font-mono">admin@devzora.com</span> / <span className="font-mono">password</span>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? <a href="#" className="text-primary hover:underline font-medium">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
