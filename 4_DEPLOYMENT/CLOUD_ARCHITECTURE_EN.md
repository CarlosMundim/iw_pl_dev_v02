# Cloud Architecture

## Overview

iWORKZ’s cloud architecture is designed for global scale, high availability, and strict regulatory compliance. As a Japanese-based company, Japan is our core market. We prioritise Japan’s data sovereignty (APPI-compliant) and legal requirements, and we also closely observe the South Korean market (PIPA compliance), offering region-optimised deployment for both. Our multi-cloud strategy enables agile, lawful operations in every jurisdiction.

## Architecture Principles

### Core Design Principles

* **Multi-Cloud Strategy**: Avoid vendor lock-in with cloud-agnostic design (AWS, Azure, GCP, and Naver/Alibaba Cloud in APAC)
* **Japan and Korea First**: Prioritise Japan (APPI) and Korea (PIPA) data residency and compliance
* **Microservices Architecture**: Loosely coupled services for flexible scaling and easy regional legal adaptation
* **API-First Design**: All functionality available through documented APIs
* **Security by Design**: Built-in security aligned to ISO27001/SOC2/GDPR/APPI/PIPA
* **Global & Regional Distribution**: Japan/Korea-specific clusters for local compliance, performance, and data localisation

### Scalability and Performance

* **Horizontal Scaling**: Autoscaling across clouds/regions
* **Load Distribution**: Multi-region load balancing (CloudFlare, ALB)
* **CDN & Caching**: Global + local CDN and multi-layered caching (Akamai/CloudFront, etc.)
* **DB Optimisation**: Read replicas, partitioning in core markets

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Global Load Balancer                    │
│                           (CloudFlare)                         │
└───────────┬──────────────┬───────────────┬───────────────┬──────┘
            │              │               │               │
  ┌─────────▼────┐ ┌───────▼─────┐ ┌───────▼─────┐ ┌──────▼─────┐
  │Japan Region   │ │Korea Region  │ │EU Region     │ │US Region    │
  │(Tokyo/Osaka)  │ │(Seoul)       │ │(Frankfurt)   │ │(Virginia)   │
  └──────────────┘ └──────────────┘ └─────────────┘ └────────────┘
            │              │               │               │
    [Application, Microservices, Data, Compliance, etc.]
```

## Regional Deployment Strategy

### Primary & Strategic Locations

* **Japan (Tokyo/Osaka)**: Core market, APPI-compliant, strict data residency, local cloud (NTT/NEC/LGWAN) supported
* **Korea (Seoul)**: PIPA-compliant, local cloud providers (Naver, Kakao, etc.) supported
* **EU West (Frankfurt)**: GDPR/ISO27001, EU-only data
* **US East (Virginia)**: SOC2, HIPAA for healthcare
* **Asia Pacific (Singapore)**: APAC hub, backup for SEA/India
* **UK (London)**: UK GDPR, NHS data compliance

### Data Sovereignty & Compliance Table

```yaml
regions:
  jp-tokyo/osaka:
    jurisdiction: "Japan"
    compliance: ["APPI", "ISMAP", "ISO 27001"]
    data_residency: "Japan only"
    backup_regions: ["ap-northeast-1", "local JP cloud"]
    notes: "No foreign transfer except where permitted by law."
  kr-seoul:
    jurisdiction: "Korea"
    compliance: ["PIPA", "ISMS", "KISA"]
    data_residency: "Korea only"
    backup_regions: ["local cloud", "ap-northeast-2"]
    notes: "KISA-certified providers, local storage/processing only."
  eu-west-1:
    jurisdiction: "EU"
    compliance: ["GDPR", "ISO 27001", "SOC 2"]
    data_residency: "EU only"
    backup_regions: ["eu-central-1"]
  us-east-1:
    jurisdiction: "USA"
    compliance: ["SOC 2", "HIPAA", "ISO 27001"]
    data_residency: "US only"
    backup_regions: ["us-west-2"]
  ap-southeast-1:
    jurisdiction: "Singapore"
    compliance: ["ISO 27001", "SOC 2", "PDPA"]
    data_residency: "SG/APAC"
    backup_regions: ["ap-northeast-1"]
  uk-west-1:
    jurisdiction: "UK"
    compliance: ["UK GDPR", "ISO 27001", "Cyber Essentials Plus"]
    data_residency: "UK only"
    backup_regions: ["eu-west-1"]
```

## Service Architecture

### API Gateway Layer

```yaml
api_gateway:
  technology: "Kong/AWS API Gateway/ALB/L7 NGINX"
  features:
    - rate_limiting: true
    - authentication: "JWT + OAuth2"
    - request_routing: "region & header based routing"
    - response_caching: "Redis/Memcached"
    - analytics: "real-time metrics"
    - security: "WAF+DDoS protection"
  routing_rules:
    - path: "/api/v1/users/*"
      service: "user-service"
      region: "geo-routing"
    - path: "/api/v1/jobs/*"
      service: "job-service"
      region: "geo-routing"
    - path: "/api/v1/matching/*"
      service: "matching-engine"
      region: "geo-routing"
