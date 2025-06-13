# iWORKZプラットフォームAPI契約
## サービス間通信仕様

### **概要**
このドキュメントは、iWORKZマイクロサービスアーキテクチャ内でのサービス間通信のためのAPI契約を定義します。各サービスは、他のサービスが利用できる特定のエンドポイントを公開し、疎結合と高凝集性を確保します。

---

## **1. 認証サービス**

### **サービスインターフェース: `auth-service`**
**ベースURL**: `http://auth-service:3001`

#### **トークン検証エンドポイント**
```http
POST /internal/validate-token
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "required_permissions": ["read:jobs", "write:applications"]
}
```

**レスポンス:**
```json
{
  "valid": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "candidate",
  "permissions": ["read:jobs", "write:applications", "read:profile"],
  "expires_at": "2024-12-31T23:59:59Z"
}
```

#### **サービス認証**
```http
POST /internal/service-auth
Content-Type: application/json

{
  "service_name": "matching-engine",
  "api_key": "srv_12345...",
  "requested_scopes": ["user:read", "jobs:read", "ai:process"]
}
```

---

## **2. ユーザー管理サービス**

### **サービスインターフェース: `user-service`**
**ベースURL**: `http://user-service:3002`

#### **ユーザープロフィール取得（内部）**
```http
GET /internal/users/{user_id}
Authorization: Bearer <service-token>
```

**レスポンス:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "candidate",
  "profile": {
    "skills": [
      {"name": "JavaScript", "level": "advanced", "years_experience": 5},
      {"name": "React", "level": "expert", "years_experience": 4}
    ],
    "location": {
      "city": "Tokyo",
      "prefecture": "Tokyo",
      "country": "JP"
    },
    "experience": [...],
    "education": [...],
    "languages": [...]
  },
  "preferences": {
    "salary_range": {"min": 6000000, "max": 10000000, "currency": "JPY"},
    "work_location": "hybrid",
    "visa_sponsorship_needed": false
  }
}
```

#### **一括ユーザー検索**
```http
POST /internal/users/bulk-lookup
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "user_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ],
  "include_fields": ["basic_info", "skills", "location"]
}
```

---

## **3. 求人管理サービス**

### **サービスインターフェース: `job-service`**
**ベースURL**: `http://job-service:3003`

#### **求人詳細取得（内部）**
```http
GET /internal/jobs/{job_id}
Authorization: Bearer <service-token>
```

**レスポンス:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "シニアReact開発者",
  "company": {
    "id": "comp_123",
    "name": "TechCorp Japan",
    "industry": "テクノロジー"
  },
  "requirements": {
    "skills": [
      {"name": "React", "level": "advanced", "required": true, "weight": 0.8},
      {"name": "TypeScript", "level": "intermediate", "required": true, "weight": 0.6}
    ],
    "experience_years": 3,
    "education_level": "bachelor",
    "languages": [
      {"code": "ja", "level": "business"},
      {"code": "en", "level": "conversational"}
    ]
  },
  "location": {
    "city": "東京",
    "prefecture": "東京都",
    "remote_work": "hybrid"
  },
  "salary": {
    "min": 7000000,
    "max": 12000000,
    "currency": "JPY",
    "period": "yearly"
  },
  "visa_sponsorship": true,
  "status": "active",
  "posted_at": "2024-01-15T10:00:00Z",
  "expires_at": "2024-03-15T23:59:59Z"
}
```

#### **マッチング用求人検索**
```http
POST /internal/jobs/search-for-matching
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "candidate_profile": {
    "skills": [...],
    "location": {...},
    "experience_years": 5,
    "salary_expectation": {...}
  },
  "filters": {
    "status": "active",
    "visa_sponsorship": true,
    "remote_work": ["hybrid", "fully_remote"]
  },
  "limit": 50
}
```

---

## **4. AIマッチングエンジン**

### **サービスインターフェース: `ai-matching-service`**
**ベースURL**: `http://ai-matching-service:3004`

#### **マッチングスコア計算**
```http
POST /internal/calculate-match
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "candidate_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "matching_criteria": {
    "skills_weight": 0.4,
    "experience_weight": 0.3,
    "location_weight": 0.2,
    "language_weight": 0.1
  }
}
```

**レスポンス:**
```json
{
  "overall_score": 0.85,
  "breakdown": {
    "skills_score": 0.90,
    "experience_score": 0.80,
    "location_score": 0.95,
    "language_score": 0.75
  },
  "matched_skills": ["React", "TypeScript", "Node.js"],
  "missing_skills": ["GraphQL"],
  "experience_gap": 0,
  "location_match": "exact",
  "language_compatibility": "high",
  "confidence": 0.92,
  "explanation": "優秀な場所適合性を持つ強力な技術マッチ",
  "calculated_at": "2024-01-20T14:30:00Z"
}
```

