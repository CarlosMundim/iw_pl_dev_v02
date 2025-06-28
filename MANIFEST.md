# iWORKZ Platform - Deployment & Infrastructure Manifest

> **Last Updated:** 2025-06-28
> **Repository:** iw_pl_dev_v02
> **Primary Region:** ap-northeast-1 (Tokyo)
> **Secondary Region:** us-east-1 (Virginia)

## 📍 Live URLs & Environments

| Environment | Purpose | URL | Auth Required | Status |
|------------|---------|-----|---------------|---------|
| **Production** | Main platform | http://34.204.61.224:3000 | No | ✅ Live |
| **Production API** | Backend API | https://api-main.d1234567890.amplifyapp.com | API Key | ✅ Live |
| **Future Production** | Main domain | https://iworkz.com | No | 🔄 Pending |
| **Future API** | API domain | https://api.iworkz.ai | API Key | 🔄 Pending |
| **Admin Dashboard** | Platform admin | https://admin.iworkz.com | Yes | 🔄 Pending |
| **AI Service** | AI assistant | https://ai.iworkz.com | API Key | 🔄 Pending |
| **Staging** | Test environment | TBD | No | 🔧 Setup |
| **Development** | Local dev | http://localhost:3000 | No | 🖥️ Local |

## 🗂️ Repository Structure

| Repository | Type | Path | Primary Branch | Last Commit |
|-----------|------|------|----------------|-------------|
| **Main Monorepo** | Full Stack | `/` | main | 3a499e3 |
| **Web Frontend** | Next.js 14 | `/2_SERVICES/web-frontend` | main | Active |
| **Backend Services** | Node.js/Express | `/2_SERVICES/backend-api` | main | Active |
| **AI Agent** | Python/FastAPI | `/2_SERVICES/ai-agent` | main | Active |
| **Deployment** | Infrastructure | `/4_DEPLOYMENT` | main | Active |
| **Database** | PostgreSQL/Prisma | `/database` | main | Active |

## 🪣 Public Asset Storage

| Service | Purpose | Endpoint | Access |
|---------|---------|----------|--------|
| **AWS S3** | Static assets | s3://iworkz-assets-production | Public read |
| **CloudFront** | CDN | TBD | Public |
| **ECR Registry** | Docker images | 916273703822.dkr.ecr.ap-northeast-1.amazonaws.com | Private |

## 🔌 API Documentation

| API | Type | Base URL | Swagger/OpenAPI |
|-----|------|----------|-----------------|
| **Main API** | REST | https://api-main.d1234567890.amplifyapp.com | /api/docs |
| **AI Service** | REST/WebSocket | https://ai.iworkz.com | /docs |
| **Admin API** | GraphQL | https://admin.iworkz.com/graphql | /graphql |
| **Search API** | Elasticsearch | Internal | N/A |

## 🏗️ Infrastructure Components

### AWS Services
- **Account ID:** 916273703822
- **Primary Region:** ap-northeast-1 (Tokyo)
- **ECS Cluster:** iworkz-cluster-production
- **Service Name:** iworkz-frontend-production
- **Task Family:** iworkz-web-frontend
- **VPC:** vpc-0abc123def456
- **Subnets:** 
  - subnet-0abc123def456 (Public 1)
  - subnet-0def456abc123 (Public 2)
  - subnet-0ghi789jkl012 (Private 1)
  - subnet-0jkl012ghi789 (Private 2)

### Database
- **Type:** PostgreSQL 14
- **Host:** iworkz-production-db.catiqcgianiw.us-east-1.rds.amazonaws.com
- **Port:** 5432
- **Database:** postgres
- **Connection Pooling:** PgBouncer

### Container Registry
- **ECR URL:** 916273703822.dkr.ecr.ap-northeast-1.amazonaws.com
- **Repository:** iworkz-web-frontend
- **Tag Strategy:** latest, staging, v1.x.x

## 📦 Key Configuration Files

### Environment Files
- `.env.production` - Production environment variables
- `.env.staging` - Staging environment variables
- `.env.local` - Local development settings
- `.env.example` - Template for new environments

### Docker Configuration
- `docker-compose.yml` - Full stack local development
- `docker-compose.production.yml` - Production orchestration
- `Dockerfile` - Main frontend image
- `docker-*.dockerfile` - Service-specific images

### AWS ECS Task Definitions
- `task-definition.json` - Main frontend task
- `task-definition-app.json` - App service
- `task-definition-api.json` - API service
- `task-definition-jobs.json` - Jobs service
- `task-definition-talent.json` - Talent service

### Build & Deploy Scripts
- `deploy-web-frontend.sh` - Main deployment script
- `deploy-platform.sh` - Full platform deployment
- `deploy-staging.sh` - Staging deployment
- `deploy-k8s.sh` - Kubernetes deployment (future)

## 🛡️ Security & Monitoring

| Service | Purpose | Access Point |
|---------|---------|--------------|
| **CloudWatch** | Logs & Metrics | AWS Console |
| **X-Ray** | Distributed tracing | AWS Console |
| **Secrets Manager** | Credentials | AWS API |
| **WAF** | Web firewall | CloudFront |
| **GuardDuty** | Threat detection | AWS Console |

## 📊 Performance Baselines

- **Frontend Bundle Size:** ~450KB gzipped
- **Initial Load Time:** <2s (Tokyo region)
- **API Response Time:** p95 < 200ms
- **Database Connection Pool:** 20 connections
- **Auto-scaling:** 2-10 tasks (CPU 70%)

## 🚀 Quick Start Commands

```bash
# Clone repository
git clone [repository-url]
cd iw_pl_dev_v02

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy to production
./deploy-web-frontend.sh

# View logs
aws logs tail /ecs/iworkz-web-frontend --follow
```

## 📝 Notes for Auditors

1. **Authentication:** Platform uses JWT tokens with 24h expiry
2. **API Rate Limiting:** 100 req/min per IP
3. **CORS Policy:** Configured for specific domains only
4. **CSP Headers:** Strict content security policy enabled
5. **SSL/TLS:** All production traffic uses HTTPS
6. **Database Backups:** Daily automated backups with 7-day retention

## 🔄 Recent Deployments

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-15 | v2.0.0 | Full internationalization & AI tools |
| 2025-01-14 | v1.9.0 | Japanese market features |
| 2025-01-13 | v1.8.0 | Enterprise dashboard |

---

**For questions or access requests, contact the DevOps team**