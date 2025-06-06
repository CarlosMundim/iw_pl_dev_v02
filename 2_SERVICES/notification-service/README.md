# Notification Service

## Overview
Multi-channel notification service handling email, SMS, push notifications, and in-app messaging.

## Tech Stack
- **Framework**: Node.js + Express + TypeScript
- **Email**: SendGrid, Amazon SES
- **SMS**: Twilio, AWS SNS
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Queue System**: Bull Queue + Redis
- **Templates**: Handlebars.js
- **Analytics**: Tracking delivery and engagement

## Development Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start notification service
npm run dev

# Run tests
npm test

# Process notification queue
npm run queue:worker
```

## Notification Channels
### Email Notifications
- Welcome emails and onboarding
- Job match alerts
- Application status updates
- Weekly digest newsletters
- Password reset and security alerts

### SMS Notifications
- Two-factor authentication codes
- Critical security alerts
- Interview reminders
- Urgent job opportunities

### Push Notifications
- Real-time job matches
- New messages and chat updates
- Application status changes
- Daily engagement prompts

### In-App Notifications
- Activity feed updates
- System announcements
- Feature announcements
- Social interactions

## API Endpoints
```typescript
POST /notifications/send              // Send immediate notification
POST /notifications/schedule          // Schedule future notification
POST /notifications/bulk             // Send bulk notifications
GET  /notifications/user/:userId     // Get user notifications
PUT  /notifications/:id/read         // Mark as read
DELETE /notifications/:id            // Delete notification
GET  /notifications/templates       // List available templates
POST /notifications/templates       // Create new template
POST /notifications/preferences     // Update user preferences
```

## Notification Types
### Transactional
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

### Marketing
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

## Template System
### Email Templates
```handlebars
<!-- job-match-alert.hbs -->
<!DOCTYPE html>
<html>
<head>
  <title>New Job Match Found!</title>
</head>
<body>
  <h1>Hi {{user.firstName}},</h1>
  <p>We found a new job that matches your preferences:</p>
  
  <div class="job-card">
    <h2>{{job.title}}</h2>
    <p><strong>Company:</strong> {{job.company.name}}</p>
    <p><strong>Location:</strong> {{job.location.city}}, {{job.location.country}}</p>
    <p><strong>Salary:</strong> {{job.salary.min}} - {{job.salary.max}} {{job.salary.currency}}</p>
    
    <a href="{{job.url}}" class="cta-button">View Job Details</a>
  </div>
  
  <p>Best regards,<br>The iWORKZ Team</p>
</body>
</html>
```

### Push Notification Templates
```typescript
const pushTemplates = {
  jobMatch: {
    title: "New Job Match! 🎯",
    body: "{{job.title}} at {{job.company.name}} - {{match.score}}% match",
    data: {
      type: "job_match",
      jobId: "{{job.id}}",
      matchScore: "{{match.score}}"
    }
  },
  messageReceived: {
    title: "New Message from {{sender.name}}",
    body: "{{message.preview}}",
    data: {
      type: "message",
      conversationId: "{{conversation.id}}"
    }
  }
};
```

## Queue Management
### Job Processing
```typescript
// Add notification to queue
const notificationQueue = new Bull('notifications', {
  redis: { host: 'localhost', port: 6379 }
});

// Process notifications
notificationQueue.process('send-email', async (job) => {
  const { template, recipient, data } = job.data;
  return await sendEmail(template, recipient, data);
});

notificationQueue.process('send-push', async (job) => {
  const { template, deviceTokens, data } = job.data;
  return await sendPushNotification(template, deviceTokens, data);
});
```

### Retry Logic
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

## User Preferences
### Preference Management
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

## Delivery Tracking
### Analytics
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

## Provider Integration
### Email Providers
```typescript
// SendGrid integration
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

### SMS Provider
```typescript
// Twilio integration
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

### Push Notifications
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

## Environment Variables
```bash
# Email Configuration
SENDGRID_API_KEY=your-sendgrid-key
SES_ACCESS_KEY=your-ses-access-key
SES_SECRET_KEY=your-ses-secret-key
FROM_EMAIL=noreply@iworkz.com

# SMS Configuration
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email

# Queue Configuration
REDIS_URL=redis://localhost:6379
QUEUE_CONCURRENCY=10
```