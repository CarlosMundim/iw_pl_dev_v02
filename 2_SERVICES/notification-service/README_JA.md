# 通知サービス

## 概要

メール、SMS、プッシュ通知、アプリ内メッセージングを処理するマルチチャネル通知サービスです。

## 技術スタック

* **フレームワーク**: Node.js + Express + TypeScript
* **メール**: SendGrid、Amazon SES
* **SMS**: Twilio、AWS SNS
* **プッシュ通知**: Firebase Cloud Messaging (FCM)
* **キューシステム**: Bull Queue + Redis
* **テンプレート**: Handlebars.js
* **アナリティクス**: 配信およびエンゲージメントの追跡

## 開発セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数の設定
cp .env.example .env

# 通知サービスの起動
npm run dev

# テストの実行
npm test

# 通知キューの処理
npm run queue:worker
```

## 通知チャネル

### メール通知

* ウェルカムメール・オンボーディング
* 求人マッチアラート
* 応募状況のアップデート
* 週間ダイジェスト・ニュースレター
* パスワードリセット・セキュリティアラート

### SMS通知

* 2要素認証コード
* 重要なセキュリティ警告
* 面接リマインダー
* 急募求人通知

### プッシュ通知

* リアルタイム求人マッチ
* 新規メッセージとチャット更新
* 応募状況変更
* 毎日のエンゲージメント促進

### アプリ内通知

* アクティビティフィードの更新
* システムアナウンス
* 新機能のお知らせ
* ソーシャルインタラクション

## APIエンドポイント

```typescript
POST /notifications/send              // 即時通知送信
POST /notifications/schedule          // 予約通知送信
POST /notifications/bulk             // バルク通知送信
GET  /notifications/user/:userId     // ユーザー通知取得
PUT  /notifications/:id/read         // 既読化
DELETE /notifications/:id            // 通知削除
GET  /notifications/templates       // テンプレート一覧
POST /notifications/templates       // 新規テンプレート作成
POST /notifications/preferences     // ユーザー設定更新
```

## 通知タイプ

### トランザクション

```typescript
interface TransactionalNotification {
  type: 'transactional';
  template: string;
  recipient: {
    userId: string;
    email?: string;
    phone?: string;
    deviceTokens?: string[];
  };
  data: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
}
```

### マーケティング

```typescript
interface MarketingNotification {
  type: 'marketing';
  campaign: string;
  segment: {
    userIds?: string[];
    criteria?: UserSegmentCriteria;
  };
  template: string;
  scheduledAt?: Date;
  channels: ('email' | 'push')[];
}
```

## テンプレートシステム

### メールテンプレート

```handlebars
<!-- job-match-alert.hbs -->
<!DOCTYPE html>
<html>
<head>
  <title>新しい求人マッチが見つかりました！</title>
</head>
<body>
  <h1>{{user.firstName}}様</h1>
  <p>ご希望に合う新しい求人を見つけました：</p>
  
  <div class="job-card">
    <h2>{{job.title}}</h2>
    <p><strong>会社:</strong> {{job.company.name}}</p>
    <p><strong>勤務地:</strong> {{job.location.city}}, {{job.location.country}}</p>
    <p><strong>給与:</strong> {{job.salary.min}} - {{job.salary.max}} {{job.salary.currency}}</p>
    
    <a href="{{job.url}}" class="cta-button">求人詳細を見る</a>
  </div>
  
  <p>今後ともよろしくお願いいたします。<br>iWORKZチーム</p>
</body>
</html>
```

### プッシュ通知テンプレート

```typescript
const pushTemplates = {
  jobMatch: {
    title: "新着求人マッチ！ 🎯",
    body: "{{job.title}}（{{job.company.name}}）- {{match.score}}% マッチ",
    data: {
      type: "job_match",
      jobId: "{{job.id}}",
      matchScore: "{{match.score}}"
    }
  },
  messageReceived: {
    title: "{{sender.name}}から新着メッセージ",
    body: "{{message.preview}}",
    data: {
      type: "message",
      conversationId: "{{conversation.id}}"
    }
  }
};
```

## キュー管理

### ジョブ処理

```typescript
// 通知をキューに追加
const notificationQueue = new Bull('notifications', {
  redis: { host: 'localhost', port: 6379 }
});

// メール送信処理
notificationQueue.process('send-email', async (job) => {
  const { template, recipient, data } = job.data;
  return await sendEmail(template, recipient, data);
});

// プッシュ通知処理
notificationQueue.process('send-push', async (job) => {
  const { template, deviceTokens, data } = job.data;
  return await sendPushNotification(template, deviceTokens, data);
});
```

### リトライロジック

```typescript
const jobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  },
  removeOnComplete: 100,
  removeOnFail: 50
};
```

## ユーザー設定

### 通知設定管理

```typescript
interface NotificationPreferences {
  userId: string;
  email: {
    jobMatches: boolean;
    applicationUpdates: boolean;
    weeklyDigest: boolean;
    marketing: boolean;
  };
  push: {
    jobMatches: boolean;
    messages: boolean;
    applicationUpdates: boolean;
  };
  sms: {
    security: boolean;
    interviews: boolean;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
    timezone: string;
  };
}
```

## 配信トラッキング

### アナリティクス

```typescript
interface NotificationAnalytics {
  notificationId: string;
  sent: {
    timestamp: Date;
    channel: string;
    provider: string;
  };
  delivered?: {
    timestamp: Date;
    status: 'delivered' | 'failed' | 'bounced';
  };
  opened?: {
    timestamp: Date;
    userAgent?: string;
    ipAddress?: string;
  };
  clicked?: {
    timestamp: Date;
    linkUrl: string;
  };
  unsubscribed?: {
    timestamp: Date;
    reason?: string;
  };
}
```

## プロバイダー連携

### メールプロバイダー

```typescript
// SendGrid連携
const sendGridClient = require('@sendgrid/mail');
sendGridClient.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (template: string, recipient: string, data: any) => {
  const msg = {
    to: recipient,
    from: 'noreply@iworkz.com',
    templateId: template,
    dynamicTemplateData: data
  };
  
  return await sendGridClient.send(msg);
};
```

### SMSプロバイダー

```typescript
// Twilio連携
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const sendSMS = async (to: string, message: string) => {
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to
  });
};
```

### プッシュ通知

```typescript
// Firebase Cloud Messaging
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendPushNotification = async (tokens: string[], payload: any) => {
  const message = {
    notification: payload.notification,
    data: payload.data,
    tokens: tokens
  };
  
  return await admin.messaging().sendMulticast(message);
};
```

## 環境変数

```bash
# メール設定
SENDGRID_API_KEY=your-sendgrid-key
SES_ACCESS_KEY=your-ses-access-key
SES_SECRET_KEY=your-ses-secret-key
FROM_EMAIL=noreply@iworkz.com

# SMS設定
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# プッシュ通知
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email

# キュー設定
REDIS_URL=redis://localhost:6379
QUEUE_CONCURRENCY=10
```
