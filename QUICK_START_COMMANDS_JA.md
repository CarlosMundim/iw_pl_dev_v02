# iWORKZプラットフォーム - クイックスタートコマンド集
## 即座にデモ環境をセットアップするためのコピー&ペーストコマンド

### **🚀 ワンコマンド起動（Windows用）**

```cmd
@echo off
echo iWORKZプラットフォームを開始しています...
echo.

echo [1/4] データベースを開始中...
cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis

echo [2/4] データベースの初期化を待機中...
timeout /t 30 /nobreak

echo [3/4] バックエンドサービスを開始中...
start cmd /k "cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\2_SERVICES\backend-api && npm run dev"
timeout /t 5 /nobreak

start cmd /k "cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\2_SERVICES\ai-agent && python src/main.py"
timeout /t 5 /nobreak

echo [4/4] Webフロントエンドを開始中...
start cmd /k "cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\2_SERVICES\web-frontend && npm run dev"

echo.
echo ✅ プラットフォームが起動中です！
echo ⏱️  全サービスの初期化まで2-3分お待ちください
echo 🌐 その後こちらにアクセス: http://localhost:3000
echo.
pause
```

### **🚀 ワンコマンド起動（Mac/Linux用）**

```bash
#!/bin/bash
echo "iWORKZプラットフォームを開始しています..."
echo

echo "[1/4] データベースを開始中..."
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis

echo "[2/4] データベースの初期化を待機中..."
sleep 30

echo "[3/4] バックエンドサービスを開始中..."
gnome-terminal -- bash -c "cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/backend-api && npm run dev; exec bash"
sleep 5

gnome-terminal -- bash -c "cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/ai-agent && python src/main.py; exec bash"
sleep 5

echo "[4/4] Webフロントエンドを開始中..."
gnome-terminal -- bash -c "cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/web-frontend && npm run dev; exec bash"

echo
echo "✅ プラットフォームが起動中です！"
echo "⏱️  全サービスの初期化まで2-3分お待ちください"
echo "🌐 その後こちらにアクセス: http://localhost:3000"
echo
```

---

## **⚡ 個別サービスコマンド**

### **データベースサービス**
```bash
# データベースのみ開始
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis

# データベース状態確認
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml ps

# データベース停止
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down
```

### **バックエンドAPI**
```bash
# 移動して開始
cd 2_SERVICES/backend-api
npm run dev

# 開発モード代替
npm run start:dev

# 本格運用モード
npm start
```

### **AIエージェントサービス**
```bash
# 移動して開始
cd 2_SERVICES/ai-agent
python src/main.py

# デバッグ付き
python -m debugpy --listen 5678 src/main.py

# バックグラウンドモード
nohup python src/main.py &
```

### **Webフロントエンド**
```bash
# 移動して開始
cd 2_SERVICES/web-frontend
npm run dev

# 本格運用ビルドと開始
npm run build
npm start

# ターボモード（高速）
npm run turbo
```

---

## **🔍 ステータス確認コマンド**

### **クイックヘルスチェック**
```bash
# 全サービスの応答確認
curl http://localhost:3000/health
curl http://localhost:3004/health

# データベース接続確認
docker exec -it iworkz-postgres pg_isready -U postgres
docker exec -it iworkz-redis redis-cli ping
```

### **詳細ステータス確認**
```bash
# 実行中プロセス確認
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# サービスログ確認
docker logs iworkz-postgres --tail 10
docker logs iworkz-redis --tail 10

# Node.jsプロセス確認
ps aux | grep node
ps aux | grep python
```

---

## **🎯 デモ専用コマンド**

### **デモデータ読み込み**
```bash
# プレゼンテーション用全デモデータ読み込み
cd 2_SERVICES/db-postgres
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/05_sample_data.sql
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/06_demo_candidates_data.sql
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/07_demo_companies_data.sql
```

### **デモユーザー作成**
```bash
# API経由でデモアカウント作成
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.candidate@iworkz.jp",
    "password": "DemoPassword123!",
    "firstName": "デモ",
    "lastName": "候補者",
    "role": "candidate"
  }'

curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.employer@iworkz.jp",
    "password": "DemoPassword123!",
    "firstName": "デモ",
    "lastName": "雇用主",
    "role": "employer",
    "companyName": "デモ株式会社"
  }'
```

---

## **🛑 緊急停止コマンド**

### **全サービス即座停止**
```bash
# 全Node.jsプロセス終了
pkill -f node

# 全Pythonプロセス終了
pkill -f python

# 全Dockerコンテナ停止
docker stop $(docker ps -q)

# 核オプション - すべて停止
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down
sudo systemctl stop docker  # Linuxのみ
```

### **ポート解放**
```bash
# Windows - ポート3000のプロセス終了
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux - ポート3000のプロセス終了
lsof -ti:3000 | xargs kill -9
lsof -ti:3004 | xargs kill -9
```

