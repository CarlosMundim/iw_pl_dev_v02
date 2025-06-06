// Common types used throughout the application

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
  isActive: boolean
  
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

export interface Job {
  id: string
  employerId: string
  title: string
  description: string
  requirements: string[]
  skillsRequired: string[]
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  location: {
    city: string
    country: string
    address?: string
    coordinates?: { lat: number; lng: number }
    remote?: boolean
  }
  remoteAllowed: boolean
  salaryRange: {
    min: number
    max: number
    currency: string
    negotiable?: boolean
  }
  benefits: string[]
  status: 'draft' | 'active' | 'paused' | 'closed' | 'expired'
  applicationDeadline?: string
  startDate?: string
  positionsAvailable: number
  viewCount: number
  applicationCount: number
  createdAt: string
  updatedAt: string
  expiresAt: string
  
  // Populated fields
  company?: {
    name: string
    size: string
    industry: string
    description?: string
    website?: string
    logo?: string
  }
}

export interface JobApplication {
  id: string
  jobId: string
  talentId: string
  status: 'applied' | 'reviewing' | 'shortlisted' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
  coverLetter?: string
  customResumeUrl?: string
  matchScore?: number
  aiAssessment?: any
  screeningAnswers?: any
  interviewNotes?: any[]
  feedback?: string
  appliedAt: string
  updatedAt: string
  reviewedAt?: string
  
  // Populated fields
  job?: Job
  talent?: User
}

export interface MatchingScore {
  id: string
  jobId: string
  talentId: string
  overallScore: number
  skillsScore: number
  experienceScore: number
  locationScore: number
  availabilityScore: number
  salaryScore: number
  aiExplanation?: string
  confidenceLevel: number
  calculatedAt: string
  
  // Populated fields
  job?: Job
  talent?: User
}

export interface ComplianceCheck {
  id: string
  entityType: 'job' | 'contract' | 'profile'
  entityId: string
  jurisdiction: string
  checkType: string
  status: 'pending' | 'passed' | 'failed' | 'warning'
  results: any
  issuesFound: any[]
  recommendations: any[]
  confidenceScore?: number
  checkedBy: 'ai' | 'human' | 'system'
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  channel: 'in-app' | 'email' | 'sms' | 'push'
  isRead: boolean
  isSent: boolean
  sentAt?: string
  readAt?: string
  expiresAt?: string
  createdAt: string
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message?: string
  data?: T
  errors?: any[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchFilters {
  query?: string
  location?: string
  skills?: string[]
  experienceLevel?: string[]
  employmentType?: string[]
  salaryMin?: number
  salaryMax?: number
  remoteOnly?: boolean
  [key: string]: any
}

export interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  url?: string
  error?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  userType: 'talent' | 'employer' | 'agency'
  phone?: string
  countryCode?: string
  languagePreference?: string
  termsAccepted: boolean
  privacyAccepted: boolean
}

export interface JobForm {
  title: string
  description: string
  requirements: string[]
  skillsRequired: string[]
  experienceLevel: string
  employmentType: string
  location: any
  remoteAllowed: boolean
  salaryRange: any
  benefits: string[]
  applicationDeadline?: string
  startDate?: string
  positionsAvailable: number
}

export interface ProfileUpdateForm {
  firstName?: string
  lastName?: string
  phone?: string
  countryCode?: string
  bio?: string
  skills?: any
  experienceYears?: number
  education?: any[]
  certifications?: any[]
  availabilityStatus?: string
  preferredLocations?: any[]
  salaryExpectations?: any
  remotePreference?: string
}

// Utility types
export type UserType = User['userType']
export type JobStatus = Job['status']
export type ApplicationStatus = JobApplication['status']
export type VerificationStatus = User['verificationStatus']
export type NotificationChannel = Notification['channel']

// API Error types
export interface ApiError {
  message: string
  code?: string
  details?: any
  statusCode?: number
}