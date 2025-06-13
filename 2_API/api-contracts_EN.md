# iWORKZ Platform API Contracts
## Service-to-Service Communication Specifications

### **Overview**
This document defines the API contracts for inter-service communication within the iWORKZ microservices architecture. Each service exposes specific endpoints for other services to consume, ensuring loose coupling and high cohesion.

---

## **1. Authentication Service**

### **Service Interface: `auth-service`**
**Base URL**: `http://auth-service:3001`

#### **Token Validation Endpoint**
```http
POST /internal/validate-token
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "required_permissions": ["read:jobs", "write:applications"]
}
```

**Response:**
```json
{
  "valid": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "candidate",
  "permissions": ["read:jobs", "write:applications", "read:profile"],
  "expires_at": "2024-12-31T23:59:59Z"
}
```

#### **Service Authentication**
```http
POST /internal/service-auth
Content-Type: application/json

{
  "service_name": "matching-engine",
  "api_key": "srv_12345...",
  "requested_scopes": ["user:read", "jobs:read", "ai:process"]
}
```

---

## **2. User Management Service**

### **Service Interface: `user-service`**
**Base URL**: `http://user-service:3002`

#### **Get User Profile (Internal)**
```http
GET /internal/users/{user_id}
Authorization: Bearer <service-token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "candidate",
  "profile": {
    "skills": [
      {"name": "JavaScript", "level": "advanced", "years_experience": 5},
      {"name": "React", "level": "expert", "years_experience": 4}
    ],
    "location": {
      "city": "Tokyo",
      "prefecture": "Tokyo",
      "country": "JP"
    },
    "experience": [...],
    "education": [...],
    "languages": [...]
  },
  "preferences": {
    "salary_range": {"min": 6000000, "max": 10000000, "currency": "JPY"},
    "work_location": "hybrid",
    "visa_sponsorship_needed": false
  }
}
```

#### **Bulk User Lookup**
```http
POST /internal/users/bulk-lookup
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "user_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ],
  "include_fields": ["basic_info", "skills", "location"]
}
```

---

## **3. Job Management Service**

### **Service Interface: `job-service`**
**Base URL**: `http://job-service:3003`

#### **Get Job Details (Internal)**
```http
GET /internal/jobs/{job_id}
Authorization: Bearer <service-token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Senior React Developer",
  "company": {
    "id": "comp_123",
    "name": "TechCorp Japan",
    "industry": "Technology"
  },
  "requirements": {
    "skills": [
      {"name": "React", "level": "advanced", "required": true, "weight": 0.8},
      {"name": "TypeScript", "level": "intermediate", "required": true, "weight": 0.6}
    ],
    "experience_years": 3,
    "education_level": "bachelor",
    "languages": [
      {"code": "ja", "level": "business"},
      {"code": "en", "level": "conversational"}
    ]
  },
  "location": {
    "city": "Tokyo",
    "prefecture": "Tokyo",
    "remote_work": "hybrid"
  },
  "salary": {
    "min": 7000000,
    "max": 12000000,
    "currency": "JPY",
    "period": "yearly"
  },
  "visa_sponsorship": true,
  "status": "active",
  "posted_at": "2024-01-15T10:00:00Z",
  "expires_at": "2024-03-15T23:59:59Z"
}
```

#### **Search Jobs for Matching**
```http
POST /internal/jobs/search-for-matching
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "candidate_profile": {
    "skills": [...],
    "location": {...},
    "experience_years": 5,
    "salary_expectation": {...}
  },
  "filters": {
    "status": "active",
    "visa_sponsorship": true,
    "remote_work": ["hybrid", "fully_remote"]
  },
  "limit": 50
}
```

---

## **4. AI Matching Engine**

### **Service Interface: `ai-matching-service`**
**Base URL**: `http://ai-matching-service:3004`

#### **Calculate Matching Score**
```http
POST /internal/calculate-match
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "candidate_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "matching_criteria": {
    "skills_weight": 0.4,
    "experience_weight": 0.3,
    "location_weight": 0.2,
    "language_weight": 0.1
  }
}
```

