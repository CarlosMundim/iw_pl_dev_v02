# デプロイメントガイド

## デプロイ環境

### 開発環境

* **場所**：ローカル開発マシン
* **目的**：新機能の開発・テスト
* **構成**：Docker Composeによるローカルサービス
* **データベース**：ローカルPostgreSQLインスタンス
* **モニタリング**：コンソールへの基本的なロギング

### ステージング環境

* **場所**：クラウド基盤（AWS/GCP）
* **目的**：統合テスト・QA検証
* **構成**：Kubernetesクラスタ
* **データベース**：マネージドPostgreSQLサービス
* **モニタリング**：フルオブザーバビリティスタック

### 本番環境

* **場所**：マルチリージョンクラウドデプロイメント
* **目的**：実ユーザー向け本番運用
* **構成**：オートスケーリング対応Kubernetes
* **データベース**：高可用性PostgreSQLクラスタ
* **モニタリング**：24時間365日監視とアラート通知

---

## CI/CDパイプライン

### GitHub Actionsワークフロー

```yaml
name: Deploy iWORKZ Platform
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm test
          docker-compose -f docker-compose.test.yml up --abort-on-container-exit
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push images
        run: |
          docker build -t iworkz/frontend .
          docker push iworkz/frontend:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/frontend frontend=iworkz/frontend:${{ github.sha }}
```

### デプロイ手順

1. **コードコミット**：開発者がリポジトリへプッシュ
2. **自動テスト**：ユニット・統合・e2eテスト
3. **ビルドプロセス**：Dockerイメージのビルド・タグ付け
4. **セキュリティスキャン**：脆弱性チェック
5. **ステージングデプロイ**：ステージング環境にデプロイ
6. **QA検証**：手動・自動テスト実施
7. **本番デプロイ**：ブルーグリーンデプロイ戦略
8. **モニタリング**：ヘルスチェック・パフォーマンス監視

---

## Infrastructure as Code（コード化インフラ）

### Terraform構成例

```hcl
# VPCとネットワーク
resource "aws_vpc" "iworkz_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
}

# EKSクラスタ
resource "aws_eks_cluster" "iworkz_cluster" {
  name     = "iworkz-production"
  role_arn = aws_iam_role.cluster_role.arn
  version  = "1.27"
  
  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "iworkz_db" {
  identifier     = "iworkz-production"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.large"
  allocated_storage = 100
  
  db_name  = "iworkz"
  username = "iworkz_admin"
  password = var.db_password
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
}
```

---

## Kubernetesマニフェスト

### フロントエンドデプロイメント例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
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
          value: "http://backend-api:8000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## モニタリング・アラート

* **アプリケーション指標**：レスポンスタイム、エラー率、スループット
* **インフラ指標**：CPU、メモリ、ディスク、ネットワーク利用状況
* **ビジネス指標**：ユーザー登録数、マッチング成功数、売上
* **アラート**：重要障害時はPagerDuty連携
* **ダッシュボード**：ステークホルダー向けGrafanaダッシュボード

---

## バックアップ・リカバリ

* **DBバックアップ**：30日保持の毎日自動バックアップ
* **アプリデータ**：ユーザーアップロードの増分バックアップ
* **構成管理**：バージョン管理されたインフラコード
* **ディザスタリカバリ**：マルチリージョン展開＋フェイルオーバー対応
