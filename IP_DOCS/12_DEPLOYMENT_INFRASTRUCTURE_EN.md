# Chapter 12: Deployment & Infrastructure

**Document Version**: 1.0.0  
**Last Updated**: December 2024  
**Classification**: Confidential - IP Documentation  
**Target Markets**: 🇯🇵 Japan (Primary), 🇰🇷 South Korea, 🌏 ASEAN  

---

## 12.1 Infrastructure Architecture Overview

### Enterprise-Grade Multi-Cloud Strategy

**Infrastructure Architecture Diagram**
```mermaid
graph TB
    subgraph "Edge & CDN Layer"
        CLOUDFLARE[CloudFlare<br/>Global CDN + DDoS Protection]
        WAF[Web Application Firewall<br/>Security Rules]
        RATE_LIMIT[Rate Limiting<br/>API Protection]
    end
    
    subgraph "Load Balancing & Routing"
        ALB[Application Load Balancer<br/>AWS ALB + NLB]
        API_GATEWAY[API Gateway<br/>Kong + AWS API Gateway]
        INGRESS[Kubernetes Ingress<br/>NGINX + Istio]
    end
    
    subgraph "Primary Cloud - AWS (Japan)"
        AZ1[Availability Zone 1<br/>ap-northeast-1a]
        AZ2[Availability Zone 2<br/>ap-northeast-1c]
        AZ3[Availability Zone 3<br/>ap-northeast-1d]
        
        subgraph "Compute Layer"
            EKS[Amazon EKS<br/>Kubernetes Clusters]
            FARGATE[AWS Fargate<br/>Serverless Containers]
            LAMBDA[AWS Lambda<br/>Serverless Functions]
            EC2[EC2 Instances<br/>Auto Scaling Groups]
        end
        
        subgraph "Data Layer"
            RDS[Amazon RDS<br/>PostgreSQL Multi-AZ]
            ELASTICACHE[ElastiCache<br/>Redis Cluster]
            OPENSEARCH[OpenSearch<br/>Search & Analytics]
            S3[Amazon S3<br/>Object Storage]
        end
        
        subgraph "AI/ML Services"
            SAGEMAKER[Amazon SageMaker<br/>ML Training & Inference]
            BEDROCK[Amazon Bedrock<br/>Foundation Models]
            TEXTRACT[Amazon Textract<br/>Document Processing]
            COMPREHEND[Amazon Comprehend<br/>NLP Services]
        end
    end
    
    subgraph "Secondary Cloud - Azure (Korea)"
        AZURE_KOREA[Azure Korea Central<br/>Disaster Recovery]
        AKS[Azure Kubernetes Service<br/>Backup Cluster]
        AZURE_DB[Azure Database<br/>PostgreSQL]
        AZURE_STORAGE[Azure Blob Storage<br/>Backup Storage]
    end
    
    subgraph "Monitoring & Observability"
        PROMETHEUS[Prometheus<br/>Metrics Collection]
        GRAFANA[Grafana<br/>Visualization]
        JAEGER[Jaeger<br/>Distributed Tracing]
        ELK[ELK Stack<br/>Centralized Logging]
        SENTRY[Sentry<br/>Error Tracking]
    end
    
    CLOUDFLARE --> ALB
    ALB --> API_GATEWAY
    API_GATEWAY --> INGRESS
    INGRESS --> EKS
    
    EKS --> RDS
    EKS --> ELASTICACHE
    EKS --> OPENSEARCH
    EKS --> S3
    
    RDS --> AZURE_DB
    S3 --> AZURE_STORAGE
```

### Infrastructure Technology Stack

