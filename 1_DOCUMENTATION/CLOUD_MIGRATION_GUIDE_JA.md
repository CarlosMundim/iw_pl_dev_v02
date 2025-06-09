# iWORKZ プラットフォーム クラウド移行ガイド（日本語）

## 目次
1. [概要](#概要)
2. [AWS移行](#aws移行)
3. [Azure移行](#azure移行)
4. [移行前チェックリスト](#移行前チェックリスト)
5. [移行戦略](#移行戦略)
6. [コスト最適化](#コスト最適化)
7. [セキュリティ考慮事項](#セキュリティ考慮事項)
8. [監視と可観測性](#監視と可観測性)
9. [災害復旧](#災害復旧)
10. [商用ローンチ準備](#商用ローンチ準備)

## 概要

このガイドでは、商用展開のための iWORKZ プラットフォームの AWS または Azure への移行に関する包括的な手順を提供します。プラットフォームは 17+ のマイクロサービス、データベース、AI コンポーネント、および監視インフラで構成されています。

### 現在のアーキテクチャ
- **17+ マイクロサービス**: バックエンド API、AI エージェント、Web フロントエンド、モバイルアプリ
- **データベース**: PostgreSQL、Redis
- **AI/ML サービス**: OpenAI、Anthropic 統合
- **インフラ**: Docker コンテナ、Kubernetes オーケストレーション
- **監視**: Prometheus、Grafana、Loki、AlertManager

### 移行目標
- **スケーラビリティ**: 100,000+ ユーザーと 10,000+ 同時接続をサポート
- **高可用性**: 99.9% 稼働時間 SLA
- **グローバル展開**: 日本と国際市場のマルチリージョン展開
- **セキュリティ**: エンタープライズレベルのセキュリティとコンプライアンス
- **コスト効率**: オートスケーリングによる最適化されたクラウド支出

## AWS移行

### AWS アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS クラウドインフラ                      │
├─────────────────────────────────────────────────────────────────┤
│  Route 53 (DNS) → CloudFront (CDN) → ALB (ロードバランサー)    │
│                           │                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    EKS クラスター                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ Web         │  │ Backend API │  │  AI Agent   │      │  │
│  │  │ Frontend    │  │    Pods     │  │    Pods     │      │  │
│  │  │   Pods      │  └─────────────┘  └─────────────┘      │  │
│  │  └─────────────┘                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ RDS         │  │ ElastiCache │  │     S3      │              │
│  │ PostgreSQL  │  │   Redis     │  │  ストレージ  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ CloudWatch  │  │     ECR     │  │  Secrets    │              │
│  │   監視      │  │ レジストリ   │  │  Manager    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### AWS コスト見積もり

#### 月額コスト内訳（本番環境）

```yaml
aws_cost_estimation:
  compute:
    eks_cluster: 
      cost_jpy: 7800  # EKSクラスター管理費用
      description: "EKSクラスター管理料金"
    
    ec2_instances:
      general_nodes:
        instance_type: "m5.xlarge"
        count: 6
        cost_per_hour_usd: 0.192
        monthly_cost_jpy: 74880  # 6台 × $0.192 × 24時間 × 30日 × 130円/USD
      
      spot_nodes:
        instance_type: "m5.large"
        count: 3
        cost_per_hour_usd: 0.058  # スポット価格
        monthly_cost_jpy: 22360
    
    total_compute_jpy: 105040

  storage:
    ebs_volumes:
      gp3_storage: 
        size_gb: 1000
        cost_per_gb_month_usd: 0.08
        monthly_cost_jpy: 10400
    
    s3_storage:
      standard_tier:
        size_gb: 500
        cost_per_gb_month_usd: 0.023
        monthly_cost_jpy: 1495
      
      intelligent_tiering:
        size_gb: 2000
        cost_per_gb_month_usd: 0.0125
        monthly_cost_jpy: 3250
    
    total_storage_jpy: 15145

  database:
    rds_postgresql:
      instance_type: "db.r6g.xlarge"
      multi_az: true
      cost_per_hour_usd: 0.504
      monthly_cost_jpy: 48960
      
      storage_gb: 1000
      storage_cost_usd: 0.115
      storage_cost_jpy: 14950
    
    elasticache_redis:
      instance_type: "cache.r6g.large"
      nodes: 3
      cost_per_hour_usd: 0.252
      monthly_cost_jpy: 73440
    
    total_database_jpy: 137350

  networking:
    load_balancer:
      alb_hours: 744  # 月間時間数
      cost_per_hour_usd: 0.0225
      monthly_cost_jpy: 2178
    
    data_transfer:
      outbound_gb: 1000
      cost_per_gb_usd: 0.114
      monthly_cost_jpy: 14820
    
    cloudfront_cdn:
      requests_millions: 10
      data_transfer_gb: 2000
      monthly_cost_jpy: 6500
    
    total_networking_jpy: 23498

  monitoring:
    cloudwatch_logs:
      ingestion_gb: 500
      cost_per_gb_usd: 0.50
      monthly_cost_jpy: 32500
    
    cloudwatch_metrics:
      custom_metrics: 1000
      cost_per_metric_usd: 0.30
      monthly_cost_jpy: 39000
    
    total_monitoring_jpy: 71500

  total_estimated_monthly_cost_jpy: 352533
  total_estimated_monthly_cost_usd: 2712  # 130円/USD換算
```

### AWS セキュリティ実装

#### セキュリティグループ設定

```yaml
# aws-security-groups.yaml
security_groups:
  eks_cluster_sg:
    name: "iworkz-eks-cluster-sg"
    description: "EKSクラスター用セキュリティグループ"
    ingress_rules:
      - protocol: "tcp"
        from_port: 443
        to_port: 443
        source: "0.0.0.0/0"
        description: "HTTPS from anywhere"
      - protocol: "tcp"
        from_port: 80
        to_port: 80
        source: "0.0.0.0/0"
        description: "HTTP from anywhere (redirect to HTTPS)"
    
    egress_rules:
      - protocol: "-1"
        from_port: 0
        to_port: 0
        destination: "0.0.0.0/0"
        description: "All outbound traffic"

  rds_sg:
    name: "iworkz-rds-sg"
    description: "RDS PostgreSQL用セキュリティグループ"
    ingress_rules:
      - protocol: "tcp"
        from_port: 5432
        to_port: 5432
        source_security_group: "eks_cluster_sg"
        description: "PostgreSQL from EKS cluster only"

  redis_sg:
    name: "iworkz-redis-sg"
    description: "ElastiCache Redis用セキュリティグループ"
    ingress_rules:
      - protocol: "tcp"
        from_port: 6379
        to_port: 6379
        source_security_group: "eks_cluster_sg"
        description: "Redis from EKS cluster only"
```

#### IAM ロールとポリシー

```json
{
  "iam_roles": {
    "eks_cluster_role": {
      "name": "iworkz-eks-cluster-role",
      "assume_role_policy": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "eks.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          }
        ]
      },
      "managed_policies": [
        "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
      ]
    },
    
    "eks_node_role": {
      "name": "iworkz-eks-node-role",
      "assume_role_policy": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          }
        ]
      },
      "managed_policies": [
        "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
      ]
    },
    
    "application_role": {
      "name": "iworkz-application-role",
      "custom_policy": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": [
              "s3:GetObject",
              "s3:PutObject",
              "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::iworkz-storage/*"
          },
          {
            "Effect": "Allow",
            "Action": [
              "secretsmanager:GetSecretValue"
            ],
            "Resource": "arn:aws:secretsmanager:ap-northeast-1:*:secret:iworkz-production-secrets-*"
          }
        ]
      }
    }
  }
}
```

## Azure移行

### Azure アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────┐
│                      Azure クラウドインフラ                      │
├─────────────────────────────────────────────────────────────────┤
│  DNS Zone → Front Door (CDN) → Application Gateway             │
│                           │                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    AKS クラスター                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ Web         │  │ Backend API │  │  AI Agent   │      │  │
│  │  │ Frontend    │  │    Pods     │  │    Pods     │      │  │
│  │  │   Pods      │  └─────────────┘  └─────────────┘      │  │
│  │  └─────────────┘                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Azure DB    │  │Azure Cache  │  │    Blob     │              │
│  │ PostgreSQL  │  │ for Redis   │  │  Storage    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │Azure Monitor│  │     ACR     │  │ Key Vault   │              │
│  │   & Logs    │  │ レジストリ   │  │  シークレット│              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Azure コスト見積もり

#### 月額コスト内訳（本番環境）

```yaml
azure_cost_estimation:
  compute:
    aks_cluster:
      cost_jpy: 0  # AKSクラスター管理は無料
      description: "AKSクラスター管理（無料）"
    
    virtual_machines:
      general_nodes:
        vm_size: "Standard_D4s_v3"
        count: 6
        cost_per_hour_jpy: 24.96  # 東日本リージョン
        monthly_cost_jpy: 107827
      
      spot_nodes:
        vm_size: "Standard_D2s_v3"
        count: 3
        cost_per_hour_jpy: 6.24  # スポット価格（約50%割引）
        monthly_cost_jpy: 13478
    
    total_compute_jpy: 121305

  storage:
    managed_disks:
      premium_ssd:
        size_gb: 1000
        cost_per_gb_month_jpy: 21.0
        monthly_cost_jpy: 21000
    
    blob_storage:
      hot_tier:
        size_gb: 500
        cost_per_gb_month_jpy: 3.0
        monthly_cost_jpy: 1500
      
      cool_tier:
        size_gb: 2000
        cost_per_gb_month_jpy: 1.5
        monthly_cost_jpy: 3000
    
    total_storage_jpy: 25500

  database:
    postgresql_flexible:
      compute_tier: "General Purpose"
      vcores: 4
      memory_gb: 32
      cost_per_hour_jpy: 25.44
      monthly_cost_jpy: 92159
      
      storage_gb: 1000
      storage_cost_per_gb_jpy: 15.6
      storage_cost_jpy: 15600
    
    azure_cache_redis:
      tier: "Standard"
      cache_size: "C2"
      cost_per_hour_jpy: 45.24
      monthly_cost_jpy: 163766
    
    total_database_jpy: 271525

  networking:
    application_gateway:
      fixed_cost_jpy: 3480  # 月額固定費
      data_processing_gb: 1000
      processing_cost_jpy: 1040
    
    load_balancer:
      cost_per_hour_jpy: 2.6
      monthly_cost_jpy: 1872
    
    bandwidth:
      outbound_gb: 1000
      cost_per_gb_jpy: 15.6
      monthly_cost_jpy: 15600
    
    front_door_cdn:
      requests_millions: 10
      data_transfer_gb: 2000
      monthly_cost_jpy: 7800
    
    total_networking_jpy: 29792

  monitoring:
    azure_monitor:
      log_ingestion_gb: 500
      cost_per_gb_jpy: 390
      monthly_cost_jpy: 195000
    
    application_insights:
      data_volume_gb: 100
      cost_per_gb_jpy: 390
      monthly_cost_jpy: 39000
    
    total_monitoring_jpy: 234000

  total_estimated_monthly_cost_jpy: 682122
  total_estimated_monthly_cost_usd: 5247  # 130円/USD換算
```

## 移行前チェックリスト

### 技術要件

- [ ] **クラウドアカウント設定**
  - [ ] 請求設定付きAWS/Azureアカウント
  - [ ] IAMロールと権限の設定
  - [ ] 必要に応じてサービスクォータの増加
  - [ ] 多要素認証の有効化

- [ ] **ドメインとSSL証明書**
  - [ ] ドメイン登録（iworkz.com）
  - [ ] DNS管理設定
  - [ ] SSL証明書のプロビジョニング
  - [ ] CDN設定の計画

- [ ] **セキュリティとコンプライアンス**
  - [ ] セキュリティグループとネットワークACLの定義
  - [ ] 保存時および転送時の暗号化有効化
  - [ ] バックアップと災害復旧戦略
  - [ ] コンプライアンス要件のマッピング（GDPR、個人情報保護法）

- [ ] **監視とアラート**
  - [ ] 監視戦略の定義
  - [ ] アラート閾値の設定
  - [ ] ログ保持ポリシーの設定
  - [ ] パフォーマンスベースラインの確立

### ビジネス要件

- [ ] **商用ローンチ準備**
  - [ ] 価格戦略の確定
  - [ ] 決済処理統合
  - [ ] 利用規約とプライバシーポリシー
  - [ ] カスタマーサポートインフラ

- [ ] **スケーラビリティ計画**
  - [ ] 予想ユーザー成長のマッピング
  - [ ] パフォーマンス要件の定義
  - [ ] オートスケーリングポリシーの設定
  - [ ] ロードテストの完了

- [ ] **国際展開**
  - [ ] マルチリージョン展開戦略
  - [ ] ローカライゼーション要件
  - [ ] データ居住コンプライアンス
  - [ ] 国際決済サポート

## 移行戦略

### フェーズ1: インフラ設定（第1-2週）

1. **クラウドアカウント準備**
   - AWS/Azureアカウント設定
   - 請求とコスト管理の設定
   - IAMロールとポリシーの作成
   - VPCとネットワークの設定

2. **コアインフラ展開**
   - Kubernetesクラスターの展開
   - 管理データベースの設定
   - ストレージソリューションの設定
   - セキュリティグループの実装

3. **CI/CDパイプライン設定**
   - コンテナレジストリの設定
   - ビルドパイプラインの設定
   - 展開自動化の実装
   - 環境プロモーションの設定

### フェーズ2: アプリケーション移行（第3-4週）

1. **データベース移行**
   - 既存データのエクスポート
   - 管理PostgreSQL/Redisの設定
   - 検証付きデータインポート
   - 接続性とパフォーマンスのテスト

2. **アプリケーション展開**
   - コンテナイメージのビルドとプッシュ
   - マイクロサービスの展開
   - サービスディスカバリの設定
   - ヘルスチェックの実装

3. **統合テスト**
   - エンドツーエンド機能テスト
   - パフォーマンスとロードテスト
   - セキュリティ侵入テスト
   - ユーザー受け入れテスト

### フェーズ3: ゴーライブ準備（第5-6週）

1. **DNSとトラフィック管理**
   - DNSレコードの設定
   - CDNとロードバランサーの設定
   - ブルーグリーン展開の実装
   - 監視とアラートの設定

2. **最終テストと最適化**
   - パフォーマンスチューニング
   - セキュリティハードニング
   - バックアップと災害復旧テスト
   - ドキュメント完成

3. **ゴーライブとサポート**
   - 本番切り替え
   - 24/7監視設定
   - サポートチームトレーニング
   - ローンチ後最適化

## 商用ローンチ準備

### ビジネスモデル実装

#### サブスクリプション階層

```yaml
# 料金プラン設定
subscription_tiers:
  talent_free:
    name: "人材向け無料プラン"
    price: 0
    currency: "JPY"
    features:
      - "基本プロフィール作成"
      - "求人検索とフィルタリング"
      - "月間5件まで応募可能"
      - "基本AIマッチング"
    limitations:
      monthly_applications: 5
      priority_support: false
      advanced_analytics: false

  talent_premium:
    name: "人材向けプレミアム"
    price: 2980
    currency: "JPY"
    billing: "monthly"
    features:
      - "無制限応募"
      - "詳細説明付き高度AIマッチング"
      - "雇用主への優先表示"
      - "履歴書最適化提案"
      - "キャリア洞察と分析"
      - "優先サポート"
    limitations:
      monthly_applications: -1  # 無制限
      priority_support: true
      advanced_analytics: true

  employer_startup:
    name: "雇用主向けスタートアップ"
    price: 29800
    currency: "JPY"
    billing: "monthly"
    features:
      - "最大5件の求人投稿"
      - "基本人材検索"
      - "標準AIマッチング"
      - "メールサポート"
    limitations:
      active_jobs: 5
      monthly_searches: 100
      advanced_analytics: false

  employer_growth:
    name: "雇用主向け成長プラン"
    price: 98000
    currency: "JPY"
    billing: "monthly"
    features:
      - "最大25件の求人投稿"
      - "高度人材検索とフィルタリング"
      - "洞察付きプレミアムAIマッチング"
      - "コンプライアンスチェック"
      - "分析ダッシュボード"
      - "電話・メールサポート"
    limitations:
      active_jobs: 25
      monthly_searches: 1000
      advanced_analytics: true

  employer_enterprise:
    name: "雇用主向けエンタープライズ"
    price: 298000
    currency: "JPY"
    billing: "monthly"
    features:
      - "無制限求人投稿"
      - "AI駆動高度採用ツール"
      - "ホワイトラベルソリューション"
      - "APIアクセス"
      - "専任アカウントマネージャー"
      - "カスタム統合"
      - "24/7サポート"
    limitations:
      active_jobs: -1  # 無制限
      monthly_searches: -1  # 無制限
      advanced_analytics: true
      api_access: true
```

#### 決済処理統合（日本市場対応）

```javascript
// payment-integration-japan.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class JapanPaymentService {
  constructor() {
    this.supportedMethods = [
      'card',           // クレジットカード
      'konbini',        // コンビニ決済
      'bancontact',     // 銀行振込
      'fpx'            // オンラインバンキング
    ];
  }

  async createSubscription(customerId, priceId, paymentMethodType = 'card') {
    try {
      const subscriptionData = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_settings: {
          payment_method_types: [paymentMethodType],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      };

      // 日本特有の設定
      if (paymentMethodType === 'konbini') {
        subscriptionData.payment_settings.payment_method_options = {
          konbini: {
            confirmation_number: this.generateKonbiniNumber(),
            expires_after_days: 3,
          },
        };
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);

      return {
        subscription_id: subscription.id,
        client_secret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status,
        payment_method: paymentMethodType,
      };
    } catch (error) {
      throw new Error(`決済処理に失敗しました: ${error.message}`);
    }
  }

  async handleJapaneseWebhook(rawBody, signature) {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object);
        await this.sendJapaneseConfirmationEmail(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object);
        await this.sendJapanesePaymentFailureNotice(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleCancelledSubscription(event.data.object);
        break;
    }
  }

  generateKonbiniNumber() {
    // コンビニ決済用の確認番号生成
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  async sendJapaneseConfirmationEmail(invoice) {
    // 日本語での確認メール送信
    const emailContent = {
      subject: 'お支払い完了のお知らせ - iWORKZ',
      template: 'payment_success_ja',
      data: {
        amount: `¥${invoice.amount_paid.toLocaleString('ja-JP')}`,
        invoice_number: invoice.number,
        payment_date: new Date(invoice.created * 1000).toLocaleDateString('ja-JP'),
      },
    };
    
    await this.sendEmail(invoice.customer_email, emailContent);
  }
}
```

### 日本市場対応機能

#### 多言語対応（i18n）実装

```javascript
// i18n-config.js
const i18n = require('i18next');
const Backend = require('i18next-fs-backend');
const LanguageDetector = require('i18next-browser-languagedetector');

i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'ja',
    debug: process.env.NODE_ENV === 'development',
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    resources: {
      ja: {
        common: {
          welcome: "iWORKZへようこそ",
          login: "ログイン",
          signup: "新規登録",
          search: "検索",
          apply: "応募する",
          salary: "給与",
          location: "勤務地",
          skills: "スキル",
          experience: "経験",
          education: "学歴",
          visa_status: "ビザステータス",
          remote_work: "リモートワーク",
          full_time: "正社員",
          part_time: "パートタイム",
          contract: "契約社員",
          internship: "インターンシップ"
        },
        messages: {
          application_sent: "応募が送信されました",
          profile_updated: "プロフィールが更新されました",
          login_success: "ログインしました",
          logout_success: "ログアウトしました",
          error_occurred: "エラーが発生しました",
          network_error: "ネットワークエラーが発生しました"
        },
        validation: {
          email_required: "メールアドレスは必須です",
          email_invalid: "有効なメールアドレスを入力してください",
          password_required: "パスワードは必須です",
          password_min_length: "パスワードは8文字以上で入力してください",
          phone_invalid: "有効な電話番号を入力してください"
        }
      },
      en: {
        common: {
          welcome: "Welcome to iWORKZ",
          login: "Login",
          signup: "Sign Up",
          search: "Search",
          apply: "Apply",
          salary: "Salary",
          location: "Location",
          skills: "Skills",
          experience: "Experience",
          education: "Education",
          visa_status: "Visa Status",
          remote_work: "Remote Work",
          full_time: "Full Time",
          part_time: "Part Time",
          contract: "Contract",
          internship: "Internship"
        }
      }
    }
  });

module.exports = i18n;
```

#### 日本の労働法コンプライアンス

```javascript
// japan-labor-compliance.js
class JapanLaborComplianceService {
  constructor() {
    this.laborStandards = {
      working_hours: {
        regular_max: 8,        // 1日8時間
        weekly_max: 40,        // 週40時間
        overtime_limit: 45,    // 月45時間残業上限
        annual_overtime_limit: 360  // 年360時間残業上限
      },
      minimum_wage: {
        tokyo: 1113,          // 東京都最低賃金（2024年）
        osaka: 1064,          // 大阪府最低賃金
        national_average: 930  // 全国平均
      },
      paid_leave: {
        annual_minimum: 10,    // 年次有給休暇最低10日
        continuous_service_required: 6  // 継続勤務6ヶ月で付与
      },
      visa_requirements: {
        engineer: {
          name: "技術・人文知識・国際業務",
          education_required: true,
          experience_alternative: 10,  // 年
          eligible_activities: [
            "システム開発",
            "プログラミング",
            "データ分析",
            "AI/ML開発"
          ]
        },
        skilled_worker: {
          name: "特定技能",
          test_required: true,
          eligible_industries: [
            "情報通信業",
            "製造業",
            "建設業"
          ]
        }
      }
    };
  }

  async checkJobCompliance(jobData) {
    const violations = [];
    const warnings = [];

    // 労働時間チェック
    if (jobData.working_hours) {
      if (jobData.working_hours.daily > this.laborStandards.working_hours.regular_max) {
        if (!jobData.overtime_compensation) {
          violations.push({
            type: "working_hours",
            message: "1日8時間を超える場合は残業代の記載が必要です",
            severity: "high"
          });
        }
      }
    }

    // 最低賃金チェック
    if (jobData.salary && jobData.location) {
      const locationMinWage = this.getMinimumWage(jobData.location);
      const hourlyRate = this.calculateHourlyRate(jobData.salary, jobData.working_hours);
      
      if (hourlyRate < locationMinWage) {
        violations.push({
          type: "minimum_wage",
          message: `${jobData.location}の最低賃金（${locationMinWage}円）を下回っています`,
          severity: "critical"
        });
      }
    }

    // ビザ要件チェック
    if (jobData.visa_sponsorship && jobData.job_category) {
      const visaCheck = await this.checkVisaEligibility(jobData);
      if (!visaCheck.eligible) {
        warnings.push({
          type: "visa_eligibility",
          message: visaCheck.reason,
          severity: "medium"
        });
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      recommendations: this.generateRecommendations(jobData, violations, warnings)
    };
  }

  getMinimumWage(prefecture) {
    const wageMap = {
      "東京都": 1113,
      "大阪府": 1064,
      "神奈川県": 1112,
      "愛知県": 1027,
      // ... 他の都道府県
    };
    
    return wageMap[prefecture] || this.laborStandards.minimum_wage.national_average;
  }

  async checkVisaEligibility(jobData) {
    const requirements = this.laborStandards.visa_requirements;
    
    if (jobData.job_category === "engineer") {
      const engineerVisa = requirements.engineer;
      
      if (!jobData.education_requirement && !jobData.experience_requirement) {
        return {
          eligible: false,
          reason: "大学卒業または10年以上の実務経験が必要です"
        };
      }
      
      if (!engineerVisa.eligible_activities.some(activity => 
          jobData.job_description.includes(activity))) {
        return {
          eligible: false,
          reason: "職務内容が技術・人文知識・国際業務ビザの対象外です"
        };
      }
    }
    
    return { eligible: true };
  }

  generateRecommendations(jobData, violations, warnings) {
    const recommendations = [];
    
    if (violations.some(v => v.type === "working_hours")) {
      recommendations.push({
        category: "労働時間",
        suggestion: "残業代計算方法と支給条件を明記してください",
        priority: "high"
      });
    }
    
    if (warnings.some(w => w.type === "visa_eligibility")) {
      recommendations.push({
        category: "ビザサポート",
        suggestion: "必要な学歴・経験要件を具体的に記載してください",
        priority: "medium"
      });
    }
    
    if (!jobData.paid_leave_policy) {
      recommendations.push({
        category: "有給休暇",
        suggestion: "年次有給休暇の付与条件を記載することを推奨します",
        priority: "low"
      });
    }
    
    return recommendations;
  }
}
```

## サポートとリソース

### 技術ドキュメント
- **AWS ドキュメント**: https://docs.aws.amazon.com/ja_jp/
- **Azure ドキュメント**: https://docs.microsoft.com/ja-jp/azure/
- **Kubernetes ドキュメント**: https://kubernetes.io/ja/docs/
- **Terraform ドキュメント**: https://www.terraform.io/docs

### サポート連絡先
- **技術サポート**: tech-support@iworkz.com
- **ビジネスサポート**: business@iworkz.com
- **セキュリティ問題**: security@iworkz.com
- **緊急ホットライン**: +81-3-xxxx-xxxx

クラウド移行に関する追加支援については、技術チームまでお問い合わせください。