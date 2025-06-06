import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: 'talent' | 'employer' | 'agency' | 'admin'
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended'
  avatar?: string
  phone?: string
  countryCode?: string
  languagePreference?: string
  timezone?: string
  createdAt: string
  lastLogin?: string
  
  // Extended fields based on user type
  skills?: any
  experienceYears?: number
  education?: any[]
  certifications?: any[]
  availabilityStatus?: string
  preferredLocations?: any[]
  salaryExpectations?: any
  bio?: string
  remotePreference?: string
  
  // Employer specific
  companyName?: string
  companySize?: string
  industry?: string
  companyDescription?: string
  websiteUrl?: string
  headquartersLocation?: any
  companyLogoUrl?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  getCurrentUser: () => Promise<void>
  clearAuth: () => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'talent' | 'employer' | 'agency'
  phone?: string
  countryCode?: string
  languagePreference?: string
  termsAccepted: boolean
  privacyAccepted: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data.data
          
          // Set cookie
          Cookies.set('auth-token', token, { 
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          })
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.message || 'Login failed')
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { user, token } = response.data.data
          
          // Set cookie
          Cookies.set('auth-token', token, { 
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          })
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.message || 'Registration failed')
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.post('/auth/logout')
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', error)
        } finally {
          // Clear all auth data
          Cookies.remove('auth-token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      refreshToken: async () => {
        try {
          const response = await api.post('/auth/refresh-token')
          const { token } = response.data.data
          
          Cookies.set('auth-token', token, { 
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          })
          
          set({ token })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true })
        try {
          const response = await api.get('/auth/me')
          const { user } = response.data.data
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          // If getting user fails, clear auth
          get().clearAuth()
          set({ isLoading: false })
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },

      clearAuth: () => {
        Cookies.remove('auth-token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// Initialize auth on app start
export const initializeAuth = () => {
  const token = Cookies.get('auth-token')
  if (token) {
    useAuthStore.getState().getCurrentUser()
  }
}