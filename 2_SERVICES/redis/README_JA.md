# Redisサービス

## 概要

キャッシュ、セッション管理、リアルタイム機能のための高性能インメモリデータストアです。

## 設定

* **バージョン**: Redis 7以上
* **メモリ**: 2GB割り当て
* **永続化**: RDB + AOF
* **クラスタリング**: シングルインスタンス（開発）、Redis Cluster（本番）
* **セキュリティ**: AUTH有効化、本番環境ではTLS対応

## 開発セットアップ

```bash
# Redisコンテナ起動
docker-compose up redis -d

# Redis CLI接続
docker-compose exec redis redis-cli

# Redisのモニター
docker-compose exec redis redis-cli monitor

# Redis情報の確認
docker-compose exec redis redis-cli info
```

## ユースケース

### キャッシュレイヤー

* データベースクエリ結果のキャッシュ
* APIレスポンスのキャッシュ
* 計算済みデータの保存
* 頻繁にアクセスされるオブジェクトの管理

### セッション管理

* ユーザーセッションの保存
* JWTトークンのブラックリスト化
* 一時的な認証コード
* レート制限カウンター

### リアルタイム機能

* WebSocket接続管理
* リアルタイム通知
* チャットメッセージのキューイング
* アクティビティフィード

### バックグラウンドジョブ

* ジョブキュー管理
* タスクスケジューリング
* 進捗トラッキング
* 結果の保存

## 利用データ構造

### 文字列（Strings）

```redis
# ユーザーセッション
SET session:user:123 "jwt_token_here" EX 3600

# APIレート制限
INCR rate_limit:api:user:123
EXPIRE rate_limit:api:user:123 60

# フィーチャーフラグ
SET feature:ai_matching:enabled "true"
```

### ハッシュ（Hashes）

```redis
# ユーザープロファイルキャッシュ
HSET user:123 name "John Doe" email "john@example.com" role "candidate"

# 求人応募キャッシュ
HSET application:456 job_id "789" candidate_id "123" status "pending"
```

### リスト（Lists）

```redis
# 最近のアクティビティ
LPUSH user:123:activities "Applied to job X"
LTRIM user:123:activities 0 99  # 最新100件のみ保持

# メッセージキュー
LPUSH job_queue "process_application:456"
```

### セット（Sets）

```redis
# ユーザースキル
SADD user:123:skills "javascript" "python" "react"

# 求人要件
SADD job:789:requirements "javascript" "nodejs" "mongodb"

# オンラインユーザー
SADD online_users "user:123" "user:456"
```

### ソート済みセット（Sorted Sets）

```redis
# リーダーボード
ZADD user_scores 1500 "user:123" 1200 "user:456"

# スコア順求人推薦
ZADD user:123:job_recommendations 0.95 "job:789" 0.87 "job:456"

# 最近の応募
ZADD recent_applications 1640995200 "app:123" 1640995300 "app:124"
```

### ストリーム（Streams）

```redis
# リアルタイムイベント
XADD events * event_type "job_applied" user_id "123" job_id "789"

# 通知ストリーム
XADD notifications * user_id "123" type "message" content "New job match found"
```

## Redisモジュール

### RedisJSON

```redis
# 複雑なJSONオブジェクトの保存
JSON.SET user:123 $ '{"name":"John","skills":["js","python"],"preferences":{"remote":true}}'

# JSONデータのクエリ
JSON.GET user:123 $.skills
```

### RediSearch

```redis
# 求人検索インデックスの作成
FT.CREATE jobs_idx ON JSON PREFIX 1 job: SCHEMA $.title AS title TEXT $.location AS location TAG
```

## パフォーマンス最適化

### メモリ最適化

```redis
# 適切なデータ型を使用
# 大きな値は圧縮
# 一時データにはTTL設定
# メモリ使用量の監視

# Redis設定
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### コネクションプーリング

```javascript
// Node.js Redisコネクションプール
const redis = require('ioredis');
const cluster = new redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 }
]);
```

## モニタリングとアラート

### 主要メトリクス

* メモリ使用量・断片化
* 秒間コマンド数
* キャッシュのヒット/ミス比率
* コネクション数
* スローログ解析

### Redis CLIコマンド

```bash
# パフォーマンス監視
INFO memory
INFO stats
INFO clients

# スロークエリ確認
SLOWLOG GET 10

# コマンド監視
MONITOR

# キースペース確認
INFO keyspace
```

## バックアップと永続化

### RDBスナップショット

```redis
# 手動スナップショット
BGSAVE

# 自動スナップショット
save 900 1      # 900秒以内に1件以上変更があれば保存
save 300 10     # 300秒以内に10件以上変更があれば保存
save 60 10000   # 60秒以内に10000件以上変更があれば保存
```

### AOF（Append Only File）

```redis
# AOF有効化
appendonly yes
appendfsync everysec

# AOFリライト
BGREWRITEAOF
```

## セキュリティ設定

```redis
# パスワード設定
requirepass your_strong_password

# 危険なコマンド無効化
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG_abc123"

# バインド先インターフェース指定
bind 127.0.0.1 10.0.0.1

# 本番環境でのTLS有効化
tls-port 6380
tls-cert-file /etc/redis/tls/redis.crt
tls-key-file /etc/redis/tls/redis.key
```
