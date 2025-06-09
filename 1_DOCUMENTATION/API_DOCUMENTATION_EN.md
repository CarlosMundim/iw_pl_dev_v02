# iWORKZ Platform API Documentation (English)

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Backend API Endpoints](#backend-api-endpoints)
6. [AI Agent API Endpoints](#ai-agent-api-endpoints)
7. [SDK Usage](#sdk-usage)
8. [Integration Examples](#integration-examples)

## Introduction

The iWORKZ Platform provides a comprehensive set of RESTful APIs designed to connect international talent with Japanese companies. Our platform features advanced AI-powered matching, compliance checking, and document processing capabilities.

### Base URLs
- **Production**: `https://api.iworkz.com`
- **Staging**: `https://staging-api.iworkz.com`
- **AI Agent**: `https://api.iworkz.com/ai`

### API Versioning
Current API version: `v1`

All endpoints are prefixed with `/api` for the backend service and `/ai` for AI-powered features.

## Authentication

### JWT Token Authentication
Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Obtaining an Access Token
```bash
curl -X POST https://api.iworkz.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "userType": "talent"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Token Refresh
```bash
curl -X POST https://api.iworkz.com/api/auth/refresh-token \
  -H "Authorization: Bearer <current-token>"
```

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **File uploads**: 20 requests per minute
- **AI processing**: 50 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Backend API Endpoints

### Authentication Endpoints

#### Register User
Create a new user account for talent, employer, or agency.

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "talent@example.com",
  "password": "securepassword123",
  "firstName": "Hiroshi",
  "lastName": "Tanaka",
  "userType": "talent",
  "phone": "+81-90-1234-5678",
  "countryCode": "JP",
  "termsAccepted": true,
  "privacyAccepted": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "talent@example.com",
      "firstName": "Hiroshi",
      "lastName": "Tanaka",
      "userType": "talent"
    },
    "token": "jwt-token"
  }
}
```

#### Login
Authenticate user and receive access token.

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "talent@example.com",
  "password": "securepassword123"
}
```

#### Get Current User
Retrieve current authenticated user's profile.

**GET** `/api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "talent@example.com",
      "firstName": "Hiroshi",
      "lastName": "Tanaka",
      "userType": "talent",
      "profile": {
        "skills": ["JavaScript", "React", "Node.js"],
        "experience": "5 years",
        "location": "Tokyo, Japan"
      }
    }
  }
}
```

#### Change Password
Update user password.

**PATCH** `/api/auth/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Password Reset
Initiate password reset flow.

**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "talent@example.com"
}
```

**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

### Job Management Endpoints

#### Get All Jobs
Retrieve paginated list of active job postings.

**GET** `/api/jobs?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-uuid",
        "title": "Senior Full Stack Developer",
        "description": "We are looking for an experienced developer...",
        "company": {
          "name": "Tech Corp Japan",
          "location": "Tokyo"
        },
        "salary": {
          "min": 6000000,
          "max": 10000000,
          "currency": "JPY"
        },
        "skillsRequired": ["JavaScript", "React", "Python"],
        "remoteAllowed": true,
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Get Single Job
Retrieve detailed information about a specific job.

**GET** `/api/jobs/{jobId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job-uuid",
      "title": "Senior Full Stack Developer",
      "description": "Detailed job description...",
      "requirements": "5+ years experience...",
      "skillsRequired": ["JavaScript", "React", "Python", "AWS"],
      "experienceLevel": "senior",
      "employmentType": "full-time",
      "location": "Tokyo, Japan",
      "remoteAllowed": true,
      "salaryRange": {
        "min": 6000000,
        "max": 10000000,
        "currency": "JPY"
      },
      "benefits": ["Health insurance", "Visa sponsorship"],
      "company": {
        "id": "company-uuid",
        "name": "Tech Corp Japan",
        "industry": "Technology",
        "size": "500-1000",
        "description": "Leading tech company in Japan"
      }
    }
  }
}
```

#### Create Job Posting
Create a new job posting (Employer/Admin only).

