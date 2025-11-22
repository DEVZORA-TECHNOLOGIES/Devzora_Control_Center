import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { Users, FolderKanban, DollarSign, AlertCircle, Calendar, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { data, isLoading } = useQuery('dashboard', () => apiService.getDashboardStats())

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const stats = data?.stats
  const today = data?.today
  const thisWeek = data?.thisWeek
  const money = data?.money
  const projects = data?.projects

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your business operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.activeClients || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.activeProjects || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">MRR</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.mrr ? `UGX ${stats.mrr.toLocaleString()}` : 'UGX 0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue Invoices</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.overdueInvoices || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today & This Week */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today & This Week</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Today's Appointments
              </h3>
              <div className="space-y-2">
                {today?.appointments?.length > 0 ? (
                  today.appointments.map((apt: any) => (
                    <div key={apt.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{apt.title}</p>
                      <p className="text-sm text-gray-500">
                        {apt.client?.name} • {format(new Date(apt.date), 'h:mm a')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No appointments today</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Renewals Due This Week
              </h3>
              <div className="space-y-2">
                {thisWeek?.renewals?.length > 0 ? (
                  thisWeek.renewals.map((sub: any) => (
                    <div key={sub.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{sub.client?.name}</p>
                      <p className="text-sm text-gray-500">
                        {sub.productName} • UGX {parseFloat(sub.amount).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No renewals this week</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {projects?.slice(0, 5).map((project: any) => {
              const statusColors = {
                GREEN: 'bg-green-100 text-green-700',
                AMBER: 'bg-yellow-100 text-yellow-700',
                RED: 'bg-red-100 text-red-700',
                ON_HOLD: 'bg-gray-100 text-gray-700',
                COMPLETED: 'bg-blue-100 text-blue-700'
              }

              return (
                <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.client?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
                        {project.status}
                      </span>
                      <span className="text-sm text-gray-500">{project.percentComplete}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Money Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Money</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Unpaid & Overdue Invoices</h3>
            <div className="space-y-2">
              {money?.unpaidInvoices?.slice(0, 5).map((invoice: any) => (
                <div key={invoice.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.client?.name}</p>
                      <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        UGX {parseFloat(invoice.total).toLocaleString()}
                      </p>
                      <p className={`text-xs ${invoice.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-500'}`}>
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

