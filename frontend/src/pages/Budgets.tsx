import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiService } from '@/services/apiService'
import {
    Plus, X, DollarSign, PieChart, TrendingUp, Calendar,
    Edit2, Trash2, Check, Clock, FileText, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

const BUDGET_STATUSES = [
    { value: 'DRAFT', label: 'Draft', icon: FileText, color: 'gray' },
    { value: 'APPROVAL', label: 'Pending Approval', icon: Clock, color: 'amber' },
    { value: 'ACTIVE', label: 'Active', icon: Check, color: 'green' },
    { value: 'COMPLETED', label: 'Completed', icon: Check, color: 'blue' }
]

export default function Budgets() {
    const [selectedBudget, setSelectedBudget] = useState<any>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [itemForm, setItemForm] = useState({ name: '', amount: '', date: '' })
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: '',
        startDate: '',
        endDate: '',
        projectId: '',
        status: 'DRAFT'
    })

    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery('budgets', () => apiService.getBudgets())
    const { data: projectsData } = useQuery('projects', () => apiService.getProjects())

    const { data: budgetDetail, isLoading: budgetDetailLoading } = useQuery(
        ['budget', selectedBudget?.id],
        () => apiService.getBudget(selectedBudget.id),
        { enabled: !!selectedBudget && isPanelOpen }
    )

    const createBudgetMutation = useMutation(
        (data: any) => apiService.createBudget(data),
        {
            onSuccess: () => {
                toast.success('Budget created successfully!')
                setIsCreating(false)
                setIsPanelOpen(false)
                resetForm()
                queryClient.invalidateQueries('budgets')
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to create budget')
            }
        }
    )

    const updateBudgetMutation = useMutation(
        ({ id, data }: any) => apiService.updateBudget(id, data),
        {
            onSuccess: () => {
                toast.success('Budget updated successfully!')
                queryClient.invalidateQueries('budgets')
                queryClient.invalidateQueries(['budget', selectedBudget?.id])
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to update budget')
            }
        }
    )

    const deleteBudgetMutation = useMutation(
        (id: string) => apiService.deleteBudget(id),
        {
            onSuccess: () => {
                toast.success('Budget deleted successfully!')
                setIsPanelOpen(false)
                setSelectedBudget(null)
                queryClient.invalidateQueries('budgets')
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to delete budget')
            }
        }
    )

    const createItemMutation = useMutation(
        ({ budgetId, data }: any) => apiService.createBudgetItem(budgetId, data),
        {
            onSuccess: () => {
                toast.success('Expense added successfully!')
                setItemForm({ name: '', amount: '', date: '' })
                queryClient.invalidateQueries('budgets')
                queryClient.invalidateQueries(['budget', selectedBudget?.id])
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to add expense')
            }
        }
    )

    const deleteItemMutation = useMutation(
        ({ budgetId, itemId }: any) => apiService.deleteBudgetItem(budgetId, itemId),
        {
            onSuccess: () => {
                toast.success('Expense deleted successfully!')
                queryClient.invalidateQueries('budgets')
                queryClient.invalidateQueries(['budget', selectedBudget?.id])
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to delete expense')
            }
        }
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isCreating) {
            createBudgetMutation.mutate(formData)
        } else if (selectedBudget) {
            updateBudgetMutation.mutate({ id: selectedBudget.id, data: formData })
        }
    }

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedBudget) return
        createItemMutation.mutate({
            budgetId: selectedBudget.id,
            data: itemForm
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const resetForm = () => {
        setFormData({
            name: '',
            amount: '',
            category: '',
            startDate: '',
            endDate: '',
            projectId: '',
            status: 'DRAFT'
        })
    }

    const openCreatePanel = () => {
        resetForm()
        setIsCreating(true)
        setSelectedBudget(null)
        setIsPanelOpen(true)
    }

    const openBudgetPanel = (budget: any) => {
        setSelectedBudget(budget)
        setFormData({
            name: budget.name,
            amount: budget.amount,
            category: budget.category,
            startDate: format(new Date(budget.startDate), 'yyyy-MM-dd'),
            endDate: format(new Date(budget.endDate), 'yyyy-MM-dd'),
            projectId: budget.projectId || '',
            status: budget.status
        })
        setIsCreating(false)
        setIsPanelOpen(true)
    }

    const budgets = data?.budgets || []
    const totalBudget = budgets.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0)
    const totalSpent = budgets.reduce((acc: number, curr: any) => acc + parseFloat(curr.spent), 0)

    const chartData = budgets.map((b: any) => ({
        name: b.name,
        budget: parseFloat(b.amount),
        spent: parseFloat(b.spent)
    }))

    const currentBudget = budgetDetail?.budget || selectedBudget
    const currentStatusIndex = BUDGET_STATUSES.findIndex(s => s.value === currentBudget?.status)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
                    <p className="text-gray-500 mt-1">Track and manage your financial resources</p>
                </div>
                <button
                    onClick={openCreatePanel}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Budget
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Allocated</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">UGX {totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">UGX {totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Remaining</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">UGX {(totalBudget - totalSpent).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <PieChart className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            {budgets.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Budget vs Spent Overview</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #E5E7EB',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar dataKey="budget" name="Budget" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="spent" name="Spent" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Budgets List */}
            <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Active Budgets</h2>
                </div>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                            <DollarSign className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No budgets set</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Create a budget to start tracking your project expenses.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {budgets.map((budget: any) => {
                            const percentage = Math.min((parseFloat(budget.spent) / parseFloat(budget.amount)) * 100, 100)
                            const statusConfig = BUDGET_STATUSES.find(s => s.value === budget.status) || BUDGET_STATUSES[0]

                            return (
                                <div
                                    key={budget.id}
                                    onClick={() => openBudgetPanel(budget)}
                                    className="p-6 hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                                                <p className="text-sm text-gray-500">{budget.category} • {budget.project?.name || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border bg-${statusConfig.color}-50 text-${statusConfig.color}-700 border-${statusConfig.color}-200`}>
                                                {statusConfig.label}
                                            </span>
                                            <div>
                                                <p className="font-bold text-gray-900">UGX {parseFloat(budget.amount).toLocaleString()}</p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Spent: UGX {parseFloat(budget.spent).toLocaleString()}</span>
                                            <span className="font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-amber-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Side Panel */}
            {isPanelOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsPanelOpen(false)}
                    />
                    <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-all duration-300">
                        <div className="flex flex-col h-full">
                            {/* Panel Header */}
                            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {isCreating ? 'Create New Budget' : currentBudget?.name}
                                </h2>
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Panel Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Status Tracker */}
                                {!isCreating && currentBudget && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Budget Progress</h3>
                                        <div className="flex items-center justify-between">
                                            {BUDGET_STATUSES.map((status, index) => {
                                                const Icon = status.icon
                                                const isActive = index <= currentStatusIndex
                                                const isCurrent = index === currentStatusIndex

                                                return (
                                                    <div key={status.value} className="flex-1 flex items-center">
                                                        <div className="flex flex-col items-center flex-1">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive
                                                                    ? `bg-${status.color}-500 text-white`
                                                                    : 'bg-gray-200 text-gray-400'
                                                                } ${isCurrent ? 'ring-4 ring-' + status.color + '-200' : ''}`}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <p className={`text-xs mt-2 font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'
                                                                }`}>
                                                                {status.label}
                                                            </p>
                                                        </div>
                                                        {index < BUDGET_STATUSES.length - 1 && (
                                                            <div className={`h-0.5 flex-1 ${index < currentStatusIndex ? `bg-${status.color}-500` : 'bg-gray-200'
                                                                }`} />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Budget Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            placeholder="e.g. Q4 Marketing"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (UGX)</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Development">Development</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        >
                                            {BUDGET_STATUSES.map(status => (
                                                <option key={status.value} value={status.value}>{status.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                                        <select
                                            name="projectId"
                                            value={formData.projectId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        >
                                            <option value="">General Budget</option>
                                            {projectsData?.projects?.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        {!isCreating && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this budget?')) {
                                                        deleteBudgetMutation.mutate(selectedBudget.id)
                                                    }
                                                }}
                                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                            >
                                                Delete Budget
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={createBudgetMutation.isLoading || updateBudgetMutation.isLoading}
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
                                        >
                                            {isCreating ? 'Create Budget' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>

                                {/* Budget Items Section */}
                                {!isCreating && currentBudget && (
                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>

                                        {/* Add Item Form */}
                                        <form onSubmit={handleItemSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                            <div className="grid grid-cols-12 gap-2">
                                                <input
                                                    type="text"
                                                    value={itemForm.name}
                                                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Expense description"
                                                    required
                                                    className="col-span-5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                                <input
                                                    type="number"
                                                    value={itemForm.amount}
                                                    onChange={(e) => setItemForm(prev => ({ ...prev, amount: e.target.value }))}
                                                    placeholder="Amount"
                                                    required
                                                    className="col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                                <input
                                                    type="date"
                                                    value={itemForm.date}
                                                    onChange={(e) => setItemForm(prev => ({ ...prev, date: e.target.value }))}
                                                    className="col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={createItemMutation.isLoading}
                                                    className="col-span-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </form>

                                        {/* Items List */}
                                        {budgetDetailLoading ? (
                                            <div className="p-8 flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        ) : currentBudget.items?.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <p className="text-sm">No expenses recorded yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {currentBudget.items?.map((item: any) => (
                                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{item.name}</p>
                                                            <p className="text-xs text-gray-500">{format(new Date(item.date), 'MMM d, yyyy')}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-semibold text-gray-900">UGX {parseFloat(item.amount).toLocaleString()}</p>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Delete this expense?')) {
                                                                        deleteItemMutation.mutate({ budgetId: currentBudget.id, itemId: item.id })
                                                                    }
                                                                }}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
