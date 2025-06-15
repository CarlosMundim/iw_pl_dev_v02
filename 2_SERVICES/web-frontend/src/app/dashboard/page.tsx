'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import IWorkzPlatform from '@/components/dashboard/iWorkzPlatform'
import { aiService } from '@/services/aiService'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BrainCircuit, 
  Zap, 
  Globe, 
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react'

interface AIHealthStatus {
  status: string
  models: {
    mistral?: string
    deepseek?: string
    llama?: string
    openai?: string
  }
  metrics?: any
}

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [aiHealth, setAiHealth] = useState<AIHealthStatus | null>(null)
  const [isLoadingHealth, setIsLoadingHealth] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && mounted) {
      router.push('/auth/login')
      return
    }

    // Check AI service health on dashboard load
    checkAIHealth()
  }, [isAuthenticated, mounted, router])

  const checkAIHealth = async () => {
    try {
      setIsLoadingHealth(true)
      const health = await aiService.getHealthStatus()
      setAiHealth(health)
    } catch (error) {
      console.error('Failed to check AI health:', error)
      setAiHealth({
        status: 'unhealthy',
        models: {}
      })
    } finally {
      setIsLoadingHealth(false)
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getModelStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'degraded': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'unhealthy': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="w-96 p-6 text-center">
          <CardContent>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* AI Status Bar */}
      <motion.div 
        className="bg-white/80 backdrop-blur-md border-b border-white/20 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-800">iWORKZ AI System</span>
            </div>
            
            {isLoadingHealth ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Checking AI status...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Overall Status */}
                <Badge className={getHealthStatusColor(aiHealth?.status || 'unknown')}>
                  {aiHealth?.status || 'Unknown'}
                </Badge>

                {/* Model Status Indicators */}
                <div className="flex items-center space-x-3">
                  {aiHealth?.models.mistral && (
                    <div className="flex items-center space-x-1">
                      {getModelStatusIcon(aiHealth.models.mistral)}
                      <span className="text-xs text-gray-600">Mistral</span>
                    </div>
                  )}
                  
                  {aiHealth?.models.deepseek && (
                    <div className="flex items-center space-x-1">
                      {getModelStatusIcon(aiHealth.models.deepseek)}
                      <span className="text-xs text-gray-600">DeepSeek</span>
                    </div>
                  )}
                  
                  {aiHealth?.models.llama && (
                    <div className="flex items-center space-x-1">
                      {getModelStatusIcon(aiHealth.models.llama)}
                      <span className="text-xs text-gray-600">Llama</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-700">
                {user?.firstName || 'User'}
              </span>
            </div>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* AI Feature Highlights */}
      {aiHealth?.status === 'healthy' && (
        <motion.div 
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Multi-Provider AI Active</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">15+ Countries Supported</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Privacy-First Local AI</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <BrainCircuit className="w-5 h-5" />
                <span className="text-sm font-medium">Real-time Intelligence</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Dashboard */}
      <IWorkzPlatform 
        userType={user?.userType as 'employer' | 'talent' || 'talent'} 
        userData={user}
      />

      {/* AI Service Error Fallback */}
      {aiHealth?.status === 'unhealthy' && (
        <motion.div 
          className="fixed bottom-4 right-4 max-w-sm"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">AI Service Issue</span>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Some AI features may be limited. Platform functionality continues normally.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-red-700 border-red-300 hover:bg-red-100"
                onClick={checkAIHealth}
              >
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}