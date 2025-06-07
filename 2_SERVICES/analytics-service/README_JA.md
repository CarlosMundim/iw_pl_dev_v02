# 分析サービス（Analytics Service）

## 概要

iWORKZ Analytics Serviceは、FastAPIベースのマイクロサービスであり、プラットフォーム全体の分析、リアルタイム指標、ダッシュボードデータ、ビジネスインテリジェンスを提供します。

## 主な機能

* **リアルタイムダッシュボード**：ライブ指標・KPI
* **ユーザー分析**：エンゲージメント、リテンション、獲得状況
* **求人パフォーマンス**：投稿成功率・採用までの期間分析
* **マッチング分析**：アルゴリズムのパフォーマンス・成功指標
* **収益分析**：ビジネスメトリクス・成長トラッキング
* **チャート生成**：動的グラフデータ出力
* **エクスポート**：レポート生成とデータ出力
* **予測分析**：成長予測・トレンド分析

## 技術スタック

* **フレームワーク**：FastAPI（Python 3.11+）
* **データ処理**：Pandas, NumPy
* **データベース**：PostgreSQL（構造化データ）、Redis（キャッシュ）
* **可視化**：Plotly（グラフ生成）
* **テンプレート**：Jinja2（レポートテンプレート）

## 主な指標

* **採用成功率**：採用までの期間、定着率、満足度
* **プラットフォーム利用**：ユーザーエンゲージメント、機能利用、セッション分析
* **コンプライアンス**：監査証跡の完全性、法令遵守
* **財務**：クライアントごとの収益、採用単価、ROI指標
* **運用**：システムパフォーマンス、API応答時間、エラー率

## ダッシュボードカテゴリ

* **エグゼクティブダッシュボード**：上位KPI・ビジネスメトリクス
* **クライアントポータル**：採用トラッキング・ワークフォース分析
* **運用ダッシュボード**：システムヘルス・パフォーマンス監視
* **コンプライアンスダッシュボード**：法令遵守・アラート

## はじめに

### 必要条件

* Python 3.11+
* pip
* Docker（コンテナデプロイ用）

### ローカル開発

```bash
# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# 開発サーバー起動
uvicorn src.main:app --reload --port 8004

# http://localhost:8004 でサービス稼働
# http://localhost:8004/docs でAPIドキュメント閲覧
```

### Dockerデプロイ

```bash
# イメージビルド
docker build -t iworkz-analytics-service .

# コンテナ起動
docker run -p 8004:8004 -e ANALYTICS_PORT=8004 iworkz-analytics-service
```

## APIエンドポイント

### ヘルス＆ステータス

* `GET /health` - サービスヘルスチェック
* `GET /status` - サービス機能確認

### ダッシュボードAPI

* `GET /api/v1/dashboard` - メインダッシュボード概要データ
* `GET /api/v1/metrics/users` - 詳細なユーザー分析
* `GET /api/v1/metrics/jobs` - 求人パフォーマンス指標
* `GET /api/v1/metrics/matching` - マッチングアルゴリズムパフォーマンス
* `GET /api/v1/metrics/revenue` - ビジネス・収益分析

### チャートAPI

* `GET /api/v1/charts/user-growth` - ユーザー成長グラフ
* `GET /api/v1/charts/job-categories` - 求人カテゴリ分布

### レポート＆エクスポート

* `GET /api/v1/reports/summary` - 総合分析サマリー
* `GET /api/v1/export/{report_type}` - 各種フォーマットでのレポート出力

### レスポンス例

```json
{
  "total_users": 1347,
  "total_jobs": 892,
  "total_matches": 3247,
  "success_rate": 0.89,
  "revenue": 67430.50,
  "growth_rate": 0.18
}
```

## 設定

### 環境変数

* `ANALYTICS_PORT` - サービスポート（デフォルト: 8004）
* `POSTGRES_HOST` - データベースホスト
* `POSTGRES_DB` - データベース名
* `POSTGRES_USER` - データベースユーザー
* `POSTGRES_PASSWORD` - データベースパスワード
* `REDIS_URL` - Redis接続URL

## 開発セットアップ

```bash
# 依存関係インストール
pip install -r requirements.txt

# テスト実行
pytest

# 自動リロードで起動
uvicorn src.main:app --reload --port 8004

# カバレッジ確認
pytest --cov=src tests/
```

**関連資料**：[ビジネスコンテキスト](/1_DOCUMENTATION/BUSINESS_CONTEXT.md)
