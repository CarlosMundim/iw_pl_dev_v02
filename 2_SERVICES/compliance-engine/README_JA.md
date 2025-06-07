# コンプライアンスエンジンサービス

## 概要

iWORKZコンプライアンスエンジンは、FastAPIベースのマイクロサービスであり、求人情報、雇用契約、候補者データの規制コンプライアンス検証を、複数の法域（日本・韓国・シンガポール・イギリス・EU・アメリカ・オーストラリア・カナダ）で自動化します。

## 主な特徴

* **多法域対応**：日本、韓国、シンガポール、イギリス、EU、アメリカ、オーストラリア、カナダのコンプライアンスに対応
* **雇用法規制チェック**：労働時間、最低賃金、福利厚生の遵守状況を自動検証
* **データ保護コンプライアンス**：APPI、PIPA、PDPA、GDPR、CCPAなど各国プライバシー規制への対応
* **リアルタイムチェック**：即時バリデーション＋信頼度スコアリング
* **違反検知**：コンプライアンス違反の自動検出
* **推奨アクション提案**：是正・改善のための具体的アドバイス
* **RESTful API**：シンプルな統合用エンドポイント

## 技術スタック

* **フレームワーク**：FastAPI（Python 3.11+）
* **データベース**：PostgreSQL（コンプライアンス用モデル）
* **キャッシュ**：Redis（法規ルールのキャッシュ）
* **バリデーション**：Pydantic
* **ドキュメント**：自動生成OpenAPI/Swaggerドキュメント

## 開発手順

### 必要条件

* Python 3.11+
* pip
* Docker（コンテナデプロイ用）

### ローカル開発

```bash
# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存パッケージインストール
pip install -r requirements.txt

# 開発サーバー起動
uvicorn src.main:app --reload --port 8003

# サービスURL: http://localhost:8003
# APIドキュメント: http://localhost:8003/docs
```

### Dockerデプロイ

```bash
# イメージビルド
docker build -t iworkz-compliance-engine .

# コンテナ起動
docker run -p 8003:8003 -e COMPLIANCE_PORT=8003 iworkz-compliance-engine
```

## APIエンドポイント

### ヘルス＆ステータス

* `GET /health` - サービスの稼働確認
* `GET /status` - サービス機能一覧および対応法域

### コンプライアンスAPI

* `POST /api/v1/check` - コンプライアンス検証実行
* `GET /api/v1/jurisdictions` - 対応法域とルール一覧取得
* `POST /api/v1/validate` - コンプライアンスデータ形式のバリデーション
* `GET /api/v1/reports/summary` - コンプライアンス状況サマリ取得

### リクエスト例

```json
POST /api/v1/check
{
  "jurisdiction": "UK",
  "entity_type": "employment",
  "data": {
    "entity_name": "Tech Corp Ltd",
    "job_posting": {...}
  }
}
```

### レスポンス例

```json
{
  "status": "completed",
  "compliant": true,
  "jurisdiction": "UK",
  "checks_performed": ["minimum_wage_compliance", "working_time_directive"],
  "violations": [],
  "recommendations": ["現行のコンプライアンス基準を維持してください"],
  "confidence_score": 0.92
}
```

## 対応法域

### 実装済み

* **UK**：雇用法、GDPR、労働時間指令
* **EU**：労働時間指令、均等待遇、GDPR
* **US**：FLSA、EEOC、ADA、CCPA準拠
* **AU**：フェアワーク法、プライバシー法規
* **CA**：雇用基準、PIPEDA

### コンプライアンス種別

* **雇用**：賃金、労働時間、福利厚生、均等機会
* **データ保護**：GDPR、CCPA、プライバシー規制
* **財務**：給与税、社会保険
* **安全衛生**：職場の安全・衛生要件

## コンフィグレーション

### 環境変数

* `COMPLIANCE_PORT` - サービスポート（デフォルト: 8003）
* `POSTGRES_HOST` - データベースホスト
* `POSTGRES_DB` - データベース名
* `POSTGRES_USER` - データベースユーザー
* `POSTGRES_PASSWORD` - データベースパスワード
* `OPENAI_API_KEY` - AIサービス連携用
* `AI_SERVICE_URL` - AIエージェントサービスのエンドポイント

## 連携ポイント

* **バックエンドAPI**：コンプライアンス検証リクエスト
* **AIエージェント**：ドキュメント解析とルール判定強化
* **データベース**：法規ルール保存・履歴管理
* **外部API**：官公庁等の規制データ取得

## 開発セットアップ

```bash
# 依存パッケージインストール
pip install -r requirements.txt

# テスト実行
pytest

# 自動再起動で起動
uvicorn src.main:app --reload --port 8003

# コンプライアンスカバレッジ測定
pytest --cov=src tests/
```

**関連ドキュメント：** [Compliance AI Prompts](/3_AI_AGENTS/COMPLIANCE_AI_PROMPTS.md)
