# iWORKZプラットフォーム - 完全デモセットアップガイド（初心者向け）
## プラットフォームをローカルで起動する詳細手順書

### **🎯 本ガイドの目的**
本ガイドは、技術的専門知識を必要とせず、デモ、プレゼンテーション、または開発目的でiWORKZプラットフォーム全体をローカルマシンで起動するための手順を説明します。

### **⏱️ セットアップ時間の目安**
- 初回セットアップ: 30-45分
- 2回目以降の起動: 5-10分

---

## **📋 開始前の準備 - 前提条件の確認**

### **手順1: 必要なソフトウェアの確認**

**コマンドプロンプト**（Windows）または**ターミナル**（Mac/Linux）を開き、以下のコマンドを実行してください：

```bash
# Dockerがインストールされているか確認
docker --version

# Docker Composeがインストールされているか確認
docker-compose --version

# Node.jsがインストールされているか確認
node --version

# Gitがインストールされているか確認
git --version
```

**表示される内容の確認:**
- Docker version 20.x.x以上
- Docker-compose version 1.29.x以上
- Node.js version 18.x.x以上
- Git version 2.x.x以上

### **手順2: 不足しているソフトウェアのインストール**

**Dockerが不足している場合:**
1. https://www.docker.com/products/docker-desktop にアクセス
2. お使いのオペレーティングシステム用のDocker Desktopをダウンロード
3. インストール後、コンピューターを再起動

**Node.jsが不足している場合:**
1. https://nodejs.org にアクセス
2. LTS版をダウンロード
3. デフォルト設定でインストール

**Gitが不足している場合:**
1. https://git-scm.com にアクセス
2. デフォルト設定でダウンロード・インストール

---

## **🚀 プラットフォームセットアップ - 初回のみ**

### **手順3: プラットフォームディレクトリへの移動**

```bash
# コマンドプロンプト/ターミナルを開き、プラットフォームディレクトリに移動
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# Windowsコマンドプロンプトの場合:
cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02
```

### **手順4: 環境変数の設定**

**環境設定テンプレートファイルのコピー:**

```bash
# 全サービスの環境設定ファイルをコピー
cp 2_SERVICES/backend-api/.env.example 2_SERVICES/backend-api/.env
cp 2_SERVICES/ai-agent/.env.example 2_SERVICES/ai-agent/.env
cp 2_SERVICES/web-frontend/.env.example 2_SERVICES/web-frontend/.env.local
cp 2_SERVICES/db-postgres/.env.example 2_SERVICES/db-postgres/.env
cp 2_SERVICES/redis/.env.example 2_SERVICES/redis/.env
```

**Windowsコマンドプロンプトの場合は`copy`を使用:**
```cmd
copy 2_SERVICES\backend-api\.env.example 2_SERVICES\backend-api\.env
copy 2_SERVICES\ai-agent\.env.example 2_SERVICES\ai-agent\.env
copy 2_SERVICES\web-frontend\.env.example 2_SERVICES\web-frontend\.env.local
copy 2_SERVICES\db-postgres\.env.example 2_SERVICES\db-postgres\.env
copy 2_SERVICES\redis\.env.example 2_SERVICES\redis\.env
```

### **手順5: 依存関係のインストール**

```bash
# バックエンドAPI依存関係のインストール
cd 2_SERVICES/backend-api
npm install
cd ../..

# AIエージェント依存関係のインストール
cd 2_SERVICES/ai-agent
pip install -r requirements.txt
cd ../..

# Webフロントエンド依存関係のインストール
cd 2_SERVICES/web-frontend
npm install
cd ../..
```

**注意:** `pip`が見つからない場合は、`python -m pip install -r requirements.txt`をお試しください

---

## **🏃‍♂️ クイックスタート - デモ実行時の手順**

### **手順6: データベースサービスの開始**

```bash
# プロジェクトルートディレクトリに移動
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# PostgreSQLとRedisデータベースを開始
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis
```

**30秒待機**してからデータベースの確認:
```bash
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml ps
```

postgresとredisが「Up」ステータスで表示されることを確認してください。

### **手順7: バックエンドAPIの開始**

**新しいターミナル/コマンドプロンプトウィンドウを開く:**

```bash
# バックエンドAPIディレクトリに移動
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/backend-api

# バックエンドAPIサーバーを開始
npm run dev
```

**表示される内容の確認:**
```
✅ Server running on http://localhost:3000
✅ Database connected successfully
✅ Redis connected successfully
```

