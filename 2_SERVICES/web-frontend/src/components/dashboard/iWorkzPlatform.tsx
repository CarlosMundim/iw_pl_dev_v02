'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Mic, 
  Bot, 
  Loader2, 
  MapPin, 
  BadgeCheck,
  Users,
  Briefcase,
  MessageSquare,
  Star,
  Calendar,
  FileText,
  Globe,
  Zap,
  Target,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  HeadphonesIcon,
  BrainCircuit
} from "lucide-react"
import { motion } from 'framer-motion'

interface PlatformProps {
  userType?: 'employer' | 'talent'
  userData?: any
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function IWorkzPlatform({ userType = 'employer', userData }: PlatformProps) {
  const [activeVoiceAssistant, setActiveVoiceAssistant] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleVoiceActivation = () => {
    setActiveVoiceAssistant(true)
    setIsLoading(true)
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false)
      setActiveVoiceAssistant(false)
    }, 2000)
  }

  const handleAIAssistant = () => {
    // Connect to our AI backend (Mistral/DeepSeek)
    console.log('Connecting to iWORKZ AI Assistant...')
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="max-w-7xl mx-auto space-y-8" variants={itemVariants}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              iWORKZ Platform
            </h1>
            <p className="text-gray-600 mt-2">The World's Most Advanced Talent Ecosystem</p>
          </div>
          
          {/* AI Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">AI Active</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Multi-Provider AI Enabled
            </Badge>
          </div>
        </div>

        <Tabs defaultValue={userType} className="w-full">
          <TabsList className="grid grid-cols-2 gap-2 h-12">
            <TabsTrigger value="employer" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Employer / HR Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="talent" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Candidate / Talent Portal</span>
            </TabsTrigger>
          </TabsList>

          {/* EMPLOYER DASHBOARD */}
          <TabsContent value="employer" className="space-y-6">
            {/* Key Metrics */}
            <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={itemVariants}>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Open Positions</p>
                      <p className="text-3xl font-bold">12</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Candidates in Pipeline</p>
                      <p className="text-3xl font-bold">89</p>
                    </div>
                    <Users className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">AI Matches Today</p>
                      <p className="text-3xl font-bold">24</p>
                    </div>
                    <BrainCircuit className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Unread Messages</p>
                      <p className="text-3xl font-bold">5</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pipeline Stages */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Recruitment Pipeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { stage: 'AI Sourced', count: 45, color: 'bg-blue-500' },
                      { stage: 'Contacted', count: 28, color: 'bg-yellow-500' },
                      { stage: 'Interviewing', count: 12, color: 'bg-purple-500' },
                      { stage: 'Hired', count: 4, color: 'bg-green-500' }
                    ].map((item, index) => (
                      <div key={item.stage} className="relative">
                        <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                          <div className={`w-3 h-3 ${item.color} rounded-full mb-3`}></div>
                          <h4 className="font-semibold text-gray-800 mb-2">{item.stage}</h4>
                          <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                        </div>
                        {index < 3 && (
                          <ArrowRight className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI-Powered Actions */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BrainCircuit className="w-5 h-5 text-purple-600" />
                    <span>AI-Powered Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1">
                      <BarChart3 className="mr-2 w-4 h-4" /> 
                      Performance Analytics
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <TrendingUp className="mr-2 w-4 h-4" /> 
                      Hiring Funnel
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <PieChart className="mr-2 w-4 h-4" /> 
                    Diversity & Inclusion Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span>Smart Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">🎯 AI Suggestion</p>
                    <p className="text-sm text-blue-600 mt-1">
                      3 high-match candidates found for "Senior Nurse - Tokyo"
                    </p>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View AI Recommendations
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* TALENT PORTAL */}
          <TabsContent value="talent" className="space-y-6">
            {/* Welcome & Onboarding */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">Welcome back, Maria! 👋</h3>
                      <p className="text-green-700">Care Assistant Professional</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profile Completion</span>
                      <span className="text-sm font-semibold text-green-700">85%</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-3">
                      <motion.div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                      ></motion.div>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Complete Your Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h3 className="font-bold text-xl text-gray-800">Top AI Match</h3>
                    <Badge className="bg-yellow-100 text-yellow-700">98% Match</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg text-blue-700">Senior Care Assistant</h4>
                    <p className="text-gray-600">Sakura Healthcare Group</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" /> 
                      Kyoto, Japan • Near You
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Visa sponsorship available
                    </div>
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Details & Apply
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Assistant Section */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-800">
                    <Bot className="w-6 h-6" />
                    <span>AI Assistant & Voice Support</span>
                    <Badge className="bg-purple-100 text-purple-700">Multilingual</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Get instant help with applications, visa questions, or career guidance in your language.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="flex items-center space-x-2 border-purple-300 hover:bg-purple-50"
                      onClick={handleVoiceActivation}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                      <span>Voice Chat</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="flex items-center space-x-2 border-blue-300 hover:bg-blue-50"
                      onClick={handleAIAssistant}
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>Ask Tomoo</span>
                    </Button>

                    <Button variant="outline" className="flex items-center space-x-2 border-green-300 hover:bg-green-50">
                      <HeadphonesIcon className="w-4 h-4" />
                      <span>Live Support</span>
                    </Button>
                  </div>

                  {activeVoiceAssistant && (
                    <motion.div 
                      className="p-4 bg-purple-100 rounded-lg border border-purple-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-purple-700 font-medium">Listening in Japanese...</span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Documents & Verification */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Document Center</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { doc: 'Professional CV', status: 'verified', icon: CheckCircle, color: 'text-green-600' },
                    { doc: 'Nursing License', status: 'verifying', icon: Loader2, color: 'text-yellow-600' },
                    { doc: 'Language Certificate (N2)', status: 'verified', icon: BadgeCheck, color: 'text-green-600' },
                    { doc: 'Criminal Background Check', status: 'pending', icon: Clock, color: 'text-gray-500' }
                  ].map((item) => (
                    <div key={item.doc} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <item.icon className={`w-5 h-5 ${item.color} ${item.status === 'verifying' ? 'animate-spin' : ''}`} />
                        <span className="font-medium">{item.doc}</span>
                      </div>
                      <Badge variant={item.status === 'verified' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                  
                  <Button variant="ghost" className="w-full mt-4">
                    Upload New Documents
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
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
                    },
                    { 
                      icon: '🎓', 
                      text: 'Completed Japanese Business Etiquette course', 
                      time: '3 days ago',
                      urgent: false 
                    }
                  ].map((activity, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${activity.urgent ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activity.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        {activity.urgent && (
                          <Badge className="bg-yellow-100 text-yellow-700">Urgent</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills & Training */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Skills & Training Hub</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Japanese Language</h4>
                      <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                        <div className="bg-blue-600 h-2 rounded-full w-[75%]"></div>
                      </div>
                      <p className="text-sm text-blue-600">N2 Level • 75% to N1</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Healthcare Skills</h4>
                      <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                        <div className="bg-green-600 h-2 rounded-full w-[90%]"></div>
                      </div>
                      <p className="text-sm text-green-600">Expert Level • Certified</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">Cultural Training</h4>
                      <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                        <div className="bg-purple-600 h-2 rounded-full w-[60%]"></div>
                      </div>
                      <p className="text-sm text-purple-600">In Progress • 4 modules left</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}