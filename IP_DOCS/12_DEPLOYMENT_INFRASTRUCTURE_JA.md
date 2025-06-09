# 第12章: デプロイ & インフラストラクチャ

**ドキュメントバージョン**: 1.0.0  
**最終更新日**: 2024年12月  
**分類**: 機密 - IP ドキュメント  
**対象市場**: 🇯🇵 日本（メイン）、🇰🇷 韓国、🌏 ASEAN  

---

## 12.1 インフラストラクチャアーキテクチャ概要

### エンタープライズグレード マルチクラウド戦略

**インフラストラクチャアーキテクチャ図**
```mermaid
graph TB
    subgraph "エッジ & CDN層"
        CLOUDFLARE[CloudFlare<br/>グローバルCDN + DDoS保護]
        WAF[Webアプリケーションファイアウォール<br/>セキュリティルール]
        RATE_LIMIT[レート制限<br/>API保護]
    end
    
    subgraph "ロードバランシング & ルーティング"
        ALB[アプリケーションロードバランサー<br/>AWS ALB + NLB]
        API_GATEWAY[APIゲートウェイ<br/>Kong + AWS API Gateway]
        INGRESS[Kubernetesイングレス<br/>NGINX + Istio]
    end
    
    subgraph "プライマリクラウド - AWS（日本）"
        AZ1[アベイラビリティゾーン1<br/>ap-northeast-1a]
        AZ2[アベイラビリティゾーン2<br/>ap-northeast-1c]
        AZ3[アベイラビリティゾーン3<br/>ap-northeast-1d]
        
        subgraph "コンピュート層"
            EKS[Amazon EKS<br/>Kubernetesクラスター]
            FARGATE[AWS Fargate<br/>サーバーレスコンテナ]
            LAMBDA[AWS Lambda<br/>サーバーレス関数]
            EC2[EC2インスタンス<br/>オートスケーリンググループ]
        end
        
        subgraph "データ層"
            RDS[Amazon RDS<br/>PostgreSQL Multi-AZ]
            ELASTICACHE[ElastiCache<br/>Redisクラスター]
            OPENSEARCH[OpenSearch<br/>検索 & アナリティクス]
            S3[Amazon S3<br/>オブジェクトストレージ]
        end
        
        subgraph "AI/MLサービス"
            SAGEMAKER[Amazon SageMaker<br/>ML学習 & 推論]
            BEDROCK[Amazon Bedrock<br/>基盤モデル]
            TEXTRACT[Amazon Textract<br/>文書処理]
            COMPREHEND[Amazon Comprehend<br/>NLPサービス]
        end
    end
    
    subgraph "セカンダリクラウド - Azure（韓国）"
        AZURE_KOREA[Azure Korea Central<br/>災害復旧]
        AKS[Azure Kubernetes Service<br/>バックアップクラスター]
        AZURE_DB[Azure Database<br/>PostgreSQL]
        AZURE_STORAGE[Azure Blob Storage<br/>バックアップストレージ]
    end
    
    subgraph "監視 & 可観測性"
        PROMETHEUS[Prometheus<br/>メトリクス収集]
        GRAFANA[Grafana<br/>可視化]
        JAEGER[Jaeger<br/>分散トレーシング]
        ELK[ELKスタック<br/>集中ログ]
        SENTRY[Sentry<br/>エラー追跡]
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

### インフラストラクチャ技術スタック

**包括的インフラストラクチャコンポーネント**
```yaml
infrastructure_stack:
  cloud_providers:
    primary: 
      provider: "AWS"
      regions: ["ap-northeast-1", "ap-northeast-3"]
      reason: "日本市場での最高のパフォーマンス、包括的なAI/MLサービス"
      
    secondary:
      provider: "Microsoft Azure"
      regions: ["Korea Central", "Korea South"]
      reason: "韓国での戦略的プレゼンス、エンタープライズパートナーシップ"
      
    edge:
      provider: "CloudFlare"
      global_presence: true
      reason: "優れたDDoS保護、グローバルCDNパフォーマンス"

  compute_services:
    container_orchestration:
      technology: "Kubernetes"
      managed_service: "Amazon EKS"
      node_groups:
        - name: "general"
          instance_types: ["m6i.large", "m6i.xlarge", "m6i.2xlarge"]
          scaling: "オートスケーリンググループ"
        - name: "compute-optimized"
          instance_types: ["c6i.xlarge", "c6i.2xlarge", "c6i.4xlarge"]
          use_case: "AI/MLワークロード"
        - name: "memory-optimized"
          instance_types: ["r6i.xlarge", "r6i.2xlarge", "r6i.4xlarge"]
          use_case: "データ処理、キャッシュ"
      
    serverless:
      containers: "AWS Fargate"
      functions: "AWS Lambda"
      benefits: ["コスト最適化", "オートスケーリング", "サーバー管理不要"]
      
    traditional_compute:
      ec2_instances: "リザーブド + オンデマンド"
      auto_scaling: "ターゲット追跡 + 予測スケーリング"
      
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
      configuration: "リードレプリカ付きMulti-AZ"
      backup: "ポイントインタイム復旧 + クロスリージョンバックアップ"
      
    caching:
      service: "Amazon ElastiCache for Redis"
      version: "Redis 7.x"
      configuration: "クラスターモード有効"
      persistence: "RDB + AOF"
      
    search_analytics:
      service: "Amazon OpenSearch Service"
      version: "OpenSearch 2.x"
      configuration: "Multi-AZクラスター"
      features: ["全文検索", "アナリティクス", "機械学習"]
      
    object_storage:
      service: "Amazon S3"
      storage_classes: ["Standard", "IA", "Glacier", "Deep Archive"]
      features: ["バージョニング", "暗号化", "クロスリージョンレプリケーション"]
      
  security_compliance:
    encryption:
      at_rest: "AWS KMS + Customer Managed Keys"
      in_transit: "TLS 1.3 + mTLS"
      application: "フィールドレベル暗号化"
      
    access_control:
      identity: "AWS IAM + RBAC"
      secrets: "AWS Secrets Manager + HashiCorp Vault"
      certificates: "AWS Certificate Manager"
      
    compliance:
      frameworks: ["ISO 27001", "SOC 2 Type II", "GDPR", "JISQ 15001"]
      audit_logging: "AWS CloudTrail + カスタム監査サービス"
      
  monitoring_observability:
    metrics:
      collection: "Prometheus + CloudWatch"
      visualization: "Grafana + CloudWatch Dashboards"
      alerting: "AlertManager + CloudWatch Alarms"
      
    logging:
      aggregation: "ELKスタック (Elasticsearch, Logstash, Kibana)"
      shipping: "Fluentd + CloudWatch Logs"
      retention: "30日ホット、1年ウォーム、7年コールド"
      
    tracing:
      distributed: "Jaeger + AWS X-Ray"
      application: "OpenTelemetry"
      
    error_tracking:
      service: "Sentry"
      integration: "全アプリケーションとサービス"
