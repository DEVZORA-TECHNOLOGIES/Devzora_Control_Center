import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { Plus, CreditCard, Calendar, TrendingUp, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

export default function Subscriptions() {
  const { data, isLoading } = useQuery('subscriptions', () => apiService.getSubscriptions({ isActive: true }))

  const subscriptions = data?.subscriptions || []
  const totalMRR = subscriptions.reduce((acc: number, sub: any) => {
    if (sub.billingCycle === 'MONTHLY') return acc + parseFloat(sub.amount)
    if (sub.billingCycle === 'ANNUAL') return acc + (parseFloat(sub.amount) / 12)
    return acc
  }, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Subscriptions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage recurring revenue streams
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5" />
          Add Subscription
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{subscriptions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">UGX {totalMRR.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Annual Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">UGX {(totalMRR * 12).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <CreditCard className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No active subscriptions</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start adding subscriptions to track your recurring revenue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100/50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cycle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Next Invoice</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-100/50">
                {subscriptions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-primary font-bold text-sm border border-blue-100">
                          {sub.client?.name?.charAt(0)}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{sub.client?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{sub.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        UGX {parseFloat(sub.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-medium">{sub.billingCycle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(sub.nextInvoiceDate), 'MMM d, yyyy')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


