# iWORKZ Platform API Documentation

## Base URLs

- **Production:** https://api-main.d1234567890.amplifyapp.com
- **Future Production:** https://api.iworkz.ai
- **Development:** http://localhost:3001

## Authentication

All API requests require authentication using JWT tokens:

```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication & User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/forgot-password` | Password reset request |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |
| DELETE | `/api/users/account` | Delete user account |

### Employer APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employers` | List all employers |
| GET | `/api/employers/:id` | Get employer details |
| POST | `/api/employers/register` | Register new employer |
| PUT | `/api/employers/:id` | Update employer profile |
| GET | `/api/employers/:id/jobs` | Get employer's job postings |
| GET | `/api/employers/:id/candidates` | Get matched candidates |

### Job Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs` | Create new job posting |
| PUT | `/api/jobs/:id` | Update job posting |
| DELETE | `/api/jobs/:id` | Delete job posting |
| GET | `/api/jobs/search` | Search jobs |
| GET | `/api/jobs/:id/applicants` | Get job applicants |
| POST | `/api/jobs/:id/apply` | Apply to job |

### Talent/Candidate APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/talent` | List all talent profiles |
| GET | `/api/talent/:id` | Get talent details |
| PUT | `/api/talent/:id` | Update talent profile |
| GET | `/api/talent/:id/applications` | Get job applications |
| POST | `/api/talent/skills` | Add/update skills |
| POST | `/api/talent/preferences` | Update job preferences |

### AI & Matching Engine

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/match` | Get AI-powered job matches |
| POST | `/api/ai/cultural-assessment` | Cultural fit assessment |
| POST | `/api/ai/resume-parse` | Parse resume with AI |
| POST | `/api/ai/job-description` | Generate job description |
| GET | `/api/ai/recommendations` | Get personalized recommendations |

### Compliance & Verification

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/compliance/verify-visa` | Verify visa status |
| POST | `/api/compliance/check-eligibility` | Check work eligibility |
| GET | `/api/compliance/requirements/:country` | Get country requirements |
| POST | `/api/credentials/verify` | Verify credentials |

### Analytics & Reporting

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Get dashboard metrics |
| GET | `/api/analytics/reports` | Generate reports |
| GET | `/api/analytics/trends` | Market trends data |
| POST | `/api/analytics/track` | Track user events |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/notifications/preferences` | Update preferences |
| DELETE | `/api/notifications/:id` | Delete notification |

### Search & Filters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/jobs` | Advanced job search |
| GET | `/api/search/talent` | Search talent pool |
| GET | `/api/search/companies` | Search companies |
| GET | `/api/filters/skills` | Get skill filters |
| GET | `/api/filters/locations` | Get location filters |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users (admin) |
| GET | `/api/admin/metrics` | Platform metrics |
| POST | `/api/admin/moderate` | Content moderation |
| GET | `/api/admin/audit-logs` | Access audit logs |

## WebSocket Events

**Connection:** `wss://api.iworkz.ai/socket`

### Events

- `match.new` - New job match available
- `application.status` - Application status update
- `message.new` - New chat message
- `notification.new` - New notification

## Rate Limiting

- **Default:** 100 requests per minute per IP
- **Authenticated:** 200 requests per minute per user
- **Premium:** 500 requests per minute

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Swagger/OpenAPI

- **Swagger UI:** `/api/docs`
- **OpenAPI Spec:** `/api/openapi.json`

## GraphQL Endpoint

- **URL:** `/api/graphql`
- **Playground:** `/api/graphql/playground`

## Health Check

- **Endpoint:** `/api/health`
- **Method:** GET
- **Response:** `{ "status": "ok", "timestamp": "..." }`