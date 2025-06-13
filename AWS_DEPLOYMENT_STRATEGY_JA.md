# iWORKZ プラットフォーム AWS 展開戦略
## ステップバイステップ プロダクションインフラストラクチャガイド

### **エグゼクティブ概要**
この包括的なガイドは、LLM API統合と重要コンポーネントの必要な設定すべてを含む、iWORKZプラットフォームのAWSへの展開の詳細手順を提供します。展開は高可用性、セキュリティ、スケーラビリティを備えたエンタープライズベストプラクティスに従います。

---

## **フェーズ1: AWSアカウント＆基盤セットアップ**

### **ステップ1.1: AWSアカウント準備**
```bash
# 1. AWS Organizations構造の作成
aws organizations create-organization --feature-set ALL

# 2. 異なる環境用の専用アカウント作成
aws organizations create-account \
  --email iworkz-prod@company.com \
  --account-name "iWORKZ-Production"

aws organizations create-account \
  --email iworkz-staging@company.com \
  --account-name "iWORKZ-Staging"

# 3. 請求アラートの設定
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget-config.json
```

### **ステップ1.2: IAM基盤セットアップ**
```bash
# 1. 展開サービスアカウントの作成
aws iam create-user --user-name iworkz-deployer

# 2. 展開ポリシーの作成・アタッチ
aws iam create-policy \
  --policy-name iWORKZDeploymentPolicy \
  --policy-document file://deployment-policy.json

aws iam attach-user-policy \
  --user-name iworkz-deployer \
  --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/iWORKZDeploymentPolicy

# 3. アクセスキーの作成
aws iam create-access-key --user-name iworkz-deployer
```

### **ステップ1.3: VPCネットワークアーキテクチャ**
```bash
# 1. メインVPCの作成
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=iWORKZ-VPC}]' \
  --query 'Vpc.VpcId' --output text)

# 2. パブリックサブネットの作成（3AZ）
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-west-2a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=iWORKZ-Public-1}]' \
  --query 'Subnet.SubnetId' --output text)

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-west-2b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=iWORKZ-Public-2}]' \
  --query 'Subnet.SubnetId' --output text)

PUBLIC_SUBNET_3=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.3.0/24 \
  --availability-zone us-west-2c \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=iWORKZ-Public-3}]' \
  --query 'Subnet.SubnetId' --output text)

# 3. プライベートサブネットの作成（3AZ）
PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-west-2a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=iWORKZ-Private-1}]' \
  --query 'Subnet.SubnetId' --output text)

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.12.0/24 \
  --availability-zone us-west-2b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=iWORKZ-Private-2}]' \
  --query 'Subnet.SubnetId' --output text)

PRIVATE_SUBNET_3=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.13.0/24 \
  --availability-zone us-west-2c \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=iWORKZ-Private-3}]' \
  --query 'Subnet.SubnetId' --output text)

# 4. インターネットゲートウェイの作成・設定
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=iWORKZ-IGW}]' \
  --query 'InternetGateway.InternetGatewayId' --output text)

aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID

# 5. プライベートサブネット用NATゲートウェイの作成
NAT_EIP_1=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
NAT_GW_1=$(aws ec2 create-nat-gateway \
  --subnet-id $PUBLIC_SUBNET_1 \
  --allocation-id $NAT_EIP_1 \
  --tag-specifications 'ResourceType=nat-gateway,Tags=[{Key=Name,Value=iWORKZ-NAT-1}]' \
  --query 'NatGateway.NatGatewayId' --output text)
```

---

## **フェーズ2: データベースインフラストラクチャセットアップ**

