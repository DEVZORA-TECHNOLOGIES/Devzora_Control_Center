import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import {
  Users,
  FolderKanban,
  DollarSign,
  AlertCircle,
  Calendar,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280', '#3B82F6'];

export default function Dashboard() {
  const { data, isLoading } = useQuery('dashboard', () => apiService.getDashboardStats())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = (data as any)?.stats
  const today = (data as any)?.today
  const thisWeek = (data as any)?.thisWeek
  const money = (data as any)?.money
  const projects = (data as any)?.projects || []

  // Aggregate projects by status for PieChart
  const projectStatusData = projects.reduce((acc: any[], project: any) => {
    const existing = acc.find(p => p.name === project.status)
    if (existing) {
      existing.value++
    } else {
      acc.push({ name: project.status, value: 1 })
    }
    return acc
  }, [])

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of your business operations
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 px-4 py-2 rounded-full border border-white/20 shadow-sm backdrop-blur-sm">
          <Calendar className="w-4 h-4" />
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Clients"
          value={stats?.activeClients || 0}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-100/50"
          trend="+12% from last month"
        />
        <StatsCard
          title="Active Projects"
          value={stats?.activeProjects || 0}
          icon={FolderKanban}
          color="text-green-600"
          bg="bg-green-100/50"
          trend="+5% from last month"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`UGX ${(stats?.mrr || 0).toLocaleString()}`}
          icon={DollarSign}
          color="text-purple-600"
          bg="bg-purple-100/50"
          trend="+8% from last month"
        />
        <StatsCard
          title="Overdue Invoices"
          value={stats?.overdueInvoices || 0}
          icon={AlertCircle}
          color="text-red-600"
          bg="bg-red-100/50"
          trend="Requires attention"
          trendColor="text-red-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Revenue Trend
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={money?.mrrData || []}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `UGX ${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMrr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            Project Status
          </h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">
                <p>No active projects</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {projectStatusData.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-600 capitalize">{entry.name.replace('_', ' ').toLowerCase()}</span>
                <span className="font-medium ml-auto">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Today's Schedule
            </h2>
            <Link to="/appointments" className="text-sm text-primary hover:underline">
              View Calendar
            </Link>
          </div>

          <div className="space-y-4">
            {today?.appointments?.length > 0 ? (
              today.appointments.map((apt: any) => (
                <div key={apt.id} className="group flex items-start gap-4 p-4 rounded-xl bg-white/50 border border-white/20 hover:bg-white/80 transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{apt.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {apt.client?.name} • {format(new Date(apt.date), 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-green-100 rounded-full text-green-600 transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Urgent Actions */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Urgent Actions
          </h2>

          <div className="space-y-4">
            {/* Overdue Invoices */}
            {money?.unpaidInvoices?.filter((i: any) => i.status === 'OVERDUE').slice(0, 3).map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Overdue Invoice #{invoice.invoiceNumber}</p>
                    <p className="text-sm text-red-600">{invoice.client?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">UGX {parseFloat(invoice.total).toLocaleString()}</p>
                  <p className="text-xs text-red-500">Due {format(new Date(invoice.dueDate), 'MMM d')}</p>
                </div>
              </div>
            ))}

            {/* Renewals */}
            {thisWeek?.renewals?.slice(0, 3).map((sub: any) => (
              <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Subscription Renewal</p>
                    <p className="text-sm text-amber-600">{sub.client?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">UGX {parseFloat(sub.amount).toLocaleString()}</p>
                  <p className="text-xs text-amber-500">Due {format(new Date(sub.nextInvoiceDate), 'MMM d')}</p>
                </div>
              </div>
            ))}

            {!money?.unpaidInvoices?.some((i: any) => i.status === 'OVERDUE') && !thisWeek?.renewals?.length && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                <p>All caught up! No urgent actions required.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, color, bg, trend, trendColor = "text-green-600" }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={`font-medium ${trendColor}`}>{trend}</span>
        </div>
      )}
    </div>
  )
}
