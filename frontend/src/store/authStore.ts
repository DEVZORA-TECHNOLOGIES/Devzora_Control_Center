import { create } from 'zustand'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('auth-token') : false,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-user', JSON.stringify(user))
      localStorage.setItem('auth-token', token)
    }
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-user')
      localStorage.removeItem('auth-token')
    }
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

