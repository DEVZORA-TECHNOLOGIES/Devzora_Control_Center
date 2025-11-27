import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { Plus, Calendar, User, ArrowRight, FolderKanban } from 'lucide-react'
import { format } from 'date-fns'

export default function Projects() {
  const { data, isLoading } = useQuery('projects', () => apiService.getProjects())

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Track project progress and milestones
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : data?.projects?.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <FolderKanban className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Start tracking your work by creating your first project.
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.projects?.map((project: any) => {
            const statusConfig = {
              GREEN: { color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
              AMBER: { color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
              RED: { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
              ON_HOLD: { color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
              COMPLETED: { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' }
            }

            const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.ON_HOLD

            return (
              <div
                key={project.id}
                className="group bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                      {project.name}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{project.client?.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color} border ${status.border}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">Progress</span>
                      <span className="font-bold text-gray-900">{project.percentComplete}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${project.percentComplete}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {project.targetEndDate ? format(new Date(project.targetEndDate), 'MMM d') : 'No date'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      {project.owner?.firstName}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


