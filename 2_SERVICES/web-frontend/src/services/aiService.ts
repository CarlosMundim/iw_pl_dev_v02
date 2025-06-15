/**
 * AI Service Integration
 * Connects frontend to iWORKZ multi-provider AI backend
 * Supports Mistral AI, DeepSeek, and Meta Llama
 */

import axios from 'axios'

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  finish_reason: string
}

export interface VoiceRequest {
  audio_data: string
  language?: string
  user_id?: string
}

export interface MatchingRequest {
  job_description?: string
  candidate_profile?: string
  user_id?: string
}

export interface SkillExtractionRequest {
  text: string
  document_type?: 'resume' | 'job_description' | 'general'
  user_id?: string
}

class AIService {
  private axiosInstance = axios.create({
    baseURL: `${AI_SERVICE_URL}/api/v1`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    // Add request interceptor for auth
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('AI Service Error:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Chat with AI Assistant (Tomoo/Sensei Aiko)
   * Uses intelligent model routing (Mistral/DeepSeek/Llama)
   */
  async chatCompletion(
    messages: AIMessage[],
    options: {
      model?: string
      max_tokens?: number
      temperature?: number
      user_id?: string
      language?: string
    } = {}
  ): Promise<AIResponse> {
    try {
      const response = await this.axiosInstance.post('/ai/chat', {
        messages,
        model: options.model || 'mistral-small-latest', // Default to Mistral
        max_tokens: options.max_tokens || 500,
        temperature: options.temperature || 0.7,
        user_id: options.user_id,
        language: options.language || 'en'
      })
      
      return response.data
    } catch (error) {
      throw new Error(`Chat completion failed: ${error}`)
    }
  }

  /**
   * Voice interaction with AI
   * Supports multilingual voice input/output
   */
  async voiceInteraction(request: VoiceRequest): Promise<{
    transcription: string
    ai_response: string
    audio_response?: string
  }> {
    try {
      const response = await this.axiosInstance.post('/ai/voice', request)
      return response.data
    } catch (error) {
      throw new Error(`Voice interaction failed: ${error}`)
    }
  }

  /**
   * AI-powered job-candidate matching
   * Uses advanced algorithms for skill and cultural fit matching
   */
  async generateMatches(request: MatchingRequest): Promise<{
    matches: Array<{
      candidate_id?: string
      job_id?: string
      overall_score: number
      skills_score: number
      experience_score: number
      cultural_fit_score: number
      explanation: string
    }>
  }> {
    try {
      const response = await this.axiosInstance.post('/ai/matching', request)
      return response.data
    } catch (error) {
      throw new Error(`Matching generation failed: ${error}`)
    }
  }

  /**
   * Extract skills from resumes or job descriptions
   * AI-powered skill identification and categorization
   */
  async extractSkills(request: SkillExtractionRequest): Promise<{
    skills: Array<{
      skill: string
      category: 'technical' | 'soft' | 'certification' | 'language' | 'domain'
      confidence: number
      context: string
    }>
  }> {
    try {
      const response = await this.axiosInstance.post('/ai/skills/extract', request)
      return response.data
    } catch (error) {
      throw new Error(`Skill extraction failed: ${error}`)
    }
  }

  /**
   * Analyze job descriptions for requirements and details
   */
  async analyzeJobDescription(
    job_description: string,
    user_id?: string
  ): Promise<{
    title: string
    department: string
    level: string
    employment_type: string
    required_skills: string[]
    preferred_skills: string[]
    required_experience_years: number
    education_requirements: string[]
    key_responsibilities: string[]
    salary_range?: { min: number; max: number; currency: string }
    location_requirements: string
    industry: string
    company_size: string
  }> {
    try {
      const response = await this.axiosInstance.post('/ai/jobs/analyze', {
        job_description,
        user_id
      })
      return response.data
    } catch (error) {
      throw new Error(`Job analysis failed: ${error}`)
    }
  }

  /**
   * Generate AI explanation for job-candidate matches
   */
  async generateMatchExplanation(
    job_data: any,
    talent_data: any,
    match_scores: any,
    user_id?: string
  ): Promise<{ explanation: string }> {
    try {
      const response = await this.axiosInstance.post('/ai/matching/explain', {
        job_data,
        talent_data,
        match_scores,
        user_id
      })
      return response.data
    } catch (error) {
      throw new Error(`Match explanation failed: ${error}`)
    }
  }

  /**
   * Get AI service health and model status
   */
  async getHealthStatus(): Promise<{
    status: string
    models: {
      mistral?: string
      deepseek?: string
      llama?: string
      openai?: string
    }
    metrics: any
  }> {
    try {
      const response = await this.axiosInstance.get('/health/detailed')
      return response.data
    } catch (error) {
      throw new Error(`Health check failed: ${error}`)
    }
  }

  /**
   * Get AI service metrics and performance data
   */
  async getMetrics(): Promise<{
    total_requests: number
    successful_requests: number
    failed_requests: number
    avg_response_time: number
    models_loaded: {
      mistral: boolean
      deepseek: boolean
      llama: boolean
      openai: boolean
    }
    provider_metrics: any
  }> {
    try {
      const response = await this.axiosInstance.get('/ai/metrics')
      return response.data
    } catch (error) {
      throw new Error(`Metrics retrieval failed: ${error}`)
    }
  }

  /**
   * Smart model selection based on task type
   */
  getOptimalModel(taskType: 'simple' | 'standard' | 'complex' | 'code' | 'local' | 'enterprise'): string {
    const modelRouting = {
      simple: 'deepseek-llm-7b-chat',       // FREE Local
      standard: 'mistral-small-latest',      // Balanced Cloud
      complex: 'mistral-medium-latest',      // Quality Cloud
      enterprise: 'mistral-large-latest',   // Premium Cloud
      code: 'deepseek-coder-7b-instruct',   // FREE Local Coding
      local: 'deepseek-coder-7b-instruct'   // Privacy-focused
    }
    
    return modelRouting[taskType] || 'mistral-small-latest'
  }

  /**
   * Helper method for cost-aware AI requests
   */
  async smartChatCompletion(
    prompt: string,
    complexity: 'simple' | 'standard' | 'complex' | 'code' | 'local' | 'enterprise' = 'standard',
    options: {
      system_prompt?: string
      user_id?: string
      language?: string
    } = {}
  ): Promise<AIResponse> {
    const messages: AIMessage[] = []
    
    if (options.system_prompt) {
      messages.push({ role: 'system', content: options.system_prompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    const model = this.getOptimalModel(complexity)
    
    return this.chatCompletion(messages, {
      model,
      user_id: options.user_id,
      language: options.language
    })
  }
}

// Export singleton instance
export const aiService = new AIService()

// Export helper functions
export const AIHelpers = {
  /**
   * Format candidate profile for AI processing
   */
  formatCandidateProfile(candidate: any): string {
    return `
      Name: ${candidate.first_name} ${candidate.last_name}
      Skills: ${candidate.skills?.join(', ') || 'Not specified'}
      Experience: ${candidate.total_experience_years || 0} years
      Education: ${candidate.education || 'Not specified'}
      Location: ${candidate.location || 'Not specified'}
      Language: ${candidate.languages?.join(', ') || 'Not specified'}
    `.trim()
  },

  /**
   * Format job description for AI processing
   */
  formatJobDescription(job: any): string {
    return `
      Title: ${job.title || 'Not specified'}
      Department: ${job.department || 'Not specified'}
      Required Skills: ${job.required_skills?.join(', ') || 'Not specified'}
      Experience Required: ${job.required_experience_years || 0} years
      Location: ${job.location || 'Not specified'}
      Employment Type: ${job.employment_type || 'Not specified'}
      Description: ${job.description || 'Not specified'}
    `.trim()
  },

  /**
   * Create context-aware system prompts
   */
  createSystemPrompt(role: 'recruiter_assistant' | 'candidate_assistant' | 'skill_extractor' | 'job_analyzer'): string {
    const prompts = {
      recruiter_assistant: `You are Tomoo, an expert AI recruiting assistant for iWORKZ platform. 
        Help recruiters find the best candidates, analyze profiles, and make data-driven hiring decisions. 
        Be professional, insightful, and focus on cultural fit and skill matching.`,
      
      candidate_assistant: `You are Sensei Aiko, a helpful AI career advisor for iWORKZ platform. 
        Assist job seekers with applications, interview preparation, and career guidance. 
        Be supportive, encouraging, and culturally sensitive. Provide practical advice.`,
      
      skill_extractor: `You are a professional skills analysis AI. Extract and categorize skills from text 
        with high accuracy. Focus on technical skills, soft skills, certifications, and domain expertise.`,
      
      job_analyzer: `You are a job description analysis AI. Extract structured information from job postings 
        including requirements, responsibilities, qualifications, and company details.`
    }
    
    return prompts[role]
  }
}

export default aiService