import { useState } from 'react'
import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { Plus, Calendar, User, ArrowRight, FolderKanban, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function Projects() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data, isLoading } = useQuery('projects', () => apiService.getProjects())

  const projects = data?.projects || []

  // Calculate stats
  const activeCount = projects.filter((p: any) => p.status !== 'COMPLETED' && p.status !== 'ON_HOLD').length
  const completedCount = projects.filter((p: any) => p.status === 'COMPLETED').length
  const onHoldCount = projects.filter((p: any) => p.status === 'ON_HOLD').length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Track project progress and milestones</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">On Hold</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{onHoldCount}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
            <FolderKanban className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Start tracking your work by creating your first project.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => {
            const statusConfig = {
              GREEN: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              AMBER: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
              RED: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
              ON_HOLD: { color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
              COMPLETED: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' }
            }

            const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.ON_HOLD

            return (
              <div
                key={project.id}
                className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium truncate">{project.client?.name}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border} whitespace-nowrap`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-500 font-medium">Progress</span>
                        <span className="font-semibold text-gray-900">{project.percentComplete}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${project.percentComplete}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {project.targetEndDate ? format(new Date(project.targetEndDate), 'MMM d') : 'No date'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-4 h-4" />
                    {project.owner?.firstName || 'Unassigned'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
            <p className="text-gray-500 mb-6">
              You can create projects directly from a Client's profile page. This ensures the project is correctly linked to a client.
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


