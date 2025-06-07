# マッチングエンジンサービス

## 概要

iWORKZマッチングエンジンは、AIを活用したアルゴリズムによるジョブ・候補者のインテリジェントなマッチングを担うNode.js/Expressのマイクロサービスです。候補者プロフィールと求人要件を分析し、互換性スコアと詳細な根拠を返します。

## 技術スタック

* **言語**: Node.js 18+
* **フレームワーク**: Express.js
* **MLライブラリ**: scikit-learn, pandas, numpy
* **ベクトル計算**: FAISS, Annoy
* **グラフ処理**: NetworkX
* **データベース**: PostgreSQL + Redis
* **キューシステム**: Celery
* **モニタリング**: MLflow, Weights & Biases

## 開発セットアップ

```bash
# 仮想環境の作成
python -m venv venv
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# マッチングモデルの初期化
python scripts/init_models.py

# サービス起動
uvicorn main:app --reload --port 8002

# パフォーマンステスト実行
python tests/test_matching_performance.py
```

## マッチングアルゴリズムの構成要素

### スキルマッチ

* 正確なスキル一致（重み付けスコア）
* 埋め込みを用いたセマンティック類似度
* スキルレベル評価とギャップ分析
* 経験要件との照合

### ロケーションマッチ

* 地理的な近接度計算
* リモートワーク志向の考慮
* タイムゾーン適合
* 出張・移動要件の判定

### 報酬マッチ

* 給与レンジの適合度
* 福利厚生の整合性
* ストック/ボーナスの考慮
* 生活コスト調整

### カルチャーフィット評価

* 企業文化分析
* 働き方志向・価値観評価
* チームダイナミクスの適合
* 価値観スコアリング

## 機械学習モデル

### 特徴量エンジニアリング

```python
# 候補者ベクトル
candidate_vector = [
    skills_embedding,      # 512次元
    experience_years,      # スカラー
    education_level,       # カテゴリカル
    location_coords,       # 2次元
    salary_expectation,    # スカラー
    work_preferences,      # 10次元
    soft_skills_score,     # スカラー
]

# ジョブベクトル
job_vector = [
    requirements_embedding, # 512次元
    seniority_level,       # カテゴリカル
    company_size,          # カテゴリカル
    location_coords,       # 2次元
    salary_range,          # 2次元
    company_culture,       # 10次元
    urgency_score,         # スカラー
]
```

### ランキングモデル

* **線形モデル**: 高速なベースラインマッチング
* **ニューラルネットワーク**: 高度な特徴抽出
* **勾配ブースティング**: 高精度ランキング
* **アンサンブルモデル**: 複合予測

## APIエンドポイント

```python
POST /matching/find-candidates    # 求人向け候補者検索
POST /matching/find-jobs         # 候補者向け求人検索
POST /matching/score-pair        # 特定ペアのスコア計算
POST /matching/bulk-match        # バルクマッチ処理
GET  /matching/recommendations   # パーソナライズ推薦
POST /matching/feedback          # マッチングフィードバック
GET  /matching/metrics           # パフォーマンス指標取得
```

## マッチングパイプライン

1. **データ取得**: 求人と候補者プロフィール
2. **特徴量抽出**: ベクトル変換
3. **候補者フィルタリング**: 初期適合スクリーニング
4. **類似度計算**: ベクトル類似度計算
5. **MLスコアリング**: モデル予測
6. **ランキング**: 関連度順にソート
7. **後処理**: ビジネスルール適用
8. **結果返却**: 順位付きマッチを返却

## パフォーマンス最適化

* **インデックス化**: FAISSによる高速検索
* **キャッシュ**: Redisで頻繁クエリ高速化
* **バッチ処理**: 効率的な一括処理
* **並列化**: マルチスレッドによる拡張性
* **モデル最適化**: 量子化・プルーニング

## 評価指標

* **Precision\@K**: 上位K件の関連度
* **Recall\@K**: 関連マッチの網羅率
* **NDCG**: 割引累積利得の正規化
* **AUC**: ROC曲線下の面積
* **Mean Reciprocal Rank**: 最初の関連結果順位

## A/Bテストフレームワーク

* モデル比較と評価
* 特徴量重要度分析
* パフォーマンス監視
* モデル自動選択
* 段階的ロールアウト

## 設定例

```bash
# モデル設定
MODEL_VERSION=v2.1.0
SIMILARITY_THRESHOLD=0.7
MAX_CANDIDATES_PER_JOB=100
MAX_JOBS_PER_CANDIDATE=50

# パフォーマンス設定
BATCH_SIZE=1000
PARALLEL_WORKERS=4
CACHE_TTL=3600

# 重み付け
SKILL_WEIGHT=0.4
EXPERIENCE_WEIGHT=0.2
LOCATION_WEIGHT=0.15
SALARY_WEIGHT=0.15
CULTURE_WEIGHT=0.1
```