### **ステップ2.1: RDS PostgreSQLクラスター**
```bash
# 1. DBサブネットグループの作成
aws rds create-db-subnet-group \
  --db-subnet-group-name iworkz-db-subnet-group \
  --db-subnet-group-description "iWORKZ Database Subnet Group" \
  --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2 $PRIVATE_SUBNET_3

# 2. RDSセキュリティグループの作成
DB_SG=$(aws ec2 create-security-group \
  --group-name iworkz-database-sg \
  --description "iWORKZ Database Security Group" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress \
  --group-id $DB_SG \
  --protocol tcp \
  --port 5432 \
  --source-group $APP_SG

# 3. RDS Aurora PostgreSQLクラスターの作成
aws rds create-db-cluster \
  --db-cluster-identifier iworkz-postgres-cluster \
  --engine aurora-postgresql \
  --engine-version 14.6 \
  --master-username postgres \
  --master-user-password $(openssl rand -base64 32) \
  --vpc-security-group-ids $DB_SG \
  --db-subnet-group-name iworkz-db-subnet-group \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --storage-encrypted \
  --kms-key-id alias/aws/rds

# 4. DBインスタンスの作成
aws rds create-db-instance \
  --db-instance-identifier iworkz-postgres-writer \
  --db-instance-class db.r6g.2xlarge \
  --engine aurora-postgresql \
  --db-cluster-identifier iworkz-postgres-cluster \
  --monitoring-interval 60 \
  --monitoring-role-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/rds-monitoring-role

aws rds create-db-instance \
  --db-instance-identifier iworkz-postgres-reader \
  --db-instance-class db.r6g.xlarge \
  --engine aurora-postgresql \
  --db-cluster-identifier iworkz-postgres-cluster
```

### **ステップ2.2: ElastiCache Redisクラスター**
```bash
# 1. Redisサブネットグループの作成
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name iworkz-redis-subnet-group \
  --cache-subnet-group-description "iWORKZ Redis Subnet Group" \
  --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2 $PRIVATE_SUBNET_3

# 2. Redisセキュリティグループの作成
REDIS_SG=$(aws ec2 create-security-group \
  --group-name iworkz-redis-sg \
  --description "iWORKZ Redis Security Group" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress \
  --group-id $REDIS_SG \
  --protocol tcp \
  --port 6379 \
  --source-group $APP_SG

# 3. Redisレプリケーショングループの作成
aws elasticache create-replication-group \
  --replication-group-id iworkz-redis-cluster \
  --description "iWORKZ Redis Cluster" \
  --num-cache-clusters 3 \
  --cache-node-type cache.r6g.large \
  --engine redis \
  --engine-version 7.0 \
  --port 6379 \
  --cache-subnet-group-name iworkz-redis-subnet-group \
  --security-group-ids $REDIS_SG \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --automatic-failover-enabled \
  --multi-az-enabled
```

### **ステップ2.3: Elasticsearchサービス**
```bash
# 1. Elasticsearchドメインの作成
aws es create-elasticsearch-domain \
  --domain-name iworkz-search \
  --elasticsearch-version 7.10 \
  --elasticsearch-cluster-config '{
    "InstanceType": "r6g.large.elasticsearch",
    "InstanceCount": 3,
    "DedicatedMasterEnabled": true,
    "MasterInstanceType": "r6g.medium.elasticsearch",
    "MasterInstanceCount": 3,
    "ZoneAwarenessEnabled": true
  }' \
  --ebs-options '{
    "EBSEnabled": true,
    "VolumeType": "gp3",
    "VolumeSize": 100
  }' \
  --vpc-options '{
    "SubnetIds": ["'$PRIVATE_SUBNET_1'", "'$PRIVATE_SUBNET_2'"],
    "SecurityGroupIds": ["'$ES_SG'"]
  }' \
  --encryption-at-rest-options '{"Enabled": true}' \
  --node-to-node-encryption-options '{"Enabled": true}' \
  --domain-endpoint-options '{"EnforceHTTPS": true}'
```

---

## **フェーズ3: EKSクラスターセットアップ**

