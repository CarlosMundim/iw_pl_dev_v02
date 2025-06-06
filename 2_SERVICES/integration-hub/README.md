# Integration Hub Service

## Overview
The iWORKZ Integration Hub is a Node.js/Express microservice that manages all third-party integrations including job boards, ATS systems, payroll providers, and identity verification services. It provides a unified API layer for external service communication.

## Features
- **Multi-Provider Support**: LinkedIn, Indeed, Stripe, Jumio, Workday integrations
- **Webhook Management**: Secure webhook processing and validation
- **OAuth Flow**: Complete OAuth2 authorization handling
- **Data Synchronization**: Automated sync with external APIs
- **API Proxy**: Unified interface for third-party service calls
- **Configuration Management**: Dynamic integration configuration
- **Real-time Status**: Integration health monitoring
- **Secure Communication**: Encrypted API key management

## Tech Stack
- **Framework**: Node.js 18+ with Express.js
- **Queue System**: Bull/Redis for async processing
- **Database**: PostgreSQL for integration configs and logs
- **Security**: Helmet, CORS, encrypted credential storage

## Integration Categories
- **Job Boards**: LinkedIn, Indeed, Glassdoor, Stack Overflow Jobs
- **ATS Systems**: Greenhouse, Lever, Workday, BambooHR
- **Payroll/EOR**: Deel, Oyster, Remote, Globalization Partners
- **Identity/KYC**: Jumio, Onfido, Trulioo, Shufti Pro
- **Government**: UK Home Office, German Federal Employment Agency
- **Communication**: Slack, Microsoft Teams, email providers

## Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client APIs   │────│  Integration Hub │────│  Third-Party    │
│                 │    │                  │    │  Services       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │  Message Queue   │
                       │  (Redis/Bull)    │
                       └──────────────────┘
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 8+
- Redis (for queue processing)
- Docker (for containerized deployment)

### Local Development
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Start development server
npm run dev

# Service available at http://localhost:3005
```

### Docker Deployment
```bash
# Build image
docker build -t iworkz-integration-hub .

# Run container
docker run -p 3005:3005 -e INTEGRATION_PORT=3005 iworkz-integration-hub
```

## API Endpoints

### Health & Status
- `GET /health` - Service health check
- `GET /status` - Service capabilities and active integrations

### Integration Management
- `GET /api/v1/integrations` - List all configured integrations
- `POST /api/v1/integrations/:id/sync` - Trigger data synchronization
- `GET /api/v1/config/:provider` - Get provider configuration
- `POST /api/v1/config/:provider` - Update provider configuration

### Webhook Processing
- `POST /webhooks/:provider` - Receive webhooks from external services

### OAuth Management
- `GET /api/v1/oauth/:provider/authorize` - Get OAuth authorization URL
- `POST /api/v1/oauth/:provider/token` - Exchange authorization code for token

### Data Proxy
- `GET /api/v1/proxy/:provider/:endpoint` - Proxy requests to external APIs

### Response Example
```json
{
  "success": true,
  "integrations": [
    {
      "id": "linkedin",
      "name": "LinkedIn",
      "status": "active",
      "type": "job_board",
      "endpoints": ["jobs", "profiles", "applications"],
      "last_sync": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 4
}
```

## Configuration

### Environment Variables
- `INTEGRATION_PORT` - Service port (default: 3005)
- `NODE_ENV` - Environment (development/production)
- `POSTGRES_HOST` - Database host
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `REDIS_URL` - Redis connection URL

### Supported Integrations
- **LinkedIn**: Job posting and candidate sourcing
- **Indeed**: Job board integration and applications
- **Stripe**: Payment processing and subscription management
- **Jumio**: Identity verification and KYC
- **Workday**: HR system integration

## Development Setup
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run with auto-reload
npm run dev

# Check integration health
curl http://localhost:3005/status
```

## Security & Compliance
- All API keys encrypted at rest
- OAuth2 flow for user-authorized integrations
- Webhook signature verification
- Rate limiting per provider
- Audit logging for all integration activities