---

## **🔧 トラブルシューティングコマンド**

### **すべてリセット**
```bash
# 全サービス停止
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down

# コンテナとボリューム削除
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down -v

# Dockerシステムクリーン
docker system prune -f

# 新規再起動
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis
```

### **権限問題修正**
```bash
# Linux/Mac - ファイル権限修正
sudo chown -R $USER:$USER /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02
chmod -R 755 /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# NPM権限修正
sudo chown -R $USER ~/.npm
```

### **キャッシュクリア**
```bash
# NPMキャッシュクリア
npm cache clean --force

# 全node_modulesクリアして再インストール
find . -name "node_modules" -type d -exec rm -rf {} +
find . -name "package-lock.json" -delete
cd 2_SERVICES/backend-api && npm install
cd ../web-frontend && npm install
cd ../..
```

---

## **📊 監視コマンド**

### **リアルタイムログ**
```bash
# バックエンドAPIログ追跡
cd 2_SERVICES/backend-api
tail -f logs/app.log

# データベースログ追跡
docker logs -f iworkz-postgres

# 全Dockerログ追跡
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml logs -f
```

### **パフォーマンス監視**
```bash
# リソース使用量確認
docker stats

# システムリソース確認
htop  # Linux/Mac
tasklist  # Windows

# ネットワーク接続監視
netstat -an | grep :3000
netstat -an | grep :3004
```

---

## **🎨 カスタマイゼーションコマンド**

### **ポート変更（必要な場合）**
```bash
# バックエンドAPIポート（package.json編集）
cd 2_SERVICES/backend-api
sed -i 's/3000/3001/g' package.json

# フロントエンドポート
cd 2_SERVICES/web-frontend
export PORT=3001
npm run dev
```

### **デバッグモード有効化**
```bash
# デバッグ付きバックエンド
cd 2_SERVICES/backend-api
DEBUG=* npm run dev

# 詳細ログ付きAIエージェント
cd 2_SERVICES/ai-agent
PYTHONPATH=. python -m pdb src/main.py
```

---

## **📱 モバイルアプリコマンド**

### **モバイル開発開始**
```bash
# Expoインストールと開始
cd 2_SERVICES/mobile-app
npm install -g @expo/cli
npm install
npm start

# iOSシミュレータ用
npm run ios

# Androidエミュレータ用
npm run android
```

---

## **🌍 ブラウザ自動化**

### **デモURL自動オープン**
```bash
# Windows
start http://localhost:3000
start http://localhost:3000/admin
start http://localhost:3000/api/docs

# Mac
open http://localhost:3000
open http://localhost:3000/admin
open http://localhost:3000/api/docs

# Linux
xdg-open http://localhost:3000
xdg-open http://localhost:3000/admin
xdg-open http://localhost:3000/api/docs
```

---

## **💾 バックアップコマンド**

### **デモデータバックアップ**
```bash
# データベースバックアップ
docker exec iworkz-postgres pg_dump -U postgres iworkz > backup_$(date +%Y%m%d).sql

# アップロードファイルバックアップ
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz 2_SERVICES/backend-api/uploads/
```

---

## **🎯 プレゼンテーションショートカット**

### **デモシナリオ1: 求人検索**
```bash
# 求人データ事前投入
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @demo_job_data.json
```

### **デモシナリオ2: AIマッチング**
```bash
# デモ用AIマッチング実行
curl -X POST http://localhost:3000/api/v1/matching/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "demo-job-123",
    "limit": 5
  }'
```

---

## **🎯 企業向けプレゼンテーション特別コマンド**

### **日本語デモ環境設定**
```bash
# 日本語ロケール設定
export LANG=ja_JP.UTF-8
export LC_ALL=ja_JP.UTF-8

# 日本時間設定
export TZ=Asia/Tokyo
```

### **投資家向けデモデータ**
```bash
# 高度な分析データ読み込み
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/08_investor_demo_data.sql

# 収益性指標表示用データ
curl -X POST http://localhost:3000/api/v1/analytics/load-demo-metrics \
  -H "Content-Type: application/json" \
  -d '{"scenario": "investor_presentation"}'
```

### **政府機関向けコンプライアンスデモ**
```bash
# コンプライアンスレポート生成
curl -X GET "http://localhost:3000/api/v1/compliance/reports?start_date=2024-01-01&end_date=2024-12-31&report_type=employment_law"

# 監査ログ表示
curl -X GET "http://localhost:3000/api/v1/audit/logs?limit=50"
```

---

**🎉 これらのコマンドでiWORKZプラットフォームがあらゆるデモやプレゼンテーションに対応できます！**

*プレゼンテーション中のクイックリファレンス用にこのファイルを保存してください。*