**POST** `/api/jobs`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "AI Engineer",
  "description": "We are seeking an experienced AI Engineer...",
  "requirements": "Master's degree in Computer Science or related field...",
  "skillsRequired": ["Python", "TensorFlow", "Machine Learning"],
  "experienceLevel": "senior",
  "employmentType": "full-time",
  "location": "Osaka, Japan",
  "remoteAllowed": false,
  "salaryRange": {
    "min": 8000000,
    "max": 12000000,
    "currency": "JPY"
  },
  "benefits": ["Visa sponsorship", "Health insurance", "Stock options"]
}
```

### Matching Endpoints

#### Get Job Matches for Talent
Get AI-powered job recommendations for authenticated talent.

**GET** `/api/matching/jobs?limit=10`

**Headers:** `Authorization: Bearer <token>` (Talent role required)

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "job": {
          "id": "job-uuid",
          "title": "Full Stack Developer",
          "company": "Tech Corp Japan"
        },
        "matchScore": 0.89,
        "reasons": [
          "Skills match: JavaScript, React",
          "Experience level aligned",
          "Location preference match"
        ],
        "skillsMatch": {
          "matched": ["JavaScript", "React", "Node.js"],
          "missing": ["AWS"],
          "score": 0.85
        }
      }
    ]
  }
}
```

#### Get Talent Matches for Job
Get AI-powered talent recommendations for a specific job.

**GET** `/api/matching/talents/{jobId}?limit=10`

**Headers:** `Authorization: Bearer <token>` (Employer/Admin role required)

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "talent": {
          "id": "talent-uuid",
          "firstName": "Hiroshi",
          "lastName": "T.",
          "skills": ["JavaScript", "React", "Python"],
          "experience": "5 years",
          "location": "Tokyo"
        },
        "matchScore": 0.92,
        "strengths": [
          "Excellent technical skills match",
          "Strong experience in similar roles",
          "Available immediately"
        ],
        "considerations": [
          "Salary expectations may be higher"
        ]
      }
    ]
  }
}
```

### File Upload Endpoints

#### Upload File
Upload resumes, documents, or images.

**POST** `/api/upload`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
file: [binary file data]
```

**Supported formats:** PDF, DOC, DOCX, JPEG, JPG, PNG (max 5MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-uuid",
      "filename": "resume.pdf",
      "originalName": "hiroshi_tanaka_resume.pdf",
      "size": 1024000,
      "url": "https://storage.iworkz.com/files/file-uuid.pdf",
      "type": "application/pdf"
    }
  }
}
```

### Compliance Endpoints

#### Check Job Compliance
Verify job posting compliance for specific jurisdiction.

**POST** `/api/compliance/check-job/{jobId}`

**Headers:** `Authorization: Bearer <token>` (Employer/Admin role required)

**Request Body:**
```json
{
  "jurisdiction": "JP"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "compliance": {
      "status": "compliant",
      "jurisdiction": "JP",
      "checks": [
        {
          "rule": "visa_sponsorship_disclosure",
          "status": "pass",
          "description": "Visa sponsorship clearly stated"
        },
        {
          "rule": "salary_disclosure",
          "status": "warning",
          "description": "Consider including more detailed salary breakdown"
        }
      ],
      "recommendations": [
        "Add specific visa types supported",
        "Include overtime policy details"
      ]
    }
  }
}
```

#### Get Compliance Rules
Retrieve compliance rules for jurisdiction.

**GET** `/api/compliance/rules/{jurisdiction}`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "jurisdiction": "JP",
    "rules": [
      {
        "id": "visa_sponsorship",
        "name": "Visa Sponsorship Disclosure",
        "description": "Must clearly state visa sponsorship availability",
        "mandatory": true,
        "category": "employment_law"
      }
    ]
  }
}
```

### Analytics Endpoints

#### Get Platform Analytics
Retrieve platform-wide statistics (Admin only).

**GET** `/api/analytics/platform`