**Comprehensive Infrastructure Components**
```yaml
infrastructure_stack:
  cloud_providers:
    primary: 
      provider: "AWS"
      regions: ["ap-northeast-1", "ap-northeast-3"]
      reason: "Best performance for Japan market, comprehensive AI/ML services"
      
    secondary:
      provider: "Microsoft Azure"
      regions: ["Korea Central", "Korea South"]
      reason: "Strategic presence in Korea, enterprise partnerships"
      
    edge:
      provider: "CloudFlare"
      global_presence: true
      reason: "Superior DDoS protection, global CDN performance"

  compute_services:
    container_orchestration:
      technology: "Kubernetes"
      managed_service: "Amazon EKS"
      node_groups:
        - name: "general"
          instance_types: ["m6i.large", "m6i.xlarge", "m6i.2xlarge"]
          scaling: "Auto Scaling Groups"
        - name: "compute-optimized"
          instance_types: ["c6i.xlarge", "c6i.2xlarge", "c6i.4xlarge"]
          use_case: "AI/ML workloads"
        - name: "memory-optimized"
          instance_types: ["r6i.xlarge", "r6i.2xlarge", "r6i.4xlarge"]
          use_case: "Data processing, caching"
      
    serverless:
      containers: "AWS Fargate"
      functions: "AWS Lambda"
      benefits: ["Cost optimization", "Auto-scaling", "No server management"]
      
    traditional_compute:
      ec2_instances: "Reserved + On-Demand"
      auto_scaling: "Target Tracking + Predictive Scaling"
      
  networking:
    vpc_design:
      cidr: "10.0.0.0/16"
      subnets:
        public: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
        private: ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
        database: ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
      
    load_balancing:
      application: "AWS Application Load Balancer"
      network: "AWS Network Load Balancer"
      global: "CloudFlare Load Balancing"
      
    security:
      firewalls: "AWS Security Groups + NACLs"
      waf: "CloudFlare WAF + AWS WAF"
      vpn: "AWS VPN + Private Link"
      
  data_services:
    relational_database:
      service: "Amazon RDS for PostgreSQL"
      version: "PostgreSQL 16"
      configuration: "Multi-AZ with Read Replicas"
      backup: "Point-in-time recovery + Cross-region backups"
      
    caching:
      service: "Amazon ElastiCache for Redis"
      version: "Redis 7.x"
      configuration: "Cluster mode enabled"
      persistence: "RDB + AOF"
      
    search_analytics:
      service: "Amazon OpenSearch Service"
      version: "OpenSearch 2.x"
      configuration: "Multi-AZ cluster"
      features: ["Full-text search", "Analytics", "Machine learning"]
      
    object_storage:
      service: "Amazon S3"
      storage_classes: ["Standard", "IA", "Glacier", "Deep Archive"]
      features: ["Versioning", "Encryption", "Cross-region replication"]
      
  security_compliance:
    encryption:
      at_rest: "AWS KMS + Customer Managed Keys"
      in_transit: "TLS 1.3 + mTLS"
      application: "Field-level encryption"
      
    access_control:
      identity: "AWS IAM + RBAC"
      secrets: "AWS Secrets Manager + HashiCorp Vault"
      certificates: "AWS Certificate Manager"
      
    compliance:
      frameworks: ["ISO 27001", "SOC 2 Type II", "GDPR", "JISQ 15001"]
      audit_logging: "AWS CloudTrail + Custom Audit Service"
      
  monitoring_observability:
    metrics:
      collection: "Prometheus + CloudWatch"
      visualization: "Grafana + CloudWatch Dashboards"
      alerting: "AlertManager + CloudWatch Alarms"
      
    logging:
      aggregation: "ELK Stack (Elasticsearch, Logstash, Kibana)"
      shipping: "Fluentd + CloudWatch Logs"
      retention: "30 days hot, 1 year warm, 7 years cold"
      
    tracing:
      distributed: "Jaeger + AWS X-Ray"
      application: "OpenTelemetry"
      
    error_tracking:
      service: "Sentry"
      integration: "All applications and services"
```

## 12.2 Containerization & Kubernetes

### Docker Container Strategy

**Multi-Stage Docker Builds for Optimization**
```dockerfile
# Multi-stage Dockerfile for Node.js Backend Services
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
    
WORKDIR /app
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/server.js"]

# Python AI Services Dockerfile
FROM python:3.12-slim AS python-base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Python development stage
FROM python-base AS python-dev
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Python production stage
FROM python-base AS python-prod
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --chown=appuser:appuser . .
USER appuser

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]

# Next.js Frontend Dockerfile
FROM node:20-alpine AS nextjs-base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage
FROM nextjs-base AS nextjs-deps
COPY package.json package-lock.json ./
RUN npm ci

# Builder stage
FROM nextjs-base AS nextjs-builder
COPY --from=nextjs-deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner stage
FROM nextjs-base AS nextjs-runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=nextjs-builder /app/public ./public
COPY --from=nextjs-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=nextjs-builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

CMD ["node", "server.js"]
```

### Kubernetes Deployment Manifests

