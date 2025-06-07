# クラウドアーキテクチャ

## 概要

iWORKZのクラウドアーキテクチャは、グローバル規模のスケール、高可用性、そして厳格な規制遵守を実現するために設計されています。当社は日本を本拠とし、日本市場をコアマーケットとしています。日本のデータ主権（APPI対応）と法令遵守を最優先し、加えて韓国市場（PIPA）も厳密に観察し、両市場向けにリージョナルな最適化を提供します。マルチクラウド戦略により、各法域で俊敏かつ合法的な運用を可能にしています。

## アーキテクチャ原則

### 基本設計原則

* **マルチクラウド戦略**: ベンダーロックイン回避、クラウド非依存設計（AWS、Azure、GCP、APACではNaverやAlibaba Cloudも含む）
* **日本・韓国重視**: 日本（APPI）・韓国（PIPA）のデータレジデンシーと法令遵守を最優先
* **マイクロサービスアーキテクチャ**: 疎結合サービスでスケール自在＆局所的な法令対応も容易
* **APIファースト設計**: 全機能はドキュメント化API経由で利用可能
* **セキュリティバイデザイン**: ISO27001/SOC2/GDPR/APPI/PIPA等各種規格準拠の内在的なセキュリティ
* **グローバル＆リージョナル分散**: パフォーマンスと法令対応・ローカライゼーションのために日本・韓国専用クラスタ配置

### スケーラビリティとパフォーマンス

* **水平スケーリング**: 複数クラウド/リージョン自動スケール
* **負荷分散**: マルチリージョンロードバランシング（CloudFlareやALB）
* **CDN＆キャッシュ**: 世界＋国内向けCDN＆多層キャッシュ（Akamai/CloudFront等）
* **DB最適化**: コア市場でリードレプリカやパーティショニング

## ハイレベルアーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        グローバルロードバランサ                  │
│                          （CloudFlare等）                        │
└───────────┬──────────────┬───────────────┬───────────────┬──────┘
            │              │               │               │
  ┌─────────▼────┐ ┌───────▼─────┐ ┌───────▼─────┐ ┌──────▼─────┐
  │日本リージョン  │ │韓国リージョン │ │EUリージョン │ │USリージョン │
  │(東京/大阪)     │ │(ソウル)       │ │(フランクフルト) │ (バージニア) │
  └──────────────┘ └──────────────┘ └─────────────┘ └────────────┘
            │              │               │               │
    [アプリケーション、マイクロサービス、データ、コンプライアンス等]
```

## リージョナル展開戦略

### プライマリ＆戦略拠点

* **日本（東京・大阪）**: コア市場、APPI準拠、国内データ完結、行政クラウド（LGWAN）も選択肢、NTT/NECクラウドも考慮
* **韓国（ソウル）**: PIPA準拠、現地クラウド（Naver Cloud, Kakao Cloud等）も利用可
* **EU西部（フランクフルト）**: GDPR/ISO27001、EU限定データ
* **米国東部（バージニア）**: SOC2、医療ならHIPAAも
* **アジア太平洋（シンガポール）**: APACハブ、SEA/インドのバックアップ
* **英国（ロンドン）**: 英国GDPR、NHSなど対応

### データ主権・コンプライアンステーブル

```yaml
regions:
  jp-tokyo/osaka:
    jurisdiction: "日本"
    compliance: ["APPI", "ISMAP", "ISO 27001"]
    data_residency: "日本国内限定"
    backup_regions: ["ap-northeast-1", "国内クラウド"]
    notes: "日本国内で完結。法律要件除き国外流出なし。"
  kr-seoul:
    jurisdiction: "韓国"
    compliance: ["PIPA", "ISMS", "KISA"]
    data_residency: "韓国国内限定"
    backup_regions: ["現地クラウド", "ap-northeast-2"]
    notes: "KISA認定事業者限定、国内保存/処理"
  eu-west-1:
    jurisdiction: "EU"
    compliance: ["GDPR", "ISO 27001", "SOC 2"]
    data_residency: "EU限定"
    backup_regions: ["eu-central-1"]
  us-east-1:
    jurisdiction: "米国"
    compliance: ["SOC 2", "HIPAA", "ISO 27001"]
    data_residency: "米国限定"
    backup_regions: ["us-west-2"]
  ap-southeast-1:
    jurisdiction: "シンガポール"
    compliance: ["ISO 27001", "SOC 2", "PDPA"]
    data_residency: "SG/APAC"
    backup_regions: ["ap-northeast-1"]
  uk-west-1:
    jurisdiction: "英国"
    compliance: ["UK GDPR", "ISO 27001", "Cyber Essentials Plus"]
    data_residency: "UK限定"
    backup_regions: ["eu-west-1"]
