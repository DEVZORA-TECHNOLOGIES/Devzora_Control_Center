import { useAuthStore } from '@/store/authStore'

// Smart API base URL detection:
// - In development (Vite dev server): use relative /api (leverages Vite proxy)
// - In production: use VITE_API_URL if set, otherwise use production default
// - Always ensures /api is appended correctly without duplication
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isDev = import.meta.env.DEV;

  // In development mode without explicit URL, use Vite proxy
  if (isDev && !envUrl) {
    return '/api';
  }

  // If VITE_API_URL is explicitly set (production or custom), use it
  if (envUrl) {
    let baseUrl = envUrl.replace(/\/$/, ''); // Remove trailing slash
    // If it doesn't already end with /api, add it
    if (!baseUrl.endsWith('/api')) {
      baseUrl = baseUrl + '/api';
    }
    return baseUrl;
  }

  // Production fallback (shouldn't happen if VITE_API_URL is set in Netlify)
  return 'https://devzora-control-center.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private getHeaders(): HeadersInit {
    const token = useAuthStore.getState().token
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.message || 'Request failed')
    }

    const data = await response.json()
    return data.data || data
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me')
  }

  // Clients
  async getClients(params?: { search?: string; isActive?: boolean }) {
    const query = new URLSearchParams()
    if (params?.search) query.append('search', params.search)
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive))
    return this.request<{ clients: any[] }>(`/clients?${query.toString()}`)
  }

  async getClient(id: string) {
    return this.request<{ client: any }>(`/clients/${id}`)
  }

  async createClient(data: any) {
    return this.request<{ client: any }>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateClient(id: string, data: any) {
    return this.request<{ client: any }>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Projects
  async getProjects(params?: { status?: string; ownerId?: string; clientId?: string }) {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.ownerId) query.append('ownerId', params.ownerId)
    if (params?.clientId) query.append('clientId', params.clientId)
    return this.request<{ projects: any[] }>(`/projects?${query.toString()}`)
  }

  async getProject(id: string) {
    return this.request<{ project: any }>(`/projects/${id}`)
  }

  async createProject(data: any) {
    return this.request<{ project: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: any) {
    return this.request<{ project: any }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateProjectProgress(id: string, data: any) {
    return this.request<{ project: any }>(`/projects/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Subscriptions
  async getSubscriptions(params?: { clientId?: string; isActive?: boolean }) {
    const query = new URLSearchParams()
    if (params?.clientId) query.append('clientId', params.clientId)
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive))
    return this.request<{ subscriptions: any[] }>(`/subscriptions?${query.toString()}`)
  }

  async getRenewals(period?: string) {
    const query = period ? `?period=${period}` : ''
    return this.request<{ renewals: any[] }>(`/subscriptions/renewals${query}`)
  }

  async createSubscription(data: any) {
    return this.request<{ subscription: any }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Invoices
  async getInvoices(params?: { status?: string; clientId?: string; overdue?: boolean }) {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.clientId) query.append('clientId', params.clientId)
    if (params?.overdue) query.append('overdue', 'true')
    return this.request<{ invoices: any[] }>(`/invoices?${query.toString()}`)
  }

  async createInvoice(data: any) {
    return this.request<{ invoice: any }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async generateInvoiceFromSubscription(subscriptionId: string, data?: any) {
    return this.request<{ invoice: any }>(`/invoices/from-subscription/${subscriptionId}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    })
  }

  async updateInvoice(id: string, data: any) {
    return this.request<{ invoice: any }>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async markInvoicePaid(id: string) {
    return this.request<{ invoice: any }>(`/invoices/${id}/paid`, {
      method: 'PATCH',
    })
  }

  // Appointments
  async getAppointments(params?: { clientId?: string; projectId?: string; ownerId?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams()
    if (params?.clientId) query.append('clientId', params.clientId)
    if (params?.projectId) query.append('projectId', params.projectId)
    if (params?.ownerId) query.append('ownerId', params.ownerId)
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    return this.request<{ appointments: any[] }>(`/appointments?${query.toString()}`)
  }

  async getMyWeek() {
    return this.request<{ appointments: any[] }>('/appointments/my-week')
  }

  async createAppointment(data: any) {
    return this.request<{ appointment: any }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard')
  }

  // Reports
  async getRevenueReport() {
    return this.request('/reports/revenue')
  }

  async getProjectsStatusReport() {
    return this.request('/reports/projects')
  }

  async getOverdueReport() {
    return this.request('/reports/overdue')
  }

  // Budgets
  async getBudgets(params?: { projectId?: string; category?: string }) {
    const query = new URLSearchParams()
    if (params?.projectId) query.append('projectId', params.projectId)
    if (params?.category) query.append('category', params.category)
    return this.request<{ budgets: any[] }>(`/budgets?${query.toString()}`)
  }

  async getBudget(id: string) {
    return this.request<{ budget: any }>(`/budgets/${id}`)
  }

  async createBudget(data: any) {
    return this.request<{ budget: any }>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBudget(id: string, data: any) {
    return this.request<{ budget: any }>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBudget(id: string) {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE',
    })
  }

  // Budget Items
  async createBudgetItem(budgetId: string, data: any) {
    return this.request<{ item: any }>(`/budgets/${budgetId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBudgetItem(budgetId: string, itemId: string, data: any) {
    return this.request<{ item: any }>(`/budgets/${budgetId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBudgetItem(budgetId: string, itemId: string) {
    return this.request(`/budgets/${budgetId}/items/${itemId}`, {
      method: 'DELETE',
    })
  }
}

export const apiService = new ApiService()