**Complete Kubernetes Configuration**
```yaml
# Namespace Configuration
apiVersion: v1
kind: Namespace
metadata:
  name: iworkz-production
  labels:
    name: iworkz-production
    environment: production
    
---
# Backend API Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  namespace: iworkz-production
  labels:
    app: backend-api
    tier: backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
        tier: backend
    spec:
      serviceAccountName: backend-api-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: backend-api
        image: iworkz/backend-api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
          readOnly: true
        - name: temp-storage
          mountPath: /tmp
      volumes:
      - name: config-volume
        configMap:
          name: backend-api-config
      - name: temp-storage
        emptyDir: {}
      imagePullSecrets:
      - name: docker-registry-secret

---
# Backend API Service
apiVersion: v1
kind: Service
metadata:
  name: backend-api-service
  namespace: iworkz-production
  labels:
    app: backend-api
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: backend-api

---
# AI Services Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-services
  namespace: iworkz-production
  labels:
    app: ai-services
    tier: ai
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ai-services
  template:
    metadata:
      labels:
        app: ai-services
        tier: ai
    spec:
      nodeSelector:
        instance-type: compute-optimized
      tolerations:
      - key: "ai-workload"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"
      containers:
      - name: ai-services
        image: iworkz/ai-services:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: openai-key
        - name: AWS_REGION
          value: "ap-northeast-1"
        - name: SAGEMAKER_ENDPOINT
          valueFrom:
            configMapKeyRef:
              name: ai-config
              key: sagemaker-endpoint
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
            nvidia.com/gpu: 0
          limits:
            memory: "4Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

---
# Frontend Web Application Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-frontend
  namespace: iworkz-production
  labels:
    app: web-frontend
    tier: frontend
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  selector:
    matchLabels:
      app: web-frontend
  template:
    metadata:
      labels:
        app: web-frontend
        tier: frontend
    spec:
      containers:
      - name: web-frontend
        image: iworkz/web-frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: api-url
        - name: NEXT_PUBLIC_GA_ID
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: ga-id
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# Horizontal Pod Autoscaler for Backend API
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-api-hpa
  namespace: iworkz-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60

---
# Ingress Configuration with SSL
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: iworkz-ingress
  namespace: iworkz-production
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://iworkz.com"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization"
spec:
  tls:
  - hosts:
    - api.iworkz.com
    - app.iworkz.com
    secretName: iworkz-tls
  rules:
  - host: api.iworkz.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-api-service
            port:
              number: 80
  - host: app.iworkz.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-frontend-service
            port:
              number: 80

---
# ConfigMap for Application Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-api-config
  namespace: iworkz-production
data:
  app.yaml: |
    server:
      port: 3000
      host: "0.0.0.0"
      cors:
        enabled: true
        origins: ["https://app.iworkz.com"]
    
    database:
      pool:
        min: 5
        max: 20
        idle_timeout: 10000
      ssl: true
      
    redis:
      cluster_mode: true
      connection_timeout: 5000
      command_timeout: 3000
      
    logging:
      level: "info"
      format: "json"
      
    monitoring:
      prometheus:
        enabled: true
        port: 9090
      
    features:
      ai_matching: true
      voice_interface: true
      business_card_scanner: true
      
---
# Network Policy for Security
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-api-netpol
  namespace: iworkz-production
spec:
  podSelector:
    matchLabels:
      app: backend-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - podSelector:
        matchLabels:
          app: web-frontend
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 6379  # Redis
    - protocol: TCP
      port: 443   # HTTPS outbound
    - protocol: TCP
      port: 53    # DNS
    - protocol: UDP
      port: 53    # DNS
```

## 12.3 CI/CD Pipeline Implementation

### GitLab CI/CD Pipeline

