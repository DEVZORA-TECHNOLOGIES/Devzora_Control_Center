import { useState } from 'react'
import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Renewals</h1>
          <p className="text-gray-500 mt-1">Track upcoming subscription renewals</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', '3months'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'Next 3 Months'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.renewals?.map((renewal: any) => (
                <tr key={renewal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{renewal.client?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{renewal.productName}</div>
                    <div className="text-xs text-gray-500">{renewal.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      UGX {parseFloat(renewal.amount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(renewal.nextInvoiceDate), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      renewal.invoiceStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                      renewal.invoiceStatus === 'SENT' ? 'bg-blue-100 text-blue-700' :
                      renewal.invoiceStatus === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {renewal.invoiceStatus || 'NOT_INVOICED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(!renewal.invoiceStatus || renewal.invoiceStatus === 'NOT_INVOICED') && (
                      <button
                        onClick={() => handleGenerateInvoice(renewal.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Generate Invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