### **ステップ3.1: EKSクラスター作成**
```bash
# 1. EKSサービスロールの作成
aws iam create-role \
  --role-name iWORKZ-EKS-ServiceRole \
  --assume-role-policy-document file://eks-service-role-trust-policy.json

aws iam attach-role-policy \
  --role-name iWORKZ-EKS-ServiceRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy

# 2. EKSクラスターの作成
aws eks create-cluster \
  --name iworkz-cluster \
  --version 1.27 \
  --role-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/iWORKZ-EKS-ServiceRole \
  --resources-vpc-config '{
    "subnetIds": ["'$PRIVATE_SUBNET_1'", "'$PRIVATE_SUBNET_2'", "'$PRIVATE_SUBNET_3'", "'$PUBLIC_SUBNET_1'", "'$PUBLIC_SUBNET_2'", "'$PUBLIC_SUBNET_3'"],
    "securityGroupIds": ["'$CLUSTER_SG'"],
    "endpointConfigPrivate": true,
    "endpointConfigPublic": true,
    "publicAccessCidrs": ["0.0.0.0/0"]
  }' \
  --logging '{"enable": ["api", "audit", "authenticator", "controllerManager", "scheduler"]}'

# 3. クラスターがアクティブになるまで待機
aws eks wait cluster-active --name iworkz-cluster

# 4. kubeconfigの更新
aws eks update-kubeconfig --name iworkz-cluster --region us-west-2
```

### **ステップ3.2: EKSノードグループ**
```bash
# 1. ノードグループロールの作成
aws iam create-role \
  --role-name iWORKZ-EKS-NodeGroupRole \
  --assume-role-policy-document file://eks-nodegroup-role-trust-policy.json

aws iam attach-role-policy \
  --role-name iWORKZ-EKS-NodeGroupRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy

aws iam attach-role-policy \
  --role-name iWORKZ-EKS-NodeGroupRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy

aws iam attach-role-policy \
  --role-name iWORKZ-EKS-NodeGroupRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

# 2. 一般ワークロード用マネージドノードグループの作成
aws eks create-nodegroup \
  --cluster-name iworkz-cluster \
  --nodegroup-name iworkz-general-nodes \
  --subnets $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2 $PRIVATE_SUBNET_3 \
  --node-role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/iWORKZ-EKS-NodeGroupRole \
  --instance-types m5.large m5.xlarge \
  --ami-type AL2_x86_64 \
  --capacity-type ON_DEMAND \
  --scaling-config '{
    "minSize": 3,
    "maxSize": 10,
    "desiredSize": 5
  }' \
  --disk-size 50 \
  --remote-access '{
    "ec2SshKey": "iworkz-key-pair",
    "sourceSecurityGroups": ["'$BASTION_SG'"]
  }'

# 3. AI/MLワークロード用マネージドノードグループの作成
aws eks create-nodegroup \
  --cluster-name iworkz-cluster \
  --nodegroup-name iworkz-ml-nodes \
  --subnets $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2 $PRIVATE_SUBNET_3 \
  --node-role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/iWORKZ-EKS-NodeGroupRole \
  --instance-types c5.2xlarge c5.4xlarge \
  --ami-type AL2_x86_64 \
  --capacity-type SPOT \
  --scaling-config '{
    "minSize": 1,
    "maxSize": 5,
    "desiredSize": 2
  }' \
  --disk-size 100 \
  --taints '[{
    "key": "workload-type",
    "value": "ml",
    "effect": "NO_SCHEDULE"
  }]'
```

---

## **フェーズ4: コンテナレジストリ＆CI/CDセットアップ**

### **ステップ4.1: ECRリポジトリ**
```bash
# 1. 全サービス用ECRリポジトリの作成
SERVICES=(
  "ai-agent"
  "backend-api"
  "web-frontend"
  "admin-dashboard"
  "analytics-service"
  "compliance-engine"
  "credential-engine"
  "matching-engine"
  "notification-service"
  "search"
  "voice-assistant"
  "mobile-app-backend"
)

for service in "${SERVICES[@]}"; do
  aws ecr create-repository \
    --repository-name iworkz/$service \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256
    
  # ライフサイクルポリシーの設定
  aws ecr put-lifecycle-configuration \
    --repository-name iworkz/$service \
    --lifecycle-policy-text file://ecr-lifecycle-policy.json
done

# 2. ECRログイントークンの取得
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-west-2.amazonaws.com
```