**Comprehensive DevOps Pipeline Configuration**
```yaml
# .gitlab-ci.yml
stages:
  - validate
  - test
  - security
  - build
  - deploy-staging
  - integration-tests
  - deploy-production
  - post-deploy

variables:
  DOCKER_REGISTRY: "registry.gitlab.com/iworkz"
  KUBERNETES_NAMESPACE_STAGING: "iworkz-staging"
  KUBERNETES_NAMESPACE_PRODUCTION: "iworkz-production"
  AWS_DEFAULT_REGION: "ap-northeast-1"

# Template for common Docker operations
.docker_template: &docker_template
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - apk add --no-cache curl git

# Template for kubectl operations
.kubectl_template: &kubectl_template
  image: bitnami/kubectl:latest
  before_script:
    - echo $KUBE_CONFIG | base64 -d > $HOME/.kube/config
    - kubectl version --client

# Validation Stage
validate:code-quality:
  stage: validate
  image: node:20-alpine
  script:
    - npm ci
    - npm run lint
    - npm run type-check
    - npm run format-check
  only:
    - merge_requests
    - main
    - develop

validate:dependencies:
  stage: validate
  image: node:20-alpine
  script:
    - npm ci
    - npm audit --audit-level high
    - npm run license-check
  only:
    - merge_requests
    - main

# Testing Stage
test:unit:
  stage: test
  image: node:20-alpine
  services:
    - postgres:16-alpine
    - redis:7-alpine
  variables:
    POSTGRES_DB: iworkz_test
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
    DATABASE_URL: "postgresql://test:test@postgres:5432/iworkz_test"
    REDIS_URL: "redis://redis:6379"
  script:
    - npm ci
    - npm run test:unit
    - npm run test:integration
  coverage: '/Coverage: \d+\.\d+%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
      junit: junit.xml
    paths:
      - coverage/
    expire_in: 1 week

test:e2e:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  services:
    - postgres:16-alpine
    - redis:7-alpine
  variables:
    DATABASE_URL: "postgresql://test:test@postgres:5432/iworkz_test"
    REDIS_URL: "redis://redis:6379"
  script:
    - npm ci
    - npm run build
    - npm run start:test &
    - sleep 30
    - npm run test:e2e
  artifacts:
    paths:
      - playwright-report/
      - test-results/
    expire_in: 1 week
    when: always

# Security Stage
security:container-scan:
  stage: security
  <<: *docker_template
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock 
      -v $PWD:/tmp/.cache/ aquasec/trivy:latest image 
      --exit-code 1 --severity HIGH,CRITICAL 
      $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
    - develop

security:sast:
  stage: security
  image: securecodewarrior/gitlab-sast:latest
  script:
    - /analyzer run
  artifacts:
    reports:
      sast: gl-sast-report.json
  only:
    - merge_requests
    - main

security:dependency-scan:
  stage: security
  image: node:20-alpine
  script:
    - npm ci
    - npm audit --json > dependency-scan-report.json
  artifacts:
    reports:
      dependency_scanning: dependency-scan-report.json
  only:
    - merge_requests
    - main

# Build Stage
build:backend:
  stage: build
  <<: *docker_template
  script:
    - cd backend-api
    - docker build 
      --target production 
      --build-arg NODE_ENV=production 
      -t $CI_REGISTRY_IMAGE/backend-api:$CI_COMMIT_SHA 
      -t $CI_REGISTRY_IMAGE/backend-api:latest .
    - docker push $CI_REGISTRY_IMAGE/backend-api:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/backend-api:latest
  only:
    - main
    - develop

build:frontend:
  stage: build
  <<: *docker_template
  script:
    - cd web-frontend
    - docker build 
      --target nextjs-runner 
      --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
      -t $CI_REGISTRY_IMAGE/web-frontend:$CI_COMMIT_SHA 
      -t $CI_REGISTRY_IMAGE/web-frontend:latest .
    - docker push $CI_REGISTRY_IMAGE/web-frontend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/web-frontend:latest
  only:
    - main
    - develop

build:ai-services:
  stage: build
  <<: *docker_template
  script:
    - cd ai-services
    - docker build 
      --target python-prod 
      -t $CI_REGISTRY_IMAGE/ai-services:$CI_COMMIT_SHA 
      -t $CI_REGISTRY_IMAGE/ai-services:latest .
    - docker push $CI_REGISTRY_IMAGE/ai-services:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/ai-services:latest
  only:
    - main
    - develop

# Staging Deployment
deploy:staging:
  stage: deploy-staging
  <<: *kubectl_template
  environment:
    name: staging
    url: https://staging.iworkz.com
  script:
    - kubectl config set-context --current --namespace=$KUBERNETES_NAMESPACE_STAGING
    - envsubst < k8s/backend-api.yaml | kubectl apply -f -
    - envsubst < k8s/web-frontend.yaml | kubectl apply -f -
    - envsubst < k8s/ai-services.yaml | kubectl apply -f -
    - kubectl rollout status deployment/backend-api
    - kubectl rollout status deployment/web-frontend
    - kubectl rollout status deployment/ai-services
  variables:
    IMAGE_TAG: $CI_COMMIT_SHA
    ENVIRONMENT: staging
  only:
    - develop

# Integration Tests
integration-tests:staging:
  stage: integration-tests
  image: postman/newman:latest
  script:
    - newman run tests/integration/api-tests.postman_collection.json 
      --environment tests/integration/staging.postman_environment.json
      --reporters cli,junit --reporter-junit-export newman-report.xml
  artifacts:
    reports:
      junit: newman-report.xml
  only:
    - develop
  needs:
    - deploy:staging

# Production Deployment
deploy:production:
  stage: deploy-production
  <<: *kubectl_template
  environment:
    name: production
    url: https://app.iworkz.com
  script:
    - kubectl config set-context --current --namespace=$KUBERNETES_NAMESPACE_PRODUCTION
    - |
      # Blue-Green Deployment Strategy
      CURRENT_COLOR=$(kubectl get service backend-api-service -o jsonpath='{.spec.selector.color}')
      if [ "$CURRENT_COLOR" = "blue" ]; then
        NEW_COLOR="green"
      else
        NEW_COLOR="blue"
      fi
      
      echo "Deploying to $NEW_COLOR environment"
      
      # Deploy new version
      sed "s/COLOR_PLACEHOLDER/$NEW_COLOR/g" k8s/backend-api.yaml | envsubst | kubectl apply -f -
      sed "s/COLOR_PLACEHOLDER/$NEW_COLOR/g" k8s/web-frontend.yaml | envsubst | kubectl apply -f -
      sed "s/COLOR_PLACEHOLDER/$NEW_COLOR/g" k8s/ai-services.yaml | envsubst | kubectl apply -f -
      
      # Wait for rollout to complete
      kubectl rollout status deployment/backend-api-$NEW_COLOR
      kubectl rollout status deployment/web-frontend-$NEW_COLOR
      kubectl rollout status deployment/ai-services-$NEW_COLOR
      
      # Health check
      sleep 30
      kubectl get pods -l color=$NEW_COLOR
      
      # Switch traffic
      kubectl patch service backend-api-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
      kubectl patch service web-frontend-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
      kubectl patch service ai-services-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
      
      echo "Traffic switched to $NEW_COLOR"
      
      # Clean up old deployment after 5 minutes
      sleep 300
      kubectl delete deployment backend-api-$CURRENT_COLOR --ignore-not-found=true
      kubectl delete deployment web-frontend-$CURRENT_COLOR --ignore-not-found=true
      kubectl delete deployment ai-services-$CURRENT_COLOR --ignore-not-found=true
  variables:
    IMAGE_TAG: $CI_COMMIT_SHA
    ENVIRONMENT: production
  when: manual
  only:
    - main

# Post-deployment tasks
post-deploy:monitoring:
  stage: post-deploy
  image: curlimages/curl:latest
  script:
    - |
      # Wait for services to be healthy
      echo "Checking service health..."
      curl -f https://api.iworkz.com/health
      curl -f https://app.iworkz.com/api/health
      
      # Trigger synthetic monitoring
      curl -X POST "$DATADOG_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d '{"deployment":"'$CI_COMMIT_SHA'","environment":"production"}'
      
      # Update deployment tracking
      curl -X POST "$DEPLOYMENT_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d '{"version":"'$CI_COMMIT_SHA'","environment":"production","status":"deployed"}'
  only:
    - main
  needs:
    - deploy:production

post-deploy:database-migration:
  stage: post-deploy
  image: migrate/migrate:latest
  script:
    - migrate -path ./migrations -database $DATABASE_URL up
  only:
    - main
  needs:
    - deploy:production
  when: manual
```

