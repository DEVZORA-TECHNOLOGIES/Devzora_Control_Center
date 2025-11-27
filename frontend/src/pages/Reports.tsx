import { useState } from 'react'
import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import {
  DollarSign,
  FolderKanban,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  CheckCircle2
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

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

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6']

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Business insights and performance metrics</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto w-fit">
            {(['revenue', 'projects', 'overdue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize flex items-center gap-2 transition-all ${activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
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
            <div className="space-y-8">
              {revenueLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</p>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        UGX {(revenueData as any)?.currentMRR?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12% from last month
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-500">Annual Run Rate</p>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        UGX {(revenueData as any)?.arr?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Projected annual revenue</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-500">Total Revenue YTD</p>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        UGX {(revenueData as any)?.totalRevenue?.toLocaleString() || '45,200,000'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Year to Date</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Growth (MRR)</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={(revenueData as any)?.mrrOverTime || []}>
                            <defs>
                              <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                              itemStyle={{ color: '#111827' }}
                            />
                            <Area type="monotone" dataKey="mrr" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorMrr)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Renewals by Month</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={(revenueData as any)?.renewalsByMonth || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="monthShort" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip
                              cursor={{ fill: '#F3F4F6' }}
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="totalAmount" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-8">
              {projectsLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries((projectsData as any)?.statusCounts || {}).map(([status, count]) => (
                      <div key={status} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-3xl font-bold text-gray-900">{count as number}</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{status}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Distribution</h3>
                      <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries((projectsData as any)?.statusCounts || {}).map(([name, value]) => ({ name, value }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.entries((projectsData as any)?.statusCounts || {}).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-center items-center text-center">
                      <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <FolderKanban className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Project Insights</h3>
                      <p className="text-gray-500 max-w-sm mt-2">
                        Detailed project analytics and timeline tracking features will be available in the next update.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'overdue' && (
            <div className="space-y-8">
              {overdueLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-red-600">Overdue Invoices</p>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-3xl font-bold text-red-700">
                        {(overdueData as any)?.summary?.totalOverdueInvoices || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-red-600">Total Overdue Amount</p>
                        <DollarSign className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-3xl font-bold text-red-700">
                        UGX {(overdueData as any)?.summary?.totalOverdueAmount?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-amber-600">Overdue Milestones</p>
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-3xl font-bold text-amber-700">
                        {(overdueData as any)?.summary?.totalOverdueMilestones || 0}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900">Overdue Invoices</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {(overdueData as any)?.overdueInvoices?.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p>No overdue invoices! Great job.</p>
                        </div>
                      ) : (
                        (overdueData as any)?.overdueInvoices?.map((invoice: any) => (
                          <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                                  !
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{invoice.client?.name}</p>
                                  <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      {invoice.daysOverdue} days overdue
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                  UGX {parseFloat(invoice.total).toLocaleString()}
                                </p>
                                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                  Send Reminder
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
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


