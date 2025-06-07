# 管理ダッシュボード（Admin Dashboard）

## 概要

iWORKZ管理ダッシュボードは、Next.js 14ベースの管理インターフェースであり、プラットフォーム運用、ユーザー管理、分析モニタリング、システム監視のための包括的なツールを提供します。

## 主な機能

* **リアルタイムダッシュボード**：ライブプラットフォーム指標・KPI
* **ユーザー管理**：ユーザーと権限管理
* **サービス監視**：全マイクロサービスのヘルス状態
* **分析サマリー**：パフォーマンス＆ビジネスメトリクス
* **クイックアクション**：管理機能へのダイレクトアクセス
* **レスポンシブデザイン**：モバイル対応管理画面
* **セキュリティ**：RBAC＆操作ログ管理

## 技術スタック

* **フレームワーク**：Next.js 14（App Router）
* **言語**：TypeScript
* **UIライブラリ**：Tailwind CSS + Headless UI
* **アイコン**：Heroicons
* **状態管理**：React hooks
* **API連携**：Axios

## はじめに

### 必要条件

* Node.js 18+
* npm 8+
* Docker（コンテナデプロイ用）

### ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバ起動
npm run dev

# http://localhost:3006 でアクセス可能
```

### Dockerデプロイ

```bash
# イメージビルド
docker build -t iworkz-admin-dashboard .

# コンテナ起動
docker run -p 3006:3006 iworkz-admin-dashboard
```

## 主な機能

### ユーザー管理

* アカウント管理
* 権限・ロール管理
* アカウント認証・停止
* 一括ユーザー操作
* ユーザーアクティビティモニタリング

### プラットフォーム分析

* KPI（主要業績指標）
* ユーザーエンゲージメント
* 求人/マッチング統計
* 収益・財務レポート
* ダッシュボードのリアルタイム更新

### コンテンツモデレーション

* 求人投稿の審査・承認
* ユーザー投稿の監視
* 自動コンテンツフィルタリング
* 通報管理システム
* コンプライアンス監視

### システム管理

* サービスヘルス監視
* データベース管理ツール
* パフォーマンスメトリクス＆アラート
* 設定管理
* 操作ログ閲覧

## ダッシュボードモジュール

### メインダッシュボード

```typescript
interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    newToday: number;
    retention: number;
  };
  jobs: {
    total: number;
    active: number;
    newToday: number;
    avgTimeToFill: number;
  };
  matches: {
    total: number;
    successful: number;
    avgMatchScore: number;
    conversionRate: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    arpu: number;
  };
}
```

### ユーザー分析

* 登録推移
* エンゲージメントヒートマップ
* 機能利用統計
* 地理分布
* コホート分析

### 求人分析

* 求人投稿推移
* 業種分布
* 給与帯分析
* フィルタイム（採用までの時間）
* カテゴリー別成功率

## コンポーネントライブラリ

### データビジュアライゼーション

```typescript
// KPIカード
interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
}

// チャートコンポーネント
interface ChartProps {
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area';
  config: ChartConfiguration;
}
```

### 管理テーブル

```typescript
// ユーザー管理テーブル
interface UserTableRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: Date;
  actions: AdminAction[];
}

// 求人管理テーブル
interface JobTableRow {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  postedDate: Date;
  applications: number;
  actions: AdminAction[];
}
```

## セキュリティ機能

### ロールベースアクセス制御

```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  ANALYST = 'analyst',
  SUPPORT = 'support'
}

interface AdminPermissions {
  users: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    suspend: boolean;
  };
  jobs: {
    view: boolean;
    approve: boolean;
    reject: boolean;
    delete: boolean;
  };
  analytics: {
    view: boolean;
    export: boolean;
  };
  system: {
    monitoring: boolean;
    configuration: boolean;
    maintenance: boolean;
  };
}
```

### 操作監査ログ

```typescript
interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

## リアルタイム機能

### ライブ更新

* ユーザーアクティビティのリアルタイム表示
* ライブチャットサポート統合
* システムアラート＆通知
* パフォーマンス指標の更新
* イベントストリーム監視

### WebSocket連携

```typescript
const socket = io('/admin', {
  auth: {
    token: adminToken
  }
});

socket.on('user_registered', (user) => {
  updateUserMetrics(user);
});

socket.on('job_posted', (job) => {
  updateJobMetrics(job);
});

socket.on('system_alert', (alert) => {
  showNotification(alert);
});
```

## レポートと分析

### 自動レポート

* 日次アクティビティサマリー
* 週次パフォーマンスレポート
* 月次BIレポート
* 四半期トレンド分析
* カスタムレポート生成

### データエクスポート

```typescript
// エクスポート機能
const exportData = async (type: 'users' | 'jobs' | 'analytics', format: 'csv' | 'xlsx' | 'pdf') => {
  const data = await fetchData(type);
  return await generateExport(data, format);
};
```

## システム監視

### ヘルスチェック

```typescript
interface SystemHealth {
  services: {
    api: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
    redis: 'healthy' | 'degraded' | 'down';
    search: 'healthy' | 'degraded' | 'down';
  };
  performance: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}
```

### アラート管理

* システムパフォーマンスアラート
* エラー率閾値
* リソース使用警告
* セキュリティインシデント通知
* カスタムアラートルール

## 環境変数例

```bash
# 管理者認証
ADMIN_JWT_SECRET=your-admin-jwt-secret
ADMIN_SESSION_TIMEOUT=3600

# API構成
API_BASE_URL=http://localhost:8000
WEBSOCKET_URL=ws://localhost:8000

# 分析
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token

# 機能フラグ
ENABLE_USER_MANAGEMENT=true
ENABLE_CONTENT_MODERATION=true
ENABLE_SYSTEM_MONITORING=true
```

## デプロイメント

* メインアプリから独立したデプロイ
* 制限付きネットワークアクセス
* 本番環境はVPN経由のみ
* 強化セキュリティモニタリング
* 定期的なセキュリティ監査
