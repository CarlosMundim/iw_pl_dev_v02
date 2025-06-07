# デプロイメントガイド

## 概要

このドキュメントはiWORKZプラットフォームの包括的なデプロイメントガイドです。ローカル開発環境からステージング、本番環境まで、コンテナ化されたマイクロサービスアーキテクチャに基づく展開手順を網羅しています。

## 前提条件

### 開発環境

* **OS**: Windows 10/11（WSL2対応）またはLinux/macOS
* **Docker**: Docker Desktop 4.0以上（Kubernetes有効化推奨）
* **Node.js**: Node.js 18+ LTSとnpm/yarn
* **Python**: Python 3.10+、pip、仮想環境
* **Git**: Git 2.30+（SSHキー設定済み）
* **IDE**: VS Code（Remote-WSL拡張推奨）

### 本番環境

* **コンテナオーケストレーション**: Kubernetes 1.25+ またはDocker Swarm
* **クラウドプロバイダ**: AWS、GCP、Azureなどマネージドサービス
* **データベース**: PostgreSQL 14+（リードレプリカ対応）
* **キャッシュ**: Redis 7+（クラスタリング対応）
* **ロードバランサ**: アプリケーションロードバランサ（SSL終端）
* **モニタリング**: Prometheus、Grafana、集中ログ管理

## ローカル開発セットアップ

### クイックスタート

```bash
# リポジトリをクローン
git clone git@github.com:your-org/iworkz-platform.git
cd iworkz-platform

# 環境設定をコピー
cp .env.example .env.local

# Docker Composeで全サービス起動
docker-compose up -d

# サービス稼働確認
docker-compose ps

# アプリケーションアクセス
# Webフロント: http://localhost:3000
# APIドキュメント: http://localhost:8000/docs
# 管理ダッシュボード: http://localhost:3002
```

### 環境構成

```bash
# データベース設定
DATABASE_URL=postgresql://postgres:password@localhost:5432/iworkz_dev
REDIS_URL=redis://localhost:6379

# APIキー（開発用）
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# 認証
JWT_SECRET=your-jwt-secret-key
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id

# サードパーティ連携（サンドボックス）
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### サービス依存関係

```yaml
# docker-compose.ymlの構成例
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

## ステージング環境

### インフラ構成

```bash
# ステージングクラスターにデプロイ
kubectl apply -f k8s/staging/

# ステージング用DB設定
kubectl apply -f k8s/staging/postgres-staging.yaml

# アプリサービスデプロイ
kubectl apply -f k8s/staging/services/

# IngressとSSL設定
kubectl apply -f k8s/staging/ingress-staging.yaml

# デプロイ確認
kubectl get pods -n iworkz-staging
kubectl get services -n iworkz-staging
```

### ステージング構成

```yaml
# Helm用staging values.yaml
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

### ステージング検証

```bash
# ステージング統合テスト
npm run test:integration:staging

# スモークテスト
npm run test:smoke:staging

# APIエンドポイント検証
curl -f https://staging-api.iworkz.com/health

# アプリログ確認
kubectl logs -n iworkz-staging deployment/backend-api

# メトリクス監視
kubectl port-forward -n monitoring service/grafana 3000:3000
```

## 本番デプロイ

### デプロイ前チェックリスト

* [ ] ステージングで全テストパス済み
* [ ] セキュリティスキャン（重大な脆弱性なし）
* [ ] DBマイグレーションスクリプトレビュー・検証
* [ ] バックアップ・ロールバック手順確認
* [ ] パフォーマンス要件クリア
* [ ] 証明書最新・有効期限内
* [ ] 環境変数・シークレット設定済み
* [ ] モニタリング・アラート設定済み
* [ ] 変更管理承認済み

### 本番インフラ

```bash
# Helmによる本番デプロイ
helm upgrade --install iworkz-prod ./helm/iworkz \
  --namespace production \
  --values helm/values-production.yaml \
  --timeout 10m

# デプロイ状況確認
helm status iworkz-prod -n production

# 本番後テスト実行
kubectl run -n production test-pod --rm -i --tty \
  --image=iworkz/test-runner \
  -- npm run test:production

# デプロイメント監視
kubectl get hpa -n production
kubectl top pods -n production
```

### 本番構成

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

## CI/CDパイプライン

### GitHub Actionsワークフロー

```yaml
# .github/workflows/deploy.yml
name: 本番デプロイ

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
      - name: Node.jsセットアップ
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: 依存関係インストール
        run: npm ci
      - name: テスト実行
        run: npm run test:ci
      - name: セキュリティスキャン
        run: npm audit --audit-level moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Dockerイメージビルド
        run: |
          docker build -t iworkz/backend-api:${{ github.sha }} ./2_SERVICES/backend-api
          docker build -t iworkz/web-frontend:${{ github.sha }} ./2_SERVICES/web-frontend
      - name: レジストリへPush
        run: |
          docker push iworkz/backend-api:${{ github.sha }}
          docker push iworkz/web-frontend:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: ステージングへデプロイ
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
      - name: 本番環境へデプロイ
        run: |
          helm upgrade --install iworkz-prod ./helm/iworkz \
            --namespace production \
            --set image.tag=${{ github.sha }} \
            --timeout 15m
```

### デプロイコマンド

```bash
# ステージング（承認必要）
npm run deploy:staging

# スモークテスト
npm run test:smoke:staging

# 本番（複数承認制）
npm run deploy:production

# デプロイ状況モニタ
npm run monitor:deployment

# ロールバック
npm run rollback:production
```

## モニタリングと可観測性

### ヘルスチェック

```bash
# アプリケーションヘルスエンドポイント
GET /health                 # 基本ヘルスチェック
GET /health/detailed        # 詳細コンポーネント状態
GET /health/dependencies    # 外部依存先の状態
GET /metrics                # Prometheusメトリクス

# DBヘルス
GET /health/database        # DB接続＆パフォーマンス
GET /health/redis           # Redis接続＆パフォーマンス

# レスポンス例
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

### ログ構成

```yaml
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
    retention_days: 2555  # 7年
```

### メトリクス・アラート

```yaml
# Prometheusアラート
groups:
  - name: iworkz-alerts
    rules:
      - alert: HighResponseTime
        expr: http_request_duration_seconds > 2
        for: 5m
        annotations:
          summary: "応答遅延発生"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        annotations:
          summary: "高エラー率検出"

      - alert: DatabaseConnectionFailure
        expr: database_connections_failed_total > 0
        for: 1m
        annotations:
          summary: "DB接続失敗"
```

---

## 関連資料

* [クラウドアーキテクチャ](./CLOUD_ARCHITECTURE.md)
* [アーキテクチャ概要](../1_DOCUMENTATION/ARCHITECTURE_OVERVIEW.md)
* [セキュリティプロトコル](../5_SECURITY/SECURITY_PROTOCOLS.md)
