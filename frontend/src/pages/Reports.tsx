import { useState } from 'react'
import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { DollarSign, FolderKanban, AlertCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'projects' | 'overdue'>('revenue')

  const { data: revenueData, isLoading: revenueLoading } = useQuery(
    'revenue-report',
    () => apiService.getRevenueReport(),
    { enabled: activeTab === 'revenue' }
  )

  const { data: projectsData, isLoading: projectsLoading } = useQuery(
    'projects-report',
    () => apiService.getProjectsStatusReport(),
    { enabled: activeTab === 'projects' }
  )

  const { data: overdueData, isLoading: overdueLoading } = useQuery(
    'overdue-report',
    () => apiService.getOverdueReport(),
    { enabled: activeTab === 'overdue' }
  )

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Business insights and analytics</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {(['revenue', 'projects', 'overdue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm capitalize flex items-center gap-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'revenue' && <DollarSign className="w-4 h-4" />}
                {tab === 'projects' && <FolderKanban className="w-4 h-4" />}
                {tab === 'overdue' && <AlertCircle className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              {revenueLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Current MRR</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        UGX {(revenueData as any)?.currentMRR?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">ARR</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        UGX {(revenueData as any)?.arr?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={(revenueData as any)?.mrrOverTime || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(revenueData as any)?.renewalsByMonth || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthShort" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalAmount" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              {projectsLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries((projectsData as any)?.statusCounts || {}).map(([status, count]) => (
                      <div key={status} className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                        <p className="text-sm text-gray-500 mt-1">{status}</p>
                      </div>
                    ))}
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries((projectsData as any)?.statusCounts || {}).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries((projectsData as any)?.statusCounts || {}).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'overdue' && (
            <div className="space-y-6">
              {overdueLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Overdue Invoices</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {(overdueData as any)?.summary?.totalOverdueInvoices || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Overdue Amount</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        UGX {(overdueData as any)?.summary?.totalOverdueAmount?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Overdue Milestones</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {(overdueData as any)?.summary?.totalOverdueMilestones || 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Invoices</h3>
                    <div className="space-y-2">
                      {(overdueData as any)?.overdueInvoices?.map((invoice: any) => (
                        <div key={invoice.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{invoice.client?.name}</p>
                              <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-red-600 mt-1">
                                {invoice.daysOverdue} days overdue
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                UGX {parseFloat(invoice.total).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


