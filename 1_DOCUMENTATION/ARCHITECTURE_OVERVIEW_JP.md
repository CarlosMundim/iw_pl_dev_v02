# アーキテクチャ概要

## 基本原則

* **モジュール型・サービス指向アーキテクチャ**（Next.js、TypeScript、Tailwind、コンテナ活用など最新ベストプラクティスに準拠）
* **APIファースト設計**：すべての機能にREST/GraphQL API経由でアクセス可能
* **責務分離**：UI・ビジネスロジック・データを明確に分離し、拡張性・テスト性を強化

---

## 主な構成要素

* **フロントエンド**：Next.js（React）、UIはTailwindを活用。モバイル・デスクトップ両対応
* **バックエンド**：Node.js／TypeScript。Dockerによるスケールアウト可能構成
* **データベース**：PostgreSQL（メイン）、Redis（キャッシュ）、S3互換オブジェクトストレージ（ファイル）
* **AIサービス**：LLM・埋め込み・RAG・エージェント型処理のマイクロサービス群（内部APIで接続）
* **セキュリティ層**：SSO用Auth0/Keycloak、内部制御用RBAC

---

## デプロイメント

* デフォルト：Docker Compose（ローカル・開発）、Kubernetes（本番）
* 継続的インテグレーション（CI）：GitHub Actionsでテスト・リント・ビルド・デプロイ自動化

---

## 参考リンク

* [デプロイメントガイド](../4_DEPLOYMENT/DEPLOYMENT_GUIDE.md)
* [クラウドアーキテクチャ](../4_DEPLOYMENT/CLOUD_ARCHITECTURE.md)
* [ビジネスコンテキスト](./BUSINESS_CONTEXT.md)