**Headers:** `Authorization: Bearer <token>` (Admin role required)

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "activeUsers": 1250,
      "totalJobs": 856,
      "totalApplications": 3420,
      "successfulMatches": 127,
      "topSkills": ["JavaScript", "Python", "React"],
      "topIndustries": ["Technology", "Finance", "Healthcare"],
      "userGrowth": {
        "thisMonth": 89,
        "lastMonth": 76
      }
    }
  }
}
```

#### Track User Events
Record user interaction events.

**POST** `/api/analytics/events`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "eventType": "job_view",
  "eventCategory": "engagement",
  "eventData": {
    "jobId": "job-uuid",
    "duration": 120,
    "source": "search"
  }
}
```

## AI Agent API Endpoints

### Compliance AI Endpoints

#### AI Compliance Check
Comprehensive AI-powered compliance analysis.

**POST** `/ai/compliance/check`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "entity_type": "job_posting",
  "entity_id": "job-uuid",
  "jurisdiction": "JP",
  "check_types": ["employment_law", "visa_requirements", "discrimination"],
  "include_recommendations": true,
  "use_cached_results": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "compliance_result": {
      "overall_status": "compliant_with_warnings",
      "confidence_score": 0.94,
      "jurisdiction": "JP",
      "checks_performed": [
        {
          "type": "employment_law",
          "status": "compliant",
          "score": 0.96,
          "findings": [
            "Working hours clearly specified",
            "Overtime compensation mentioned"
          ]
        },
        {
          "type": "visa_requirements",
          "status": "warning",
          "score": 0.78,
          "findings": [
            "Visa sponsorship availability unclear",
            "Required visa types not specified"
          ]
        }
      ],
      "ai_recommendations": [
        {
          "priority": "high",
          "category": "visa_requirements",
          "suggestion": "Explicitly state which visa types are supported (e.g., Engineer/Specialist in Humanities/International Services)",
          "impact": "Improves transparency and reduces candidate confusion"
        }
      ],
      "regulatory_references": [
        {
          "law": "Immigration Control and Refugee Recognition Act",
          "article": "Article 7-1-2",
          "summary": "Work visa requirements for foreign nationals"
        }
      ]
    }
  }
}
```

#### Bulk Compliance Check
Check multiple entities simultaneously.

**POST** `/ai/compliance/bulk-check`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "entity_ids": ["job-uuid-1", "job-uuid-2", "job-uuid-3"],
  "entity_type": "job_posting",
  "jurisdiction": "JP",
  "check_types": ["employment_law", "visa_requirements"]
}
```

#### Get Supported Jurisdictions
List all supported compliance jurisdictions.

**GET** `/ai/compliance/jurisdictions`

**Response:**
```json
{
  "success": true,
  "data": {
    "jurisdictions": [
      {
        "code": "JP",
        "name": "Japan",
        "supported_checks": ["employment_law", "visa_requirements", "discrimination"],
        "language": "ja"
      },
      {
        "code": "US",
        "name": "United States",
        "supported_checks": ["employment_law", "discrimination", "accessibility"],
        "language": "en"
      }
    ]
  }
}
```

### Document Processing AI Endpoints

#### Parse Resume
Extract structured data from resume files using AI.

**POST** `/ai/documents/parse-resume`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
file: [resume file - PDF, DOC, DOCX, TXT, max 10MB]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "parsed_resume": {
      "personal_info": {
        "name": "Hiroshi Tanaka",
        "email": "hiroshi.tanaka@email.com",
        "phone": "+81-90-1234-5678",
        "location": "Tokyo, Japan",
        "visa_status": "Work visa required"
      },
      "skills": [
        {
          "name": "JavaScript",
          "category": "Programming Languages",
          "proficiency": "Expert",
          "years_experience": 5
        },
        {
          "name": "React",
          "category": "Frontend Frameworks",
          "proficiency": "Advanced",
          "years_experience": 4
        }
      ],
      "experience": [
        {
          "company": "Tech Solutions Inc.",
          "position": "Senior Frontend Developer",
          "duration": "2020-2024",
          "location": "Tokyo, Japan",
          "description": "Led development of React-based applications...",
          "achievements": [
            "Improved application performance by 40%",
            "Led team of 5 developers"
          ]
        }
      ],
      "education": [
        {
          "institution": "Tokyo University",
          "degree": "Bachelor of Computer Science",
          "year": "2019",
          "location": "Tokyo, Japan"
        }
      ],
      "languages": [
        {
          "language": "Japanese",
          "proficiency": "Native"
        },
        {
          "language": "English",
          "proficiency": "Fluent"
        }
      ],
      "confidence_score": 0.93,
      "extraction_notes": [
        "High quality document with clear structure",
        "All sections successfully identified"
      ]
    }
  }
}
```

#### Analyze Document
General document analysis with configurable extraction.

**POST** `/ai/documents/analyze-document`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
file: [document file]
document_type: "contract" | "resume" | "job_description" | "other"
extract_skills: true
extract_experience: true
extract_education: false
extract_contact: true
```

