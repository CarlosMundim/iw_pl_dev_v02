import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { aiService, AIResponse } from '@/services/aiService'

interface DashboardState {
  // AI Assistant State
  isAIActive: boolean
  isVoiceActive: boolean
  lastAIResponse: AIResponse | null
  aiHealth: {
    status: string
    models: Record<string, string>
    lastChecked: Date | null
  }

  // Dashboard Data
  userType: 'employer' | 'talent'
  dashboardData: {
    employer: {
      openPositions: number
      candidatesInPipeline: number
      aiMatchesToday: number
      unreadMessages: number
      pipelineStages: Array<{
        stage: string
        count: number
        color: string
      }>
    }
    talent: {
      profileCompletion: number
      topMatches: Array<{
        id: string
        title: string
        company: string
        location: string
        matchScore: number
        urgent: boolean
      }>
      documents: Array<{
        name: string
        status: 'verified' | 'verifying' | 'pending' | 'rejected'
      }>
      recentActivity: Array<{
        icon: string
        text: string
        time: string
        urgent: boolean
      }>
      skills: Array<{
        name: string
        level: number
        category: string
      }>
    }
  }

  // Actions
  setUserType: (type: 'employer' | 'talent') => void
  setAIActive: (active: boolean) => void
  setVoiceActive: (active: boolean) => void
  updateAIHealth: (health: { status: string; models: Record<string, string> }) => void
  updateDashboardData: (type: 'employer' | 'talent', data: any) => void
  
  // AI Actions
  sendAIMessage: (message: string, complexity?: string) => Promise<AIResponse>
  startVoiceSession: () => Promise<void>
  stopVoiceSession: () => void
  checkAIHealth: () => Promise<void>
  
  // Dashboard Actions
  refreshDashboard: () => Promise<void>
  updateProfileCompletion: (percentage: number) => void
  addRecentActivity: (activity: any) => void
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        isAIActive: false,
        isVoiceActive: false,
        lastAIResponse: null,
        aiHealth: {
          status: 'unknown',
          models: {},
          lastChecked: null
        },
        userType: 'talent',
        dashboardData: {
          employer: {
            openPositions: 12,
            candidatesInPipeline: 89,
            aiMatchesToday: 24,
            unreadMessages: 5,
            pipelineStages: [
              { stage: 'AI Sourced', count: 45, color: 'bg-blue-500' },
              { stage: 'Contacted', count: 28, color: 'bg-yellow-500' },
              { stage: 'Interviewing', count: 12, color: 'bg-purple-500' },
              { stage: 'Hired', count: 4, color: 'bg-green-500' }
            ]
          },
          talent: {
            profileCompletion: 85,
            topMatches: [
              {
                id: '1',
                title: 'Senior Care Assistant',
                company: 'Sakura Healthcare Group',
                location: 'Kyoto, Japan',
                matchScore: 98,
                urgent: true
              },
              {
                id: '2',
                title: 'Nursing Assistant',
                company: 'Tokyo Medical Center',
                location: 'Tokyo, Japan',
                matchScore: 92,
                urgent: false
              }
            ],
            documents: [
              { name: 'Professional CV', status: 'verified' },
              { name: 'Nursing License', status: 'verifying' },
              { name: 'Language Certificate (N2)', status: 'verified' },
              { name: 'Criminal Background Check', status: 'pending' }
            ],
            recentActivity: [
              {
                icon: '🗓️',
                text: 'Interview scheduled with Sakura Healthcare',
                time: 'Tomorrow, 2:00 PM JST',
                urgent: true
              },
              {
                icon: '📄',
                text: 'Job offer received from Tokyo Care Center',
                time: '2 hours ago',
                urgent: false
              },
              {
                icon: '📨',
                text: 'Message from Recruiter Yuki-san',
                time: '1 day ago',
                urgent: false
              }
            ],
            skills: [
              { name: 'Japanese Language', level: 75, category: 'Language' },
              { name: 'Healthcare Skills', level: 90, category: 'Technical' },
              { name: 'Cultural Training', level: 60, category: 'Soft Skills' }
            ]
          }
        },

        // Basic Actions
        setUserType: (type) => set({ userType: type }),
        setAIActive: (active) => set({ isAIActive: active }),
        setVoiceActive: (active) => set({ isVoiceActive: active }),
        
        updateAIHealth: (health) => 
          set((state) => ({
            aiHealth: {
              ...health,
              lastChecked: new Date()
            }
          })),

        updateDashboardData: (type, data) =>
          set((state) => ({
            dashboardData: {
              ...state.dashboardData,
              [type]: { ...state.dashboardData[type], ...data }
            }
          })),

        // AI Actions
        sendAIMessage: async (message, complexity = 'standard') => {
          try {
            set({ isAIActive: true })
            
            const response = await aiService.smartChatCompletion(
              message,
              complexity as any,
              {
                system_prompt: get().userType === 'employer' 
                  ? 'You are Tomoo, an expert AI recruiting assistant for iWORKZ platform.'
                  : 'You are Sensei Aiko, a helpful AI career advisor for iWORKZ platform.',
                user_id: 'dashboard_user'
              }
            )
            
            set({ lastAIResponse: response, isAIActive: false })
            return response
          } catch (error) {
            set({ isAIActive: false })
            throw error
          }
        },

        startVoiceSession: async () => {
          try {
            set({ isVoiceActive: true })
            // Voice session logic will be implemented when voice service is ready
            console.log('Voice session started')
          } catch (error) {
            set({ isVoiceActive: false })
            throw error
          }
        },

        stopVoiceSession: () => {
          set({ isVoiceActive: false })
          console.log('Voice session stopped')
        },

        checkAIHealth: async () => {
          try {
            const health = await aiService.getHealthStatus()
            get().updateAIHealth(health)
          } catch (error) {
            get().updateAIHealth({ status: 'unhealthy', models: {} })
          }
        },

        // Dashboard Actions
        refreshDashboard: async () => {
          try {
            // Refresh dashboard data from APIs
            await get().checkAIHealth()
            
            // Update metrics based on user type
            if (get().userType === 'employer') {
              // Fetch employer metrics
              // This would connect to your backend APIs
              console.log('Refreshing employer dashboard')
            } else {
              // Fetch talent metrics
              console.log('Refreshing talent dashboard')
            }
          } catch (error) {
            console.error('Dashboard refresh failed:', error)
          }
        },

        updateProfileCompletion: (percentage) =>
          set((state) => ({
            dashboardData: {
              ...state.dashboardData,
              talent: {
                ...state.dashboardData.talent,
                profileCompletion: percentage
              }
            }
          })),

        addRecentActivity: (activity) =>
          set((state) => ({
            dashboardData: {
              ...state.dashboardData,
              talent: {
                ...state.dashboardData.talent,
                recentActivity: [activity, ...state.dashboardData.talent.recentActivity.slice(0, 9)]
              }
            }
          }))
      }),
      {
        name: 'iworkz-dashboard-store',
        partialize: (state) => ({
          userType: state.userType,
          dashboardData: state.dashboardData,
          aiHealth: state.aiHealth
        })
      }
    ),
    {
      name: 'DashboardStore'
    }
  )
)

// Helper hooks for specific data
export const useAIHealth = () => useDashboardStore((state) => state.aiHealth)
export const useEmployerData = () => useDashboardStore((state) => state.dashboardData.employer)
export const useTalentData = () => useDashboardStore((state) => state.dashboardData.talent)
export const useAIState = () => useDashboardStore((state) => ({
  isActive: state.isAIActive,
  isVoiceActive: state.isVoiceActive,
  lastResponse: state.lastAIResponse
}))

export default useDashboardStore