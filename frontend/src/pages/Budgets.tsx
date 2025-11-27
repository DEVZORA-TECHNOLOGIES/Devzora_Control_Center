import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiService } from '@/services/apiService'
import { Plus, Search, DollarSign, PieChart, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

export default function Budgets() {
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: '',
        startDate: '',
        endDate: '',
        projectId: ''
    })

    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery('budgets', () => apiService.getBudgets())
    const { data: projectsData } = useQuery('projects', () => apiService.getProjects())

    const createBudgetMutation = useMutation(
        (data: any) => apiService.createBudget(data),
        {
            onSuccess: () => {
                toast.success('Budget created successfully!')
                setIsModalOpen(false)
                setFormData({
                    name: '',
                    amount: '',
                    category: '',
                    startDate: '',
                    endDate: '',
                    projectId: ''
                })
                queryClient.invalidateQueries('budgets')
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to create budget')
            }
        }
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createBudgetMutation.mutate(formData)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const budgets = data?.budgets || []
    const totalBudget = budgets.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0)
    const totalSpent = budgets.reduce((acc: number, curr: any) => acc + parseFloat(curr.spent), 0)

    // Data for chart
    const chartData = budgets.map((b: any) => ({
        name: b.name,
        budget: parseFloat(b.amount),
        spent: parseFloat(b.spent)
    }))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Budgets
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage your financial resources
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Budget
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Allocated</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">UGX {totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">UGX {totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Remaining</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">UGX {(totalBudget - totalSpent).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <PieChart className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            {budgets.length > 0 && (
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
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
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar dataKey="budget" name="Budget" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="spent" name="Spent" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Budgets List */}
            <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100/50">
                    <h2 className="text-lg font-semibold text-gray-900">Active Budgets</h2>
                </div>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                            <DollarSign className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No budgets set</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Create a budget to start tracking your project expenses.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100/50">
                        {budgets.map((budget: any) => {
                            const percentage = Math.min((parseFloat(budget.spent) / parseFloat(budget.amount)) * 100, 100)

                            return (
                                <div key={budget.id} className="p-6 hover:bg-white/50 transition-all">
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
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">UGX {parseFloat(budget.amount).toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d, yyyy')}
                                            </p>
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

            {/* Add Budget Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Budget</h2>

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

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createBudgetMutation.isLoading}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {createBudgetMutation.isLoading ? 'Creating...' : 'Create Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