```

## 12.2 コンテナ化 & Kubernetes

### Dockerコンテナ戦略

**最適化のためのマルチステージDockerビルド**
```dockerfile
# Node.jsバックエンドサービス用マルチステージDockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 開発ステージ
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ビルドステージ
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# 本番ステージ
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

# Python AIサービス Dockerfile
FROM python:3.12-slim AS python-base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# システム依存関係をインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Python開発ステージ
FROM python-base AS python-dev
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Python本番ステージ
FROM python-base AS python-prod
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 非rootユーザーを作成
RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --chown=appuser:appuser . .
USER appuser

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]

# Next.jsフロントエンド Dockerfile
FROM node:20-alpine AS nextjs-base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 依存関係ステージ
FROM nextjs-base AS nextjs-deps
COPY package.json package-lock.json ./
RUN npm ci

# ビルダーステージ
FROM nextjs-base AS nextjs-builder
COPY --from=nextjs-deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# ランナーステージ
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

### Kubernetesデプロイメントマニフェスト

**完全なKubernetes構成**
```yaml
# 名前空間設定
apiVersion: v1
kind: Namespace
metadata:
  name: iworkz-production
  labels:
    name: iworkz-production
    environment: production
    
---
# バックエンドAPIデプロイメント
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
# バックエンドAPIサービス
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
# AIサービスデプロイメント
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
# フロントエンドWebアプリケーションデプロイメント
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
# バックエンドAPI用水平ポッドオートスケーラー
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
# SSL付きイングレス構成
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
# アプリケーション設定用ConfigMap
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
# セキュリティ用ネットワークポリシー
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

## 12.3 CI/CDパイプライン実装

### GitLab CI/CDパイプライン

**包括的DevOpsパイプライン構成**
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

# 共通Docker操作用テンプレート
.docker_template: &docker_template
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - apk add --no-cache curl git

# kubectl操作用テンプレート
.kubectl_template: &kubectl_template
  image: bitnami/kubectl:latest
  before_script:
    - echo $KUBE_CONFIG | base64 -d > $HOME/.kube/config
    - kubectl version --client

# 検証ステージ
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

# テストステージ
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

# セキュリティステージ
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

# ビルドステージ
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

# ステージングデプロイ
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

# 統合テスト
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

# 本番デプロイ
deploy:production:
  stage: deploy-production
  <<: *kubectl_template
  environment:
    name: production
    url: https://app.iworkz.com
  script:
    - kubectl config set-context --current --namespace=$KUBERNETES_NAMESPACE_PRODUCTION
    - |
      # Blue-Green デプロイ戦略
      CURRENT_COLOR=$(kubectl get service backend-api-service -o jsonpath='{.spec.selector.color}')
      if [ "$CURRENT_COLOR" = "blue" ]; then
        NEW_COLOR="green"
      else
        NEW_COLOR="blue"
      fi
      
      echo "Deploying to $NEW_COLOR environment"
      
      # 新バージョンをデプロイ
      sed "s/COLOR_PLACEHOLDER/$NEW_COLOR/g" k8s/backend-api.yaml | envsubst | kubectl apply -f -
      sed "s/COLOR_PLACEHOLDER/$NEW_COLOR/g" k8s/web-frontend.yaml | envsubst | kubectl apply -f -
      sed "s/COLOR_PLACEHOLDER/$NEW_COLOR/g" k8s/ai-services.yaml | envsubst | kubectl apply -f -
      
      # ロールアウトの完了を待機
      kubectl rollout status deployment/backend-api-$NEW_COLOR
      kubectl rollout status deployment/web-frontend-$NEW_COLOR
      kubectl rollout status deployment/ai-services-$NEW_COLOR
      
      # ヘルスチェック
      sleep 30
      kubectl get pods -l color=$NEW_COLOR
      
      # トラフィックを切り替え
      kubectl patch service backend-api-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
      kubectl patch service web-frontend-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
      kubectl patch service ai-services-service -p '{"spec":{"selector":{"color":"'$NEW_COLOR'"}}}'
      
      echo "Traffic switched to $NEW_COLOR"
      
      # 5分後に古いデプロイをクリーンアップ
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

# デプロイ後のタスク
post-deploy:monitoring:
  stage: post-deploy
  image: curlimages/curl:latest
  script:
    - |
      # サービスの正常性を確認
      echo "Checking service health..."
      curl -f https://api.iworkz.com/health
      curl -f https://app.iworkz.com/api/health
      
      # 合成監視をトリガー
      curl -X POST "$DATADOG_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d '{"deployment":"'$CI_COMMIT_SHA'","environment":"production"}'
      
      # デプロイ追跡を更新
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

## 12.4 Infrastructure as Code (IaC)

### Terraform AWS インフラストラクチャ

**完全なAWSインフラストラクチャ定義**
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

# データソース
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# 変数
variable "aws_region" {
  description = "AWSリソースのリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "環境名"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "プロジェクト名"
  type        = string
  default     = "iworkz"
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

# VPC設定
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

  # VPCフローログ
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

# EKSクラスター
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

  # EKS管理ノードグループ
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

  # Fargateプロファイル
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

# EKSノードグループ用セキュリティグループ
resource "aws_security_group" "node_group_sg" {
  name_prefix = "${var.project_name}-${var.environment}-node-group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "VPCからの全トラフィック"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    description = "全アウトバウンドトラフィック"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-node-group-sg"
  }
}

# RDS PostgreSQLデータベース
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

# ElastiCache Redisクラスター
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
  description                = "${var.project_name} ${var.environment}のRedisクラスター"

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

# 出力
output "vpc_id" {
  description = "VPCのID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_endpoint" {
  description = "EKSコントロールプレーンのエンドポイント"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "Kubernetesクラスター名"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "RDSインスタンスエンドポイント"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redisエンドポイント"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}
```

