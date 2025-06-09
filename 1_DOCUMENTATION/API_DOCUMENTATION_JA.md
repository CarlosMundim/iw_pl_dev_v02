# iWORKZ プラットフォーム API ドキュメント（日本語）

## 目次
1. [はじめに](#はじめに)
2. [認証](#認証)
3. [レート制限](#レート制限)
4. [エラーハンドリング](#エラーハンドリング)
5. [バックエンドAPIエンドポイント](#バックエンドapiエンドポイント)
6. [AI エージェント API エンドポイント](#ai-エージェント-api-エンドポイント)
7. [SDK の使用方法](#sdk-の使用方法)
8. [統合例](#統合例)

## はじめに

iWORKZ プラットフォームは、国際的な人材と日本企業を結ぶために設計された包括的な RESTful API セットを提供します。当プラットフォームは、高度な AI 駆動のマッチング、コンプライアンスチェック、および文書処理機能を特徴としています。

### ベース URL
- **本番環境**: `https://api.iworkz.com`
- **ステージング環境**: `https://staging-api.iworkz.com`
- **AI エージェント**: `https://api.iworkz.com/ai`

### API バージョニング
現在の API バージョン: `v1`

すべてのエンドポイントは、バックエンドサービスには `/api`、AI 機能には `/ai` のプレフィックスが付きます。

## 認証

### JWT トークン認証
ほとんどのエンドポイントは JWT トークンによる認証が必要です。Authorization ヘッダーにトークンを含めてください：

```
Authorization: Bearer <your-jwt-token>
```

### アクセストークンの取得
```bash
curl -X POST https://api.iworkz.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

レスポンス:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "userType": "talent"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### トークンリフレッシュ
```bash
curl -X POST https://api.iworkz.com/api/auth/refresh-token \
  -H "Authorization: Bearer <current-token>"
```

## レート制限

公平な使用を確保するため、API リクエストはレート制限されています：

- **一般的なエンドポイント**: 1分間に100リクエスト
- **認証エンドポイント**: 1分間に10リクエスト
- **ファイルアップロード**: 1分間に20リクエスト
- **AI 処理**: 1分間に50リクエスト

レスポンスにはレート制限ヘッダーが含まれます：
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## エラーハンドリング

### 標準エラーレスポンス形式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "無効な入力データです",
    "details": {
      "field": "email",
      "issue": "無効なメール形式です"
    }
  }
}
```

### HTTP ステータスコード
- `200` - 成功
- `201` - 作成完了
- `400` - 不正なリクエスト
- `401` - 未認証
- `403` - 禁止
- `404` - 見つかりません
- `429` - レート制限を超過
- `500` - 内部サーバーエラー

## バックエンド API エンドポイント

### 認証エンドポイント

#### ユーザー登録
人材、雇用主、またはエージェンシーの新しいユーザーアカウントを作成します。

**POST** `/api/auth/register`

**リクエストボディ:**
```json
{
  "email": "talent@example.com",
  "password": "securepassword123",
  "firstName": "太郎",
  "lastName": "田中",
  "userType": "talent",
  "phone": "+81-90-1234-5678",
  "countryCode": "JP",
  "termsAccepted": true,
  "privacyAccepted": true
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "talent@example.com",
      "firstName": "太郎",
      "lastName": "田中",
      "userType": "talent"
    },
    "token": "jwt-token"
  }
}
```

#### ログイン
ユーザーを認証してアクセストークンを受け取ります。

**POST** `/api/auth/login`

**リクエストボディ:**
```json
{
  "email": "talent@example.com",
  "password": "securepassword123"
}
```

#### 現在のユーザー取得
認証された現在のユーザーのプロフィールを取得します。

**GET** `/api/auth/me`

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "talent@example.com",
      "firstName": "太郎",
      "lastName": "田中",
      "userType": "talent",
      "profile": {
        "skills": ["JavaScript", "React", "Node.js"],
        "experience": "5年",
        "location": "東京都"
      }
    }
  }
}
```

#### パスワード変更
ユーザーのパスワードを更新します。

**PATCH** `/api/auth/change-password`

**ヘッダー:** `Authorization: Bearer <token>`

**リクエストボディ:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### パスワードリセット
パスワードリセットフローを開始します。

**POST** `/api/auth/forgot-password`

**リクエストボディ:**
```json
{
  "email": "talent@example.com"
}
```

**POST** `/api/auth/reset-password`

**リクエストボディ:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

### 求人管理エンドポイント

#### 全求人取得
アクティブな求人投稿のページ分割されたリストを取得します。

**GET** `/api/jobs?page=1&limit=20`

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-uuid",
        "title": "シニアフルスタック開発者",
        "description": "経験豊富な開発者を探しています...",
        "company": {
          "name": "テックコープジャパン",
          "location": "東京"
        },
        "salary": {
          "min": 6000000,
          "max": 10000000,
          "currency": "JPY"
        },
        "skillsRequired": ["JavaScript", "React", "Python"],
        "remoteAllowed": true,
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### 単一求人取得
特定の求人に関する詳細情報を取得します。

**GET** `/api/jobs/{jobId}`

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job-uuid",
      "title": "シニアフルスタック開発者",
      "description": "詳細な求人説明...",
      "requirements": "5年以上の経験...",
      "skillsRequired": ["JavaScript", "React", "Python", "AWS"],
      "experienceLevel": "senior",
      "employmentType": "full-time",
      "location": "東京都",
      "remoteAllowed": true,
      "salaryRange": {
        "min": 6000000,
        "max": 10000000,
        "currency": "JPY"
      },
      "benefits": ["健康保険", "ビザサポート"],
      "company": {
        "id": "company-uuid",
        "name": "テックコープジャパン",
        "industry": "テクノロジー",
        "size": "500-1000人",
        "description": "日本の主要テクノロジー企業"
      }
    }
  }
}
```

#### 求人投稿作成
新しい求人投稿を作成します（雇用主/管理者のみ）。

**POST** `/api/jobs`

**ヘッダー:** `Authorization: Bearer <token>`

**リクエストボディ:**
```json
{
  "title": "AI エンジニア",
  "description": "経験豊富な AI エンジニアを募集しています...",
  "requirements": "コンピューターサイエンスまたは関連分野の修士号...",
  "skillsRequired": ["Python", "TensorFlow", "機械学習"],
  "experienceLevel": "senior",
  "employmentType": "full-time",
  "location": "大阪府",
  "remoteAllowed": false,
  "salaryRange": {
    "min": 8000000,
    "max": 12000000,
    "currency": "JPY"
  },
  "benefits": ["ビザサポート", "健康保険", "ストックオプション"]
}
```

### マッチングエンドポイント

#### 人材向け求人マッチング取得
認証された人材向けの AI 駆動求人推薦を取得します。

**GET** `/api/matching/jobs?limit=10`

**ヘッダー:** `Authorization: Bearer <token>` (人材ロール必須)

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "job": {
          "id": "job-uuid",
          "title": "フルスタック開発者",
          "company": "テックコープジャパン"
        },
        "matchScore": 0.89,
        "reasons": [
          "スキルマッチ: JavaScript, React",
          "経験レベルが一致",
          "勤務地希望がマッチ"
        ],
        "skillsMatch": {
          "matched": ["JavaScript", "React", "Node.js"],
          "missing": ["AWS"],
          "score": 0.85
        }
      }
    ]
  }
}
```

#### 求人向け人材マッチング取得
特定の求人に対する AI 駆動人材推薦を取得します。

**GET** `/api/matching/talents/{jobId}?limit=10`

**ヘッダー:** `Authorization: Bearer <token>` (雇用主/管理者ロール必須)

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "talent": {
          "id": "talent-uuid",
          "firstName": "太郎",
          "lastName": "田.",
          "skills": ["JavaScript", "React", "Python"],
          "experience": "5年",
          "location": "東京"
        },
        "matchScore": 0.92,
        "strengths": [
          "優秀な技術スキルマッチ",
          "類似ポジションでの豊富な経験",
          "即座に就業可能"
        ],
        "considerations": [
          "給与期待値が高い可能性"
        ]
      }
    ]
  }
}
```

### ファイルアップロードエンドポイント

#### ファイルアップロード
履歴書、文書、または画像をアップロードします。

**POST** `/api/upload`

**ヘッダー:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**リクエストボディ:**
```
file: [バイナリファイルデータ]
```

**サポート形式:** PDF, DOC, DOCX, JPEG, JPG, PNG (最大5MB)

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-uuid",
      "filename": "resume.pdf",
      "originalName": "田中太郎_履歴書.pdf",
      "size": 1024000,
      "url": "https://storage.iworkz.com/files/file-uuid.pdf",
      "type": "application/pdf"
    }
  }
}
```

### コンプライアンスエンドポイント

#### 求人コンプライアンスチェック
特定の管轄区域に対する求人投稿のコンプライアンスを確認します。

**POST** `/api/compliance/check-job/{jobId}`

**ヘッダー:** `Authorization: Bearer <token>` (雇用主/管理者ロール必須)

**リクエストボディ:**
```json
{
  "jurisdiction": "JP"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "compliance": {
      "status": "compliant",
      "jurisdiction": "JP",
      "checks": [
        {
          "rule": "visa_sponsorship_disclosure",
          "status": "pass",
          "description": "ビザサポートが明確に記載されています"
        },
        {
          "rule": "salary_disclosure",
          "status": "warning",
          "description": "より詳細な給与内訳の記載を検討してください"
        }
      ],
      "recommendations": [
        "サポートする特定のビザタイプを追加",
        "残業代ポリシーの詳細を含める"
      ]
    }
  }
}
```

#### コンプライアンスルール取得
管轄区域のコンプライアンスルールを取得します。

**GET** `/api/compliance/rules/{jurisdiction}`

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "jurisdiction": "JP",
    "rules": [
      {
        "id": "visa_sponsorship",
        "name": "ビザサポート開示",
        "description": "ビザサポートの可否を明確に記載する必要があります",
        "mandatory": true,
        "category": "employment_law"
      }
    ]
  }
}
```

