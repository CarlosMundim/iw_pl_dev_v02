# 🚀 iWORKZプラットフォーム - デプロイメント＆バックアップ設定

## 📋 リポジトリ＆デプロイメント戦略

### **ステップ1: GitHubリポジトリ設定**

#### **1.1 GitHubリポジトリの作成**
```bash
# プロジェクトルートに移動
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# gitリポジトリを初期化
git init

# .gitignoreファイルを作成
cat > .gitignore << 'EOF'
# 依存関係
node_modules/
*/node_modules/
__pycache__/
*.pyc
.env
.env.local
.env.production

# ビルド出力
.next/
dist/
build/

# ログ
*.log
logs/

# データベース
*.db
*.sqlite

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Docker
docker-compose.override.yml

# 一時ファイル
*.tmp
*.temp

# APIキー（セキュリティ）
.env.*
!.env.example
EOF

# すべてのファイルを追加
git add .

# 初期コミット
git commit -m "初期コミット: iWORKZプラットフォーム - AI駆動グローバル人材マッチング

- 完全なマイクロサービスアーキテクチャ
- ゼロコストデモ用モックAIサービス  
- フルスタックプラットフォーム: React フロントエンド + Node.js API + Python AI
- サンプルデータ付きPostgreSQLデータベース
- Redisキャッシュとセッション管理
- Dockerコンテナ化
- 包括的なドキュメンテーション

機能:
- AI駆動履歴書解析
- インテリジェント求人・候補者マッチング
- 多管轄コンプライアンスチェック
- リアルタイム分析ダッシュボード
- モダンレスポンシブUI/UX

投資家デモとステークホルダープレゼンテーション準備完了。"
```

#### **1.2 GitHubにプッシュ**
```bash
# まずGitHub.comでリポジトリを作成し、その後:
git remote add origin https://github.com/YOUR_USERNAME/iworkz-platform.git
git branch -M main
git push -u origin main
```

### **ステップ2: Vercelデプロイメント設定**

#### **2.1 フロントエンドデプロイメント（Web-Frontend）**
```bash
# Vercel CLIをインストール
npm i -g vercel

# フロントエンドに移動
cd 2_SERVICES/web-frontend

# Vercelにデプロイ
vercel

# プロンプトに従って:
# - セットアップしてデプロイ: Yes
# - どのスコープ: [あなたのアカウント]
# - 既存プロジェクトにリンク: No
# - プロジェクト名: iworkz-web-frontend
# - ディレクトリ: ./
# - 設定をオーバーライド: No
```

#### **2.2 バックエンドAPIデプロイメント**
```bash
# バックエンドに移動
cd ../backend-api

# バックエンドAPIをデプロイ
vercel

# プロジェクト名: iworkz-backend-api
# ビルドコマンド: npm run build
# 出力ディレクトリ: dist
# インストールコマンド: npm install
```

#### **2.3 AIエージェントデプロイメント**
```bash
# AIエージェントに移動
cd ../ai-agent

# Pythonデプロイメント用vercel.jsonを作成
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.py"
    }
  ]
}
EOF

# AIサービスをデプロイ
vercel

# プロジェクト名: iworkz-ai-agent
```

### **ステップ3: 環境設定**

#### **3.1 Vercel環境変数**
```bash
# 各Vercelプロジェクトで環境変数を追加:

# Webフロントエンド
vercel env add NEXT_PUBLIC_API_URL
# 値: https://iworkz-backend-api.vercel.app/api/v1

vercel env add NEXT_PUBLIC_AI_URL  
# 値: https://iworkz-ai-agent.vercel.app

# バックエンドAPI
vercel env add DATABASE_URL
# 値: [本番データベースURL]

vercel env add REDIS_URL
# 値: [本番Redis URL]

vercel env add USE_MOCK_AI
# 値: true

# AIエージェント
vercel env add USE_MOCK_AI
# 値: true

vercel env add MOCK_RESPONSE_DELAY
# 値: 0.8
```

#### **3.2 本番データベース設定**
```bash
# オプション1: Railway（デモ推奨）
# 1. railway.appでサインアップ
# 2. 新しいプロジェクトを作成
# 3. PostgreSQLサービスを追加
# 4. 接続文字列をVercel環境にコピー

# オプション2: Supabase（無料枠）
# 1. supabase.comでサインアップ
# 2. 新しいプロジェクトを作成
# 3. Vercelで接続文字列を使用

# オプション3: PlanetScale（MySQL代替）
# 1. planetscale.comでサインアップ
# 2. データベースを作成
# 3. 接続文字列を使用
```

### **ステップ4: Googleドライブバックアップ**

#### **4.1 バックアップアーカイブの作成**
```bash
# プロジェクトルートに移動
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# node_modulesとビルドファイルを除外してバックアップを作成
tar -czf iworkz-platform-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='*.log' \
  .

# これで作成されます: iworkz-platform-backup-YYYYMMDD.tar.gz
```

