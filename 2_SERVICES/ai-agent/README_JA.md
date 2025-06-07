# AIエージェントサービス

## 概要

コアAI/MLサービスとして、知的な推薦、自然言語処理、自動意思決定機能を提供します。

## 技術スタック

* **言語**：Python 3.11+
* **フレームワーク**：FastAPI
* **AI/ML**：OpenAI GPT、Anthropic Claude、HuggingFace
* **ベクターデータベース**：Pinecone / Weaviate
* **キューシステム**：Celery + Redis
* **MLパイプライン**：MLflow
* **デプロイ**：Docker + Kubernetes

## 開発セットアップ

```bash
# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 依存関係のインストール
pip install -r requirements.txt

# 開発サーバー起動
uvicorn main:app --reload --port 8001

# テスト実行
pytest

# モデル学習
python scripts/train_models.py
```

## AI機能

### 自然言語処理

* 履歴書のパースとスキル抽出
* 求人票の分析
* フィードバックの感情分析
* 多言語サポート

### 機械学習モデル

* 求人・候補者マッチングアルゴリズム
* 給与予測モデル
* キャリアパスの提案
* スキルギャップ分析

### AI連携

* **OpenAI GPT**：テキスト生成と解析
* **Anthropic Claude**：複雑な推論タスク
* **HuggingFace**：カスタムモデルのデプロイ
* **Google Cloud AI**：画像・翻訳API

## APIエンドポイント

```python
POST /ai/match-candidates
POST /ai/analyze-resume
POST /ai/generate-job-description
POST /ai/predict-salary
POST /ai/recommend-skills
GET  /ai/model-status
POST /ai/feedback/process
```

## モデル学習パイプライン

1. **データ収集**：自動データ収集
2. **前処理**：クリーニングと正規化
3. **特徴量エンジニアリング**：関連特徴量抽出
4. **モデル学習**：MLモデル開発
5. **モデル評価**：パフォーマンス検証
6. **モデルデプロイ**：本番環境へのデプロイ
7. **モデル監視**：パフォーマンス監視

## ベクターデータベース連携

* **埋め込み**：意味検索のためのSentence Transformers
* **ストレージ**：効率的なベクトル保存・取得
* **類似検索**：高速な候補者と求人マッチング
* **インデックス化**：最適化された検索パフォーマンス

## バックグラウンドタスク

* モデルの学習・再学習
* 応募バッチ処理
* データパイプラインのオーケストレーション
* モデルパフォーマンスの監視
* モデルの自動更新

## 環境変数例

```bash
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
PINECONE_API_KEY=your-pinecone-key
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379
MODEL_STORAGE_PATH=/app/models
```
