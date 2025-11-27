import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { apiService } from '@/services/apiService'
import { Plus, Search, X, MapPin, Building2, Phone, Mail, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Clients() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    address: '',
    city: '',
    country: '',
    notes: ''
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['clients', search],
    () => apiService.getClients({ search })
  )

  const createClientMutation = useMutation(
    (data: any) => apiService.createClient(data),
    {
      onSuccess: () => {
        toast.success('Client created successfully!')
        setIsModalOpen(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          industry: '',
          address: '',
          city: '',
          country: '',
          notes: ''
        })
        queryClient.invalidateQueries(['clients'])
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create client')
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Client name is required')
      return
    }
    createClientMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Clients
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your client relationships
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, email, or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : data?.clients?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {search ? 'Try adjusting your search terms to find what you are looking for.' : 'Get started by adding your first client to the system.'}
            </p>
            {!search && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                <Plus className="w-5 h-5" />
                Add Client
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100/50">
            {data?.clients?.map((client: any) => (
              <div
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="group p-6 hover:bg-white/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-primary font-bold text-lg border border-blue-100">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                        {client.name}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        {client.industry && (
                          <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-0.5 rounded-md">
                            <Building2 className="w-3.5 h-3.5" />
                            {client.industry}
                          </span>
                        )}
                        {client.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {client.email}
                          </span>
                        )}
                        {client.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {client.city}, {client.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-medium">Projects</p>
                      <p className="text-lg font-bold text-gray-900">{client._count?.projects || 0}</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-medium">Active Subs</p>
                      <p className="text-lg font-bold text-gray-900">{client._count?.subscriptions || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Client Side Panel */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden ${isModalOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
      >
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out ${isModalOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setIsModalOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-all duration-300 ease-out ${isModalOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="flex flex-col h-full">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
                <p className="text-sm text-gray-500 mt-1">Enter the details to register a new client</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <form id="create-client-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Company Information
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="e.g. Technology"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Contact Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="contact@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="123 Business St"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                    placeholder="Any additional information..."
                  />
                </div>
              </form>
            </div>

            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-client-form"
                disabled={createClientMutation.isLoading}
                className="px-8 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createClientMutation.isLoading ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

