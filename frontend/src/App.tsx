import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import ClientDetail from '@/pages/ClientDetail'
import Projects from '@/pages/Projects'
import Subscriptions from '@/pages/Subscriptions'
import Renewals from '@/pages/Renewals'
import Invoices from '@/pages/Invoices'
import Appointments from '@/pages/Appointments'
import Reports from '@/pages/Reports'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/:id" element={<ClientDetail />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/renewals" element={<Renewals />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App

