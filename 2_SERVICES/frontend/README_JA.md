# フロントエンドサービス

## 概要

Next.js、TypeScript、Tailwind CSSで構築されたiWORKZプラットフォームの主要なユーザーインターフェースです。

## 技術スタック

* **フレームワーク**：Next.js 14（App Router）
* **言語**：TypeScript
* **スタイリング**：Tailwind CSS
* **状態管理**：Zustand
* **認証**：NextAuth.js
* **HTTPクライアント**：Axios
* **テスト**：Jest + React Testing Library

## 開発セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# 本番ビルド
npm run build
```

## 主な機能

* すべての画面サイズに対応したレスポンシブデザイン
* 最適なSEOのためのサーバーサイドレンダリング
* WebSocketによるリアルタイム更新
* PWA（プログレッシブウェブアプリ）対応
* 多言語対応（i18n）

## プロジェクト構成

```
frontend/
├── src/
│   ├── app/           # App Router ページ
│   ├── components/    # 再利用可能なコンポーネント
│   ├── lib/          # ユーティリティ・設定
│   ├── hooks/        # カスタムReactフック
│   ├── store/        # 状態管理
│   └── types/        # TypeScript型定義
├── public/           # 静的アセット
└── tests/           # テストファイル
```

## 環境変数

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## 利用可能なスクリプト

* `npm run dev` - 開発サーバー起動
* `npm run build` - 本番ビルド
* `npm run start` - 本番サーバー起動
* `npm run lint` - ESLint実行
* `npm run test` - テスト実行
* `npm run test:watch` - ウォッチモードでテスト実行
