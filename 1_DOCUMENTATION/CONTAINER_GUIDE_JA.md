# コンテナガイド

## Dockerサービス概要

iWORKZプラットフォームは、Dockerコンテナを活用して一貫した開発・デプロイ環境を実現します。

---

## サービス構成

### フロントエンドサービス

```yaml
# Webフロントエンド
web-frontend:
  build: ./2_SERVICES/web-frontend
  ports: ["3000:3000"]
  environment:
    - NODE_ENV=development
    - NEXT_PUBLIC_API_URL=http://localhost:8000

# モバイルアプリ（開発サーバー）
mobile-app-dev:
  build: ./2_SERVICES/mobile-app
  ports: ["19000:19000", "19001:19001", "19002:19002"]
  
# 投資家向けサイト
investors-website:
  build: ./2_SERVICES/investors-website
  ports: ["3001:3000"]
```

### バックエンドサービス

```yaml
# APIゲートウェイ
backend-api:
  build: ./2_SERVICES/backend-api
  ports: ["8000:8000"]
  depends_on: [db-postgres, redis]
  
# AIエージェントサービス
ai-agent:
  build: ./2_SERVICES/ai-agent
  ports: ["8001:8000"]
  environment:
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    
# マッチングエンジン
matching-engine:
  build: ./2_SERVICES/matching-engine
  ports: ["8002:8000"]
```

### データサービス

```yaml
# PostgreSQLデータベース
db-postgres:
  image: postgres:15
  ports: ["5432:5432"]
  environment:
    - POSTGRES_DB=iworkz
    - POSTGRES_USER=iworkz_user
    - POSTGRES_PASSWORD=${DB_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
    
# Redisキャッシュ
redis:
  image: redis:7-alpine
  ports: ["6379:6379"]
  volumes:
    - redis_data:/data
    
# Elasticsearch
search:
  image: elasticsearch:8.8.0
  ports: ["9200:9200", "9300:9300"]
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
```

---

## コンテナ管理

### 開発ワークフロー

```bash
# すべてのサービスを起動
docker-compose up -d

# ログを表示
docker-compose logs -f [サービス名]

# 特定サービスの再起動
docker-compose restart [サービス名]

# サービスを再ビルド
docker-compose build [サービス名]

# コンテナ内でコマンド実行
docker-compose exec [サービス名] bash
```

### 本番運用での考慮点

* マルチステージビルドでイメージを小型化
* すべてのサービスにヘルスチェックを実装
* リソース制限と予約を設定
* 機密データにはシークレット管理を利用
* ログ集約のためロギングドライバーを有効化

### ネットワーク

* サービス間は内部Dockerネットワークで通信
* 外部公開は明示的に公開されたポートのみ
* サービス名で相互接続可能
* サービスディスカバリを活用し動的スケールにも対応

### データ永続化

* DBデータはネームドボリュームで保持
* アプリケーションログはホストファイルシステムにマウント
* 設定ファイルはバインドマウントで共有
* 重要データのバックアップ戦略も構築

### モニタリング

```yaml
# Prometheus
prometheus:
  image: prom/prometheus
  ports: ["9090:9090"]
  
# Grafana
grafana:
  image: grafana/grafana
  ports: ["3100:3000"]
```