```

## サービスアーキテクチャ

### APIゲートウェイレイヤ

```yaml
api_gateway:
  technology: "Kong/AWS API Gateway/ALB/L7 NGINX"
  features:
    - rate_limiting: true
    - authentication: "JWT + OAuth2"
    - request_routing: "リージョン＆ヘッダー単位ルーティング"
    - response_caching: "Redis/Memcached"
    - analytics: "リアルタイムメトリクス"
    - security: "WAF+DDoS対策"
  routing_rules:
    - path: "/api/v1/users/*"
      service: "user-service"
      region: "ジオルーティング"
    - path: "/api/v1/jobs/*"
      service: "job-service"
      region: "ジオルーティング"
    - path: "/api/v1/matching/*"
      service: "matching-engine"
      region: "ジオルーティング"
```

### マイクロサービス展開

```yaml
microservices:
  backend-api:
    replicas: 3
    regions: ["JP", "KR", "EU", "US"]
    resources:
      requests: { cpu: "500m", memory: "1Gi" }
      limits: { cpu: "2", memory: "4Gi" }
    autoscaling:
      min_replicas: 3
      max_replicas: 20
      target_cpu: 70
    health_checks:
      liveness: "/health"
      readiness: "/ready"
  ai-agent:
    replicas: 2
    regions: ["JP", "KR", "EU", "US"]
    resources:
      requests: { cpu: "1", memory: "2Gi" }
      limits: { cpu: "4", memory: "8Gi" }
    gpu_support: true
    autoscaling:
      min_replicas: 2
      max_replicas: 10
      target_cpu: 80
  matching-engine:
    replicas: 2
    regions: ["JP", "KR", "EU", "US"]
    resources:
      requests: { cpu: "2", memory: "4Gi" }
      limits: { cpu: "8", memory: "16Gi" }
    persistent_storage: true
    autoscaling:
      min_replicas: 2
      max_replicas: 8
      target_cpu: 75
```

## データアーキテクチャ

### データベース設計

```yaml
postgresql:
  primary:
    instance_type: "db.r5.2xlarge"
    storage: "1TB SSD"
    backup_retention: "30日"
    encryption: "AES-256"
  read_replicas:
    count: 2
    instance_type: "db.r5.xlarge"
    lag_monitoring: "< 5秒"
  connection_pooling:
    technology: "PgBouncer"
    max_connections: 1000
    pool_mode: "transaction"
redis:
  cluster:
    nodes: 6
    instance_type: "cache.r5.large"
    memory: "13.07 GB/ノード"
    backup: "毎日スナップショット"
  use_cases:
    - セッション管理
    - APIキャッシュ
    - リアルタイムマッチング
    - レート制限
```

### オブジェクトストレージ

```yaml
object_storage:
  primary_provider: "AWS S3 / Google Cloud Storage / 国内JP・KRクラウド"
  secondary_provider: "Azure Blob / Naver Cloud Storage"
  buckets:
    user_documents:
      encryption: "KMS管理"
      versioning: true
      lifecycle: "90日後アーカイブ"
    application_assets:
      cdn_enabled: true
      compression: true
      cache_control: "1年"
    backup_data:
      encryption: "顧客管理キー"
      cross_region_replication: true
      retention: "7年"