### 分析エンドポイント

#### プラットフォーム分析取得
プラットフォーム全体の統計を取得します（管理者のみ）。

**GET** `/api/analytics/platform`

**ヘッダー:** `Authorization: Bearer <token>` (管理者ロール必須)

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "activeUsers": 1250,
      "totalJobs": 856,
      "totalApplications": 3420,
      "successfulMatches": 127,
      "topSkills": ["JavaScript", "Python", "React"],
      "topIndustries": ["テクノロジー", "金融", "ヘルスケア"],
      "userGrowth": {
        "thisMonth": 89,
        "lastMonth": 76
      }
    }
  }
}
```

#### ユーザーイベント追跡
ユーザーインタラクションイベントを記録します。

**POST** `/api/analytics/events`

**ヘッダー:** `Authorization: Bearer <token>`

**リクエストボディ:**
```json
{
  "eventType": "job_view",
  "eventCategory": "engagement",
  "eventData": {
    "jobId": "job-uuid",
    "duration": 120,
    "source": "search"
  }
}
```

## AI エージェント API エンドポイント

### コンプライアンス AI エンドポイント

#### AI コンプライアンスチェック
包括的な AI 駆動コンプライアンス分析。

**POST** `/ai/compliance/check`

**ヘッダー:** `Authorization: Bearer <token>`

**リクエストボディ:**
```json
{
  "entity_type": "job_posting",
  "entity_id": "job-uuid",
  "jurisdiction": "JP",
  "check_types": ["employment_law", "visa_requirements", "discrimination"],
  "include_recommendations": true,
  "use_cached_results": false
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "compliance_result": {
      "overall_status": "compliant_with_warnings",
      "confidence_score": 0.94,
      "jurisdiction": "JP",
      "checks_performed": [
        {
          "type": "employment_law",
          "status": "compliant",
          "score": 0.96,
          "findings": [
            "労働時間が明確に記載されています",
            "残業代について言及されています"
          ]
        },
        {
          "type": "visa_requirements",
          "status": "warning",
          "score": 0.78,
          "findings": [
            "ビザサポートの可否が不明確です",
            "必要なビザタイプが指定されていません"
          ]
        }
      ],
      "ai_recommendations": [
        {
          "priority": "high",
          "category": "visa_requirements",
          "suggestion": "サポートするビザタイプを明確に記載してください（例：技術・人文知識・国際業務）",
          "impact": "透明性が向上し、応募者の混乱を減らします"
        }
      ],
      "regulatory_references": [
        {
          "law": "出入国管理及び難民認定法",
          "article": "第7条の1の2",
          "summary": "外国人の就労ビザ要件"
        }
      ]
    }
  }
}
```

#### 一括コンプライアンスチェック
複数のエンティティを同時にチェックします。

**POST** `/ai/compliance/bulk-check`

**ヘッダー:** `Authorization: Bearer <token>`

**リクエストボディ:**
```json
{
  "entity_ids": ["job-uuid-1", "job-uuid-2", "job-uuid-3"],
  "entity_type": "job_posting",
  "jurisdiction": "JP",
  "check_types": ["employment_law", "visa_requirements"]
}
```

#### サポート管轄区域取得
サポートされているすべてのコンプライアンス管轄区域をリストします。

**GET** `/ai/compliance/jurisdictions`

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "jurisdictions": [
      {
        "code": "JP",
        "name": "日本",
        "supported_checks": ["employment_law", "visa_requirements", "discrimination"],
        "language": "ja"
      },
      {
        "code": "US",
        "name": "アメリカ合衆国",
        "supported_checks": ["employment_law", "discrimination", "accessibility"],
        "language": "en"
      }
    ]
  }
}
```