**Response:**
```json
{
  "overall_score": 0.85,
  "breakdown": {
    "skills_score": 0.90,
    "experience_score": 0.80,
    "location_score": 0.95,
    "language_score": 0.75
  },
  "matched_skills": ["React", "TypeScript", "Node.js"],
  "missing_skills": ["GraphQL"],
  "experience_gap": 0,
  "location_match": "exact",
  "language_compatibility": "high",
  "confidence": 0.92,
  "explanation": "Strong technical match with excellent location compatibility",
  "calculated_at": "2024-01-20T14:30:00Z"
}
```

#### **Batch Matching**
```http
POST /internal/batch-matching
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "candidates": ["user_id_1", "user_id_2", ...],
  "jobs": ["job_id_1", "job_id_2", ...],
  "matching_criteria": {...},
  "minimum_score": 0.7
}
```

---

## **5. Compliance Engine**

### **Service Interface: `compliance-service`**
**Base URL**: `http://compliance-service:3005`

#### **Validate Employment Eligibility**
```http
POST /internal/validate-eligibility
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "candidate_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "validation_type": "full_check"
}
```

**Response:**
```json
{
  "eligible": true,
  "compliance_score": 0.95,
  "visa_status": {
    "type": "permanent_resident",
    "valid_until": null,
    "work_authorized": true
  },
  "tax_compliance": {
    "status": "compliant",
    "last_checked": "2024-01-15T00:00:00Z"
  },
  "labor_law_compliance": {
    "overtime_eligible": true,
    "minimum_wage_applicable": true,
    "health_insurance_required": true
  },
  "required_documents": [],
  "recommendations": [
    "Ensure health insurance enrollment within 30 days"
  ],
  "validated_at": "2024-01-20T14:30:00Z"
}
```

#### **Check Regulatory Updates**
```http
GET /internal/regulatory-updates
Authorization: Bearer <service-token>
Query Parameters:
- since: 2024-01-01T00:00:00Z
- category: labor_law,visa_regulations
```

---

## **6. Credential Verification Service**

### **Service Interface: `credential-service`**
**Base URL**: `http://credential-service:3006`

#### **Verify Credential**
```http
POST /internal/verify-credential
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "credential_id": "cred_12345",
  "verification_level": "full",
  "blockchain_verification": true
}
```

**Response:**
```json
{
  "verified": true,
  "verification_score": 0.98,
  "blockchain_verified": true,
  "issuer_verified": true,
  "data_integrity_verified": true,
  "expiry_status": "valid",
  "verification_details": {
    "blockchain_hash": "0x1234...",
    "transaction_id": "0xabcd...",
    "block_number": 18500000,
    "ipfs_hash": "QmX1234..."
  },
  "verified_at": "2024-01-20T14:30:00Z"
}
```

---

## **7. Notification Service**

### **Service Interface: `notification-service`**
**Base URL**: `http://notification-service:3007`

#### **Send Notification**
```http
POST /internal/send-notification
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "job_match",
  "priority": "medium",
  "channels": ["in_app", "email"],
  "template": "new_job_match",
  "data": {
    "job_title": "Senior React Developer",
    "company_name": "TechCorp Japan",
    "match_score": 0.85,
    "job_url": "https://app.iworkz.jp/jobs/123"
  },
  "schedule_at": null,
  "deduplication_key": "job_match_user_123_job_456"
}
```

**Response:**
```json
{
  "notification_id": "notif_12345",
  "status": "sent",
  "channels_sent": ["in_app", "email"],
  "channels_failed": [],
  "sent_at": "2024-01-20T14:30:00Z"
}
```

---

## **8. Analytics Service**

### **Service Interface: `analytics-service`**
**Base URL**: `http://analytics-service:3008`

#### **Track Event**
```http
POST /internal/track-event
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "event_type": "job_view",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "properties": {
    "job_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "source": "search_results",
    "match_score": 0.85,
    "position_in_list": 3
  },
  "timestamp": "2024-01-20T14:30:00Z",
  "session_id": "sess_12345"
}
```

#### **Get Analytics Data**
```http
POST /internal/analytics/query
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "metric": "job_application_funnel",
  "filters": {
    "date_range": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "user_segment": "candidates",
    "location": "Tokyo"
  },
  "group_by": ["date", "job_category"]
}
```

---

## **9. Search Service**

### **Service Interface: `search-service`**
**Base URL**: `http://search-service:3009`

