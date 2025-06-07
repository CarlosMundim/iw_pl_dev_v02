# DevOpsサービス

## 概要

iWORKZプラットフォーム向けのInfrastructure as Code（IaC）、CI/CDパイプライン、監視、デプロイ自動化を提供します。

## 技術スタック

* **インフラ**：Terraform、AWS/GCP/Azure
* **コンテナ化**：Docker、Kubernetes
* **CI/CD**：GitHub Actions、GitLab CI
* **監視**：Prometheus、Grafana、ELK Stack
* **セキュリティ**：HashiCorp Vault、SOPS
* **自動化**：Ansible、Helm Charts

## リポジトリ構成

```
devops/
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   ├── modules/
│   └── shared/
├── kubernetes/
│   ├── base/
│   ├── overlays/
│   └── helm-charts/
├── monitoring/
│   ├── prometheus/
│   ├── grafana/
│   └── alerts/
├── scripts/
├── ansible/
└── .github/workflows/
```

## Infrastructure as Code（IaC）

### Terraform構成例

```hcl
# メインVPCとネットワーク
module "vpc" {
  source = "./modules/vpc"
  
  cidr_block           = var.vpc_cidr
  availability_zones   = var.azs
  public_subnets      = var.public_subnets
  private_subnets     = var.private_subnets
  enable_nat_gateway  = true
  enable_vpn_gateway  = false
  
  tags = local.common_tags
}

# EKSクラスタ
module "eks" {
  source = "./modules/eks"
  
  cluster_name     = "${var.project_name}-${var.environment}"
  cluster_version  = var.kubernetes_version
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  
  node_groups = {
    main = {
      instance_types = ["t3.medium", "t3.large"]
      scaling_config = {
        desired_size = 3
        max_size     = 10
        min_size     = 1
      }
    }
  }
}

# RDSデータベース
module "database" {
  source = "./modules/rds"
  
  identifier     = "${var.project_name}-${var.environment}-db"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.db_instance_class
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [module.security_groups.database.id]
  subnet_group_name      = module.vpc.database_subnet_group
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  tags = local.common_tags
}
```

## Kubernetesマニフェスト

### アプリケーションデプロイメント

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: iworkz
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: iworkz/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: API_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: api_url
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: iworkz
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

### Ingress構成

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: iworkz-ingress
  namespace: iworkz
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.iworkz.com
    - app.iworkz.com
    secretName: iworkz-tls
  rules:
  - host: app.iworkz.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.iworkz.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
```

## CI/CDパイプライン

### GitHub Actionsワークフロー

```yaml
name: Deploy iWORKZ Platform
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, backend-api, ai-agent]
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: '2_SERVICES/${{ matrix.service }}/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd 2_SERVICES/${{ matrix.service }}
        npm ci
    
    - name: Run tests
      run: |
        cd 2_SERVICES/${{ matrix.service }}
        npm test
    
    - name: Run security audit
      run: |
        cd 2_SERVICES/${{ matrix.service }}
        npm audit --audit-level high

  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, backend-api, ai-agent]
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./2_SERVICES/${{ matrix.service }}
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Deploy to EKS
      run: |
        aws eks get-token --cluster-name iworkz-staging | kubectl apply -f kubernetes/overlays/staging/
        kubectl set image deployment/frontend frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}
        kubectl rollout status deployment/frontend

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Production
      run: |
        # Blue-green deployment strategy
        ./scripts/blue-green-deploy.sh ${{ github.sha }}
```

## 監視・オブザーバビリティ

### Prometheus構成

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - alertmanager:9093

scrape_configs:
- job_name: 'kubernetes-pods'
  kubernetes_sd_configs:
  - role: pod
  relabel_configs:
  - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
    action: keep
    regex: true

- job_name: 'frontend'
  static_configs:
  - targets: ['frontend:3000']
  metrics_path: /metrics

- job_name: 'backend-api'
  static_configs:
  - targets: ['backend-api:8000']
  metrics_path: /metrics
```

### Grafanaダッシュボード

```json
{
  "dashboard": {
    "title": "iWORKZ Platform Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## セキュリティとコンプライアンス

### シークレット管理

```bash
# SOPSによるシークレット暗号化
sops -e -i secrets/production.yaml

# Vault連携
vault kv put secret/iworkz/production \
  database_password="$(openssl rand -base64 32)" \
  jwt_secret="$(openssl rand -base64 64)"
```

### セキュリティスキャン

```yaml
# security-scan.yml
name: Security Scan
on:
  schedule:
    - cron: '0 2 * * *'  # 毎日2時に実行

jobs:
  container-scan:
    runs-on: ubuntu-latest
    steps:
    - name: Scan container images
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'iworkz/frontend:latest'
        format: 'sarif'
        output: 'trivy-results.sarif'
```

## バックアップと災害対策

### データベースバックアップ

```bash
#!/bin/bash
# backup-database.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="iworkz_backup_${TIMESTAMP}.sql"

pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_NAME
aws s3 cp $BACKUP_NAME s3://iworkz-backups/database/
```

### 災害復旧計画

1. **RPO**: 最大データ損失4時間以内
2. **RTO**: 最大復旧時間2時間以内
3. **バックアップ戦略**: 毎日自動バックアップ
4. **マルチリージョン**: アクティブ・パッシブ構成
5. **フェイルオーバー**: DNS自動切り替え

## 環境変数

```bash
# AWS構成
AWS_REGION=us-west-2
AWS_ACCOUNT_ID=123456789012

# Kubernetes
KUBECONFIG=/path/to/kubeconfig
NAMESPACE=iworkz

# 監視
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
ALERT_WEBHOOK=https://hooks.slack.com/...

# セキュリティ
VAULT_ADDR=https://vault.iworkz.com
SOPS_KMS_ARN=arn:aws:kms:us-west-2:123456789012:key/...
```