### 文書処理 AI エンドポイント

#### 履歴書解析
AI を使用して履歴書ファイルから構造化データを抽出します。

**POST** `/ai/documents/parse-resume`

**ヘッダー:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**リクエストボディ:**
```
file: [履歴書ファイル - PDF, DOC, DOCX, TXT, 最大10MB]
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "parsed_resume": {
      "personal_info": {
        "name": "田中太郎",
        "email": "tanaka.taro@email.com",
        "phone": "+81-90-1234-5678",
        "location": "東京都",
        "visa_status": "就労ビザが必要"
      },
      "skills": [
        {
          "name": "JavaScript",
          "category": "プログラミング言語",
          "proficiency": "エキスパート",
          "years_experience": 5
        },
        {
          "name": "React",
          "category": "フロントエンドフレームワーク",
          "proficiency": "上級",
          "years_experience": 4
        }
      ],
      "experience": [
        {
          "company": "テックソリューションズ株式会社",
          "position": "シニアフロントエンド開発者",
          "duration": "2020-2024",
          "location": "東京都",
          "description": "React ベースのアプリケーション開発をリード...",
          "achievements": [
            "アプリケーションパフォーマンスを40%改善",
            "5名の開発者チームをリード"
          ]
        }
      ],
      "education": [
        {
          "institution": "東京大学",
          "degree": "コンピューターサイエンス学士",
          "year": "2019",
          "location": "東京都"
        }
      ],
      "languages": [
        {
          "language": "日本語",
          "proficiency": "ネイティブ"
        },
        {
          "language": "英語",
          "proficiency": "流暢"
        }
      ],
      "confidence_score": 0.93,
      "extraction_notes": [
        "明確な構造を持つ高品質な文書",
        "すべてのセクションが正常に識別されました"
      ]
    }
  }
}
```