```

## セキュリティアーキテクチャ

### ネットワークセキュリティ

```yaml
network_security:
  vpc_configuration:
    cidr: "10.0.0.0/16"
    availability_zones: 3
    public_subnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
    private_subnets: ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
    database_subnets: ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
  security_groups:
    web_tier:
      inbound: ["80/tcp", "443/tcp"]
      outbound: "全許可"
    app_tier:
      inbound: ["web_tierから8000/tcp"]
      outbound: ["443/tcp", "5432/tcp", "6379/tcp"]
    data_tier:
      inbound: ["app_tierから5432/tcp", "app_tierから6379/tcp"]
      outbound: "なし"
```

### 暗号化と鍵管理

```yaml
encryption:
  data_at_rest:
    databases: "KMS対応AES-256（各国要件順守）"
    object_storage: "顧客管理AES-256キー"
    volumes: "AES-256暗号化"
  data_in_transit:
    external: "TLS 1.3"
    internal: "サービス間mTLS"
    database: "SSL/TLS必須"
  key_management:
    provider: "AWS KMS / Google Cloud KMS / 国内KMS"
    rotation: "年次自動ローテーション"
    access_control: "IAMベース監査ログ付き"
```

## モニタリングと可観測性

### モニタリングスタック

```yaml
monitoring:
  metrics:
    collector: "Prometheus"
    storage: "PromQLで30日保持"
    visualization: "Grafanaダッシュボード"
    alerting: "AlertManager＋PagerDuty連携"
  logging:
    aggregation: "ELKスタック（Elasticsearch, Logstash, Kibana）"
    retention: "運用30日、監査7年"
    structured_logging: "相関ID付JSONログ"
  tracing:
    technology: "Jaeger/Zipkin"
    sampling_rate: "本番1%、検証100%"
    retention: "7日"
  synthetic_monitoring:
    uptime_checks: "世界5拠点で1分毎"
    api_testing: "クリティカルユーザ動線は5分毎"
    performance_budgets: "応答<2秒、可用性>99.9%"
```

### パフォーマンス監視

```yaml
performance_metrics:
  application:
    - response_time_percentiles: ["p50", "p95", "p99"]
    - error_rate: "< 0.1%"
    - throughput: "秒間リクエスト数"
    - database_query_time: "平均100ms未満"
  infrastructure:
    - cpu_utilization: "平均80%未満"
    - memory_utilization: "平均85%未満"
    - disk_io: "IOPS＆スループット"
    - network_latency: "サービス間50ms未満"
  business_metrics:
    - user_registration_rate（ユーザ登録率）
    - job_matching_success_rate（求人マッチ成功率）
    - compliance_check_completion_time（コンプライアンスチェック所要時間）
    - user_satisfaction_scores（満足度）
```

## 災害対策・事業継続

### バックアップ戦略

```yaml
backup_configuration:
  databases:
    frequency: "連続バックアップ＋時点復元"
    retention: "自動30日、法令7年"
    testing: "月次リストア検証"
  object_storage:
    cross_region_replication: true
    versioning: "30世代保持"
    lifecycle_management: "90日後グレイシャーへアーカイブ"
  application_data:
    configuration_backup: "毎日バージョン管理へ"
    secrets_backup: "別金庫へ暗号化バックアップ"
```

### 復旧手順

```yaml
disaster_recovery:
  rto_targets:
    critical_services: "1時間以内"
    standard_services: "4時間以内"
    non_critical_services: "24時間以内"
  rpo_targets:
    transactional_data: "5分以内"
    analytical_data: "1時間以内"
    configuration_data: "24時間以内"
  failover_procedures:
    automated: "ヘルスチェックで自動切替"
    manual: "手順書付手動運用"
    testing: "四半期毎にリカバリ訓練"
```

---

## 関連資料

* [導入ガイド](./DEPLOYMENT_GUIDE.md)
* [セキュリティプロトコル](../5_SECURITY/SECURITY_PROTOCOLS.md)
* [アーキテクチャ概要](../1_DOCUMENTATION/ARCHITECTURE_OVERVIEW.md)
