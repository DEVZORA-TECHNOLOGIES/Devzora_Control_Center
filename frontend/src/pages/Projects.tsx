import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function Projects() {
  const { data, isLoading } = useQuery('projects', () => apiService.getProjects())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Track project progress and milestones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.projects?.map((project: any) => {
            const statusColors = {
              GREEN: 'bg-green-100 text-green-700 border-green-200',
              AMBER: 'bg-yellow-100 text-yellow-700 border-yellow-200',
              RED: 'bg-red-100 text-red-700 border-red-200',
              ON_HOLD: 'bg-gray-100 text-gray-700 border-gray-200',
              COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200'
            }

            return (
              <div key={project.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-current" style={{ borderColor: project.status === 'GREEN' ? '#10b981' : project.status === 'AMBER' ? '#f59e0b' : project.status === 'RED' ? '#ef4444' : '#6b7280' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{project.client?.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">{project.percentComplete}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.percentComplete}%` }}
                    />
                  </div>
                  {project.targetEndDate && (
                    <p className="text-xs text-gray-500">
                      Target: {format(new Date(project.targetEndDate), 'MMM d, yyyy')}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Owner: {project.owner?.firstName} {project.owner?.lastName}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


