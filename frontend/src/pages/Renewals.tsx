import { useState } from 'react'
import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  Calendar,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react'

export default function Renewals() {
  const [period, setPeriod] = useState<'week' | 'month' | '3months'>('month')

  const { data, isLoading, refetch } = useQuery(
    ['renewals', period],
    () => apiService.getRenewals(period)
  )

  const handleGenerateInvoice = async (subscriptionId: string) => {
    try {
      await apiService.generateInvoiceFromSubscription(subscriptionId)
      toast.success('Invoice generated successfully')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invoice')
    }
  }

  const renewals = data?.renewals || []
  const totalValue = renewals.reduce((acc: number, r: any) => acc + parseFloat(r.amount), 0)
  const pendingCount = renewals.filter((r: any) => !r.invoiceStatus || r.invoiceStatus === 'NOT_INVOICED').length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Renewals</h1>
          <p className="text-gray-500 mt-1">Track upcoming subscription renewals</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {(['week', 'month', '3months'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${period === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'Next 3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Renewals</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{renewals.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Renewal Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">UGX {totalValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Action</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : renewals.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No renewals found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              There are no subscriptions renewing in this period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product & Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renewals.map((renewal: any) => (
                  <tr key={renewal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {renewal.client?.name?.charAt(0)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{renewal.client?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{renewal.productName}</div>
                        <div className="text-xs text-gray-500">{renewal.plan}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        UGX {parseFloat(renewal.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {format(new Date(renewal.nextInvoiceDate), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${renewal.invoiceStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                          renewal.invoiceStatus === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            renewal.invoiceStatus === 'DRAFT' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                        {renewal.invoiceStatus || 'NOT_INVOICED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {(!renewal.invoiceStatus || renewal.invoiceStatus === 'NOT_INVOICED') ? (
                        <button
                          onClick={() => handleGenerateInvoice(renewal.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Generate Invoice
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Invoice Created</span>
                      )}
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