## 12.5 監視 & 可観測性

### 包括的監視スタック

**Prometheus、Grafana、Jaegerの設定**
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
      # Kubernetes APIサーバー
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

      # Kubernetesノード
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

      # Kubernetesポッド
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

      # アプリケーションサービス
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

      # 外部サービス
      - job_name: 'postgres-exporter'
        static_configs:
        - targets: ['postgres-exporter:9187']

      - job_name: 'redis-exporter'
        static_configs:
        - targets: ['redis-exporter:9121']

---
# アラートルール設定
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
      
      # 高レベルサービス可用性
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "サービス {{ $labels.instance }} がダウンしています"
          description: "{{ $labels.job }} の {{ $labels.instance }} が1分以上ダウンしています。"

      # APIレスポンス時間
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "高いAPIレイテンシが検出されました"
          description: "{{ $labels.instance }} の95パーセンタイルレイテンシが {{ $value }}s です"

      # エラー率
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "高いエラー率が検出されました"
          description: "{{ $labels.instance }} のエラー率が {{ $value | humanizePercentage }} です"

      # データベース接続
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends / pg_settings_max_connections * 100 > 80
        for: 5m
        labels:
          severity: warning
          team: database
        annotations:
          summary: "データベース接続使用率が高いです"
          description: "{{ $labels.instance }} でのデータベース接続使用率が {{ $value }}% です"

      # メモリ使用量
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
          team: infrastructure
        annotations:
          summary: "高いメモリ使用率"
          description: "{{ $labels.instance }} でのメモリ使用率が {{ $value }}% です"

      # ディスク使用量
      - alert: HighDiskUsage
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
          team: infrastructure
        annotations:
          summary: "高いディスク使用率"
          description: "{{ $labels.instance }} でのディスク使用率が {{ $value }}% です"

      # CPU使用量
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
        for: 10m
        labels:
          severity: warning
          team: infrastructure
        annotations:
          summary: "高いCPU使用率"
          description: "{{ $labels.instance }} でのCPU使用率が {{ $value }}% です"

      # ポッドクラッシュループ
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "ポッドがクラッシュループしています"
          description: "ポッド {{ $labels.namespace }}/{{ $labels.pod }} が毎秒 {{ $value }} 回再起動しています"

      # AIサービス固有のアラート
      - alert: AIModelInferenceLatency
        expr: histogram_quantile(0.95, rate(ai_model_inference_duration_seconds_bucket[5m])) > 2.0
        for: 3m
        labels:
          severity: warning
          team: ai
        annotations:
          summary: "AIモデル推論のレイテンシが高いです"
          description: "モデル {{ $labels.model_name }} の95パーセンタイル推論レイテンシが {{ $value }}s です"

      - alert: AIModelAccuracyDrop
        expr: ai_model_accuracy < 0.85
        for: 10m
        labels:
          severity: critical
          team: ai
        annotations:
          summary: "AIモデルの精度が低下しました"
          description: "モデル {{ $labels.model_name }} の精度が {{ $value }} で、閾値0.85を下回っています"