### **ステップ4.2: Dockerイメージのビルド＆プッシュ**
```bash
# 1. 全サービスイメージのビルド＆プッシュ
for service in "${SERVICES[@]}"; do
  echo "Building and pushing $service..."
  
  # イメージのビルド
  docker build -t iworkz/$service:latest ./2_SERVICES/$service/
  
  # ECR用タグ付け
  docker tag iworkz/$service:latest \
    $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-west-2.amazonaws.com/iworkz/$service:latest
  
  # ECRへのプッシュ
  docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-west-2.amazonaws.com/iworkz/$service:latest
done
```

---

## **フェーズ5: シークレット管理＆APIキー設定**

### **ステップ5.1: AWS Secrets Managerセットアップ**
```bash
# 1. データベース接続用シークレットの作成
aws secretsmanager create-secret \
  --name iworkz/database/postgres \
  --description "PostgreSQL database credentials" \
  --secret-string '{
    "host": "iworkz-postgres-cluster.cluster-xxxxx.us-west-2.rds.amazonaws.com",
    "port": "5432",
    "database": "iworkz",
    "username": "postgres",
    "password": "'$(openssl rand -base64 32)'"
  }'

# 2. Redis用シークレットの作成
aws secretsmanager create-secret \
  --name iworkz/cache/redis \
  --description "Redis cluster credentials" \
  --secret-string '{
    "host": "iworkz-redis-cluster.xxxxx.cache.amazonaws.com",
    "port": "6379",
    "auth_token": "'$(openssl rand -base64 32)'"
  }'

# 3. LLM APIキー用シークレットの作成
aws secretsmanager create-secret \
  --name iworkz/ai/openai-api-key \
  --description "OpenAI API Key for LLM services" \
  --secret-string '{"api_key": "YOUR_OPENAI_API_KEY_HERE"}'

aws secretsmanager create-secret \
  --name iworkz/ai/anthropic-api-key \
  --description "Anthropic API Key for Claude" \
  --secret-string '{"api_key": "YOUR_ANTHROPIC_API_KEY_HERE"}'

aws secretsmanager create-secret \
  --name iworkz/ai/google-api-key \
  --description "Google AI API Key" \
  --secret-string '{"api_key": "YOUR_GOOGLE_AI_API_KEY_HERE"}'

# 4. ブロックチェーン用シークレットの作成
aws secretsmanager create-secret \
  --name iworkz/blockchain/ethereum \
  --description "Ethereum network configuration" \
  --secret-string '{
    "network_url": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    "private_key": "YOUR_ETHEREUM_PRIVATE_KEY",
    "contract_address": "0x..."
  }'

# 5. 外部API用シークレットの作成
aws secretsmanager create-secret \
  --name iworkz/external/sendgrid \
  --description "SendGrid API for email notifications" \
  --secret-string '{"api_key": "YOUR_SENDGRID_API_KEY"}'

aws secretsmanager create-secret \
  --name iworkz/external/twilio \
  --description "Twilio API for SMS notifications" \
  --secret-string '{
    "account_sid": "YOUR_TWILIO_ACCOUNT_SID",
    "auth_token": "YOUR_TWILIO_AUTH_TOKEN",
    "phone_number": "YOUR_TWILIO_PHONE_NUMBER"
  }'
```

### **ステップ5.2: Kubernetesシークレット統合**
```bash
# 1. AWS Load Balancer Controllerのインストール
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master"

helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=iworkz-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# 2. Secrets Store CSI Driverのインストール
helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts
helm install csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver \
  --namespace kube-system

# 3. AWS Secrets Manager Providerのインストール
kubectl apply -f https://raw.githubusercontent.com/aws/secrets-store-csi-driver-provider-aws/main/deployment/aws-provider-installer.yaml

# 4. IRSAでのサービスアカウント作成
eksctl create iamserviceaccount \
  --name iworkz-secrets-sa \
  --namespace default \
  --cluster iworkz-cluster \
  --attach-policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite \
  --approve
```

