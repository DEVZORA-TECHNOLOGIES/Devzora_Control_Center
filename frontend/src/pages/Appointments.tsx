import { useState } from 'react'
import { useQuery } from 'react-query'
import { apiService } from '@/services/apiService'
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  MoreVertical,
  CheckCircle2
} from 'lucide-react'
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function Appointments() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data, isLoading } = useQuery('my-week', () => apiService.getMyWeek())

  const appointments = data?.appointments || []

  const upcomingCount = appointments.filter((a: any) => new Date(a.date) > new Date()).length
  const todayCount = appointments.filter((a: any) => isToday(new Date(a.date))).length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your schedule and meetings</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{upcomingCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{todayCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Upcoming Schedule</h2>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Your schedule is clear. Create a new appointment to get started.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Appointment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((apt: any) => {
              const date = new Date(apt.date)
              const isVirtual = apt.location?.toLowerCase().includes('zoom') || apt.location?.toLowerCase().includes('meet') || apt.location?.toLowerCase().includes('teams')

              return (
                <div key={apt.id} className="p-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-xs font-bold text-primary uppercase tracking-wider">
                        {format(date, 'MMM')}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {format(date, 'd')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(date, 'EEE')}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {apt.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{format(date, 'h:mm a')}</span>
                              <span className="text-gray-400">({formatDistanceToNow(date, { addSuffix: true })})</span>
                            </div>

                            {apt.location && (
                              <div className="flex items-center gap-1.5">
                                {isVirtual ? (
                                  <Video className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                )}
                                <span>{apt.location}</span>
                              </div>
                            )}
                          </div>

                          {(apt.client || apt.project) && (
                            <div className="flex items-center gap-3 mt-3">
                              {apt.client && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                  <User className="w-3 h-3" />
                                  {apt.client.name}
                                </span>
                              )}
                              {apt.project && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                                  <Calendar className="w-3 h-3" />
                                  {apt.project.name}
                                </span>
                              )}
                            </div>
                          )}

                          {apt.description && (
                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                              {apt.description}
                            </p>
                          )}
                        </div>

                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Modal Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Appointment</h2>
            <p className="text-gray-500 mb-6">
              This feature is coming soon! You'll be able to schedule meetings with clients and link them to projects.
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


