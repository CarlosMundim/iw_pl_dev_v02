# Tomoo AIコンシェルジュ – 音声アシスタントサービス

## 概要

TomooはiWORKZプラットフォーム向けのインテリジェントなAI音声コンシェルジュです。音声による求人検索、キャリア相談、サイト内ナビゲーション機能を提供します。FastAPIバックエンドとElectronデスクトップフロントエンドで構築され、Whisper（音声認識）、Coqui TTS（音声合成）、オプションでローカルLLMも利用可能です。

## 技術スタック

* **バックエンド**: FastAPI（Python 3.11以上）
* **フロントエンド**: Electron（Node.js 18以上）
* **音声認識**: OpenAI Whisper
* **音声合成**: Coqui TTS
* **LLM**: llama.cpp（ローカルモデル対応）
* **音声処理**: librosa, soundfile, PyAudio
* **リアルタイム通信**: WebSocket, WebRTC

## 開発セットアップ

```bash
# システム依存パッケージのインストール（Ubuntu/Debian）
sudo apt-get install portaudio19-dev python3-pyaudio

# 仮想環境作成
python -m venv venv
source venv/bin/activate

# Python依存パッケージインストール
pip install -r requirements.txt

# 音声サービスの起動
uvicorn main:app --reload --port 8003

# 音声エンドポイントのテスト
python test_voice.py
```

## 主な機能

### 音声認識

* リアルタイム音声→テキスト変換
* 多言語対応
* ノイズリダクション・前処理
* 話者識別・ダイアリゼーション

### 音声合成

* 自然な音声での合成
* 複数ボイス選択
* SSMLサポート
* 感情表現の調整

### 自然言語理解（NLU）

* インテント認識と分類
* エンティティ抽出
* コンテキスト対応の会話管理
* 複数ターンの対話管理

### 音声コマンド

* 音声による求人検索
* 音声でプロフィール更新
* 面接スケジュール調整
* 応募状況の照会

## APIエンドポイント

```python
POST /voice/transcribe        # 音声→テキスト変換
POST /voice/synthesize        # テキスト→音声合成
POST /voice/process-command   # 音声コマンド処理
WS   /voice/stream            # リアルタイム音声ストリーミング
GET  /voice/supported-languages
POST /voice/train-model       # カスタム音声モデルのトレーニング
```

## 音声処理パイプライン

1. **音声入力**: マイクまたはファイルアップロード
2. **前処理**: ノイズリダクション、正規化
3. **音声認識**: 音声→テキスト変換
4. **NLU処理**: インテント・エンティティ抽出
5. **ビジネスロジック**: ユーザーリクエスト処理
6. **応答生成**: 適切なレスポンス作成
7. **音声合成**: レスポンスを音声化
8. **配信**: 音声をユーザーへ返却

## 対応言語

* 英語（US, UK, AU）
* スペイン語（ES, MX, AR）
* ポルトガル語（BR, PT）
* フランス語（FR, CA）
* ドイツ語（DE）
* イタリア語（IT）
* 日本語（JP）
* 中国語（CN, TW）

## 連携ポイント

* **バックエンドAPI**: ユーザー認証・データ
* **AIエージェント**: 自然言語処理
* **フロントエンド**: WebRTCによる音声配信
* **モバイルアプリ**: ネイティブ音声連携
* **通知サービス**: 音声アラート

## 設定例

```bash
# 音声サービス
OPENAI_API_KEY=your-openai-key
GOOGLE_SPEECH_API_KEY=your-google-key
ELEVENLABS_API_KEY=your-elevenlabs-key
AZURE_SPEECH_KEY=your-azure-key

# 音声設定
SAMPLE_RATE=16000
AUDIO_FORMAT=wav
MAX_RECORDING_DURATION=300

# NLU構成
RASA_MODEL_PATH=/app/models/rasa
SPACY_MODEL=en_core_web_sm
```