#### **Index Document**
```http
POST /internal/index
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "index": "jobs",
  "document_id": "job_12345",
  "document": {
    "title": "Senior React Developer",
    "description": "We are looking for an experienced React developer...",
    "skills": ["React", "TypeScript", "Node.js"],
    "location": {
      "city": "Tokyo",
      "prefecture": "Tokyo",
      "country": "JP",
      "coordinates": [35.6762, 139.6503]
    },
    "salary_range": [7000000, 12000000],
    "company": "TechCorp Japan",
    "posted_at": "2024-01-20T14:30:00Z"
  }
}
```

#### **Search Documents**
```http
POST /internal/search
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "index": "jobs",
  "query": {
    "bool": {
      "must": [
        {"match": {"skills": "React"}},
        {"range": {"salary_range.min": {"gte": 6000000}}}
      ],
      "filter": [
        {"term": {"status": "active"}},
        {"geo_distance": {
          "distance": "50km",
          "location.coordinates": [35.6762, 139.6503]
        }}
      ]
    }
  },
  "sort": [
    {"posted_at": {"order": "desc"}},
    {"_score": {"order": "desc"}}
  ],
  "size": 20,
  "from": 0
}
```

---

## **10. File Storage Service**

### **Service Interface: `file-service`**
**Base URL**: `http://file-service:3010`

#### **Upload File**
```http
POST /internal/upload
Content-Type: multipart/form-data
Authorization: Bearer <service-token>

file: [binary data]
user_id: 550e8400-e29b-41d4-a716-446655440000
file_type: resume
visibility: private
```

**Response:**
```json
{
  "file_id": "file_12345",
  "url": "https://cdn.iworkz.jp/files/12345/resume.pdf",
  "cdn_url": "https://cdn.iworkz.jp/files/12345/resume.pdf",
  "size": 1048576,
  "type": "application/pdf",
  "uploaded_at": "2024-01-20T14:30:00Z",
  "expires_at": null
}
```

---

## **Service Discovery Configuration**

### **Consul Service Registration**
```json
{
  "service": {
    "name": "matching-engine",
    "id": "matching-engine-1",
    "tags": ["ai", "matching", "production"],
    "address": "10.0.1.15",
    "port": 3004,
    "meta": {
      "version": "1.0.0",
      "environment": "production"
    },
    "check": {
      "http": "http://10.0.1.15:3004/health",
      "interval": "10s",
      "timeout": "3s"
    }
  }
}
```

### **Load Balancing Configuration**
```yaml
# HAProxy configuration for service load balancing
global
  daemon

defaults
  mode http
  timeout connect 5000ms
  timeout client 50000ms
  timeout server 50000ms

backend auth-service
  balance roundrobin
  server auth1 auth-service-1:3001 check
  server auth2 auth-service-2:3001 check

backend matching-engine
  balance leastconn
  server match1 matching-engine-1:3004 check
  server match2 matching-engine-2:3004 check
```

---

## **Error Handling Standards**

### **Standard Error Response**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "request_id": "req_12345",
    "timestamp": "2024-01-20T14:30:00Z"
  }
}
```

### **Common Error Codes**
- `AUTHENTICATION_FAILED` - Invalid or expired token
- `AUTHORIZATION_DENIED` - Insufficient permissions
- `VALIDATION_ERROR` - Input validation failed
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVICE_UNAVAILABLE` - Downstream service unavailable
- `INTERNAL_ERROR` - Unexpected server error

---

## **Circuit Breaker Configuration**

### **Hystrix Configuration**
```yaml
hystrix:
  command:
    default:
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 5000
      circuitBreaker:
        requestVolumeThreshold: 20
        sleepWindowInMilliseconds: 30000
        errorThresholdPercentage: 50
  
  collapser:
    default:
      timerDelayInMilliseconds: 100
      maxRequestsInBatch: 10
```

---

## **Monitoring and Tracing**

### **Health Check Endpoint**
All services must implement:
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "external_api": "degraded"
  },
  "timestamp": "2024-01-20T14:30:00Z"
}
```

### **Distributed Tracing Headers**
```http
X-Trace-ID: 1234567890abcdef
X-Span-ID: abcdef1234567890
X-Parent-Span-ID: fedcba0987654321
X-Correlation-ID: corr_12345
```

---

This API contract specification ensures consistent communication patterns across all iWORKZ microservices, enabling reliable and scalable inter-service interactions.