#### Get Supported Document Formats
List supported file formats and processing capabilities.

**GET** `/ai/documents/supported-formats`

**Response:**
```json
{
  "success": true,
  "data": {
    "supported_formats": [
      {
        "format": "PDF",
        "max_size_mb": 10,
        "features": ["text_extraction", "ocr", "structure_analysis"]
      },
      {
        "format": "DOCX",
        "max_size_mb": 10,
        "features": ["text_extraction", "structure_analysis", "metadata"]
      }
    ],
    "processing_capabilities": [
      "Resume parsing",
      "Skills extraction",
      "Experience analysis",
      "Contact information extraction",
      "Language detection"
    ]
  }
}
```

### AI Matching Endpoints

#### AI Candidate Matching
Advanced AI-powered talent matching for jobs.

**POST** `/ai/matching/match-candidates`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "job_id": "job-uuid",
  "talent_ids": ["talent-1", "talent-2"],
  "max_results": 20,
  "min_score": 0.7,
  "include_explanation": true,
  "use_cached_results": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matching_results": [
      {
        "talent_id": "talent-uuid",
        "match_score": 0.89,
        "confidence": 0.94,
        "explanation": {
          "strengths": [
            "Excellent technical skills alignment (95% match)",
            "Strong experience in similar roles",
            "Preferred location match"
          ],
          "considerations": [
            "Salary expectations 15% above budget",
            "Notice period of 2 months"
          ],
          "skill_analysis": {
            "required_skills_match": 0.92,
            "bonus_skills_present": ["AWS", "Docker"],
            "missing_skills": ["Kubernetes"],
            "transferable_skills": ["Python", "React"]
          }
        },
        "scoring_breakdown": {
          "technical_skills": 0.95,
          "experience_level": 0.88,
          "location_preference": 1.0,
          "availability": 0.85,
          "cultural_fit": 0.82
        },
        "ai_insights": [
          "Candidate has worked in similar company cultures",
          "Strong adaptability based on career progression",
          "Excellent communication skills in Japanese and English"
        ]
      }
    ],
    "processing_time_ms": 1247,
    "algorithm_version": "v2.1.0"
  }
}
```

#### AI Job Matching
AI-powered job recommendations for talent.

**POST** `/ai/matching/match-jobs`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "talent_id": "talent-uuid",
  "job_ids": ["job-1", "job-2", "job-3"],
  "min_score": 0.6
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_matches": [
      {
        "job_id": "job-uuid",
        "match_score": 0.91,
        "recommendation_strength": "strong",
        "why_good_match": [
          "Perfect technical skills alignment",
          "Salary range meets expectations",
          "Company culture matches preferences"
        ],
        "growth_opportunities": [
          "Leadership development program",
          "International project exposure",
          "Advanced technical training"
        ],
        "potential_concerns": [
          "Longer commute than preferred",
          "Limited remote work options"
        ]
      }
    ]
  }
}
```

## SDK Usage

### JavaScript/Node.js SDK

```javascript
const { iWORKZAPI } = require('@iworkz/api-sdk');

const client = new iWORKZAPI({
  baseURL: 'https://api.iworkz.com',
  apiKey: 'your-api-key'
});

// Authenticate
const auth = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get job matches
const matches = await client.matching.getJobMatches({
  limit: 10
});

// Upload resume
const resume = await client.documents.uploadResume(fileBuffer);
```

### Python SDK