---
# Grafanaダッシュボード ConfigMap
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
        "title": "iWORKZ プラットフォーム概要",
        "tags": ["iworkz", "overview"],
        "timezone": "Asia/Tokyo",
        "refresh": "30s",
        "time": {
          "from": "now-1h",
          "to": "now"
        },
        "panels": [
          {
            "title": "サービス正常性",
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
            "title": "リクエスト率",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(http_requests_total[5m])) by (service)",
                "legendFormat": "{{ service }}"
              }
            ],
            "yAxes": [
              {
                "label": "1秒あたりのリクエスト"
              }
            ]
          },
          {
            "title": "レスポンス時間（95パーセンタイル）",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))",
                "legendFormat": "{{ service }}"
              }
            ],
            "yAxes": [
              {
                "label": "レスポンス時間 (s)"
              }
            ]
          },
          {
            "title": "エラー率",
            "type": "graph",
            "targets": [
              {
                "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service)",
                "legendFormat": "{{ service }}"
              }
            ],
            "yAxes": [
              {
                "label": "エラー率 (%)",
                "max": 1,
                "min": 0
              }
            ]
          },
          {
            "title": "アクティブユーザー",
            "type": "stat",
            "targets": [
              {
                "expr": "sum(active_users_total)",
                "legendFormat": "アクティブユーザー"
              }
            ]
          },
          {
            "title": "AIモデルパフォーマンス",
            "type": "graph",
            "targets": [
              {
                "expr": "ai_model_accuracy",
                "legendFormat": "{{ model_name }} 精度"
              },
              {
                "expr": "histogram_quantile(0.95, rate(ai_model_inference_duration_seconds_bucket[5m]))",
                "legendFormat": "{{ model_name }} P95 レイテンシ"
              }
            ]
          },
          {
            "title": "データベースパフォーマンス",
            "type": "graph",
            "targets": [
              {
                "expr": "pg_stat_database_tup_returned / pg_stat_database_tup_fetched",
                "legendFormat": "キャッシュヒット率"
              },
              {
                "expr": "pg_stat_database_numbackends",
                "legendFormat": "アクティブ接続"
              }
            ]
          },
          {
            "title": "インフラストラクチャリソース",
            "type": "graph",
            "targets": [
              {
                "expr": "100 - (avg(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
                "legendFormat": "CPU使用率 %"
              },
              {
                "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
                "legendFormat": "メモリ使用率 %"
              },
              {
                "expr": "(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100",
                "legendFormat": "ディスク使用率 %"
              }
            ]
          }
        ]
      }
    }
```

---

**この包括的なデプロイ & インフラストラクチャドキュメントは、エンタープライズグレードのインフラストラクチャアーキテクチャ、コンテナ化戦略、CI/CDパイプライン、Infrastructure as Code、日本市場向けに最適化された高可用性、スケーラビリティ、コンプライアンス要件を持つ監視システムの詳細な実装を提供します。**

---

*インフラストラクチャ実装は、日本でのミッションクリティカルな雇用プラットフォーム運用に適したセキュリティ、コンプライアンス、運用優秀性を重視し、包括的な監視、自動化されたデプロイプロセス、災害復旧機能を備えて設計されています。*