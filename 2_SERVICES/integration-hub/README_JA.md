# インテグレーションハブサービス

## 概要

iWORKZインテグレーションハブは、求人ボード、ATSシステム、給与プロバイダー、本人確認（KYC）サービスなど、全てのサードパーティ連携を管理するNode.js/Expressマイクロサービスです。外部サービスとの通信のための統一APIレイヤーを提供します。

## 特徴

* **マルチプロバイダー対応**：LinkedIn、Indeed、Stripe、Jumio、Workday等との連携
* **Webhook管理**：安全なWebhook処理・検証
* **OAuthフロー**：OAuth2認証フロー完全対応
* **データ同期**：外部APIとの自動データ同期
* **APIプロキシ**：サードパーティサービス呼び出しの統一インターフェース
* **設定管理**：動的な連携設定
* **リアルタイムステータス**：連携ヘルスモニタリング
* **セキュア通信**：APIキーの暗号化管理

## 技術スタック

* **フレームワーク**：Node.js 18+ & Express.js
* **キューシステム**：Bull/Redisによる非同期処理
* **データベース**：連携設定・ログ用PostgreSQL
* **セキュリティ**：Helmet、CORS、資格情報の暗号化保管

## 連携カテゴリ

* **求人ボード**：LinkedIn、Indeed、Glassdoor、Stack Overflow Jobs
* **ATSシステム**：Greenhouse、Lever、Workday、BambooHR
* **給与/EOR**：Deel、Oyster、Remote、Globalization Partners
* **本人確認/KYC**：Jumio、Onfido、Trulioo、Shufti Pro
* **行政機関**：英国Home Office、ドイツ連邦雇用庁
* **コミュニケーション**：Slack、Microsoft Teams、メールプロバイダー

## アーキテクチャ

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client APIs   │────│  Integration Hub │────│  Third-Party    │
│                 │    │                  │    │  Services       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │  Message Queue   │
                       │  (Redis/Bull)    │
                       └──────────────────┘
```

## はじめに

### 前提条件

* Node.js 18+
* npm 8+
* Redis（キュー処理用）
* Docker（コンテナデプロイ用）

### ローカル開発

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env

# 開発サーバー起動
npm run dev

# サービスは http://localhost:3005 で利用可能
```

### Dockerデプロイ

```bash
# イメージビルド
docker build -t iworkz-integration-hub .

# コンテナ起動
docker run -p 3005:3005 -e INTEGRATION_PORT=3005 iworkz-integration-hub
```

## APIエンドポイント

### ヘルス＆ステータス

* `GET /health` - サービスのヘルスチェック
* `GET /status` - サービス機能・有効な連携一覧

### 連携管理

* `GET /api/v1/integrations` - 全連携一覧
* `POST /api/v1/integrations/:id/sync` - データ同期実行
* `GET /api/v1/config/:provider` - プロバイダー設定取得
* `POST /api/v1/config/:provider` - プロバイダー設定更新

### Webhook処理

* `POST /webhooks/:provider` - 外部サービスからのWebhook受信

### OAuth管理

* `GET /api/v1/oauth/:provider/authorize` - OAuth認可URL取得
* `POST /api/v1/oauth/:provider/token` - 認可コードをトークンに交換

### データプロキシ

* `GET /api/v1/proxy/:provider/:endpoint` - 外部APIへのプロキシリクエスト

### レスポンス例

```json
{
  "success": true,
  "integrations": [
    {
      "id": "linkedin",
      "name": "LinkedIn",
      "status": "active",
      "type": "job_board",
      "endpoints": ["jobs", "profiles", "applications"],
      "last_sync": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 4
}
```

## 設定

### 環境変数

* `INTEGRATION_PORT` - サービスポート（デフォルト: 3005）
* `NODE_ENV` - 環境（development/production）
* `POSTGRES_HOST` - データベースホスト
* `POSTGRES_DB` - データベース名
* `POSTGRES_USER` - データベースユーザー
* `POSTGRES_PASSWORD` - データベースパスワード
* `REDIS_URL` - Redis接続URL

### サポート連携

* **LinkedIn**：求人掲載・候補者獲得
* **Indeed**：求人ボード連携・応募管理
* **Stripe**：決済・サブスクリプション管理
* **Jumio**：本人確認・KYC
* **Workday**：HRシステム連携

## 開発セットアップ

```bash
# 依存関係のインストール
npm install

# テスト実行
npm test

# 自動リロードで起動
npm run dev

# 連携ヘルス確認
curl http://localhost:3005/status
```

## セキュリティ＆コンプライアンス

* すべてのAPIキーは暗号化保存
* OAuth2でユーザー認可連携
* Webhook署名検証
* プロバイダー毎のレート制限
* すべての連携アクティビティを監査ログに記録
