# Backend API Service

## Overview

The Backend API Service is the main API gateway and business logic engine for the iWORKZ platform, built with Node.js, Express, and TypeScript.

## Tech Stack

* **Runtime**: Node.js 18+
* **Framework**: Express.js (TypeScript)
* **Database**: PostgreSQL (Prisma ORM)
* **Authentication**: JWT & Passport.js
* **Validation**: Joi / Zod
* **Documentation**: Swagger / OpenAPI
* **Testing**: Jest & Supertest

## Development Setup

```bash
# Install dependencies
npm install

# Set up and migrate database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev

# Run test suite
npm test

# Generate API docs
npm run docs:generate
```

## API Architecture

```
├── Authentication & Authorization
├── User Management
├── Job Matching & Recommendations
├── Credential Verification
├── Real-time Messaging
├── File Upload & Processing
├── Notification Management
└── Analytics & Reporting
```

## Key Features

* RESTful API structure
* JWT-based authentication and RBAC
* Request rate limiting & security headers
* Input validation and sanitisation
* Comprehensive error handling
* API versioning support

## Database Schema

* **Users**: Authentication & profile info
* **Jobs**: Job postings and requirements
* **Applications**: Job application tracking
* **Credentials**: Verified qualifications
* **Messages**: Platform communications
* **Notifications**: Alerts and updates
* **Analytics**: Usage and metrics tracking

## Security Features

* JWT token management
* Password hashing (bcrypt)
* Input validation and sanitisation
* SQL injection prevention
* CORS configuration
* Security headers (Helmet.js)
* Rate limiting and DDoS protection

## API Endpoints (Examples)

```
GET    /api/v1/users/:id
POST   /api/v1/auth/login
GET    /api/v1/jobs
POST   /api/v1/jobs
GET    /api/v1/matches/:userId
POST   /api/v1/applications
GET    /api/v1/credentials/:userId
POST   /api/v1/credentials/verify
```

## Environment Variables (Example)

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/iworkz
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```
