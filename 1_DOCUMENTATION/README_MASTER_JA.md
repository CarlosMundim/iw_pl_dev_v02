# iWORKZプラットフォーム - マスターREADME

## 🚀 クイックスタート

### 前提条件

* Windows 10/11（WSL 2 必須）
* Docker Desktop
* VS Code（Remote-WSL拡張機能）
* SSHキー設定済みのGit

### 開発環境セットアップ

```bash
# リポジトリのクローン
git clone git@github.com:your-org/iworkz-platform.git
cd iworkz-platform

# 環境変数ファイルのコピー
cp .env.example .env.local

# 全サービスの起動
docker-compose up -d

# フロントエンドサービスの依存関係をインストール
cd 2_SERVICES/web-frontend && npm install
cd ../mobile-app && npm install
cd ../investors-website && npm install
```

### アクセスポイント

* **Webフロントエンド**: [http://localhost:3000](http://localhost:3000)
* **インベスターズサイト**: [http://localhost:3001](http://localhost:3001)
* **APIドキュメント**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **管理ダッシュボード**: [http://localhost:3002](http://localhost:3002)

## 📁 プロジェクト構成

```
iw_pl_dev_v02/
├── 0_ENV_SETUP/          # 環境セットアップガイド
├── 1_DOCUMENTATION/      # プロジェクトドキュメント
├── 2_SERVICES/           # マイクロサービス・アプリケーション
├── 3_AI_AGENTS/          # AI連携ガイド
├── 4_MISC/               # その他ファイル
├── docker-compose.yml    # コンテナオーケストレーション
└── .env.example          # 環境変数テンプレート
```

## 🛠️ サービス概要

### フロントエンドサービス

* **web-frontend**: メインUI（Next.js）
* **mobile-app**: React Native モバイルアプリ
* **investors-website**: 投資家向けポータル
* **admin-dashboard**: 管理インターフェース

### バックエンドサービス

* **backend-api**: メインAPIゲートウェイとビジネスロジック
* **ai-agent**: AI/MLによるレコメンデーション
* **voice-assistant**: 音声インタラクション処理
* **matching-engine**: 求人・人材マッチングアルゴリズム
* **credential-engine**: 資格認証・検証
* **notification-service**: マルチチャネル通知

### データサービス

* **db-postgres**: メインPostgreSQLデータベース
* **redis**: キャッシュ・セッション管理
* **search**: Elasticsearchによる全文検索

## 🔧 開発ワークフロー

### 日常開発

1. サービス起動: `docker-compose up -d`
2. VS Code（Remote-WSL）で作業
3. 変更を加えローカルでテスト
4. 分かりやすいメッセージでコミット
5. フィーチャーブランチにプッシュしPR作成

### テスト

```bash
# ユニットテスト
npm test

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# Docker上で全テスト
docker-compose -f docker-compose.test.yml up
```

### コード品質

```bash
# リンティング
npm run lint

# 型チェック
npm run typecheck

# コード整形
npm run format

# プリコミットフック
npm run pre-commit
```

## 🚀 デプロイ

### ステージング

```bash
# ステージングへのデプロイ
npm run deploy:staging

# スモークテスト
npm run test:smoke
```

### 本番環境

```bash
# 本番デプロイ（承認必要）
npm run deploy:production

# デプロイ監視
npm run monitor:deployment
```

## 📚 ドキュメントリンク

* [プロジェクト概要](1_DOCUMENTATION/PROJECT_OVERVIEW.md)
* [アーキテクチャガイド](1_DOCUMENTATION/ARCHITECTURE.md)
* [コンテナガイド](1_DOCUMENTATION/CONTAINER_GUIDE.md)
* [デプロイメントガイド](1_DOCUMENTATION/DEPLOYMENT.md)
* [Gitワークフロー](1_DOCUMENTATION/GIT_WORKFLOW.md)

## 🤖 AI連携

* [エージェントプロンプト](3_AI_AGENTS/AGENT_PROMPTS.md)
* [プロンプトエンジニアリング](3_AI_AGENTS/PROMPT_ENGINEERING_GUIDE.md)
* [APIキー設定](3_AI_AGENTS/API_KEYS_GUIDE.md)

## 🆘 サポート

* **Issues**: バグ・機能リクエストはGitHub Issuesへ
* **ドキュメント**: まずドキュメントフォルダを確認
* **環境構築**: 0\_ENV\_SETUP/のガイド参照
* **チャット**: チームSlackチャンネル #iworkz-dev

## 📝 コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチ作成
3. 変更を加える
4. 新機能にはテスト追加
5. 全テストパス確認
6. プルリクエストを提出

## 📄 ライセンス

本プロジェクトは専有・機密です。All rights reserved.