---

## **フェーズ6: アプリケーション展開**

### **ステップ6.1: Kubernetesマニフェスト展開**
```bash
# 1. ネームスペースの作成
kubectl create namespace iworkz-prod
kubectl create namespace iworkz-monitoring

# 2. ConfigMapsの展開
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: iworkz-config
  namespace: iworkz-prod
data:
  NODE_ENV: "production"
  AWS_REGION: "us-west-2"
  LOG_LEVEL: "info"
  REDIS_CLUSTER_MODE: "true"
  DATABASE_POOL_SIZE: "20"
  API_RATE_LIMIT: "1000"
EOF

# 3. データベース初期化ジョブの展開
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  namespace: iworkz-prod
spec:
  template:
    spec:
      containers:
      - name: db-migrate
        image: $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-west-2.amazonaws.com/iworkz/backend-api:latest
        command: ["npm", "run", "migrate"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: connection_string
      restartPolicy: Never
EOF

# 4. コアサービスの展開
kubectl apply -f ./4_DEPLOYMENT/kubernetes/deployments/
kubectl apply -f ./4_DEPLOYMENT/kubernetes/services/
kubectl apply -f ./4_DEPLOYMENT/kubernetes/ingress.yaml
```

### **ステップ6.2: AIサービス展開**
```bash
# 1. AI/MLモデルの展開
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agent
  namespace: iworkz-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-agent
  template:
    metadata:
      labels:
        app: ai-agent
    spec:
      nodeSelector:
        workload-type: ml
      tolerations:
      - key: workload-type
        value: ml
        effect: NoSchedule
      containers:
      - name: ai-agent
        image: $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-west-2.amazonaws.com/iworkz/ai-agent:latest
        resources:
          requests:
            cpu: "2"
            memory: "4Gi"
          limits:
            cpu: "4"
            memory: "8Gi"
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secret
              key: api_key
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: anthropic-secret
              key: api_key
EOF
```

---

## **フェーズ7: 監視＆ログセットアップ**

### **ステップ7.1: Prometheus & Grafana展開**
```bash
# 1. Prometheus Operatorのインストール
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace iworkz-monitoring \
  --create-namespace \
  --values - <<EOF
prometheus:
  prometheusSpec:
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 100Gi
          storageClassName: gp3
grafana:
  persistence:
    enabled: true
    size: 20Gi
    storageClassName: gp3
  adminPassword: $(openssl rand -base64 32)
EOF

# 2. カスタムダッシュボードの設定
kubectl apply -f ./4_DEPLOYMENT/monitoring/grafana/dashboards/
```

### **ステップ7.2: 集中ログ**
```bash
# 1. ログ収集用Fluent Bitのインストール
helm repo add fluent https://fluent.github.io/helm-charts
helm install fluent-bit fluent/fluent-bit \
  --namespace iworkz-monitoring \
  --values - <<EOF
config:
  outputs: |
    [OUTPUT]
        Name cloudwatch_logs
        Match *
        region us-west-2
        log_group_name /aws/eks/iworkz-cluster
        log_stream_prefix fluent-bit-
        auto_create_group true
EOF

# 2. ログ保持の設定
aws logs put-retention-policy \
  --log-group-name /aws/eks/iworkz-cluster \
  --retention-in-days 30
```

---

## **フェーズ8: セキュリティ＆SSL設定**

### **ステップ8.1: SSL証明書セットアップ**
```bash
# 1. ACM証明書のリクエスト
CERT_ARN=$(aws acm request-certificate \
  --domain-name "*.iworkz.jp" \
  --subject-alternative-names "iworkz.jp" \
  --validation-method DNS \
  --query 'CertificateArn' --output text)

# 2. ドメイン検証用Route53の設定
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://dns-validation-records.json

# 3. 証明書検証の待機
aws acm wait certificate-validated --certificate-arn $CERT_ARN
```

