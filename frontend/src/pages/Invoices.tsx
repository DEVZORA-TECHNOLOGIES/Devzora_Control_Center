import { useState } from 'react'
import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Invoices() {
  const [activeTab, setActiveTab] = useState<'draft' | 'sent' | 'paid' | 'overdue'>('draft')

  const { data, isLoading, refetch } = useQuery(
    ['invoices', activeTab],
    () => apiService.getInvoices({ 
      status: activeTab === 'overdue' ? undefined : activeTab.toUpperCase(),
      overdue: activeTab === 'overdue'
    })
  )

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await apiService.markInvoicePaid(invoiceId)
      toast.success('Invoice marked as paid')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update invoice')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">Manage invoices and payments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {(['draft', 'sent', 'paid', 'overdue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data?.invoices?.map((invoice: any) => (
              <div key={invoice.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-500 mt-1">{invoice.client?.name}</p>
                    <p className="text-sm text-gray-500">
                      Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        UGX {parseFloat(invoice.total).toLocaleString()}
                      </p>
                      <span className={`text-sm ${
                        invoice.status === 'PAID' ? 'text-green-600' :
                        invoice.status === 'OVERDUE' ? 'text-red-600' :
                        invoice.status === 'SENT' ? 'text-blue-600' :
                        'text-gray-500'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    {invoice.status === 'SENT' && (
                      <button
                        onClick={() => handleMarkPaid(invoice.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