#### **4.2 Googleドライブにアップロード**
```bash
# drive.google.com経由で手動アップロード
# またはGoogle Drive Desktopの同期を使用
# またはgdrive CLIツールを使用:

# gdrive CLIをインストール
# ダウンロード: https://github.com/prasmussen/gdrive
# 認証設定に従って実施

# バックアップをアップロード
gdrive upload iworkz-platform-backup-$(date +%Y%m%d).tar.gz
```

### **ステップ5: 自動バックアップスクリプト**

#### **5.1 バックアップ自動化の作成**
```bash
# バックアップスクリプトを作成
cat > backup-platform.sh << 'EOF'
#!/bin/bash

# iWORKZプラットフォームバックアップスクリプト
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="iworkz-platform-backup-$DATE"
PROJECT_DIR="/mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02"

echo "🔄 iWORKZプラットフォームバックアップを作成中..."

# アーカイブを作成
cd "$PROJECT_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='*.log' \
  --exclude='.env.local' \
  .

# バックアップディレクトリに移動
mkdir -p ~/iworkz-backups
mv "${BACKUP_NAME}.tar.gz" ~/iworkz-backups/

echo "✅ バックアップ作成完了: ~/iworkz-backups/${BACKUP_NAME}.tar.gz"

# オプション: Googleドライブにアップロード
# gdrive upload "~/iworkz-backups/${BACKUP_NAME}.tar.gz"

echo "📁 バックアップのGoogleドライブアップロード準備完了"
EOF

# 実行可能にする
chmod +x backup-platform.sh

# バックアップを実行
./backup-platform.sh
```

### **ステップ6: 本番URL**

#### **6.1 期待されるデプロイメントURL**
```bash
# 成功したデプロイメント後:

# フロントエンド（メインアプリ）
https://iworkz-web-frontend.vercel.app

# バックエンドAPI
https://iworkz-backend-api.vercel.app

# AIエージェントサービス  
https://iworkz-ai-agent.vercel.app

# APIドキュメンテーション
https://iworkz-backend-api.vercel.app/docs
https://iworkz-ai-agent.vercel.app/docs
```

#### **6.2 カスタムドメイン設定（オプション）**
```bash
# Vercelダッシュボードで:
# 1. プロジェクト設定に移動
# 2. カスタムドメインを追加
# 3. DNSレコードを設定

# ドメイン例:
# app.iworkz.com → web-frontend
# api.iworkz.com → backend-api  
# ai.iworkz.com → ai-agent
```

## 🎯 デプロイメントチェックリスト

### **GitHubリポジトリ**
- [ ] リポジトリが作成されプッシュ済み
- [ ] プロジェクト説明付きREADME.md
- [ ] 適切な.gitignore設定
- [ ] すべてのシークレットがリポジトリから除外
- [ ] ドキュメンテーションファイルが含まれている

### **Vercelデプロイメント**
- [ ] フロントエンドがデプロイされアクセス可能
- [ ] バックエンドAPIがヘルスチェック付きでデプロイ済み
- [ ] AIエージェントがモックレスポンス付きでデプロイ済み
- [ ] 環境変数が設定済み
- [ ] カスタムドメインが設定済み（オプション）

### **データベース＆インフラストラクチャ**
- [ ] 本番データベースがプロビジョニング済み
- [ ] Redisキャッシュサービスが設定済み
- [ ] サンプルデータがロード済み
- [ ] 接続文字列が保護済み

### **バックアップ戦略**
- [ ] ローカルバックアップが作成されテスト済み
- [ ] Googleドライブバックアップがアップロード済み
- [ ] 自動バックアップスクリプトが作成済み
- [ ] バックアップスケジュールが確立済み

## 🚀 ゴーライブコマンド

### **クイックデプロイメント**
```bash
# 1. GitHubにプッシュ
git add . && git commit -m "本番準備完了" && git push

# 2. すべてのサービスをデプロイ
cd 2_SERVICES/web-frontend && vercel --prod
cd ../backend-api && vercel --prod  
cd ../ai-agent && vercel --prod

# 3. 本番をテスト
curl https://iworkz-backend-api.vercel.app/health
curl https://iworkz-ai-agent.vercel.app/health

# 4. バックアップを作成
./backup-platform.sh
```

### **ステークホルダー向けデモURL**
```bash
# ライブデモ用に以下のURLを共有:
🌐 プラットフォーム: https://iworkz-web-frontend.vercel.app
📚 APIドキュメント: https://iworkz-backend-api.vercel.app/docs
🤖 AIドキュメント: https://iworkz-ai-agent.vercel.app/docs
```

## 💡 開発者のためのコツ

- **本番でモックモードを使用** してコスト効率的なデモを実現
- **Vercelログを監視** してデプロイメントの問題をデバッグ  
- **カスタムドメインを設定** してプロフェッショナルなプレゼンテーションを実現
- **大きな変更前に定期的なバックアップ** を実施
- **ローカルと本番間の環境パリティ** を維持

**あなたのプラットフォームは、グローバルアクセスと投資家プレゼンテーションの準備が整いました!** 🎉