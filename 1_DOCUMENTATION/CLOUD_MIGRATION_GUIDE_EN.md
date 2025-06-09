# iWORKZ Platform Cloud Migration Guide (English)

## Table of Contents
1. [Overview](#overview)
2. [AWS Migration](#aws-migration)
3. [Azure Migration](#azure-migration)
4. [Pre-Migration Checklist](#pre-migration-checklist)
5. [Migration Strategy](#migration-strategy)
6. [Cost Optimization](#cost-optimization)
7. [Security Considerations](#security-considerations)
8. [Monitoring and Observability](#monitoring-and-observability)
9. [Disaster Recovery](#disaster-recovery)
10. [Commercial Launch Preparation](#commercial-launch-preparation)

## Overview

This guide provides comprehensive instructions for migrating the iWORKZ platform to AWS or Azure for commercial deployment. The platform consists of 17+ microservices, databases, AI components, and monitoring infrastructure.

### Current Architecture
- **17+ Microservices**: Backend API, AI Agent, Web Frontend, Mobile App
- **Databases**: PostgreSQL, Redis
- **AI/ML Services**: OpenAI, Anthropic integrations
- **Infrastructure**: Docker containers, Kubernetes orchestration
- **Monitoring**: Prometheus, Grafana, Loki, AlertManager

### Migration Goals
- **Scalability**: Support 100,000+ users and 10,000+ concurrent connections
- **High Availability**: 99.9% uptime SLA
- **Global Reach**: Multi-region deployment for Japan and international markets
- **Security**: Enterprise-grade security and compliance
- **Cost Efficiency**: Optimized cloud spend with auto-scaling

## AWS Migration

### AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud Infrastructure                  │
├─────────────────────────────────────────────────────────────────┤
│  Route 53 (DNS) → CloudFront (CDN) → ALB (Load Balancer)       │
│                           │                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    EKS Cluster                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ Web Frontend│  │ Backend API │  │  AI Agent   │      │  │
│  │  │   Pods      │  │    Pods     │  │    Pods     │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ RDS         │  │ ElastiCache │  │     S3      │              │
│  │ PostgreSQL  │  │   Redis     │  │   Storage   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ CloudWatch  │  │   ECR       │  │   Secrets   │              │
│  │ Monitoring  │  │  Registry   │  │  Manager    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### AWS Infrastructure as Code

#### 1. Enhanced Terraform Configuration

Update the existing Terraform configuration for production:

```hcl
# terraform/aws/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "iworkz-terraform-state"
    key    = "production/terraform.tfstate"
    region = "ap-northeast-1"
    encrypt = true
    dynamodb_table = "iworkz-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "iWORKZ"
      Environment = var.environment
      ManagedBy   = "Terraform"
      CostCenter  = "Engineering"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"  # Tokyo region for Japan market
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "iworkz-production"
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.cluster_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = false  # High availability
  enable_vpn_gateway     = false
  enable_dns_hostnames   = true
  enable_dns_support     = true

  # Enable flow logs for security
  enable_flow_log                      = true
  create_flow_log_cloudwatch_iam_role  = true
  create_flow_log_cloudwatch_log_group = true

  tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.28"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  cluster_endpoint_private_access = true

  # Enable cluster logging
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  # EKS Managed Node Groups
  eks_managed_node_groups = {
    general = {
      name = "general"
      
      instance_types = ["m5.xlarge"]
      capacity_type  = "ON_DEMAND"
      
      min_size     = 3
      max_size     = 10
      desired_size = 6

      labels = {
        role = "general"
      }

      tags = {
        Environment = var.environment
      }
    }

    spot = {
      name = "spot"
      
      instance_types = ["m5.large", "m5.xlarge", "m4.large", "m4.xlarge"]
      capacity_type  = "SPOT"
      
      min_size     = 0
      max_size     = 20
      desired_size = 3

      labels = {
        role = "spot"
      }

      taints = {
        spot = {
          key    = "spot-instance"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      }

      tags = {
        Environment = var.environment
      }
    }
  }

  # IRSA for various AWS services
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  tags = {
    Environment = var.environment
  }
}

# RDS PostgreSQL
resource "aws_db_subnet_group" "iworkz" {
  name       = "${var.cluster_name}-db-subnet-group"
  subnet_ids = module.vpc.database_subnets

  tags = {
    Name = "${var.cluster_name} DB subnet group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.cluster_name}-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.cluster_primary_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-rds-sg"
  }
}

resource "aws_db_instance" "iworkz" {
  identifier = "${var.cluster_name}-postgres"

  # Engine
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.xlarge"  # Production instance

  # Storage
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database
  db_name  = "iworkz_platform"
  username = "iworkz_admin"
  password = random_password.db_password.result

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.iworkz.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Backup and maintenance
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  # Performance insights
  performance_insights_enabled = true
  monitoring_interval         = 60

  # Multi-AZ for high availability
  multi_az = true

  # Deletion protection
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.cluster_name}-postgres-final-snapshot"

  tags = {
    Name = "${var.cluster_name}-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "iworkz" {
  name       = "${var.cluster_name}-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.cluster_name}-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.cluster_primary_security_group_id]
  }

  tags = {
    Name = "${var.cluster_name}-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "iworkz" {
  replication_group_id         = "${var.cluster_name}-redis"
  description                  = "Redis cluster for iWORKZ platform"

  node_type                    = "cache.r6g.large"
  port                         = 6379
  parameter_group_name         = "default.redis7"

  num_cache_clusters           = 3
  automatic_failover_enabled   = true
  multi_az_enabled            = true

  subnet_group_name           = aws_elasticache_subnet_group.iworkz.name
  security_group_ids          = [aws_security_group.redis.id]

  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  auth_token                  = random_password.redis_password.result

  # Backup
  snapshot_retention_limit = 7
  snapshot_window         = "03:00-05:00"

  # Maintenance
  maintenance_window = "sun:05:00-sun:06:00"

  tags = {
    Name = "${var.cluster_name}-redis"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "iworkz_storage" {
  bucket = "${var.cluster_name}-storage"

  tags = {
    Name = "${var.cluster_name}-storage"
  }
}

resource "aws_s3_bucket_versioning" "iworkz_storage" {
  bucket = aws_s3_bucket.iworkz_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "iworkz_storage" {
  bucket = aws_s3_bucket.iworkz_storage.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "iworkz_storage" {
  bucket = aws_s3_bucket.iworkz_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront for global CDN
resource "aws_cloudfront_distribution" "iworkz" {
  origin {
    domain_name = module.eks.cluster_endpoint
    origin_id   = "EKS-${var.cluster_name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["iworkz.com", "www.iworkz.com"]

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "EKS-${var.cluster_name}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Host", "Authorization", "CloudFront-Forwarded-Proto"]
      cookies {
        forward = "all"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.iworkz.arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Name = "${var.cluster_name}-cdn"
  }
}

# Random passwords
resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "random_password" "redis_password" {
  length  = 32
  special = false
}

# Secrets Manager
resource "aws_secretsmanager_secret" "iworkz" {
  name = "${var.cluster_name}-secrets"
}

resource "aws_secretsmanager_secret_version" "iworkz" {
  secret_id = aws_secretsmanager_secret.iworkz.id
  secret_string = jsonencode({
    db_password    = random_password.db_password.result
    redis_password = random_password.redis_password.result
    jwt_secret     = random_password.jwt_secret.result
  })
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

# Outputs
output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.iworkz.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.iworkz.primary_endpoint_address
  sensitive   = true
}

output "s3_bucket" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.iworkz_storage.bucket
}
```

#### 2. AWS Deployment Script

```bash
#!/bin/bash
# deploy-aws.sh

set -euo pipefail

# Configuration
AWS_REGION="ap-northeast-1"
CLUSTER_NAME="iworkz-production"
ENVIRONMENT="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    command -v aws >/dev/null 2>&1 || print_error "AWS CLI not installed"
    command -v terraform >/dev/null 2>&1 || print_error "Terraform not installed"
    command -v kubectl >/dev/null 2>&1 || print_error "kubectl not installed"
    command -v helm >/dev/null 2>&1 || print_error "Helm not installed"
    
    # Check AWS credentials
    aws sts get-caller-identity >/dev/null 2>&1 || print_error "AWS credentials not configured"
    
    print_success "Prerequisites check passed"
}

# Deploy infrastructure
deploy_infrastructure() {
    print_header "Deploying AWS Infrastructure"
    
    cd terraform/aws
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    terraform plan -var="aws_region=${AWS_REGION}" -var="environment=${ENVIRONMENT}"
    
    # Apply infrastructure
    terraform apply -var="aws_region=${AWS_REGION}" -var="environment=${ENVIRONMENT}" -auto-approve
    
    # Update kubeconfig
    aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}
    
    print_success "Infrastructure deployed"
}

# Install cluster add-ons
install_addons() {
    print_header "Installing Cluster Add-ons"
    
    # AWS Load Balancer Controller
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
        -n kube-system \
        --set clusterName=${CLUSTER_NAME} \
        --set serviceAccount.create=false \
        --set serviceAccount.name=aws-load-balancer-controller
    
    # Cluster Autoscaler
    helm install cluster-autoscaler autoscaler/cluster-autoscaler \
        -n kube-system \
        --set autoDiscovery.clusterName=${CLUSTER_NAME} \
        --set awsRegion=${AWS_REGION}
    
    # External DNS
    helm install external-dns bitnami/external-dns \
        -n kube-system \
        --set provider=aws \
        --set aws.region=${AWS_REGION} \
        --set txtOwnerId=${CLUSTER_NAME}
    
    print_success "Add-ons installed"
}

# Deploy application
deploy_application() {
    print_header "Deploying iWORKZ Application"
    
    # Create namespaces
    kubectl apply -f ../kubernetes/namespaces.yaml
    
    # Create secrets from AWS Secrets Manager
    kubectl create secret generic iworkz-secrets \
        --from-literal=DATABASE_URL="postgresql://iworkz_admin:$(aws secretsmanager get-secret-value --secret-id ${CLUSTER_NAME}-secrets --query 'SecretString' --output text | jq -r '.db_password')@$(terraform output -raw rds_endpoint):5432/iworkz_platform" \
        --from-literal=REDIS_URL="redis://:$(aws secretsmanager get-secret-value --secret-id ${CLUSTER_NAME}-secrets --query 'SecretString' --output text | jq -r '.redis_password')@$(terraform output -raw redis_endpoint):6379" \
        --from-literal=JWT_SECRET="$(aws secretsmanager get-secret-value --secret-id ${CLUSTER_NAME}-secrets --query 'SecretString' --output text | jq -r '.jwt_secret')" \
        -n iworkz-platform
    
    # Deploy applications
    kubectl apply -f ../kubernetes/deployments/
    kubectl apply -f ../kubernetes/monitoring/
    kubectl apply -f ../kubernetes/ingress.yaml
    
    # Wait for deployment
    kubectl wait --for=condition=available --timeout=600s deployment --all -n iworkz-platform
    
    print_success "Application deployed"
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check pod status
    kubectl get pods -n iworkz-platform
    kubectl get pods -n iworkz-monitoring
    
    # Check services
    kubectl get services -n iworkz-platform
    
    # Check ingress
    kubectl get ingress -n iworkz-platform
    
    # Get load balancer URL
    LB_URL=$(kubectl get ingress iworkz-ingress -n iworkz-platform -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    echo "Application URL: https://${LB_URL}"
    
    print_success "Deployment verified"
}

# Main execution
main() {
    print_header "Starting AWS Deployment"
    
    check_prerequisites
    deploy_infrastructure
    install_addons
    deploy_application
    verify_deployment
    
    print_header "AWS Deployment Complete!"
    print_success "iWORKZ Platform deployed to AWS"
}

# Run deployment
main "$@"
```

### AWS Cost Optimization

#### Auto Scaling Configuration

```yaml
# aws-cluster-autoscaler.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cluster-autoscaler
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/cluster-autoscaler-role

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      serviceAccountName: cluster-autoscaler
      containers:
        - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.28.2
          name: cluster-autoscaler
          resources:
            limits:
              cpu: 100m
              memory: 300Mi
            requests:
              cpu: 100m
              memory: 300Mi
          command:
            - ./cluster-autoscaler
            - --v=4
            - --stderrthreshold=info
            - --cloud-provider=aws
            - --skip-nodes-with-local-storage=false
            - --expander=least-waste
            - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/iworkz-production
            - --balance-similar-node-groups
            - --skip-nodes-with-system-pods=false
          env:
            - name: AWS_REGION
              value: ap-northeast-1
```

#### Cost Monitoring Dashboard

```yaml
# cost-monitoring-dashboard.json
{
  "dashboard": {
    "title": "AWS Cost Monitoring - iWORKZ",
    "panels": [
      {
        "title": "EKS Cluster Costs",
        "type": "graph",
        "targets": [
          {
            "expr": "aws_billing_estimated_charges{service_name=\"AmazonEKS\"}",
            "legendFormat": "EKS Charges"
          }
        ]
      },
      {
        "title": "RDS Costs",
        "type": "graph",
        "targets": [
          {
            "expr": "aws_billing_estimated_charges{service_name=\"AmazonRDS\"}",
            "legendFormat": "RDS Charges"
          }
        ]
      },
      {
        "title": "S3 Storage Costs",
        "type": "graph",
        "targets": [
          {
            "expr": "aws_billing_estimated_charges{service_name=\"AmazonS3\"}",
            "legendFormat": "S3 Charges"
          }
        ]
      }
    ]
  }
}
```

## Azure Migration

### Azure Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Azure Cloud Infrastructure                  │
├─────────────────────────────────────────────────────────────────┤
│  DNS Zone → Front Door (CDN) → Application Gateway             │
│                           │                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    AKS Cluster                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ Web Frontend│  │ Backend API │  │  AI Agent   │      │  │
│  │  │   Pods      │  │    Pods     │  │    Pods     │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Azure DB    │  │Azure Cache  │  │   Blob      │              │
│  │ PostgreSQL  │  │ for Redis   │  │  Storage    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │Azure Monitor│  │   ACR       │  │ Key Vault   │              │
│  │   & Logs    │  │  Registry   │  │  Secrets    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Azure Terraform Configuration

```hcl
# terraform/azure/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "iworkz-terraform-rg"
    storage_account_name = "iworkzterraformstate"
    container_name       = "tfstate"
    key                  = "production.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# Variables
variable "location" {
  description = "Azure region"
  type        = string
  default     = "Japan East"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "cluster_name" {
  description = "AKS cluster name"
  type        = string
  default     = "iworkz-production"
}

# Resource Group
resource "azurerm_resource_group" "iworkz" {
  name     = "${var.cluster_name}-rg"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "iWORKZ"
    ManagedBy   = "Terraform"
  }
}

# Virtual Network
resource "azurerm_virtual_network" "iworkz" {
  name                = "${var.cluster_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.iworkz.location
  resource_group_name = azurerm_resource_group.iworkz.name

  tags = {
    Environment = var.environment
  }
}

# Subnets
resource "azurerm_subnet" "aks" {
  name                 = "aks-subnet"
  resource_group_name  = azurerm_resource_group.iworkz.name
  virtual_network_name = azurerm_virtual_network.iworkz.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "database" {
  name                 = "database-subnet"
  resource_group_name  = azurerm_resource_group.iworkz.name
  virtual_network_name = azurerm_virtual_network.iworkz.name
  address_prefixes     = ["10.0.2.0/24"]
  
  delegation {
    name = "fs"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "iworkz" {
  name                = var.cluster_name
  location            = azurerm_resource_group.iworkz.location
  resource_group_name = azurerm_resource_group.iworkz.name
  dns_prefix          = var.cluster_name

  default_node_pool {
    name           = "default"
    node_count     = 3
    vm_size        = "Standard_D4s_v3"
    vnet_subnet_id = azurerm_subnet.aks.id
    
    enable_auto_scaling = true
    min_count          = 3
    max_count          = 10
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
    network_policy = "calico"
  }

  # Enable monitoring
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.iworkz.id
  }

  tags = {
    Environment = var.environment
  }
}

# Additional Node Pool for Spot Instances
resource "azurerm_kubernetes_cluster_node_pool" "spot" {
  name                  = "spot"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.iworkz.id
  vm_size              = "Standard_D2s_v3"
  node_count           = 2
  
  enable_auto_scaling = true
  min_count          = 0
  max_count          = 20
  
  priority        = "Spot"
  eviction_policy = "Delete"
  spot_max_price  = 0.1  # Maximum price per hour
  
  node_taints = ["spot=true:NoSchedule"]

  tags = {
    Environment = var.environment
    NodeType    = "spot"
  }
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "iworkz" {
  name                   = "${var.cluster_name}-postgres"
  resource_group_name    = azurerm_resource_group.iworkz.name
  location              = azurerm_resource_group.iworkz.location
  version               = "15"
  delegated_subnet_id   = azurerm_subnet.database.id
  private_dns_zone_id   = azurerm_private_dns_zone.postgres.id
  administrator_login    = "iworkz_admin"
  administrator_password = random_password.db_password.result

  storage_mb = 102400
  sku_name   = "GP_Standard_D4s_v3"

  backup_retention_days        = 30
  geo_redundant_backup_enabled = true

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]

  tags = {
    Environment = var.environment
  }
}

# Private DNS Zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgres" {
  name                = "${var.cluster_name}-postgres.private.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.iworkz.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${var.cluster_name}-postgres-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = azurerm_virtual_network.iworkz.id
  resource_group_name   = azurerm_resource_group.iworkz.name
}

# Azure Cache for Redis
resource "azurerm_redis_cache" "iworkz" {
  name                = "${var.cluster_name}-redis"
  location            = azurerm_resource_group.iworkz.location
  resource_group_name = azurerm_resource_group.iworkz.name
  capacity            = 2
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    enable_authentication = true
  }

  tags = {
    Environment = var.environment
  }
}

# Storage Account
resource "azurerm_storage_account" "iworkz" {
  name                     = "${replace(var.cluster_name, "-", "")}storage"
  resource_group_name      = azurerm_resource_group.iworkz.name
  location                = azurerm_resource_group.iworkz.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  
  blob_properties {
    versioning_enabled = true
  }

  tags = {
    Environment = var.environment
  }
}

# Container Registry
resource "azurerm_container_registry" "iworkz" {
  name                = "${replace(var.cluster_name, "-", "")}acr"
  resource_group_name = azurerm_resource_group.iworkz.name
  location            = azurerm_resource_group.iworkz.location
  sku                 = "Premium"
  admin_enabled       = false

  tags = {
    Environment = var.environment
  }
}

# Give AKS access to ACR
resource "azurerm_role_assignment" "aks_acr" {
  principal_id                     = azurerm_kubernetes_cluster.iworkz.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                           = azurerm_container_registry.iworkz.id
  skip_service_principal_aad_check = true
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "iworkz" {
  name                = "${var.cluster_name}-logs"
  location            = azurerm_resource_group.iworkz.location
  resource_group_name = azurerm_resource_group.iworkz.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = {
    Environment = var.environment
  }
}

# Key Vault
resource "azurerm_key_vault" "iworkz" {
  name                = "${var.cluster_name}-kv"
  location            = azurerm_resource_group.iworkz.location
  resource_group_name = azurerm_resource_group.iworkz.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore"
    ]
  }

  tags = {
    Environment = var.environment
  }
}

# Store secrets in Key Vault
resource "azurerm_key_vault_secret" "db_password" {
  name         = "db-password"
  value        = random_password.db_password.result
  key_vault_id = azurerm_key_vault.iworkz.id
}

resource "azurerm_key_vault_secret" "redis_password" {
  name         = "redis-password"
  value        = azurerm_redis_cache.iworkz.primary_access_key
  key_vault_id = azurerm_key_vault.iworkz.id
}

# Random passwords
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Data sources
data "azurerm_client_config" "current" {}

# Outputs
output "kube_config" {
  value     = azurerm_kubernetes_cluster.iworkz.kube_config_raw
  sensitive = true
}

output "cluster_name" {
  value = azurerm_kubernetes_cluster.iworkz.name
}

output "resource_group_name" {
  value = azurerm_resource_group.iworkz.name
}

output "postgres_fqdn" {
  value     = azurerm_postgresql_flexible_server.iworkz.fqdn
  sensitive = true
}

output "redis_hostname" {
  value     = azurerm_redis_cache.iworkz.hostname
  sensitive = true
}
```

## Pre-Migration Checklist

### Technical Requirements

- [ ] **Cloud Account Setup**
  - [ ] AWS/Azure account with billing configured
  - [ ] IAM roles and permissions configured
  - [ ] Service quotas increased if needed
  - [ ] Multi-factor authentication enabled

- [ ] **Domain and SSL Certificates**
  - [ ] Domain registration (iworkz.com)
  - [ ] DNS management setup
  - [ ] SSL certificates provisioned
  - [ ] CDN configuration planned

- [ ] **Security and Compliance**
  - [ ] Security groups and network ACLs defined
  - [ ] Encryption at rest and in transit enabled
  - [ ] Backup and disaster recovery strategy
  - [ ] Compliance requirements mapped (GDPR, PIPEDA)

- [ ] **Monitoring and Alerting**
  - [ ] Monitoring strategy defined
  - [ ] Alert thresholds configured
  - [ ] Log retention policies set
  - [ ] Performance baselines established

### Business Requirements

- [ ] **Commercial Launch Preparation**
  - [ ] Pricing strategy finalized
  - [ ] Payment processing integration
  - [ ] Terms of service and privacy policy
  - [ ] Customer support infrastructure

- [ ] **Scalability Planning**
  - [ ] Expected user growth mapped
  - [ ] Performance requirements defined
  - [ ] Auto-scaling policies configured
  - [ ] Load testing completed

- [ ] **International Expansion**
  - [ ] Multi-region deployment strategy
  - [ ] Localization requirements
  - [ ] Data residency compliance
  - [ ] International payment support

## Migration Strategy

### Phase 1: Infrastructure Setup (Week 1-2)

1. **Cloud Account Preparation**
   - Set up AWS/Azure accounts
   - Configure billing and cost management
   - Create IAM roles and policies
   - Set up VPCs and networking

2. **Core Infrastructure Deployment**
   - Deploy Kubernetes cluster
   - Set up managed databases
   - Configure storage solutions
   - Implement security groups

3. **CI/CD Pipeline Setup**
   - Configure container registries
   - Set up build pipelines
   - Implement deployment automation
   - Configure environment promotion

### Phase 2: Application Migration (Week 3-4)

1. **Database Migration**
   - Export existing data
   - Set up managed PostgreSQL/Redis
   - Import data with validation
   - Test connectivity and performance

2. **Application Deployment**
   - Build and push container images
   - Deploy microservices
   - Configure service discovery
   - Implement health checks

3. **Integration Testing**
   - End-to-end functionality testing
   - Performance and load testing
   - Security penetration testing
   - User acceptance testing

### Phase 3: Go-Live Preparation (Week 5-6)

1. **DNS and Traffic Management**
   - Configure DNS records
   - Set up CDN and load balancers
   - Implement blue-green deployment
   - Configure monitoring and alerting

2. **Final Testing and Optimization**
   - Performance tuning
   - Security hardening
   - Backup and disaster recovery testing
   - Documentation completion

3. **Go-Live and Support**
   - Production cutover
   - 24/7 monitoring setup
   - Support team training
   - Post-launch optimization

## Commercial Launch Preparation

### Business Model Implementation

#### Subscription Tiers

```yaml
# Pricing tiers configuration
subscription_tiers:
  talent_free:
    name: "Talent Free"
    price: 0
    currency: "JPY"
    features:
      - "Basic profile creation"
      - "Job search and filtering"
      - "Up to 5 job applications per month"
      - "Basic AI matching"
    limitations:
      monthly_applications: 5
      priority_support: false
      advanced_analytics: false

  talent_premium:
    name: "Talent Premium"
    price: 2980
    currency: "JPY"
    billing: "monthly"
    features:
      - "Unlimited job applications"
      - "Advanced AI matching with explanations"
      - "Priority visibility to employers"
      - "Resume optimization suggestions"
      - "Career insights and analytics"
      - "Priority support"
    limitations:
      monthly_applications: -1  # unlimited
      priority_support: true
      advanced_analytics: true

  employer_startup:
    name: "Employer Startup"
    price: 29800
    currency: "JPY"
    billing: "monthly"
    features:
      - "Up to 5 active job postings"
      - "Basic talent search"
      - "Standard AI matching"
      - "Email support"
    limitations:
      active_jobs: 5
      monthly_searches: 100
      advanced_analytics: false

  employer_growth:
    name: "Employer Growth"
    price: 98000
    currency: "JPY"
    billing: "monthly"
    features:
      - "Up to 25 active job postings"
      - "Advanced talent search and filtering"
      - "Premium AI matching with insights"
      - "Compliance checking"
      - "Analytics dashboard"
      - "Phone and email support"
    limitations:
      active_jobs: 25
      monthly_searches: 1000
      advanced_analytics: true

  employer_enterprise:
    name: "Employer Enterprise"
    price: 298000
    currency: "JPY"
    billing: "monthly"
    features:
      - "Unlimited job postings"
      - "Advanced AI-powered recruiting tools"
      - "White-label solutions"
      - "API access"
      - "Dedicated account manager"
      - "Custom integrations"
      - "24/7 support"
    limitations:
      active_jobs: -1  # unlimited
      monthly_searches: -1  # unlimited
      advanced_analytics: true
      api_access: true
```

#### Payment Processing Integration

```javascript
// payment-integration.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createSubscription(customerId, priceId, paymentMethodId) {
    try {
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_settings: {
          payment_method_options: {
            card: {
              request_three_d_secure: 'if_required',
            },
          },
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        subscription_id: subscription.id,
        client_secret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status,
      };
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  async handleWebhook(rawBody, signature) {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleCancelledSubscription(event.data.object);
        break;
    }
  }

  async handleSuccessfulPayment(invoice) {
    // Update user subscription status
    // Send confirmation email
    // Enable premium features
  }

  async handleFailedPayment(invoice) {
    // Notify user of failed payment
    // Set account to grace period
    // Send payment retry instructions
  }
}
```

### Compliance and Legal Framework

#### GDPR Compliance Implementation

```javascript
// gdpr-compliance.js
class GDPRComplianceService {
  async handleDataSubjectRequest(userId, requestType) {
    switch (requestType) {
      case 'DATA_EXPORT':
        return await this.exportUserData(userId);
      case 'DATA_DELETION':
        return await this.deleteUserData(userId);
      case 'DATA_RECTIFICATION':
        return await this.updateUserData(userId);
      case 'DATA_PORTABILITY':
        return await this.portUserData(userId);
    }
  }

  async exportUserData(userId) {
    const userData = await this.aggregateUserData(userId);
    
    return {
      personal_information: userData.profile,
      application_history: userData.applications,
      search_history: userData.searches,
      communication_logs: userData.communications,
      consent_records: userData.consents,
      exported_at: new Date().toISOString(),
    };
  }

  async deleteUserData(userId) {
    // Anonymize instead of hard delete for audit trail
    await this.anonymizeUserData(userId);
    
    // Mark account as deleted
    await this.markAccountDeleted(userId);
    
    // Remove from marketing lists
    await this.removeFromMarketing(userId);
    
    // Log the deletion request
    await this.logDataDeletion(userId);
  }

  async trackConsent(userId, consentType, granted) {
    await this.storeConsentRecord({
      user_id: userId,
      consent_type: consentType,
      granted: granted,
      timestamp: new Date(),
      ip_address: this.getClientIP(),
      user_agent: this.getUserAgent(),
    });
  }
}
```

## Support and Resources

### Technical Documentation
- **AWS Documentation**: https://docs.aws.amazon.com/
- **Azure Documentation**: https://docs.microsoft.com/azure/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Terraform Documentation**: https://www.terraform.io/docs/

### Support Contacts
- **Technical Support**: tech-support@iworkz.com
- **Business Support**: business@iworkz.com
- **Security Issues**: security@iworkz.com
- **Emergency Hotline**: +81-3-xxxx-xxxx

For additional assistance with cloud migration, please contact our technical team.