#### 文書分析
設定可能な抽出機能を持つ一般的な文書分析。

**POST** `/ai/documents/analyze-document`

**ヘッダー:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**リクエストボディ:**
```
file: [文書ファイル]
document_type: "contract" | "resume" | "job_description" | "other"
extract_skills: true
extract_experience: true
extract_education: false
extract_contact: true
```

#### サポート文書形式取得
サポートされているファイル形式と処理機能をリストします。

**GET** `/ai/documents/supported-formats`

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "supported_formats": [
      {
        "format": "PDF",
        "max_size_mb": 10,
        "features": ["text_extraction", "ocr", "structure_analysis"]
      },
      {
        "format": "DOCX",
        "max_size_mb": 10,
        "features": ["text_extraction", "structure_analysis", "metadata"]
      }
    ],
    "processing_capabilities": [
      "履歴書解析",
      "スキル抽出",
      "経験分析",
      "連絡先情報抽出",
      "言語検出"
    ]
  }
}
```

### AI マッチングエンドポイント

#### AI 候補者マッチング
求人に対する高度な AI 駆動人材マッチング。

**POST** `/ai/matching/match-candidates`

**ヘッダー:** `Authorization: Bearer <token>`

**リクエストボディ:**
```json
{
  "job_id": "job-uuid",
  "talent_ids": ["talent-1", "talent-2"],
  "max_results": 20,
  "min_score": 0.7,
  "include_explanation": true,
  "use_cached_results": false
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "matching_results": [
      {
        "talent_id": "talent-uuid",
        "match_score": 0.89,
        "confidence": 0.94,
        "explanation": {
          "strengths": [
            "優秀な技術スキルの一致（95%マッチ）",
            "類似ポジションでの豊富な経験",
            "希望勤務地のマッチ"
          ],
          "considerations": [
            "給与期待値が予算より15%高い",
            "2ヶ月の引き継ぎ期間"
          ],
          "skill_analysis": {
            "required_skills_match": 0.92,
            "bonus_skills_present": ["AWS", "Docker"],
            "missing_skills": ["Kubernetes"],
            "transferable_skills": ["Python", "React"]
          }
        },
        "scoring_breakdown": {
          "technical_skills": 0.95,
          "experience_level": 0.88,
          "location_preference": 1.0,
          "availability": 0.85,
          "cultural_fit": 0.82
        },
        "ai_insights": [
          "候補者は類似の企業文化で働いた経験があります",
          "キャリア進歩に基づく高い適応性",
          "日本語と英語での優秀なコミュニケーション能力"
        ]
      }
    ],
    "processing_time_ms": 1247,
    "algorithm_version": "v2.1.0"
  }
}
```

#### AI 求人マッチング
人材向けの AI 駆動求人推薦。

**POST** `/ai/matching/match-jobs`

**ヘッダー:** `Authorization: Bearer <token>`

**リクエストボディ:**
```json
{
  "talent_id": "talent-uuid",
  "job_ids": ["job-1", "job-2", "job-3"],
  "min_score": 0.6
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "job_matches": [
      {
        "job_id": "job-uuid",
        "match_score": 0.91,
        "recommendation_strength": "strong",
        "why_good_match": [
          "完璧な技術スキルの一致",
          "給与レンジが期待値と合致",
          "企業文化が希望と一致"
        ],
        "growth_opportunities": [
          "リーダーシップ開発プログラム",
          "国際プロジェクトへの参加",
          "高度な技術トレーニング"
        ],
        "potential_concerns": [
          "希望より通勤時間が長い",
          "リモートワークオプションが限定的"
        ]
      }
    ]
  }
}
```

## SDK の使用方法

### JavaScript/Node.js SDK

```javascript
const { iWORKZAPI } = require('@iworkz/api-sdk');

