# APIキー設定ガイド

## 概要

このガイドは、iWORKZプラットフォームで利用するすべてのAI・デジタルサービスのAPIキーの設定・管理方法を、ヘルスケア、介護、IT/AI、サービス、エンジニアリング、製造、金融、F\&B、BPOなど幅広い業界・用途でカバーします。

---

## 1. 必須AI・クラウドサービス

### OpenAI GPTサービス

* **目的**: テキスト生成、コード、履歴書解析、スコアリング、埋め込み、音声認識（Whisper）
* **業界**: 全業界（求人マッチング、法令遵守、タレントアナリティクス、AIチャット等）
* **料金**: 従量課金（[OpenAI料金](https://openai.com/pricing)参照）

#### 設定手順

1. [OpenAIプラットフォーム](https://platform.openai.com/)にアクセス
2. アカウント登録・メール認証
3. 「API Keys」でAPIキーを発行
4. 安全な場所へAPIキーを保存（パスワードマネージャー等推奨）

```bash
# 環境変数
OPENAI_API_KEY=sk-your-secret-key-here
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_MODEL=gpt-3.5-turbo
```

#### 利用例

```javascript
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const completion = await openai.chat.completions.create({
  messages: [{ role: 'user', content: 'Analyze this resume...' }],
  model: 'gpt-3.5-turbo',
  max_tokens: 1000,
  temperature: 0.3
});
```

---

### Anthropic Claude

* **目的**: 高度な推論、分析、長文コンテンツ生成、法令順守チェック
* **業界**: 金融・ヘルスケア等の規制業種（高い説明性・順守要件が必要な領域）
* **料金**: [Anthropic料金](https://console.anthropic.com/)

#### 設定手順

1. [Anthropic Console](https://console.anthropic.com/)に登録
2. アカウント認証
3. APIキーを発行
4. 利用上限の設定を推奨

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000
```

#### 利用例

```python
import anthropic
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    temperature=0.3,
    messages=[{"role": "user", "content": "Evaluate this job candidate..."}]
)
```

---

### Google Cloud AI Platform

* **目的**: 多言語翻訳、自然言語処理、音声認識
* **業界**: 介護、グローバルBPO、F\&B（メニュー翻訳）、多国籍プラットフォーム等
* **料金**: [Google AI料金](https://cloud.google.com/pricing)

#### 設定手順

1. [Google Cloudプロジェクト](https://console.cloud.google.com/)作成
2. 必要なAI API（翻訳/NLP/音声認識）を有効化
3. サービスアカウントを作成し、JSON認証情報をダウンロード
4. 必要な環境変数を設定

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_TRANSLATE_API_KEY=your-translate-key
```

#### 利用例

```javascript
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const [translation] = await translate.translate(text, targetLanguage);
```

---

### Azure Cognitive Services

* **目的**: 音声・テキスト解析、画像処理
* **業界**: 医療（ボイスメモ）、F\&B（メニュー読み上げ）、金融（OCR）等
* **料金**: [Azure Cognitive料金](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/)

#### 設定手順

1. [Azureポータル](https://portal.azure.com/)でアカウント作成
2. Cognitive Servicesリソース作成
3. エンドポイントURL・APIキー取得

```bash
AZURE_COGNITIVE_SERVICES_KEY=your-subscription-key
AZURE_COGNITIVE_SERVICES_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_SPEECH_KEY=your-speech-key
AZURE_SPEECH_REGION=your-region
```

---

### HuggingFace

* **目的**: 専門モデル（順守、感情、業界特化NLP等）
* **業界**: 製造、サービス、金融（不正検知、契約書解析など）
* **料金**: 無料枠あり・高負荷は有料

#### 設定手順

1. [HuggingFace](https://huggingface.co/)に登録
2. アクセストークン発行

```bash
HUGGINGFACE_API_TOKEN=hf_your-token-here
```

#### 利用例

```python
from transformers import pipeline
classifier = pipeline("text-classification", model="your-model", use_auth_token=os.environ.get("HUGGINGFACE_API_TOKEN"))
result = classifier("This is a great job opportunity!")
```

---

## 2. ベクターデータベースサービス

### Pinecone

* **目的**: 高速ベクトル検索（例：求職者と求人のマッチング）
* **業界**: AI人材配置、ランキング、大規模BPO

#### 設定手順

1. [Pinecone](https://www.pinecone.io/)登録
2. プロジェクト作成・APIキー取得

```bash
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=job-matching-index
```

#### 利用例

```python
import pinecone
pinecone.init(api_key=os.environ.get("PINECONE_API_KEY"), environment=os.environ.get("PINECONE_ENVIRONMENT"))
index = pinecone.Index("job-matching-index")
index.upsert(vectors=[("job_1", embedding_vector, {"title": "Software Engineer"})])
results = index.query(query_vector, top_k=10)
```

---

### Weaviate

* **目的**: オープンソースのベクトルDB、GraphQL対応
* **業界**: ナレッジグラフ、順守検索など

```bash
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-key
```

---

## 3. 外部サービスAPI

### SendGrid（メール）

* **目的**: トランザクションメール・通知メール（求人通知、面接案内、給与明細等）

```bash
SENDGRID_API_KEY=SG.your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@iworkz.com
SENDGRID_TEMPLATE_ID=d-your-template-id
```

### Twilio（SMS・音声）

* **目的**: SMS通知（セキュリティ、緊急求人、音声面接リマインダー）

```bash
TWILIO_ACCOUNT_SID=AC-your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Stripe（決済）

* **目的**: 決済処理（有料機能、B2Bサブスクリプション、登録料等）

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

---

## 4. セキュリティ・コスト管理

### 環境管理

* .envファイルはバージョン管理にコミットしない
* シークレットマネージャー（AWS/GCP/Azure）で安全管理
* APIキーは90日ごとまたは必要に応じてローテーション

### コスト・利用量監視

* 各クラウドベンダーのアラート（AWS CloudWatch, GCP Billing, Azure Monitor）を利用
* 利用状況の定期チェックと不要キーの無効化

### トラブルシューティング・テスト

* 本番投入前に最小限のテストでAPIキー動作確認
* 各サービス毎にサンプルスクリプトで検証

---

## 5. セットアップ・ヘルスチェック用スクリプト

### セットアップ

```bash
#!/bin/bash
echo "iWORKZ AI APIキーのセットアップ中..."
cp .env.example .env 2>/dev/null || true
# ...（フルスクリプトは英語版参照）
```

### 接続テスト（例）

```javascript
// test-api-keys.js を参照（各AI・クラウドサービスごとの接続確認スクリプト）
```

---

## 6. よくある問題と対処法

* **無効なAPIキー**: 形式を再確認し、不明な場合は再発行
* **レート制限**: 各プロバイダーの制限を守り、429時は指数バックオフ実装
* **ネットワーク問題**: VPN、プロキシ、ファイアウォール、DNS設定を確認
* **権限エラー**: サービスアカウント・ロールの設定見直し

---

**重要**: すべてのAPIキーを厳重に管理し、頻繁にローテーションし、日々の利用状況を監視してサービス停止や順守違反を防止してください。