```

### Microservices Deployment

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

## Data Architecture

### Database Design

```yaml
postgresql:
  primary:
    instance_type: "db.r5.2xlarge"
    storage: "1TB SSD"
    backup_retention: "30 days"
    encryption: "AES-256"
  read_replicas:
    count: 2
    instance_type: "db.r5.xlarge"
    lag_monitoring: "< 5 seconds"
  connection_pooling:
    technology: "PgBouncer"
    max_connections: 1000
    pool_mode: "transaction"
redis:
  cluster:
    nodes: 6
    instance_type: "cache.r5.large"
    memory: "13.07 GB/node"
    backup: "daily snapshots"
  use_cases:
    - session_storage
    - api_caching
    - real_time_matching
    - rate_limiting
```

### Object Storage

```yaml
object_storage:
  primary_provider: "AWS S3 / Google Cloud Storage / Local JP/KR Cloud"
  secondary_provider: "Azure Blob / Naver Cloud Storage"
  buckets:
    user_documents:
      encryption: "KMS-managed"
      versioning: true
      lifecycle: "archive after 90 days"
    application_assets:
      cdn_enabled: true
      compression: true
      cache_control: "1 year"
    backup_data:
      encryption: "customer-managed key"
      cross_region_replication: true
      retention: "7 years"
```

## Security Architecture

### Network Security

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
      outbound: "all"
    app_tier:
      inbound: ["8000/tcp from web_tier"]
      outbound: ["443/tcp", "5432/tcp", "6379/tcp"]
    data_tier:
      inbound: ["5432/tcp from app_tier", "6379/tcp from app_tier"]
      outbound: "none"
```

### Encryption & Key Management

```yaml
encryption:
  data_at_rest:
    databases: "AES-256 with KMS (per local requirements)"
    object_storage: "Customer-managed AES-256 keys"
    volumes: "AES-256 encryption"
  data_in_transit:
    external: "TLS 1.3"
    internal: "mTLS between services"
    database: "SSL/TLS required"
  key_management:
    provider: "AWS KMS / Google Cloud KMS / Local KMS"
    rotation: "annual automatic rotation"
    access_control: "IAM-based with audit logging"
```

## Monitoring & Observability

### Monitoring Stack

```yaml
monitoring:
  metrics:
    collector: "Prometheus"
    storage: "PromQL with 30-day retention"
    visualization: "Grafana dashboards"
    alerting: "AlertManager + PagerDuty integration"
  logging:
    aggregation: "ELK Stack (Elasticsearch, Logstash, Kibana)"
    retention: "30 days (ops), 7 years (audit)"
    structured_logging: "JSON logs with correlation IDs"
  tracing:
    technology: "Jaeger/Zipkin"
    sampling_rate: "1% prod, 100% staging"
    retention: "7 days"
  synthetic_monitoring:
    uptime_checks: "1 min from 5 global sites"
    api_testing: "critical user journeys every 5 mins"
    performance_budgets: "response <2s, availability >99.9%"
```

### Performance Monitoring

```yaml
performance_metrics:
  application:
    - response_time_percentiles: ["p50", "p95", "p99"]
    - error_rate: "< 0.1%"
    - throughput: "requests per second"
    - database_query_time: "< 100ms avg"
  infrastructure:
    - cpu_utilization: "< 80% avg"
    - memory_utilization: "< 85% avg"
    - disk_io: "IOPS & throughput"
    - network_latency: "< 50ms inter-service"
  business_metrics:
    - user_registration_rate
    - job_matching_success_rate
    - compliance_check_completion_time
    - user_satisfaction_scores
```

## Disaster Recovery & Business Continuity

### Backup Strategy

```yaml
backup_configuration:
  databases:
    frequency: "continuous backup with PITR"
    retention: "30 days auto, 7 years regulatory"
    testing: "monthly restore validation"
  object_storage:
    cross_region_replication: true
    versioning: "30 versions kept"
    lifecycle_management: "archive to glacier after 90 days"
  application_data:
    configuration_backup: "daily to VCS"
    secrets_backup: "encrypted, separate vault"
```

### Recovery Procedures

```yaml
disaster_recovery:
  rto_targets:
    critical_services: "< 1 hour"
    standard_services: "< 4 hours"
    non_critical_services: "< 24 hours"
  rpo_targets:
    transactional_data: "< 5 minutes"
    analytical_data: "< 1 hour"
    configuration_data: "< 24 hours"
  failover_procedures:
    automated: "health check triggered failover"
    manual: "runbooks with step-by-step ops"
    testing: "quarterly disaster recovery drills"
```

---

## Further Reading

* [Deployment Guide](./DEPLOYMENT_GUIDE.md)
* [Security Protocols](../5_SECURITY/SECURITY_PROTOCOLS.md)
* [Architecture Overview](../1_DOCUMENTATION/ARCHITECTURE_OVERVIEW.md)