const client = new iWORKZAPI({
  baseURL: 'https://api.iworkz.com',
  apiKey: 'your-api-key'
});

// 認証
const auth = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// 求人マッチング取得
const matches = await client.matching.getJobMatches({
  limit: 10
});

// 履歴書アップロード
const resume = await client.documents.uploadResume(fileBuffer);
```

### Python SDK

```python
from iworkz_api import iWORKZClient

client = iWORKZClient(
    base_url="https://api.iworkz.com",
    api_key="your-api-key"
)

# 認証
auth_result = client.auth.login(
    email="user@example.com",
    password="password"
)

# 履歴書解析
with open("resume.pdf", "rb") as f:
    parsed_resume = client.ai.parse_resume(f)

# コンプライアンスチェック
compliance = client.ai.check_compliance(
    entity_type="job_posting",
    entity_id="job-uuid",
    jurisdiction="JP"
)
```

## 統合例

### 完全な求職応募フローの作成

```javascript
// 1. 人材登録
const registration = await client.auth.register({
  email: 'talent@example.com',
  password: 'securepassword',
  firstName: '太郎',
  lastName: '田中',
  userType: 'talent'
});

// 2. 履歴書アップロードと解析
const resumeFile = fs.readFileSync('resume.pdf');
const parsedResume = await client.ai.parseResume(resumeFile);

// 3. 解析データでプロフィール更新
await client.users.updateProfile({
  skills: parsedResume.skills.map(s => s.name),
  experience: parsedResume.experience
});

// 4. 求人マッチング取得
const jobMatches = await client.matching.getJobMatches({
  limit: 10,
  minScore: 0.7
});

// 5. トップマッチに応募
const topJob = jobMatches[0];
await client.jobs.apply(topJob.job.id, {
  coverLetter: 'このポジションに非常に興味があります...'
});
```

### コンプライアンスチェック付き雇用主求人投稿

```javascript
// 1. 求人投稿作成
const jobData = {
  title: 'シニアフルスタック開発者',
  description: '経験豊富な開発者を探しています...',
  skillsRequired: ['JavaScript', 'React', 'Node.js'],
  salaryRange: { min: 6000000, max: 10000000, currency: 'JPY' },
  location: '東京都',
  remoteAllowed: true
};

const job = await client.jobs.create(jobData);

// 2. コンプライアンスチェック
const compliance = await client.ai.checkCompliance({
  entityType: 'job_posting',
  entityId: job.id,
  jurisdiction: 'JP',
  includeRecommendations: true
});

// 3. 必要に応じて推奨事項に基づく求人更新
if (compliance.status === 'warning') {
  console.log('コンプライアンス推奨事項:', compliance.aiRecommendations);
  // AI の推奨事項に基づいて求人投稿を更新
}

// 4. 人材マッチング取得
const talentMatches = await client.matching.getTalentMatches(job.id, {
  limit: 20,
  minScore: 0.8
});
```

## サポートとリソース

- **API ドキュメント**: https://docs.iworkz.com/api
- **開発者ポータル**: https://developers.iworkz.com
- **サポートメール**: api-support@iworkz.com
- **ステータスページ**: https://status.iworkz.com
- **GitHub 例**: https://github.com/iworkz/api-examples

追加のサポートやご質問については、開発者サポートチームまでお問い合わせください。