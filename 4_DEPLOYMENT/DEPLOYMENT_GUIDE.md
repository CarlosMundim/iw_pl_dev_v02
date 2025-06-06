# Deployment Guide

## Overview
Comprehensive deployment guide for the iWORKZ platform, covering local development, staging, and production environments with containerized microservices architecture.

## Prerequisites

### Development Environment
- **Operating System**: Windows 10/11 with WSL 2 or Linux/macOS
- **Docker**: Docker Desktop 4.0+ with Kubernetes enabled
- **Node.js**: Node.js 18+ LTS with npm/yarn
- **Python**: Python 3.10+ with pip and virtual environments
- **Git**: Git 2.30+ with SSH keys configured
- **IDE**: VS Code with Remote-WSL extension (recommended)

### Production Environment
- **Container Orchestration**: Kubernetes 1.25+ or Docker Swarm
- **Cloud Provider**: AWS, GCP, or Azure with managed services
- **Database**: PostgreSQL 14+ with read replicas
- **Cache**: Redis 7+ with clustering support
- **Load Balancer**: Application Load Balancer with SSL termination
- **Monitoring**: Prometheus, Grafana, and centralized logging

## Local Development Setup

### Quick Start
```bash
# Clone the repository
git clone git@github.com:your-org/iworkz-platform.git
cd iworkz-platform

# Copy environment configuration
cp .env.example .env.local

# Start all services with Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps

# Access the application
# Web Frontend: http://localhost:3000
# API Documentation: http://localhost:8000/docs
# Admin Dashboard: http://localhost:3002
```

### Environment Configuration
```bash
# Database configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/iworkz_dev
REDIS_URL=redis://localhost:6379

# API Keys (development)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Authentication
JWT_SECRET=your-jwt-secret-key
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id

# Third-party integrations (sandbox)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### Service Dependencies
```yaml
# docker-compose.yml structure
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: iworkz_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend-api:
    build: ./2_SERVICES/backend-api
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/iworkz_dev
      - REDIS_URL=redis://redis:6379

  web-frontend:
    build: ./2_SERVICES/web-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend-api
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000

volumes:
  postgres_data:
  redis_data:
```

## Staging Environment

### Infrastructure Setup
```bash
# Deploy to staging cluster
kubectl apply -f k8s/staging/

# Configure staging database
kubectl apply -f k8s/staging/postgres-staging.yaml

# Deploy application services
kubectl apply -f k8s/staging/services/

# Configure ingress and SSL
kubectl apply -f k8s/staging/ingress-staging.yaml

# Verify deployment
kubectl get pods -n iworkz-staging
kubectl get services -n iworkz-staging
```

### Staging Configuration
```yaml
# staging values.yaml for Helm
environment: staging
replicaCount: 2

database:
  host: postgres-staging.internal
  name: iworkz_staging
  ssl: require

redis:
  host: redis-staging.internal
  cluster: true

ingress:
  enabled: true
  host: staging.iworkz.com
  tls:
    enabled: true
    secretName: staging-tls-cert

monitoring:
  enabled: true
  namespace: monitoring

resources:
  backend-api:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"
```

### Staging Validation
```bash
# Run integration tests against staging
npm run test:integration:staging

# Run smoke tests
npm run test:smoke:staging

# Validate API endpoints
curl -f https://staging-api.iworkz.com/health

# Check application logs
kubectl logs -n iworkz-staging deployment/backend-api

# Monitor metrics
kubectl port-forward -n monitoring service/grafana 3000:3000
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] All tests pass in staging environment
- [ ] Security scan completed with no critical issues
- [ ] Database migration scripts reviewed and tested
- [ ] Backup and rollback procedures verified
- [ ] Performance benchmarks meet requirements
- [ ] Security certificates updated and valid
- [ ] Environment variables and secrets configured
- [ ] Monitoring and alerting configured
- [ ] Change management approval obtained

