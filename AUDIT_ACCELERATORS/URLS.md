# iWORKZ Platform - Complete URL & Endpoint Registry

## 🌐 Public-Facing URLs

### Production Environment
```
# Main Application
http://34.204.61.224:3000                    # Live production (temp IP)
https://iworkz.com                           # Future production domain
https://www.iworkz.com                       # Future www redirect
https://iworkz.jp                            # Japanese domain

# API Endpoints
https://api-main.d1234567890.amplifyapp.com  # Current API (AWS auto-generated)
https://api.iworkz.ai                        # Future API domain
https://api.iworkz.com                       # Alternative API domain

# Admin & Tools
https://admin.iworkz.com                     # Admin dashboard
https://admin.iworkz.com/graphql             # GraphQL playground
https://admin.iworkz.com/graphql/playground  # GraphQL interactive

# AI Services
https://ai.iworkz.com                        # AI assistant service
https://ai.iworkz.com/docs                   # AI API documentation
https://ai.iworkz.com/webhook                # AI webhook endpoint

# Static Assets & CDN
https://assets.iworkz.com                    # Static file CDN
https://cdn.iworkz.com                       # CloudFront distribution
```

### Staging Environment
```
# Staging URLs (with test credentials - FOR CHACHIE'S AUDIT)
https://staging.iworkz.com                   # Username: demo@iworkz.com / Pass: Demo123!
https://api-staging.iworkz.com               # API Key: staging_key_2024_test
https://admin-staging.iworkz.com             # Admin: admin@staging / Pass: Admin123!

# Basic Auth for Audit Access
https://audit:iworkz2024@staging.iworkz.com  # Direct audit access
Authorization: Basic YXVkaXQ6aXdvcmt6MjAyNA==  # Base64: audit:iworkz2024

# Staging Database (Read-Only Audit Access)
Host: iworkz-staging-db.catiqcgianiw.us-east-1.rds.amazonaws.com
Port: 5432
Database: postgres
User: audit_readonly
Pass: AuditAccess2024!
```

### Development/Local
```
http://localhost:3000                        # Frontend dev server
http://localhost:3001                        # Backend API
http://localhost:4000                        # GraphQL server
http://localhost:9200                        # Elasticsearch
http://localhost:6379                        # Redis
http://localhost:5432                        # PostgreSQL
```

## 🔍 Health Check & Monitoring Endpoints

```
# Health Checks (LIVE - TEST THESE)
GET http://34.204.61.224:3000/api/health     # Basic health check
GET http://34.204.61.224:3000/api/health/detailed  # Detailed system status
GET http://34.204.61.224:3000/api/health/db  # Database connectivity
GET http://34.204.61.224:3000/api/health/redis  # Redis connectivity

# Cultural Intelligence API (NEW)
POST /api/cultural/match                     # Cultural matching algorithm
POST /api/cultural/assess                    # Cultural assessment
GET /api/cultural/weights                    # Algorithm weights (A/B testing)
POST /api/cultural/bias-check                # Bias monitoring endpoint

# Metrics & Monitoring
GET /metrics                                 # Prometheus metrics
GET /api/metrics/performance                 # Performance metrics
GET /api/metrics/usage                       # Usage statistics
GET /api/metrics/cultural-bias               # Cultural bias monitoring
```

## 📚 API Documentation URLs

```
# OpenAPI/Swagger
/api/docs                                    # Swagger UI
/api/openapi.json                           # OpenAPI 3.0 spec
/api/swagger.json                           # Swagger 2.0 spec
/api/redoc                                  # ReDoc documentation

# GraphQL
/graphql                                    # GraphQL endpoint
/graphql/playground                         # GraphQL Playground
/graphql/schema                             # Schema introspection
```

## 🔐 Authentication Endpoints

```
# OAuth/Social Login
/api/auth/google                            # Google OAuth
/api/auth/linkedin                          # LinkedIn OAuth
/api/auth/github                            # GitHub OAuth
/api/auth/callback/:provider                # OAuth callbacks

# SAML/SSO (Enterprise)
/api/auth/saml                              # SAML endpoint
/api/auth/saml/metadata                     # SAML metadata
```

## 🛠️ Developer Tools & Debug Endpoints

```
# Debug (Disabled in Production)
/api/debug/config                           # [STAGING ONLY] Config dump
/api/debug/routes                           # [STAGING ONLY] Route list
/api/debug/cache                            # [STAGING ONLY] Cache status
/api/debug/queues                           # [STAGING ONLY] Queue status

# Storybook
https://storybook.iworkz.com                # Component library
```

## 📡 WebSocket Endpoints

```
# Real-time Connections
wss://api.iworkz.com/socket                 # Main WebSocket
wss://api.iworkz.com/notifications         # Notification stream
wss://api.iworkz.com/chat                  # Chat service
wss://ai.iworkz.com/assistant              # AI assistant stream
```

## 🌏 Regional Endpoints

```
# Tokyo Region (Primary)
https://jp.api.iworkz.com                   # Japan API
https://jp-admin.iworkz.com                 # Japan admin

# US East (Secondary)
https://us.api.iworkz.com                   # US API
https://us-admin.iworkz.com                 # US admin
```

## 🔧 Infrastructure & Internal Services

```
# AWS Resources (Internal Only)
916273703822.dkr.ecr.ap-northeast-1.amazonaws.com              # ECR Registry
iworkz-production-db.catiqcgianiw.us-east-1.rds.amazonaws.com  # RDS Database
iworkz-cluster-production.ecs.amazonaws.com                    # ECS Cluster

# Load Balancers
iworkz-alb-production.elb.amazonaws.com                        # Application LB
iworkz-nlb-internal.elb.amazonaws.com                          # Network LB

# S3 Buckets (Public Read)
https://iworkz-assets-production.s3.amazonaws.com              # Static assets
https://iworkz-uploads-production.s3.amazonaws.com             # User uploads
https://iworkz-backups-production.s3.amazonaws.com             # [PRIVATE] Backups
```

## 🚪 Backdoors & Special Access

```
# Support Tools
/api/support/impersonate                    # [ADMIN ONLY] User impersonation
/api/support/logs/:userId                   # [ADMIN ONLY] User activity logs
/api/support/export/:userId                 # [ADMIN ONLY] GDPR export

# Feature Flags
/api/features                               # Feature flag status
/api/features/override                      # [ADMIN ONLY] Override flags
```

## 🎯 Testing Endpoints

```
# Test Accounts (Staging Only)
Employer: employer@test.iworkz.com / Test123!
Talent: talent@test.iworkz.com / Test123!
Admin: admin@test.iworkz.com / Admin123!

# API Test Keys (Staging)
Public Key: pk_test_iworkz_2024
Secret Key: sk_test_iworkz_secret_2024
```

## 🔒 Security Headers Applied

All production endpoints enforce:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: default-src 'self'`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Rate Limits

| Endpoint Pattern | Limit | Window |
|-----------------|-------|---------|
| `/api/auth/*` | 5 req | 15 min |
| `/api/public/*` | 100 req | 1 min |
| `/api/private/*` | 200 req | 1 min |
| `/api/admin/*` | 500 req | 1 min |
| WebSocket | 1000 msg | 1 hour |

## 🚨 Emergency Endpoints

```
# Circuit Breakers
POST /api/emergency/disable-signups         # Disable new registrations
POST /api/emergency/maintenance-mode        # Enable maintenance mode
POST /api/emergency/flush-cache            # Clear all caches
POST /api/emergency/reset-rate-limits      # Reset rate limiters
```

---

**Note:** All staging credentials are for testing only. Production uses environment-specific secrets managed via AWS Secrets Manager.