#### **バッチマッチング**
```http
POST /internal/batch-matching
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "candidates": ["user_id_1", "user_id_2", ...],
  "jobs": ["job_id_1", "job_id_2", ...],
  "matching_criteria": {...},
  "minimum_score": 0.7
}
```

---

## **5. コンプライアンスエンジン**

### **サービスインターフェース: `compliance-service`**
**ベースURL**: `http://compliance-service:3005`

#### **雇用適格性検証**
```http
POST /internal/validate-eligibility
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "candidate_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "validation_type": "full_check"
}
```

**レスポンス:**
```json
{
  "eligible": true,
  "compliance_score": 0.95,
  "visa_status": {
    "type": "permanent_resident",
    "valid_until": null,
    "work_authorized": true
  },
  "tax_compliance": {
    "status": "compliant",
    "last_checked": "2024-01-15T00:00:00Z"
  },
  "labor_law_compliance": {
    "overtime_eligible": true,
    "minimum_wage_applicable": true,
    "health_insurance_required": true
  },
  "required_documents": [],
  "recommendations": [
    "30日以内に健康保険への加入を確実にしてください"
  ],
  "validated_at": "2024-01-20T14:30:00Z"
}
```

#### **規制更新確認**
```http
GET /internal/regulatory-updates
Authorization: Bearer <service-token>
クエリパラメータ:
- since: 2024-01-01T00:00:00Z
- category: labor_law,visa_regulations
```

---

## **6. 資格認証サービス**

### **サービスインターフェース: `credential-service`**
**ベースURL**: `http://credential-service:3006`

#### **資格認証**
```http
POST /internal/verify-credential
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "credential_id": "cred_12345",
  "verification_level": "full",
  "blockchain_verification": true
}
```

**レスポンス:**
```json
{
  "verified": true,
  "verification_score": 0.98,
  "blockchain_verified": true,
  "issuer_verified": true,
  "data_integrity_verified": true,
  "expiry_status": "valid",
  "verification_details": {
    "blockchain_hash": "0x1234...",
    "transaction_id": "0xabcd...",
    "block_number": 18500000,
    "ipfs_hash": "QmX1234..."
  },
  "verified_at": "2024-01-20T14:30:00Z"
}
```

---

## **7. 通知サービス**

### **サービスインターフェース: `notification-service`**
**ベースURL**: `http://notification-service:3007`

#### **通知送信**
```http
POST /internal/send-notification
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "job_match",
  "priority": "medium",
  "channels": ["in_app", "email"],
  "template": "new_job_match",
  "data": {
    "job_title": "シニアReact開発者",
    "company_name": "TechCorp Japan",
    "match_score": 0.85,
    "job_url": "https://app.iworkz.jp/jobs/123"
  },
  "schedule_at": null,
  "deduplication_key": "job_match_user_123_job_456"
}
```

**レスポンス:**
```json
{
  "notification_id": "notif_12345",
  "status": "sent",
  "channels_sent": ["in_app", "email"],
  "channels_failed": [],
  "sent_at": "2024-01-20T14:30:00Z"
}
```

---

## **8. 分析サービス**

### **サービスインターフェース: `analytics-service`**
**ベースURL**: `http://analytics-service:3008`

#### **イベント追跡**
```http
POST /internal/track-event
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "event_type": "job_view",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "properties": {
    "job_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "source": "search_results",
    "match_score": 0.85,
    "position_in_list": 3
  },
  "timestamp": "2024-01-20T14:30:00Z",
  "session_id": "sess_12345"
}
```

#### **分析データ取得**
```http
POST /internal/analytics/query
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "metric": "job_application_funnel",
  "filters": {
    "date_range": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "user_segment": "candidates",
    "location": "Tokyo"
  },
  "group_by": ["date", "job_category"]
}
```

---

## **9. 検索サービス**

### **サービスインターフェース: `search-service`**
**ベースURL**: `http://search-service:3009`

#### **ドキュメントインデックス**
```http
POST /internal/index
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "index": "jobs",
  "document_id": "job_12345",
  "document": {
    "title": "シニアReact開発者",
    "description": "経験豊富なReact開発者を探しています...",
    "skills": ["React", "TypeScript", "Node.js"],
    "location": {
      "city": "東京",
      "prefecture": "東京都",
      "country": "JP",
      "coordinates": [35.6762, 139.6503]
    },
    "salary_range": [7000000, 12000000],
    "company": "TechCorp Japan",
    "posted_at": "2024-01-20T14:30:00Z"
  }
}
```