### **ステップ8.2: WAF設定**
```bash
# 1. WAF Web ACLの作成
aws wafv2 create-web-acl \
  --name iworkz-waf \
  --scope REGIONAL \
  --default-action '{"Allow": {}}' \
  --rules file://waf-rules.json \
  --visibility-config '{
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "iworkz-waf"
  }'

# 2. WAFとALBの関連付け
aws wafv2 associate-web-acl \
  --web-acl-arn arn:aws:wafv2:us-west-2:$(aws sts get-caller-identity --query Account --output text):webacl/iworkz-waf/... \
  --resource-arn arn:aws:elasticloadbalancing:us-west-2:$(aws sts get-caller-identity --query Account --output text):loadbalancer/app/...
```

---

## **フェーズ9: オートスケーリング＆パフォーマンス最適化**

### **ステップ9.1: Horizontal Pod Autoscaler**
```bash
# 1. メトリクスサーバーのインストール
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 2. 全サービス用HPAの設定
kubectl apply -f - <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-api-hpa
  namespace: iworkz-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
```

### **ステップ9.2: クラスターオートスケーラー**
```bash
# 1. クラスターオートスケーラーのインストール
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# 2. ノードグループ用オートスケーラーの設定
kubectl patch deployment cluster-autoscaler \
  -n kube-system \
  -p '{"spec":{"template":{"metadata":{"annotations":{"cluster-autoscaler.kubernetes.io/safe-to-evict": "false"}}}}}'
```

---

## **フェーズ10: バックアップ＆災害復旧**

### **ステップ10.1: データベースバックアップ設定**
```bash
# 1. 自動RDSバックアップの設定
aws rds modify-db-cluster \
  --db-cluster-identifier iworkz-postgres-cluster \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --copy-tags-to-snapshot

# 2. リージョン間バックアップの作成
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier iworkz-postgres-cluster \
  --db-cluster-snapshot-identifier iworkz-postgres-backup-$(date +%Y%m%d)

# 3. バックアップリージョンへのスナップショットコピー
aws rds copy-db-cluster-snapshot \
  --source-db-cluster-snapshot-identifier arn:aws:rds:us-west-2:$(aws sts get-caller-identity --query Account --output text):cluster-snapshot:iworkz-postgres-backup-$(date +%Y%m%d) \
  --target-db-cluster-snapshot-identifier iworkz-postgres-backup-$(date +%Y%m%d) \
  --source-region us-west-2 \
  --region us-east-1
```

### **ステップ10.2: アプリケーションデータバックアップ**
```bash
# 1. Kubernetesバックアップ用Veleroのインストール
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts/
helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --set configuration.provider=aws \
  --set configuration.backupStorageLocation.bucket=iworkz-backup-bucket \
  --set configuration.backupStorageLocation.config.region=us-west-2 \
  --set serviceAccount.server.create=false \
  --set serviceAccount.server.name=velero

# 2. 日次バックアップの設定
kubectl apply -f - <<EOF
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-backup
  namespace: velero
spec:
  schedule: "0 2 * * *"
  template:
    includedNamespaces:
    - iworkz-prod
    ttl: "720h"
EOF
```

---

## **フェーズ11: テスト＆検証**

### **ステップ11.1: ヘルスチェック検証**
```bash
# 1. 全サービスエンドポイントのテスト
SERVICES_ENDPOINTS=(
  "https://api.iworkz.jp/health"
  "https://ai.iworkz.jp/health"
  "https://app.iworkz.jp/health"
  "https://admin.iworkz.jp/health"
)

for endpoint in "${SERVICES_ENDPOINTS[@]}"; do
  echo "Testing $endpoint..."
  curl -f -s $endpoint || echo "FAILED: $endpoint"
done

# 2. データベース接続の検証
kubectl exec -it deployment/backend-api -n iworkz-prod -- npm run db:test

# 3. AIモデルエンドポイントのテスト
curl -X POST https://ai.iworkz.jp/api/v1/match \
  -H "Content-Type: application/json" \
  -d '{"candidate_id": "test", "job_requirements": "test"}'
```