### Production Infrastructure
```bash
# Production deployment using Helm
helm upgrade --install iworkz-prod ./helm/iworkz \
  --namespace production \
  --values helm/values-production.yaml \
  --timeout 10m

# Verify deployment health
helm status iworkz-prod -n production

# Run post-deployment tests
kubectl run -n production test-pod --rm -i --tty \
  --image=iworkz/test-runner \
  -- npm run test:production

# Monitor deployment metrics
kubectl get hpa -n production
kubectl top pods -n production
```

### Production Configuration
```yaml
# production values.yaml
environment: production
replicaCount: 5

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70

database:
  host: postgres-prod-cluster.rds.amazonaws.com
  name: iworkz_production
  ssl: require
  readReplicas:
    enabled: true
    count: 2

redis:
  cluster:
    enabled: true
    nodes: 6

security:
  networkPolicies: true
  podSecurityPolicy: true
  rbac: true

monitoring:
  prometheus: true
  grafana: true
  alertmanager: true
  jaeger: true

backup:
  database:
    schedule: "0 2 * * *"
    retention: "30d"
  volumes:
    schedule: "0 3 * * *"
    retention: "7d"
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Run security scan
        run: npm audit --audit-level moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t iworkz/backend-api:${{ github.sha }} ./2_SERVICES/backend-api
          docker build -t iworkz/web-frontend:${{ github.sha }} ./2_SERVICES/web-frontend
      - name: Push to registry
        run: |
          docker push iworkz/backend-api:${{ github.sha }}
          docker push iworkz/web-frontend:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          helm upgrade --install iworkz-staging ./helm/iworkz \
            --namespace staging \
            --set image.tag=${{ github.sha }}

  deploy-production:
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          helm upgrade --install iworkz-prod ./helm/iworkz \
            --namespace production \
            --set image.tag=${{ github.sha }} \
            --timeout 15m
```

### Deployment Commands
```bash
# Deploy to staging (requires approval)
npm run deploy:staging

# Run smoke tests against staging
npm run test:smoke:staging

# Deploy to production (requires multiple approvals)
npm run deploy:production

# Monitor deployment status
npm run monitor:deployment

# Rollback if needed
npm run rollback:production
```

## Monitoring and Observability

### Health Checks
```bash
# Application health endpoints
GET /health                 # Basic health check
GET /health/detailed        # Detailed component status
GET /health/dependencies    # External dependency status
GET /metrics               # Prometheus metrics

# Database health
GET /health/database       # Database connectivity and performance
GET /health/redis         # Redis connectivity and performance

# Example health check response
{
  "status": "healthy",
  "version": "1.2.3",
  "timestamp": "2024-01-15T10:30:00Z",
  "components": {
    "database": "healthy",
    "redis": "healthy",
    "external_apis": "healthy"
  },
  "metrics": {
    "response_time_ms": 45,
    "memory_usage_mb": 512,
    "cpu_usage_percent": 23
  }
}
```

### Logging Configuration
```yaml
# Logging configuration
logging:
  level: info
  format: json
  outputs:
    - console
    - file
    - elasticsearch

  structured_logging:
    service_name: iworkz-api
    version: 1.2.3
    environment: production

  audit_logging:
    enabled: true
    sensitive_data_masking: true
    retention_days: 2555  # 7 years
```

### Metrics and Alerting
```yaml
# Prometheus alerts
groups:
  - name: iworkz-alerts
    rules:
      - alert: HighResponseTime
        expr: http_request_duration_seconds > 2
        for: 5m
        annotations:
          summary: "High response time detected"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        annotations:
          summary: "High error rate detected"

      - alert: DatabaseConnectionFailure
        expr: database_connections_failed_total > 0
        for: 1m
        annotations:
          summary: "Database connection failures"
```

---

## Further Reading

- [Cloud Architecture](./CLOUD_ARCHITECTURE.md)
- [Architecture Overview](../1_DOCUMENTATION/ARCHITECTURE_OVERVIEW.md)
- [Security Protocols](../5_SECURITY/SECURITY_PROTOCOLS.md)