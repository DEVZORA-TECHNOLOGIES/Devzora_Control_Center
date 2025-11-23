import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import { Plus, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function Appointments() {
  const { data, isLoading } = useQuery('my-week', () => apiService.getMyWeek())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Week</h1>
          <p className="text-gray-500 mt-1">Your appointments and meetings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {data?.appointments?.map((apt: any) => (
            <div key={apt.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{apt.title}</h3>
                  {apt.description && (
                    <p className="text-sm text-gray-500 mt-1">{apt.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{format(new Date(apt.date), 'MMM d, yyyy h:mm a')}</span>
                    {apt.client && <span>• {apt.client.name}</span>}
                    {apt.project && <span>• {apt.project.name}</span>}
                    {apt.location && <span>• {apt.location}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {data?.appointments?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No appointments this week</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