```python
from iworkz_api import iWORKZClient

client = iWORKZClient(
    base_url="https://api.iworkz.com",
    api_key="your-api-key"
)

# Authenticate
auth_result = client.auth.login(
    email="user@example.com",
    password="password"
)

# Parse resume
with open("resume.pdf", "rb") as f:
    parsed_resume = client.ai.parse_resume(f)

# Check compliance
compliance = client.ai.check_compliance(
    entity_type="job_posting",
    entity_id="job-uuid",
    jurisdiction="JP"
)
```

## Integration Examples

### Creating a Complete Job Application Flow

```javascript
// 1. Register talent
const registration = await client.auth.register({
  email: 'talent@example.com',
  password: 'securepassword',
  firstName: 'Hiroshi',
  lastName: 'Tanaka',
  userType: 'talent'
});

// 2. Upload and parse resume
const resumeFile = fs.readFileSync('resume.pdf');
const parsedResume = await client.ai.parseResume(resumeFile);

// 3. Update profile with parsed data
await client.users.updateProfile({
  skills: parsedResume.skills.map(s => s.name),
  experience: parsedResume.experience
});

// 4. Get job matches
const jobMatches = await client.matching.getJobMatches({
  limit: 10,
  minScore: 0.7
});

// 5. Apply to top match
const topJob = jobMatches[0];
await client.jobs.apply(topJob.job.id, {
  coverLetter: 'I am very interested in this position...'
});
```

### Employer Job Posting with Compliance Check

```javascript
// 1. Create job posting
const jobData = {
  title: 'Senior Full Stack Developer',
  description: 'We are looking for an experienced developer...',
  skillsRequired: ['JavaScript', 'React', 'Node.js'],
  salaryRange: { min: 6000000, max: 10000000, currency: 'JPY' },
  location: 'Tokyo, Japan',
  remoteAllowed: true
};

const job = await client.jobs.create(jobData);

// 2. Check compliance
const compliance = await client.ai.checkCompliance({
  entityType: 'job_posting',
  entityId: job.id,
  jurisdiction: 'JP',
  includeRecommendations: true
});

// 3. Update job based on recommendations if needed
if (compliance.status === 'warning') {
  console.log('Compliance recommendations:', compliance.aiRecommendations);
  // Update job posting based on AI recommendations
}

// 4. Get talent matches
const talentMatches = await client.matching.getTalentMatches(job.id, {
  limit: 20,
  minScore: 0.8
});
```

### Bulk Document Processing

```javascript
const documents = ['resume1.pdf', 'resume2.docx', 'resume3.pdf'];
const processedResults = [];

for (const docPath of documents) {
  try {
    const fileBuffer = fs.readFileSync(docPath);
    const result = await client.ai.parseResume(fileBuffer);
    processedResults.push({
      filename: docPath,
      status: 'success',
      data: result
    });
  } catch (error) {
    processedResults.push({
      filename: docPath,
      status: 'error',
      error: error.message
    });
  }
}

console.log(`Processed ${processedResults.length} documents`);
```

## Error Handling Best Practices

### Retry Logic for Rate Limits

```javascript
async function makeAPICallWithRetry(apiCall, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries) {
        const retryAfter = error.headers['retry-after'] || Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
}

// Usage
const jobMatches = await makeAPICallWithRetry(() => 
  client.matching.getJobMatches({ limit: 10 })
);
```

### Error Handling Patterns

```javascript
try {
  const result = await client.ai.parseResume(fileBuffer);
  // Handle success
} catch (error) {
  switch (error.code) {
    case 'FILE_TOO_LARGE':
      console.error('File size exceeds 10MB limit');
      break;
    case 'UNSUPPORTED_FORMAT':
      console.error('File format not supported');
      break;
    case 'PARSING_FAILED':
      console.error('AI parsing failed:', error.message);
      break;
    default:
      console.error('Unexpected error:', error);
  }
}
```

## Support and Resources

- **API Documentation**: https://docs.iworkz.com/api
- **Developer Portal**: https://developers.iworkz.com
- **Support Email**: api-support@iworkz.com
- **Status Page**: https://status.iworkz.com
- **GitHub Examples**: https://github.com/iworkz/api-examples

For additional support or questions, please contact our developer support team.