**このウィンドウは開いたままにしてください！**

### **手順8: AIエージェントサービスの開始**

**さらに新しいターミナル/コマンドプロンプトウィンドウを開く:**

```bash
# AIエージェントディレクトリに移動
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/ai-agent

# AIエージェントサービスを開始
python src/main.py
```

**表示される内容の確認:**
```
✅ AI Agent service running on http://localhost:3004
✅ Models loaded successfully
✅ Ready to process matching requests
```

**このウィンドウは開いたままにしてください！**

### **手順9: Webフロントエンドの開始**

**さらに新しいターミナル/コマンドプロンプトウィンドウを開く:**

```bash
# Webフロントエンドディレクトリに移動
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/web-frontend

# フロントエンドアプリケーションを開始
npm run dev
```

**表示される内容の確認:**
```
✅ ready - started server on 0.0.0.0:3000, url: http://localhost:3000
✅ info  - Loaded env from .env.local
```

**このウィンドウは開いたままにしてください！**

---

## **🌐 実行中プラットフォームへのアクセス**

### **手順10: ブラウザでプラットフォームを開く**

Webブラウザを開き、以下のURLにアクセス:

**メインプラットフォーム:** http://localhost:3000

**管理者ダッシュボード:** http://localhost:3000/admin

**API仕様書:** http://localhost:3000/api/docs

**ヘルスチェック:** http://localhost:3000/health

### **手順11: 全機能の動作確認**

**メインページの読み込み確認:**
- iWORKZホームページが表示される
- ナビゲーションメニューが応答する
- ブラウザコンソールにエラーメッセージがない（F12キーで確認）

**シンプルなAPI呼び出しのテスト:**
```bash
# 新しいターミナルでAPIをテスト
curl http://localhost:3000/health
```

**期待される応答:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai_agent": "running"
  }
}
```

---

## **🎭 デモシナリオとテストデータ**

### **手順12: デモデータの読み込み（オプション）**

```bash
# データベースサービスディレクトリに移動
cd 2_SERVICES/db-postgres

# デモ用サンプルデータを読み込み
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/05_sample_data.sql
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/06_demo_candidates_data.sql
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/07_demo_companies_data.sql
```

### **手順13: デモ用ユーザーアカウント**

**テスト候補者アカウント:**
- メールアドレス: demo.candidate@iworkz.jp
- パスワード: DemoPassword123!

**テスト雇用主アカウント:**
- メールアドレス: demo.employer@iworkz.jp
- パスワード: DemoPassword123!

**管理者アカウント:**
- メールアドレス: admin@iworkz.jp
- パスワード: AdminPassword123!

### **手順14: 実演可能なデモシナリオ**

**1. 求人検索デモ:**
- http://localhost:3000/jobs にアクセス
- 「React Developer」で検索
- 場所、給与、スキルでのフィルタリングを実演

**2. AI マッチングデモ:**
- 候補者としてログイン
- 「おすすめ求人」に移動
- マッチングスコアと説明を表示

**3. 求人投稿デモ:**
- 雇用主としてログイン
- 新しい求人投稿を作成
- コンプライアンスチェックとAI提案を表示

**4. 管理者ダッシュボードデモ:**
- 管理者としてログイン
- 分析ダッシュボードを表示
- ユーザー活動とプラットフォーム指標を閲覧

---

## **⏹️ プラットフォームの停止**

### **手順15: 正常なシャットダウン**

**デモ終了後にプラットフォームを停止:**

1. **フロントエンド停止:** web-frontendターミナルで`Ctrl+C`

2. **AIエージェント停止:** ai-agentターミナルで`Ctrl+C`

3. **バックエンドAPI停止:** backend-apiターミナルで`Ctrl+C`

4. **データベース停止:**
```bash
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down
```

**すべて停止したことを確認:**
```bash
docker ps
```

iWORKZコンテナが実行されていないことを確認してください。

---

## **🔧 よくある問題のトラブルシューティング**

### **問題1: ポートが既に使用中**

**エラー:** `Port 3000 is already in use`

**解決策:**
```bash
# ポートを使用しているプロセスを確認
netstat -ano | findstr :3000

# プロセスを終了（PIDを実際のプロセスIDに置き換え）
taskkill /PID <PID> /F
```

### **問題2: データベース接続失敗**

**エラー:** `Database connection failed`

**解決策:**
```bash
# データベースを再起動
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml restart postgres

