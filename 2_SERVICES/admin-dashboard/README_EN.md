# Admin Dashboard

## Overview

The iWORKZ Admin Dashboard is a Next.js 14 administrative interface for platform management, user administration, analytics monitoring, and system oversight. It provides comprehensive tools for managing the iWORKZ platform.

## Features

* **Real-time Dashboard**: Live platform metrics and KPIs
* **User Management**: User administration and role management
* **Service Monitoring**: Health status of all microservices
* **Analytics Overview**: Platform performance and business metrics
* **Quick Actions**: Direct access to management functions
* **Responsive Design**: Mobile-friendly administrative interface
* **Security**: Role-based access control and audit logging

## Tech Stack

* **Framework**: Next.js 14 with App Router
* **Language**: TypeScript
* **UI Library**: Tailwind CSS + Headless UI
* **Icons**: Heroicons
* **State Management**: React hooks
* **API Integration**: Axios for service communication

## Getting Started

### Prerequisites

* Node.js 18+
* npm 8+
* Docker (for containerized deployment)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Service available at http://localhost:3006
```

### Docker Deployment

```bash
# Build image
docker build -t iworkz-admin-dashboard .

# Run container
docker run -p 3006:3006 iworkz-admin-dashboard
```

## Key Features

### User Management

* User account administration
* Role and permission management
* Account verification and suspension
* Bulk user operations
* User activity monitoring

### Platform Analytics

* Key performance indicators (KPIs)
* User engagement metrics
* Job posting and matching statistics
* Revenue and financial reporting
* Real-time dashboard updates

### Content Moderation

* Job posting review and approval
* User-generated content moderation
* Automated content filtering
* Report management system
* Compliance monitoring

### System Administration

* Service health monitoring
* Database administration tools
* Performance metrics and alerts
* Configuration management
* Audit log viewing

## Dashboard Modules

### Main Dashboard

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

### User Analytics

* User registration trends
* Engagement heatmaps
* Feature usage statistics
* Geographic distribution
* Cohort analysis

### Job Analytics

* Job posting trends
* Industry distribution
* Salary range analysis
* Time-to-fill metrics
* Success rate by category

## Component Library

### Data Visualization

```typescript
// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
}

// Chart Components
interface ChartProps {
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area';
  config: ChartConfiguration;
}
```

### Admin Tables

```typescript
// User Management Table
interface UserTableRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: Date;
  actions: AdminAction[];
}

// Job Management Table
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

## Security Features

### Role-Based Access Control

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

### Audit Logging

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

## Real-time Features

### Live Updates

* Real-time user activity
* Live chat support integration
* System alerts and notifications
* Performance metric updates
* Event stream monitoring

### WebSocket Integration

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

## Reports and Analytics

### Automated Reports

* Daily activity summaries
* Weekly performance reports
* Monthly business intelligence
* Quarterly trend analysis
* Custom report generation

### Data Export

```typescript
// Export functionality
const exportData = async (type: 'users' | 'jobs' | 'analytics', format: 'csv' | 'xlsx' | 'pdf') => {
  const data = await fetchData(type);
  return await generateExport(data, format);
};
```

## System Monitoring

### Health Checks

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

### Alert Management

* System performance alerts
* Error rate thresholds
* Resource usage warnings
* Security incident notifications
* Custom alert rules

## Environment Variables

```bash
# Admin Authentication
ADMIN_JWT_SECRET=your-admin-jwt-secret
ADMIN_SESSION_TIMEOUT=3600

# API Configuration
API_BASE_URL=http://localhost:8000
WEBSOCKET_URL=ws://localhost:8000

# Analytics
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token

# Feature Flags
ENABLE_USER_MANAGEMENT=true
ENABLE_CONTENT_MODERATION=true
ENABLE_SYSTEM_MONITORING=true
```

## Deployment

* Separate deployment from main application
* Restricted network access
* VPN-only access in production
* Enhanced security monitoring
* Regular security audits