### **ステップ11.2: パフォーマンステスト**
```bash
# 1. 負荷テスト用k6のインストール
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: loadtest-script
data:
  script.js: |
    import http from 'k6/http';
    import { check } from 'k6';
    
    export let options = {
      stages: [
        { duration: '5m', target: 1000 },
        { duration: '10m', target: 5000 },
        { duration: '5m', target: 0 },
      ],
    };
    
    export default function() {
      let response = http.get('https://api.iworkz.jp/api/v1/jobs');
      check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
      });
    }
---
apiVersion: batch/v1
kind: Job
metadata:
  name: load-test
spec:
  template:
    spec:
      containers:
      - name: k6
        image: grafana/k6:latest
        command: ["k6", "run", "--out", "cloud", "/scripts/script.js"]
        volumeMounts:
        - name: script
          mountPath: /scripts
      volumes:
      - name: script
        configMap:
          name: loadtest-script
      restartPolicy: Never
EOF
```

---

## **フェーズ12: Go-Liveチェックリスト**

### **最終検証ステップ**
```bash
# 1. DNS設定
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.iworkz.jp",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "k8s-iworkzpr-ingressn-xxxxx.elb.us-west-2.amazonaws.com",
          "EvaluateTargetHealth": true,
          "HostedZoneId": "Z1D633PJN98FT9"
        }
      }
    }]
  }'

# 2. 最終セキュリティスキャン
aws inspector create-assessment-template \
  --assessment-template-name iworkz-security-assessment \
  --assessment-target-arn arn:aws:inspector:us-west-2:$(aws sts get-caller-identity --query Account --output text):target/... \
  --duration-in-seconds 3600 \
  --rules-package-arns arn:aws:inspector:us-west-2:758058086616:rulespackage/0-9hgA516p

# 3. パフォーマンスベースライン
kubectl apply -f ./monitoring/performance-tests/baseline-test.yaml

# 4. 監視アラート
aws sns create-topic --name iworkz-alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-west-2:$(aws sts get-caller-identity --query Account --output text):iworkz-alerts \
  --protocol email \
  --notification-endpoint ops@iworkz.jp
```

---

## **推定コスト（月額）**

### **インフラストラクチャコスト**
- **EKSクラスター**: $73（クラスター）+ $300-800（ノード）
- **RDS Aurora**: $500-1,200（3インスタンス）
- **ElastiCache**: $200-400（Redisクラスター）
- **Elasticsearch**: $400-800（3ノード）
- **ロードバランサー**: ALBあたり$25-50
- **データ転送**: $100-300
- **ストレージ**: $100-200（EBS、S3）
- **監視**: $50-150（CloudWatch、ログ）

### **月額総推定コスト**: $1,800 - $4,000 USD

---

## **成功基準**

### **技術検証**
- ✅ 19サービス全てが展開され正常稼働
- ✅ 10ms未満の遅延でのデータベース接続動作
- ✅ 100ms未満平均でのAPIエンドポイント応答
- ✅ 負荷下でのオートスケーリング動作
- ✅ SSL証明書有効・HTTPS強制
- ✅ 監視・アラート機能動作
- ✅ バックアップ・災害復旧テスト済み

### **セキュリティ検証**
- ✅ AWS Secrets Managerでの全シークレット管理
- ✅ ネットワークセキュリティグループの適切な設定
- ✅ アプリケーション保護WAFルール
- ✅ 保存時・転送時暗号化有効
- ✅ RBAC・IAMポリシー実装

### **パフォーマンス検証**
- ✅ 負荷テスト正常完了
- ✅ データベースパフォーマンス最適化
- ✅ CDN・キャッシングの適切な設定
- ✅ アプリケーション起動時間<30秒
- ✅ システムが10,000+同時ユーザーをサポート

---

*この展開戦略は、日本市場向けに設計された高可用性、セキュリティ、スケーラビリティを備えたiWORKZプラットフォームのエンタープライズグレードAWSインフラストラクチャを提供します。*