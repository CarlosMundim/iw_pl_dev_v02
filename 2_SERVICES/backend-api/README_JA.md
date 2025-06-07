# バックエンドAPIサービス

## 概要

iWORKZプラットフォームの主要なAPIゲートウェイおよびビジネスロジックエンジンです。Node.js、Express、TypeScriptで構築されています。

## 技術スタック

* **実行環境**：Node.js 18+
* **フレームワーク**：Express.js（TypeScript）
* **データベース**：PostgreSQL（Prisma ORM）
* **認証**：JWT & Passport.js
* **バリデーション**：Joi / Zod
* **ドキュメント**：Swagger / OpenAPI
* **テスト**：Jest & Supertest

## 開発セットアップ

```bash
# 依存関係のインストール
npm install

# データベースのセットアップとマイグレーション
npm run db:migrate
npm run db:seed

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# APIドキュメント生成
npm run docs:generate
```

## APIアーキテクチャ

```
├── 認証 & 認可
├── ユーザー管理
├── ジョブマッチング & 推薦
├── 資格認証検証
├── リアルタイムメッセージング
├── ファイルアップロード & 処理
├── 通知管理
└── 分析 & レポーティング
```

## 主な特徴

* RESTful API設計
* JWT認証とRBAC
* リクエストレート制限＆セキュリティヘッダー
* 入力バリデーションとサニタイズ
* 包括的なエラーハンドリング
* APIバージョニング対応

## データベーススキーマ

* **Users**：認証・プロフィール情報
* **Jobs**：求人情報・要件
* **Applications**：応募トラッキング
* **Credentials**：認証済み資格
* **Messages**：プラットフォーム内通信
* **Notifications**：通知・アラート
* **Analytics**：利用状況・指標

## セキュリティ機能

* JWTトークン管理
* bcryptによるパスワードハッシュ化
* 入力バリデーションとサニタイズ
* SQLインジェクション防止
* CORS設定
* セキュリティヘッダー（Helmet.js）
* レート制限とDDoS対策

## APIエンドポイント例

```
GET    /api/v1/users/:id
POST   /api/v1/auth/login
GET    /api/v1/jobs
POST   /api/v1/jobs
GET    /api/v1/matches/:userId
POST   /api/v1/applications
GET    /api/v1/credentials/:userId
POST   /api/v1/credentials/verify
```

## 環境変数例

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/iworkz
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```