# 30秒待機後、バックエンドAPIを再起動
```

### **問題3: AIエージェントが応答しない**

**エラー:** `AI service unavailable`

**解決策:**
```bash
# Python依存関係がインストールされているか確認
cd 2_SERVICES/ai-agent
pip install -r requirements.txt

# AIエージェントを再起動
python src/main.py
```

### **問題4: フロントエンドが読み込まれない**

**エラー:** `This site can't be reached`

**解決策:**
```bash
# npmキャッシュをクリアして再インストール
cd 2_SERVICES/web-frontend
npm cache clean --force
rm -rf node_modules
npm install
npm run dev
```

### **問題5: Dockerサービスが開始しない**

**エラー:** `Docker daemon is not running`

**解決策:**
1. Docker Desktopアプリケーションを開く
2. 完全に起動するまで待機
3. dockerコマンドを再実行

---

## **📱 モバイルアプリデモ（オプション）**

### **手順16: デモ用モバイルアプリの開始**

**モバイルアプリを表示したい場合:**

```bash
# モバイルアプリディレクトリに移動
cd 2_SERVICES/mobile-app

# 依存関係をインストール
npm install

# Expo開発サーバーを開始
npm start
```

**その後:**
1. スマートフォンにExpo Goアプリをインストール
2. ターミナルに表示されるQRコードをスキャン
3. モバイルアプリがスマートフォンに読み込まれます

---

## **⚡ クイックリファレンスコマンド**

### **すべて開始（コピー&ペースト用）:**

```bash
# 1. データベース開始
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis

# 2. 新しいターミナル - バックエンド開始
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/backend-api
npm run dev

# 3. 新しいターミナル - AIエージェント開始
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/ai-agent
python src/main.py

# 4. 新しいターミナル - フロントエンド開始
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/web-frontend
npm run dev
```

### **すべて停止:**

```bash
# 全サービスターミナルでCtrl+Cを押した後:
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down
```

### **アクセスURL:**
- **メインプラットフォーム:** http://localhost:3000
- **APIヘルス:** http://localhost:3000/health
- **管理者パネル:** http://localhost:3000/admin
- **API仕様書:** http://localhost:3000/api/docs

---

## **🎤 プレゼンテーションのコツ**

### **投資家・ステークホルダー向け:**

1. **メインダッシュボードから開始** - プロフェッショナルなUIを表示
2. **AIマッチングを実演** - コア技術をハイライト
3. **モバイル対応性を表示** - ブラウザウィンドウのリサイズ
4. **日本語サポートを表示** - 設定で言語切替
5. **分析ダッシュボードを表示** - ビジネス指標を提示

### **技術関係者向け:**

1. **API仕様書を表示** - 技術的深度を実証
2. **リアルタイム機能を表示** - WebSocket接続
3. **セキュリティ機能を実演** - 認証フロー
4. **データベース管理を表示** - データ管理
5. **システム監視を表示** - ヘルスチェックと指標

### **重要なトークポイント:**

- ✅ **19のマイクロサービス**がシームレスに動作
- ✅ **AI駆動マッチング**90%以上の精度
- ✅ **日本市場特化**機能
- ✅ **エンタープライズ級セキュリティ**とコンプライアンス
- ✅ **スケーラブルなクラウド対応**アーキテクチャ
- ✅ **モバイルとWebプラットフォーム**完全統合

---

## **📞 サポート＆ヘルプ**

**問題が発生した場合:**

1. **全ターミナルを確認** - エラーメッセージがないか確認
2. **Dockerが動作中か確認** - Docker Desktopをチェック
3. **個別サービスを再起動** - Ctrl+Cで停止して再起動
4. **ポートの可用性を確認** - ポート3000、3004が空いているか確認
5. **環境ファイルを確認** - .envファイルが正しくコピーされているか確認

**重要:** デモ中はすべてのターミナルウィンドウを開いたままにしてください。各サービスは適切に動作するために専用のターミナルウィンドウが必要です。

---

## **🏆 デモの準備完了！**

iWORKZプラットフォームがローカルで実行され、プレゼンテーション準備が整いました。プラットフォームは以下を実証します:

- **完全なAI駆動雇用ソリューション**
- **日本市場特化**
- **エンタープライズ級アーキテクチャ**
- **本格運用対応実装**

**プレゼンテーション成功をお祈りします！ 🚀**

---

*このガイドにより、技術的専門知識なしでも誰でもデモ用にiWORKZプラットフォームを起動できます。すべてのプレゼンテーションニーズに対応するため、このガイドを手元に置いてご活用ください！*