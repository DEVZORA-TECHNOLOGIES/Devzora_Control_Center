import { useState, memo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiService } from '@/services/apiService'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Plus, X, Edit2, Calendar, DollarSign, FileText, Briefcase } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

// SidePanel component moved outside to prevent recreation on every render
interface SidePanelProps {
  title: string
  children: React.ReactNode
  isLoading: boolean
  formId: string
  isOpen: boolean
  onClose: () => void
}

const SidePanel = memo(({ title, children, isLoading: submitting, formId, isOpen, onClose }: SidePanelProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div
        className={`absolute inset-0 bg-black transition-all duration-300 ease-out ${
          isOpen ? 'opacity-50 backdrop-blur-sm' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-all duration-300 ease-out pointer-events-auto ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={formId}
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

SidePanel.displayName = 'SidePanel'

// Detail Modal Component
interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const DetailModal = memo(({ isOpen, onClose, title, children }: DetailModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      <div
        className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
})

DetailModal.displayName = 'DetailModal'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'projects' | 'subscriptions' | 'invoices' | 'appointments'>('projects')
  const [openPanel, setOpenPanel] = useState<'project' | 'subscription' | 'invoice' | 'appointment' | null>(null)
  const [isEditingClient, setIsEditingClient] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ type: string; data: any } | null>(null)
  
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin'

  // Form states
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: '',
    milestones: [{ name: '', dueDate: '' }]
  })

  const [subscriptionForm, setSubscriptionForm] = useState({
    productName: '',
    plan: '',
    amount: '',
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
    startDate: new Date().toISOString().split('T')[0]
  })

  const [invoiceForm, setInvoiceForm] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: '1', rate: '', amount: '' }],
    tax: '0',
    notes: ''
  })

  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    location: '',
    projectId: ''
  })

  const { data, isLoading } = useQuery(
    ['client', id],
    () => apiService.getClient(id!),
    { enabled: !!id }
  )

  const client = data?.client

  // Client edit form state
  const [clientEditForm, setClientEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    address: '',
    city: '',
    country: '',
    notes: '',
    isActive: true
  })

  // Initialize edit form when client data loads
  useEffect(() => {
    if (client && !isEditingClient) {
      setClientEditForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        industry: client.industry || '',
        address: client.address || '',
        city: client.city || '',
        country: client.country || '',
        notes: client.notes || '',
        isActive: client.isActive !== undefined ? client.isActive : true
      })
    }
  }, [client, isEditingClient])

  // Mutations
  const updateClientMutation = useMutation(
    (data: any) => apiService.updateClient(id!, data),
    {
      onSuccess: () => {
        toast.success('Client updated successfully!')
        setIsEditingClient(false)
        queryClient.invalidateQueries(['client', id])
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update client')
      }
    }
  )
  const createProjectMutation = useMutation(
    (data: any) => apiService.createProject(data),
    {
      onSuccess: () => {
        toast.success('Project created successfully!')
        setOpenPanel(null)
        queryClient.invalidateQueries(['client', id])
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create project')
      }
    }
  )

  const createSubscriptionMutation = useMutation(
    (data: any) => apiService.createSubscription(data),
    {
      onSuccess: () => {
        toast.success('Subscription created successfully!')
        setOpenPanel(null)
        queryClient.invalidateQueries(['client', id])
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create subscription')
      }
    }
  )

  const createInvoiceMutation = useMutation(
    (data: any) => apiService.createInvoice(data),
    {
      onSuccess: () => {
        toast.success('Invoice created successfully!')
        setOpenPanel(null)
        queryClient.invalidateQueries(['client', id])
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create invoice')
      }
    }
  )

  const createAppointmentMutation = useMutation(
    (data: any) => apiService.createAppointment(data),
    {
      onSuccess: () => {
        toast.success('Appointment created successfully!')
        setOpenPanel(null)
        queryClient.invalidateQueries(['client', id])
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create appointment')
      }
    }
  )

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!projectForm.name || !projectForm.startDate) {
      toast.error('Project name and start date are required')
      return
    }

    const milestones = projectForm.milestones
      .filter(m => m.name && m.dueDate)
      .map(m => ({
        name: m.name,
        dueDate: new Date(m.dueDate).toISOString()
      }))

    createProjectMutation.mutate({
      name: projectForm.name,
      description: projectForm.description,
      clientId: id,
      ownerId: currentUser?.id,
      startDate: new Date(projectForm.startDate).toISOString(),
      targetEndDate: projectForm.targetEndDate ? new Date(projectForm.targetEndDate).toISOString() : null,
      milestones
    })
  }

  const handleSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!subscriptionForm.productName || !subscriptionForm.amount) {
      toast.error('Product name and amount are required')
      return
    }

    createSubscriptionMutation.mutate({
      ...subscriptionForm,
      clientId: id,
      amount: parseFloat(subscriptionForm.amount)
    })
  }

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const validItems = invoiceForm.items.filter(item => item.description && item.rate)
    if (validItems.length === 0) {
      toast.error('At least one invoice item is required')
      return
    }

    const items = validItems.map(item => ({
      description: item.description,
      quantity: parseFloat(item.quantity || '1'),
      rate: parseFloat(item.rate),
      amount: parseFloat(item.quantity || '1') * parseFloat(item.rate)
    }))

    createInvoiceMutation.mutate({
      clientId: id,
      issueDate: new Date(invoiceForm.issueDate).toISOString(),
      dueDate: new Date(invoiceForm.dueDate).toISOString(),
      items,
      tax: parseFloat(invoiceForm.tax || '0'),
      notes: invoiceForm.notes
    })
  }

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!appointmentForm.title || !appointmentForm.date) {
      toast.error('Title and date are required')
      return
    }

    createAppointmentMutation.mutate({
      ...appointmentForm,
      clientId: id,
      projectId: appointmentForm.projectId || null,
      ownerId: currentUser?.id
    })
  }

  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '1', rate: '', amount: '' }]
    }))
  }

  const updateInvoiceItem = (index: number, field: string, value: string) => {
    setInvoiceForm(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      if (field === 'quantity' || field === 'rate') {
        const qty = parseFloat(newItems[index].quantity || '1')
        const rate = parseFloat(newItems[index].rate || '0')
        newItems[index].amount = (qty * rate).toFixed(2)
      }
      return { ...prev, items: newItems }
    })
  }

  const removeInvoiceItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const addMilestone = () => {
    setProjectForm(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', dueDate: '' }]
    }))
  }

  const updateMilestone = (index: number, field: string, value: string) => {
    setProjectForm(prev => {
      const newMilestones = [...prev.milestones]
      newMilestones[index] = { ...newMilestones[index], [field]: value }
      return { ...prev, milestones: newMilestones }
    })
  }

  const removeMilestone = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const handleClientEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientEditForm.name) {
      toast.error('Client name is required')
      return
    }
    updateClientMutation.mutate(clientEditForm)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!client) {
    return <div>Client not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-500 mt-1">Client profile and details</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
          {isAdmin && (
            <button
              onClick={() => setIsEditingClient(!isEditingClient)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Edit2 className="w-4 h-4" />
              {isEditingClient ? 'Cancel Edit' : 'Edit Client'}
            </button>
          )}
        </div>
        {isEditingClient ? (
          <form onSubmit={handleClientEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientEditForm.name}
                  onChange={(e) => setClientEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={clientEditForm.email}
                  onChange={(e) => setClientEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={clientEditForm.phone}
                  onChange={(e) => setClientEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={clientEditForm.industry}
                  onChange={(e) => setClientEditForm(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={clientEditForm.city}
                  onChange={(e) => setClientEditForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={clientEditForm.country}
                  onChange={(e) => setClientEditForm(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  value={clientEditForm.address}
                  onChange={(e) => setClientEditForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={clientEditForm.notes}
                  onChange={(e) => setClientEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={clientEditForm.isActive}
                    onChange={(e) => setClientEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Active Client</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingClient(false)}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateClientMutation.isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateClientMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{client.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="font-medium text-gray-900">{client.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Industry</p>
              <p className="font-medium text-gray-900">{client.industry || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-medium text-gray-900">
                {[client.city, client.country].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
            {client.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-900">{client.address}</p>
              </div>
            )}
            {client.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="font-medium text-gray-900 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {(['projects', 'subscriptions', 'invoices', 'appointments'] as const).map((tab) => (
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

        <div className="p-6">
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setOpenPanel('project')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
              {client.projects?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No projects yet. Create your first project.</p>
                </div>
              ) : (
                client.projects?.map((project: any) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedItem({ type: 'project', data: project })}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        project.status === 'GREEN' ? 'bg-green-100 text-green-700' :
                        project.status === 'AMBER' ? 'bg-yellow-100 text-yellow-700' :
                        project.status === 'RED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setOpenPanel('subscription')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Subscription
                </button>
              </div>
              {client.subscriptions?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No subscriptions yet. Add your first subscription.</p>
                </div>
              ) : (
                client.subscriptions?.map((sub: any) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedItem({ type: 'subscription', data: sub })}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{sub.productName}</h3>
                        <p className="text-sm text-gray-500">{sub.plan} • {sub.billingCycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">UGX {parseFloat(sub.amount).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          Next: {format(new Date(sub.nextInvoiceDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setOpenPanel('invoice')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  New Invoice
                </button>
              </div>
              {client.invoices?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No invoices yet. Create your first invoice.</p>
                </div>
              ) : (
                client.invoices?.map((invoice: any) => (
                  <div
                    key={invoice.id}
                    onClick={() => setSelectedItem({ type: 'invoice', data: invoice })}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-gray-500">
                          Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">UGX {parseFloat(invoice.total).toLocaleString()}</p>
                        <span className={`text-sm ${
                          invoice.status === 'PAID' ? 'text-green-600' :
                          invoice.status === 'OVERDUE' ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setOpenPanel('appointment')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  New Appointment
                </button>
              </div>
              {client.appointments?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No appointments yet. Schedule your first appointment.</p>
                </div>
              ) : (
                client.appointments?.map((apt: any) => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedItem({ type: 'appointment', data: apt })}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{apt.title}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(apt.date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {apt.owner?.firstName} {apt.owner?.lastName}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Project Side Panel */}
      {openPanel === 'project' && (
        <SidePanel
          title="New Project"
          isLoading={createProjectMutation.isLoading}
          formId="project-form"
          isOpen={openPanel === 'project'}
          onClose={() => setOpenPanel(null)}
        >
          <form id="project-form" onSubmit={handleProjectSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectForm.name}
                onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., Restaurant Management System Deployment"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Project description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target End Date</label>
                <input
                  type="date"
                  value={projectForm.targetEndDate}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, targetEndDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Milestones</label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Milestone
                </button>
              </div>
              {projectForm.milestones.map((milestone, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                    placeholder="Milestone name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {projectForm.milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </form>
        </SidePanel>
      )}

      {/* Add Subscription Side Panel */}
      {openPanel === 'subscription' && (
        <SidePanel
          title="Add Subscription"
          isLoading={createSubscriptionMutation.isLoading}
          formId="subscription-form"
          isOpen={openPanel === 'subscription'}
          onClose={() => setOpenPanel(null)}
        >
          <form id="subscription-form" onSubmit={handleSubscriptionSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subscriptionForm.productName}
                onChange={(e) => setSubscriptionForm(prev => ({ ...prev, productName: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Restaurant Management System"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Plan</label>
              <input
                type="text"
                value={subscriptionForm.plan}
                onChange={(e) => setSubscriptionForm(prev => ({ ...prev, plan: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Standard, Enterprise"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (UGX) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={subscriptionForm.amount}
                  onChange={(e) => setSubscriptionForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1200000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Billing Cycle <span className="text-red-500">*</span>
                </label>
                <select
                  value={subscriptionForm.billingCycle}
                  onChange={(e) => setSubscriptionForm(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={subscriptionForm.startDate}
                onChange={(e) => setSubscriptionForm(prev => ({ ...prev, startDate: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
        </SidePanel>
      )}

      {/* New Invoice Side Panel */}
      {openPanel === 'invoice' && (
        <SidePanel
          title="New Invoice"
          isLoading={createInvoiceMutation.isLoading}
          formId="invoice-form"
          isOpen={openPanel === 'invoice'}
          onClose={() => setOpenPanel(null)}
        >
          <form id="invoice-form" onSubmit={handleInvoiceSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Date</label>
                <input
                  type="date"
                  value={invoiceForm.issueDate}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Invoice Items</label>
                <button
                  type="button"
                  onClick={addInvoiceItem}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Item
                </button>
              </div>
              {invoiceForm.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="col-span-5 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateInvoiceItem(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateInvoiceItem(index, 'rate', e.target.value)}
                    placeholder="Rate"
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={item.amount}
                    readOnly
                    placeholder="Amount"
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  {invoiceForm.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInvoiceItem(index)}
                      className="col-span-1 px-3 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tax (UGX)</label>
                <input
                  type="number"
                  value={invoiceForm.tax}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, tax: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </form>
        </SidePanel>
      )}

      {/* New Appointment Side Panel */}
      {openPanel === 'appointment' && (
        <SidePanel
          title="New Appointment"
          isLoading={createAppointmentMutation.isLoading}
          formId="appointment-form"
          isOpen={openPanel === 'appointment'}
          onClose={() => setOpenPanel(null)}
        >
          <form id="appointment-form" onSubmit={handleAppointmentSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={appointmentForm.title}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Monthly Check-in"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={appointmentForm.description}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Appointment description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={appointmentForm.location}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Office or Zoom link"
                />
              </div>
            </div>
            {client.projects && client.projects.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Related Project (Optional)</label>
                <select
                  value={appointmentForm.projectId}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None</option>
                  {client.projects.map((project: any) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
            )}
          </form>
        </SidePanel>
      )}

      {/* Detail Modals */}
      <DetailModal
        isOpen={selectedItem?.type === 'project'}
        onClose={() => setSelectedItem(null)}
        title="Project Details"
      >
        {selectedItem?.type === 'project' && selectedItem.data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Project Name</p>
                <p className="font-semibold text-gray-900">{selectedItem.data.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  selectedItem.data.status === 'GREEN' ? 'bg-green-100 text-green-700' :
                  selectedItem.data.status === 'AMBER' ? 'bg-yellow-100 text-yellow-700' :
                  selectedItem.data.status === 'RED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedItem.data.status}
                </span>
              </div>
              {selectedItem.data.startDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">{format(new Date(selectedItem.data.startDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              {selectedItem.data.targetEndDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Target End Date</p>
                  <p className="font-medium text-gray-900">{format(new Date(selectedItem.data.targetEndDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              {selectedItem.data.owner && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Owner</p>
                  <p className="font-medium text-gray-900">
                    {selectedItem.data.owner.firstName} {selectedItem.data.owner.lastName}
                  </p>
                </div>
              )}
              {selectedItem.data.progressPercent !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Progress</p>
                  <p className="font-medium text-gray-900">{selectedItem.data.progressPercent}%</p>
                </div>
              )}
            </div>
            {selectedItem.data.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="font-medium text-gray-900 whitespace-pre-wrap">{selectedItem.data.description}</p>
              </div>
            )}
            {selectedItem.data._count?.milestones > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Milestones</p>
                <p className="font-medium text-gray-900">{selectedItem.data._count.milestones} milestone(s)</p>
              </div>
            )}
          </div>
        )}
      </DetailModal>

      <DetailModal
        isOpen={selectedItem?.type === 'subscription'}
        onClose={() => setSelectedItem(null)}
        title="Subscription Details"
      >
        {selectedItem?.type === 'subscription' && selectedItem.data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Product Name</p>
                <p className="font-semibold text-gray-900">{selectedItem.data.productName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Plan</p>
                <p className="font-medium text-gray-900">{selectedItem.data.plan || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Billing Cycle</p>
                <p className="font-medium text-gray-900">{selectedItem.data.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className="font-semibold text-gray-900">UGX {parseFloat(selectedItem.data.amount).toLocaleString()}</p>
              </div>
              {selectedItem.data.startDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">{format(new Date(selectedItem.data.startDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              {selectedItem.data.nextInvoiceDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Invoice Date</p>
                  <p className="font-medium text-gray-900">{format(new Date(selectedItem.data.nextInvoiceDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  selectedItem.data.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedItem.data.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}
      </DetailModal>

      <DetailModal
        isOpen={selectedItem?.type === 'invoice'}
        onClose={() => setSelectedItem(null)}
        title="Invoice Details"
      >
        {selectedItem?.type === 'invoice' && selectedItem.data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                <p className="font-semibold text-gray-900">{selectedItem.data.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  selectedItem.data.status === 'PAID' ? 'bg-green-100 text-green-700' :
                  selectedItem.data.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedItem.data.status}
                </span>
              </div>
              {selectedItem.data.issueDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                  <p className="font-medium text-gray-900">{format(new Date(selectedItem.data.issueDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              {selectedItem.data.dueDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Due Date</p>
                  <p className="font-medium text-gray-900">{format(new Date(selectedItem.data.dueDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              {selectedItem.data.subscription && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Related Subscription</p>
                  <p className="font-medium text-gray-900">{selectedItem.data.subscription.productName}</p>
                </div>
              )}
              {selectedItem.data.creator && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created By</p>
                  <p className="font-medium text-gray-900">
                    {selectedItem.data.creator.firstName} {selectedItem.data.creator.lastName}
                  </p>
                </div>
              )}
            </div>
            {selectedItem.data.items && selectedItem.data.items.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Invoice Items</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedItem.data.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">UGX {parseFloat(item.rate).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">UGX {parseFloat(item.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-6 pt-4 border-t border-gray-200">
              {selectedItem.data.tax > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tax</p>
                  <p className="font-medium text-gray-900">UGX {parseFloat(selectedItem.data.tax).toLocaleString()}</p>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">UGX {parseFloat(selectedItem.data.total).toLocaleString()}</p>
              </div>
            </div>
            {selectedItem.data.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="font-medium text-gray-900 whitespace-pre-wrap">{selectedItem.data.notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailModal>

      <DetailModal
        isOpen={selectedItem?.type === 'appointment'}
        onClose={() => setSelectedItem(null)}
        title="Appointment Details"
      >
        {selectedItem?.type === 'appointment' && selectedItem.data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="font-semibold text-gray-900">{selectedItem.data.title}</p>
              </div>
              {selectedItem.data.project && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Related Project</p>
                  <p className="font-medium text-gray-900">{selectedItem.data.project.name}</p>
                </div>
              )}
              {selectedItem.data.date && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                  <p className="font-medium text-gray-900">{format(new Date(selectedItem.data.date), 'MMM d, yyyy h:mm a')}</p>
                </div>
              )}
              {selectedItem.data.location && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{selectedItem.data.location}</p>
                </div>
              )}
              {selectedItem.data.owner && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Owner</p>
                  <p className="font-medium text-gray-900">
                    {selectedItem.data.owner.firstName} {selectedItem.data.owner.lastName}
                  </p>
                </div>
              )}
            </div>
            {selectedItem.data.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="font-medium text-gray-900 whitespace-pre-wrap">{selectedItem.data.description}</p>
              </div>
            )}
          </div>
        )}
      </DetailModal>
    </div>
  )
}
