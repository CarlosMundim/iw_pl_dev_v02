import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshResponse = await api.post('/auth/refresh-token')
        const { token } = refreshResponse.data.data
        
        // Update cookie
        Cookies.set('auth-token', token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, logout user
        Cookies.remove('auth-token')
        
        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          window.location.href = '/auth/login'
        }
        
        toast.error('Your session has expired. Please log in again.')
        return Promise.reject(refreshError)
      }
    }

    // Handle other HTTP errors
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Bad request')
          break
        case 403:
          toast.error('You do not have permission to perform this action')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 409:
          toast.error(data.message || 'Conflict error')
          break
        case 422:
          toast.error(data.message || 'Validation error')
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Internal server error. Please try again later.')
          break
        case 502:
        case 503:
        case 504:
          toast.error('Service temporarily unavailable. Please try again later.')
          break
        default:
          toast.error('An unexpected error occurred')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Something else happened
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

// API helper functions
export const apiHelpers = {
  // Authentication
  auth: {
    login: (email: string, password: string) =>
      api.post('/auth/login', { email, password }),
    register: (userData: any) =>
      api.post('/auth/register', userData),
    logout: () =>
      api.post('/auth/logout'),
    getCurrentUser: () =>
      api.get('/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
      api.patch('/auth/change-password', { currentPassword, newPassword }),
    forgotPassword: (email: string) =>
      api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
      api.post('/auth/reset-password', { token, password }),
    refreshToken: () =>
      api.post('/auth/refresh-token'),
  },

  // Users
  users: {
    getProfile: () =>
      api.get('/users/profile'),
    updateProfile: (userData: any) =>
      api.patch('/users/profile', userData),
    getAllUsers: (params?: any) =>
      api.get('/users', { params }),
  },

  // Jobs
  jobs: {
    getAll: (params?: any) =>
      api.get('/jobs', { params }),
    getById: (id: string) =>
      api.get(`/jobs/${id}`),
    create: (jobData: any) =>
      api.post('/jobs', jobData),
    update: (id: string, jobData: any) =>
      api.patch(`/jobs/${id}`, jobData),
    delete: (id: string) =>
      api.delete(`/jobs/${id}`),
    apply: (jobId: string, applicationData: any) =>
      api.post(`/jobs/${jobId}/apply`, applicationData),
  },

  // Matching
  matching: {
    getJobMatches: (params?: any) =>
      api.get('/matching/jobs', { params }),
    getTalentMatches: (jobId: string, params?: any) =>
      api.get(`/matching/talents/${jobId}`, { params }),
  },

  // Compliance
  compliance: {
    checkJob: (jobId: string, jurisdiction: string) =>
      api.post(`/compliance/check-job/${jobId}`, { jurisdiction }),
    getRules: (jurisdiction: string) =>
      api.get(`/compliance/rules/${jurisdiction}`),
  },

  // Analytics
  analytics: {
    getPlatformStats: () =>
      api.get('/analytics/platform'),
    trackEvent: (eventData: any) =>
      api.post('/analytics/events', eventData),
  },

  // File Upload
  upload: {
    file: (file: File, onUploadProgress?: (progress: number) => void) => {
      const formData = new FormData()
      formData.append('file', file)
      
      return api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onUploadProgress(progress)
          }
        },
      })
    },
  },
}

export { api }
export default api