### GitHub Actions Alternative Pipeline

**GitHub Actions Workflow for CI/CD**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  AWS_REGION: ap-northeast-1
  ECR_REGISTRY: 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com
  EKS_CLUSTER_NAME: iworkz-production

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint code
      run: npm run lint
    
    - name: Type check
      run: npm run type-check
    
    - name: Format check
      run: npm run format-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: iworkz_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/iworkz_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/iworkz_test
        REDIS_URL: redis://localhost:6379
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: 'trivy-results.sarif'

  build:
    needs: [validate, test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    strategy:
      matrix:
        service: [backend-api, web-frontend, ai-services]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Login to Amazon ECR
      uses: aws-actions/amazon-ecr-login@v2
    
    - name: Build and push Docker image
      env:
        ECR_REPOSITORY: iworkz/${{ matrix.service }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd ${{ matrix.service }}
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy-staging:
    needs: [build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION
    
    - name: Deploy to staging
      run: |
        kubectl config set-context --current --namespace=iworkz-staging
        envsubst < k8s/staging/ | kubectl apply -f -
        kubectl rollout status deployment/backend-api
        kubectl rollout status deployment/web-frontend
        kubectl rollout status deployment/ai-services
      env:
        IMAGE_TAG: ${{ github.sha }}
        ENVIRONMENT: staging

  deploy-production:
    needs: [build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION
    
    - name: Blue-Green Deployment
      run: |
        kubectl config set-context --current --namespace=iworkz-production
        
        # Determine current and new colors
        CURRENT_COLOR=$(kubectl get service backend-api-service -o jsonpath='{.spec.selector.color}' || echo "blue")
        NEW_COLOR=$([ "$CURRENT_COLOR" = "blue" ] && echo "green" || echo "blue")
        
        echo "Deploying to $NEW_COLOR environment"
        
        # Deploy new version
        sed "s/COLOR_PLACEHOLDER/$NEW_COLOR/g" k8s/production/ | envsubst | kubectl apply -f -
        
        # Wait for rollout
        kubectl rollout status deployment/backend-api-$NEW_COLOR
        kubectl rollout status deployment/web-frontend-$NEW_COLOR
        kubectl rollout status deployment/ai-services-$NEW_COLOR
        
        # Health check
        sleep 30
        
        # Switch traffic
        kubectl patch service backend-api-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
        kubectl patch service web-frontend-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
        kubectl patch service ai-services-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
        
        echo "Traffic switched to $NEW_COLOR"
      env:
        IMAGE_TAG: ${{ github.sha }}
        ENVIRONMENT: production
```

## 12.4 Infrastructure as Code (IaC)

### Terraform AWS Infrastructure

**Complete AWS Infrastructure Definition**
```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }
  
  backend "s3" {
    bucket         = "iworkz-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "iWORKZ"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "iworkz"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-${var.environment}-vpc"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = false
  enable_vpn_gateway     = false
  enable_dns_hostnames   = true
  enable_dns_support     = true

  # VPC Flow Logs
  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role  = true

  tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
  }

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
    "kubernetes.io/role/elb"                                       = 1
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
    "kubernetes.io/role/internal-elb"                             = 1
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = "1.28"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  cluster_endpoint_private_access = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # EKS Managed Node Groups
  eks_managed_node_groups = {
    general = {
      name = "general"
      
      instance_types = ["m6i.large", "m6i.xlarge"]
      
      min_size     = 3
      max_size     = 20
      desired_size = 6

      pre_bootstrap_user_data = <<-EOT
        #!/bin/bash
        /etc/eks/bootstrap.sh ${var.project_name}-${var.environment}
      EOT

      vpc_security_group_ids = [aws_security_group.node_group_sg.id]
      
      tags = {
        NodeGroup = "general"
      }
    }

    compute_optimized = {
      name = "compute-optimized"
      
      instance_types = ["c6i.xlarge", "c6i.2xlarge"]
      
      min_size     = 0
      max_size     = 10
      desired_size = 2

      taints = [
        {
          key    = "compute-optimized"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]

      labels = {
        NodeGroup = "compute-optimized"
        Workload  = "ai-ml"
      }

      tags = {
        NodeGroup = "compute-optimized"
      }
    }

    memory_optimized = {
      name = "memory-optimized"
      
      instance_types = ["r6i.xlarge", "r6i.2xlarge"]
      
      min_size     = 0
      max_size     = 5
      desired_size = 1

      taints = [
        {
          key    = "memory-optimized"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]

      labels = {
        NodeGroup = "memory-optimized"
        Workload  = "data-processing"
      }

      tags = {
        NodeGroup = "memory-optimized"
      }
    }
  }

  # Fargate Profiles
  fargate_profiles = {
    default = {
      name = "default"
      selectors = [
        {
          namespace = "fargate-workloads"
        }
      ]

      tags = {
        Owner = "fargate"
      }

      timeouts = {
        create = "20m"
        delete = "20m"
      }
    }
  }

  # aws-auth configmap
  manage_aws_auth_configmap = true

  aws_auth_roles = [
    {
      rolearn  = module.eks_admins_iam_role.iam_role_arn
      username = "cluster-admin"
      groups   = ["system:masters"]
    },
  ]

  aws_auth_users = [
    {
      userarn  = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/devops"
      username = "devops"
      groups   = ["system:masters"]
    },
  ]

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Security Group for EKS Node Groups
resource "aws_security_group" "node_group_sg" {
  name_prefix = "${var.project_name}-${var.environment}-node-group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "All traffic from VPC"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-node-group-sg"
  }
}

# RDS PostgreSQL Database
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = module.vpc.database_subnets

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-postgres"

  allocated_storage       = 100
  max_allocated_storage   = 1000
  storage_type           = "gp3"
  storage_encrypted      = true
  
  engine         = "postgres"
  engine_version = "16.1"
  instance_class = "db.r6g.xlarge"

  db_name  = "iworkz"
  username = "iworkz_admin"
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  multi_az               = true
  publicly_accessible    = false
  copy_tags_to_snapshot  = true
  deletion_protection    = true

  performance_insights_enabled = true
  monitoring_interval         = 60
  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "elasticache" {
  name_prefix = "${var.project_name}-${var.environment}-elasticache"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Redis"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-elasticache-sg"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-${var.environment}-redis"
  description                = "Redis cluster for ${var.project_name} ${var.environment}"

  port                = 6379
  parameter_group_name = "default.redis7"
  node_type           = "cache.r7g.large"
  num_cache_clusters  = 3

  subnet_group_name       = aws_elasticache_subnet_group.main.name
  security_group_ids      = [aws_security_group.elasticache.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth_token.result

  automatic_failover_enabled = true
  multi_az_enabled          = true

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.elasticache.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-redis"
  }
}

resource "random_password" "redis_auth_token" {
  length  = 32
  special = false
}

resource "aws_cloudwatch_log_group" "elasticache" {
  name              = "/aws/elasticache/${var.project_name}-${var.environment}"
  retention_in_days = 14
}

# OpenSearch Cluster
resource "aws_opensearch_domain" "main" {
  domain_name    = "${var.project_name}-${var.environment}-search"
  engine_version = "OpenSearch_2.11"

  cluster_config {
    instance_type            = "r6g.large.search"
    instance_count           = 3
    dedicated_master_enabled = true
    master_instance_type     = "r6g.medium.search"
    master_instance_count    = 3
    zone_awareness_enabled   = true

    zone_awareness_config {
      availability_zone_count = 3
    }
  }

  vpc_options {
    subnet_ids         = slice(module.vpc.private_subnets, 0, 3)
    security_group_ids = [aws_security_group.opensearch.id]
  }

  ebs_options {
    ebs_enabled = true
    volume_type = "gp3"
    volume_size = 100
  }

  encrypt_at_rest {
    enabled = true
  }

  node_to_node_encryption {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  advanced_security_options {
    enabled                        = true
    anonymous_auth_enabled         = false
    internal_user_database_enabled = true
    master_user_options {
      master_user_name     = "admin"
      master_user_password = random_password.opensearch_password.result
    }
  }

  log_publishing_options {
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.opensearch.arn
    log_type                 = "INDEX_SLOW_LOGS"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-opensearch"
  }
}

resource "aws_security_group" "opensearch" {
  name_prefix = "${var.project_name}-${var.environment}-opensearch"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-opensearch-sg"
  }
}

resource "random_password" "opensearch_password" {
  length  = 32
  special = true
}

resource "aws_cloudwatch_log_group" "opensearch" {
  name              = "/aws/opensearch/domains/${var.project_name}-${var.environment}-search"
  retention_in_days = 14
}

# S3 Buckets
resource "aws_s3_bucket" "app_storage" {
  bucket = "${var.project_name}-${var.environment}-app-storage"
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM Roles
module "eks_admins_iam_role" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"

  role_name = "${var.project_name}-${var.environment}-eks-admin"

  attach_admin_policy = true

  oidc_providers = {
    ex = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:cluster-admin"]
    }
  }
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "opensearch_endpoint" {
  description = "OpenSearch domain endpoint"
  value       = aws_opensearch_domain.main.endpoint
  sensitive   = true
}
```

## 12.5 Monitoring & Observability

### Comprehensive Monitoring Stack

**Prometheus, Grafana, and Jaeger Configuration**
```yaml
# monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      external_labels:
        cluster: 'iworkz-production'
        region: 'ap-northeast-1'

    rule_files:
      - "/etc/prometheus/rules/*.yml"

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093

    scrape_configs:
      # Kubernetes API Server
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
        - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
          action: keep
          regex: default;kubernetes;https

      # Kubernetes Nodes
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
        - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - action: labelmap
          regex: __meta_kubernetes_node_label_(.+)

      # Kubernetes Pods
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
        - role: pod
        relabel_configs:
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          target_label: __address__
        - action: labelmap
          regex: __meta_kubernetes_pod_label_(.+)
        - source_labels: [__meta_kubernetes_namespace]
          action: replace
          target_label: kubernetes_namespace
        - source_labels: [__meta_kubernetes_pod_name]
          action: replace
          target_label: kubernetes_pod_name

      # Application Services
      - job_name: 'backend-api'
        static_configs:
        - targets: ['backend-api-service:9090']
        metrics_path: /metrics
        scrape_interval: 10s

      - job_name: 'ai-services'
        static_configs:
        - targets: ['ai-services-service:9090']
        metrics_path: /metrics
        scrape_interval: 15s

      - job_name: 'web-frontend'
        static_configs:
        - targets: ['web-frontend-service:9090']
        metrics_path: /metrics
        scrape_interval: 30s

      # External Services
      - job_name: 'postgres-exporter'
        static_configs:
        - targets: ['postgres-exporter:9187']

      - job_name: 'redis-exporter'
        static_configs:
        - targets: ['redis-exporter:9121']

---
# Alert Rules Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-alert-rules
  namespace: monitoring
data:
  alerts.yml: |
    groups:
    - name: iworkz.rules
      rules:
      
      # High-level Service Availability
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          description: "{{ $labels.instance }} of job {{ $labels.job }} has been down for more than 1 minute."

      # API Response Time
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "High API latency detected"
          description: "95th percentile latency is {{ $value }}s for {{ $labels.instance }}"

      # Error Rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for {{ $labels.instance }}"

      # Database Connections
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends / pg_settings_max_connections * 100 > 80
        for: 5m
        labels:
          severity: warning
          team: database
        annotations:
          summary: "High database connection usage"
          description: "Database connection usage is {{ $value }}% on {{ $labels.instance }}"

      # Memory Usage
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
          team: infrastructure
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}% on {{ $labels.instance }}"

      # Disk Usage
      - alert: HighDiskUsage
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
          team: infrastructure
        annotations:
          summary: "High disk usage"
          description: "Disk usage is {{ $value }}% on {{ $labels.instance }}"

      # CPU Usage
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
        for: 10m
        labels:
          severity: warning
          team: infrastructure
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"

      # Pod Crash Looping
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.namespace }}/{{ $labels.pod }} is restarting {{ $value }} times per second"

      # AI Service Specific Alerts
      - alert: AIModelInferenceLatency
        expr: histogram_quantile(0.95, rate(ai_model_inference_duration_seconds_bucket[5m])) > 2.0
        for: 3m
        labels:
          severity: warning
          team: ai
        annotations:
          summary: "AI model inference latency is high"
          description: "95th percentile inference latency is {{ $value }}s for model {{ $labels.model_name }}"

      - alert: AIModelAccuracyDrop
        expr: ai_model_accuracy < 0.85
        for: 10m
        labels:
          severity: critical
          team: ai
        annotations:
          summary: "AI model accuracy has dropped"
          description: "Model {{ $labels.model_name }} accuracy is {{ $value }}, below threshold of 0.85"

---
# Grafana Dashboard ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: monitoring
data:
  iworkz-overview.json: |
    {
      "dashboard": {
        "id": null,
        "title": "iWORKZ Platform Overview",
        "tags": ["iworkz", "overview"],
        "timezone": "Asia/Tokyo",
        "refresh": "30s",
        "time": {
          "from": "now-1h",
          "to": "now"
        },
        "panels": [
          {
            "title": "Service Health",
            "type": "stat",
            "targets": [
              {
                "expr": "up",
                "legendFormat": "{{ instance }}"
              }
            ],
            "fieldConfig": {
              "defaults": {
                "mappings": [
                  {
                    "options": {
                      "0": {
                        "text": "DOWN",
                        "color": "red"
                      },
                      "1": {
                        "text": "UP",
                        "color": "green"
                      }
                    },
                    "type": "value"
                  }
                ]
              }
            }
          },
          {
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(http_requests_total[5m])) by (service)",
                "legendFormat": "{{ service }}"
              }
            ],
            "yAxes": [
              {
                "label": "Requests per second"
              }
            ]
          },
          {
            "title": "Response Time (95th percentile)",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))",
                "legendFormat": "{{ service }}"
              }
            ],
            "yAxes": [
              {
                "label": "Response time (s)"
              }
            ]
          },
          {
            "title": "Error Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service)",
                "legendFormat": "{{ service }}"
              }
            ],
            "yAxes": [
              {
                "label": "Error rate (%)",
                "max": 1,
                "min": 0
              }
            ]
          },
          {
            "title": "Active Users",
            "type": "stat",
            "targets": [
              {
                "expr": "sum(active_users_total)",
                "legendFormat": "Active Users"
              }
            ]
          },
          {
            "title": "AI Model Performance",
            "type": "graph",
            "targets": [
              {
                "expr": "ai_model_accuracy",
                "legendFormat": "{{ model_name }} Accuracy"
              },
              {
                "expr": "histogram_quantile(0.95, rate(ai_model_inference_duration_seconds_bucket[5m]))",
                "legendFormat": "{{ model_name }} P95 Latency"
              }
            ]
          },
          {
            "title": "Database Performance",
            "type": "graph",
            "targets": [
              {
                "expr": "pg_stat_database_tup_returned / pg_stat_database_tup_fetched",
                "legendFormat": "Cache Hit Ratio"
              },
              {
                "expr": "pg_stat_database_numbackends",
                "legendFormat": "Active Connections"
              }
            ]
          },
          {
            "title": "Infrastructure Resources",
            "type": "graph",
            "targets": [
              {
                "expr": "100 - (avg(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
                "legendFormat": "CPU Usage %"
              },
              {
                "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
                "legendFormat": "Memory Usage %"
              },
              {
                "expr": "(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100",
                "legendFormat": "Disk Usage %"
              }
            ]
          }
        ]
      }
    }
```

---

**This comprehensive Deployment & Infrastructure documentation provides detailed implementation of enterprise-grade infrastructure architecture, containerization strategies, CI/CD pipelines, infrastructure as code, and monitoring systems specifically designed for the Japanese market with high availability, scalability, and compliance requirements.**

---

*Infrastructure implementation emphasizes security, compliance, and operational excellence with comprehensive monitoring, automated deployment processes, and disaster recovery capabilities suitable for mission-critical employment platform operations in Japan.*