# オンボーディングガイド

## 開発者向け

### はじめに

1. **アクセス**：GitHubリポジトリのアクセス権を [contact@iworkz.ai](mailto:contact@iworkz.ai) にリクエストしてください。すべてのコードとインフラはGitHubで管理されています。
2. **セットアップ**：Docker Desktop、Node.js（LTS）、Python 3.10+、VS Codeをインストールしてください。リポジトリをクローンし、`docker compose up` を実行、`localhost:3000` にアクセスします。
3. **開発ワークフロー**：全ての機能／バグ修正ブランチはプルリクエストとコードレビューを必須とします。
4. **シークレット**：ローカルの `.env` ファイルは絶対にコミットしません。暗号化された認証情報はオペレーションリードにリクエストしてください。
5. **課題管理**：全てのタスク、バグ、機能追加はGitHub Issuesで管理します。

### 開発環境セットアップ

```bash
# 必要条件の確認
node --version    # 18以上
python --version  # 3.10以上
docker --version  # 20.10以上

# クローンとセットアップ
git clone git@github.com:your-org/iworkz-platform.git
cd iworkz-platform

# 環境構成
cp .env.example .env.local
# .env.local を自分のローカル環境に合わせて編集

# 開発環境の起動
docker-compose up -d

# サービス稼働確認
docker-compose ps
curl http://localhost:3000        # Webフロントエンド
curl http://localhost:8000/health # バックエンドAPI
```

### コード品質基準

* **Lint**：ESLint（TypeScript対応）
* **フォーマット**：Prettierによる統一設定
* **テスト**：Jest（ユニット）、Playwright（E2E）
* **型安全性**：厳格なTypeScript設定
* **セキュリティ**：定期的なセキュリティ監査と依存パッケージ更新

### Gitワークフロー

1. `main` から機能ブランチを作成
2. 意味のあるコミットメッセージで変更
3. テストと品質チェックをローカルで実行
4. ブランチをプッシュしてプルリクエスト作成
5. コードレビュー対応
6. 承認とCIパス後にマージ

## パートナー向け

### インテグレーションプロセス

* **インテグレーション**：[Integration Hub](../2_SERVICES/integration-hub/README.md) から開始してください。
* **API**：エンドポイント仕様や認証についてはAPIドキュメントを参照
* **セキュリティ**：[GDPRコンプライアンス](../5_SECURITY/GDPR_COMPLIANCE.md)および[セキュリティプロトコル](../5_SECURITY/SECURITY_PROTOCOLS.md)参照
* **テスト**：統合テスト用のサンドボックス環境を提供

### パートナーオンボーディングステップ

1. **初回連絡**：パートナーシップ担当に連絡
2. **技術評価**：インテグレーション要件の確認
3. **サンドボックスアクセス**：開発環境認証情報の受領
4. **インテグレーション開発**：構築・テスト
5. **セキュリティレビュー**：コンプライアンス確認
6. **本番デプロイ**：本番環境への展開
7. **継続的サポート**：技術サポート・ドキュメント提供

## 新規メンバー向け

### 初週チェックリスト

* [ ] ITセットアップ（PC、アカウント、アクセス権）
* [ ] GitHubアクセス・SSHキー設定
* [ ] 開発環境のセットアップと確認
* [ ] コアドキュメントの読了（Business Context、Architecture）
* [ ] チーム自己紹介ミーティング
* [ ] コードベース・プロジェクト構造の確認
* [ ] 最初の小タスクまたはバグ修正

### 必読資料

1. [Business Context](./BUSINESS_CONTEXT.md) － ミッション・市場理解
2. [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) － 技術基盤
3. [Security Protocols](../5_SECURITY/SECURITY_PROTOCOLS.md) － セキュリティ要件
4. [Git Workflow](./GIT_WORKFLOW.md) － 開発プロセス
5. 各担当分野のREADMEファイル

### チーム構成

* **エンジニアリング**：フルスタック、フロントエンド、バックエンド、DevOps、AI/MLスペシャリスト
* **プロダクト**：プロダクトマネージャー、デザイナー、ユーザーリサーチ
* **コンプライアンス**：法務・規制・コンプライアンス
* **オペレーション**：カスタマーサクセス、サポート、ビジネスオペレーション
* **リーダーシップ**：経営陣・部門責任者

## トレーニングと成長

### 技術トレーニング

* **プラットフォームアーキテクチャ**：全構成要素の理解
* **セキュリティトレーニング**：年次セキュリティ講習
* **コンプライアンス研修**：規制要件と運用
* **AI/ML研修**：AIコンポーネントや倫理的配慮の理解

### キャリア開発

* **カンファレンス参加**：業界カンファレンス参加支援
* **資格取得**：技術・専門資格取得の支援
* **社内研修**：ランチ勉強会・ナレッジシェア
* **メンタープログラム**：経験者とのメンタリング

### リソース・ツール

* **ドキュメント**：リポジトリ内の包括的ドキュメント
* **コミュニケーション**：Slack（チャット）、Zoom（会議）
* **プロジェクト管理**：GitHub Issues／Projects
* **ナレッジベース**：Confluenceによる追加ドキュメント
* **サポート**：ITヘルプデスク・技術サポート

---

## 追加資料

* [Business Context](./BUSINESS_CONTEXT.md)
* [Architecture Overview](./ARCHITECTURE_OVERVIEW.md)
* [Deployment Guide](../4_DEPLOYMENT/DEPLOYMENT_GUIDE.md)
* [Security Protocols](../5_SECURITY/SECURITY_PROTOCOLS.md)
