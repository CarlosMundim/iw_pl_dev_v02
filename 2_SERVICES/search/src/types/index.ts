export interface SearchFilters {
  employmentTypes?: string[];
  experienceLevels?: string[];
  locations?: string[];
  companies?: string[];
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  skills?: string[];
  remote?: boolean;
  postedWithin?: string; // e.g., "7d", "30d"
  geo?: {
    latitude: number;
    longitude: number;
    distance?: string; // e.g., "50km"
  };
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  }[];
  page?: number;
  size?: number;
  highlight?: boolean;
  aggregations?: boolean;
}

export interface JobDocument {
  id: string;
  title: string;
  description: string;
  requirements: {
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    required: boolean;
    yearsExperience?: number;
  }[];
  location: {
    city: string;
    country: string;
    countryCode: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
    remote: boolean;
    hybrid?: boolean;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  company: {
    id: string;
    name: string;
    size: string;
    industry: string;
    logo?: string;
    verified: boolean;
  };
  benefits?: string[];
  languages?: string[];
  postedDate: Date;
  expiresDate?: Date;
  status: 'active' | 'paused' | 'expired' | 'filled';
  featured: boolean;
  urgentHiring: boolean;
  views: number;
  applications: number;
  tags?: string[];
  metadata?: {
    source?: string;
    externalId?: string;
    lastUpdated: Date;
  };
}

export interface CandidateDocument {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  title?: string;
  summary?: string;
  skills: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsExperience: number;
    verified: boolean;
    certifications?: string[];
  }[];
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    durationMonths: number;
    description: string;
    achievements?: string[];
    technologies?: string[];
  }[];
  education: {
    id: string;
    degree: string;
    field: string;
    institution: string;
    location: string;
    graduationYear: number;
    gpa?: number;
    honors?: string[];
  }[];
  certifications?: {
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
    url?: string;
  }[];
  languages: {
    language: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  }[];
  location: {
    city: string;
    country: string;
    countryCode: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
    willingToRelocate: boolean;
    maxRelocationDistance?: number;
  };
  preferences: {
    jobTypes: string[];
    industries: string[];
    salaryExpectation: {
      min: number;
      max: number;
      currency: string;
    };
    remotePreference: 'only' | 'hybrid' | 'onsite' | 'flexible';
    availability: 'immediate' | '2weeks' | '1month' | '3months';
    workAuthorization: string[];
  };
  availability: 'available' | 'employed-open' | 'employed-closed' | 'not-available';
  lastActive: Date;
  profileCompletion: number;
  verified: boolean;
  featured: boolean;
  visibility: 'public' | 'private' | 'recruiter-only';
  metadata?: {
    source?: string;
    externalId?: string;
    lastUpdated: Date;
    searchBoost?: number;
  };
}

export interface SearchResponse<T> {
  hits: {
    total: {
      value: number;
      relation: 'eq' | 'gte';
    };
    hits: Array<{
      _id: string;
      _source: T;
      _score: number;
      highlight?: Record<string, string[]>;
    }>;
  };
  aggregations?: Record<string, any>;
  took: number;
  timedOut: boolean;
}

export interface SearchResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  aggregations?: {
    employmentTypes?: Array<{ key: string; count: number }>;
    experienceLevels?: Array<{ key: string; count: number }>;
    locations?: Array<{ key: string; count: number }>;
    companies?: Array<{ key: string; count: number }>;
    skills?: Array<{ key: string; count: number }>;
    salaryRanges?: Array<{ key: string; count: number }>;
  };
  suggestions?: string[];
  took: number;
}

export interface SuggestionQuery {
  field: string;
  prefix: string;
  size?: number;
  contexts?: Record<string, any>;
}

export interface SuggestionResult {
  suggestions: Array<{
    text: string;
    score: number;
    contexts?: Record<string, any>;
  }>;
}

export interface IndexConfig {
  name: string;
  mappings: Record<string, any>;
  settings: Record<string, any>;
  aliases?: string[];
}

export interface BulkOperation {
  index?: {
    _index: string;
    _id: string;
  };
  update?: {
    _index: string;
    _id: string;
  };
  delete?: {
    _index: string;
    _id: string;
  };
  doc?: any;
  doc_as_upsert?: boolean;
}

export interface SearchAnalytics {
  query: string;
  filters: SearchFilters;
  results: number;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  clickedResults?: string[];
  executionTime: number;
}

export interface IndexStats {
  name: string;
  status: string;
  docsCount: number;
  storeSize: string;
  health: 'green' | 'yellow' | 'red';
  shards: {
    primary: number;
    replica: number;
  };
}

export interface ClusterHealth {
  status: 'green' | 'yellow' | 'red';
  numberOfNodes: number;
  numberOfDataNodes: number;
  activePrimaryShards: number;
  activeShards: number;
  relocatingShards: number;
  initializingShards: number;
  unassignedShards: number;
  delayedUnassignedShards: number;
  pendingTasks: number;
  inFlightFetch: number;
  taskMaxWaitingInQueueMillis: number;
  activeShardsPercentAsNumber: number;
}