#### **ドキュメント検索**
```http
POST /internal/search
Content-Type: application/json
Authorization: Bearer <service-token>

{
  "index": "jobs",
  "query": {
    "bool": {
      "must": [
        {"match": {"skills": "React"}},
        {"range": {"salary_range.min": {"gte": 6000000}}}
      ],
      "filter": [
        {"term": {"status": "active"}},
        {"geo_distance": {
          "distance": "50km",
          "location.coordinates": [35.6762, 139.6503]
        }}
      ]
    }
  },
  "sort": [
    {"posted_at": {"order": "desc"}},
    {"_score": {"order": "desc"}}
  ],
  "size": 20,
  "from": 0
}
```

---

## **10. ファイルストレージサービス**

### **サービスインターフェース: `file-service`**
**ベースURL**: `http://file-service:3010`

#### **ファイルアップロード**
```http
POST /internal/upload
Content-Type: multipart/form-data
Authorization: Bearer <service-token>

file: [バイナリデータ]
user_id: 550e8400-e29b-41d4-a716-446655440000
file_type: resume
visibility: private
```

**レスポンス:**
```json
{
  "file_id": "file_12345",
  "url": "https://cdn.iworkz.jp/files/12345/resume.pdf",
  "cdn_url": "https://cdn.iworkz.jp/files/12345/resume.pdf",
  "size": 1048576,
  "type": "application/pdf",
  "uploaded_at": "2024-01-20T14:30:00Z",
  "expires_at": null
}
```

---

## **サービスディスカバリー設定**

### **Consulサービス登録**
```json
{
  "service": {
    "name": "matching-engine",
    "id": "matching-engine-1",
    "tags": ["ai", "matching", "production"],
    "address": "10.0.1.15",
    "port": 3004,
    "meta": {
      "version": "1.0.0",
      "environment": "production"
    },
    "check": {
      "http": "http://10.0.1.15:3004/health",
      "interval": "10s",
      "timeout": "3s"
    }
  }
}
```

### **ロードバランシング設定**
```yaml
# サービスロードバランシング用HAProxy設定
global
  daemon

defaults
  mode http
  timeout connect 5000ms
  timeout client 50000ms
  timeout server 50000ms

backend auth-service
  balance roundrobin
  server auth1 auth-service-1:3001 check
  server auth2 auth-service-2:3001 check

backend matching-engine
  balance leastconn
  server match1 matching-engine-1:3004 check
  server match2 matching-engine-2:3004 check
```

---

## **エラーハンドリング標準**

### **標準エラーレスポンス**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "無効な入力パラメータ",
    "details": {
      "field": "email",
      "reason": "無効なメール形式"
    },
    "request_id": "req_12345",
    "timestamp": "2024-01-20T14:30:00Z"
  }
}
```

### **一般的エラーコード**
- `AUTHENTICATION_FAILED` - 無効または期限切れトークン
- `AUTHORIZATION_DENIED` - 権限不足
- `VALIDATION_ERROR` - 入力検証失敗
- `RESOURCE_NOT_FOUND` - 要求されたリソースが見つからない
- `RATE_LIMIT_EXCEEDED` - リクエスト過多
- `SERVICE_UNAVAILABLE` - ダウンストリームサービス利用不可
- `INTERNAL_ERROR` - 予期しないサーバーエラー

---

## **サーキットブレーカー設定**

### **Hystrix設定**
```yaml
hystrix:
  command:
    default:
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 5000
      circuitBreaker:
        requestVolumeThreshold: 20
        sleepWindowInMilliseconds: 30000
        errorThresholdPercentage: 50
  
  collapser:
    default:
      timerDelayInMilliseconds: 100
      maxRequestsInBatch: 10
```

---

## **監視・トレーシング**

### **ヘルスチェックエンドポイント**
全サービス実装必須:
```http
GET /health
```

**レスポンス:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "external_api": "degraded"
  },
  "timestamp": "2024-01-20T14:30:00Z"
}
```

### **分散トレーシングヘッダー**
```http
X-Trace-ID: 1234567890abcdef
X-Span-ID: abcdef1234567890
X-Parent-Span-ID: fedcba0987654321
X-Correlation-ID: corr_12345
```

---

このAPI契約仕様により、全iWORKZマイクロサービス間での一貫したコミュニケーションパターンが保証され、信頼性・拡張性のあるサービス間相互作用が可能になります。