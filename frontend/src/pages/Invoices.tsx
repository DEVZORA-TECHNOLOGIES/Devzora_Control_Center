import { useState } from 'react'
import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import {
  Plus,
  FileText,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Search,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Invoices() {
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data, isLoading, refetch } = useQuery(
    ['invoices', activeTab],
    () => apiService.getInvoices({
      status: activeTab === 'all' || activeTab === 'overdue' ? undefined : activeTab.toUpperCase(),
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

  const invoices = data?.invoices || []

  // Calculate stats
  const totalInvoiced = invoices.reduce((acc: number, inv: any) => acc + parseFloat(inv.total), 0)
  const paidAmount = invoices
    .filter((inv: any) => inv.status === 'PAID')
    .reduce((acc: number, inv: any) => acc + parseFloat(inv.total), 0)
  const pendingAmount = invoices
    .filter((inv: any) => inv.status === 'SENT' || inv.status === 'DRAFT')
    .reduce((acc: number, inv: any) => acc + parseFloat(inv.total), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">Manage invoices and payments</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invoiced</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">UGX {totalInvoiced.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Collected</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">UGX {paidAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">UGX {pendingAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
        {/* Tabs & Filter */}
        <div className="border-b border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-all ${activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create a new invoice to get started with billing your clients.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invoices.map((invoice: any) => (
              <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${invoice.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                            invoice.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' :
                              invoice.status === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{invoice.client?.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Issued: {format(new Date(invoice.createdAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span className={invoice.status === 'OVERDUE' ? 'text-red-600 font-medium' : ''}>
                          Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        UGX {parseFloat(invoice.total).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Send Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      {invoice.status === 'SENT' && (
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-xs font-medium transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Invoice</h2>
            <p className="text-gray-500 mb-6">
              This feature is coming soon! You can currently generate invoices from Subscriptions or Renewals.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


