# iWORKZ Platform Infrastructure
# Terraform configuration for AWS deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "s3" {
    bucket = "iworkz-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "ap-northeast-1"
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "iWORKZ"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Carlos Mundim"
      Team        = "DevOps"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC Configuration
resource "aws_vpc" "iworkz_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc-${var.environment}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "iworkz_igw" {
  vpc_id = aws_vpc.iworkz_vpc.id

  tags = {
    Name = "${var.project_name}-igw-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "public_subnets" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.iworkz_vpc.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}-${var.environment}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private_subnets" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.iworkz_vpc.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}-${var.environment}"
    Type = "Private"
  }
}

# NAT Gateways
resource "aws_eip" "nat_eips" {
  count  = length(aws_subnet.public_subnets)
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.iworkz_igw]
}

resource "aws_nat_gateway" "nat_gateways" {
  count = length(aws_subnet.public_subnets)

  allocation_id = aws_eip.nat_eips[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id

  tags = {
    Name = "${var.project_name}-nat-gateway-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.iworkz_igw]
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.iworkz_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.iworkz_igw.id
  }

  tags = {
    Name = "${var.project_name}-public-rt-${var.environment}"
  }
}

resource "aws_route_table" "private_rts" {
  count  = length(aws_nat_gateway.nat_gateways)
  vpc_id = aws_vpc.iworkz_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateways[count.index].id
  }

  tags = {
    Name = "${var.project_name}-private-rt-${count.index + 1}-${var.environment}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_rta" {
  count = length(aws_subnet.public_subnets)

  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_rta" {
  count = length(aws_subnet.private_subnets)

  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rts[count.index].id
}

# Security Groups
resource "aws_security_group" "eks_cluster_sg" {
  name_prefix = "${var.project_name}-eks-cluster-"
  vpc_id      = aws_vpc.iworkz_vpc.id

  ingress {
    from_port = 443
    to_port   = 443
    protocol  = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-eks-cluster-sg-${var.environment}"
  }
}

resource "aws_security_group" "eks_node_sg" {
  name_prefix = "${var.project_name}-eks-node-"
  vpc_id      = aws_vpc.iworkz_vpc.id

  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }

  ingress {
    from_port       = 1025
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster_sg.id]
  }

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-eks-node-sg-${var.environment}"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "iworkz_cluster" {
  name     = "${var.project_name}-cluster-${var.environment}"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = concat(aws_subnet.public_subnets[*].id, aws_subnet.private_subnets[*].id)
    security_group_ids      = [aws_security_group.eks_cluster_sg.id]
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = var.cluster_endpoint_public_access_cidrs
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_service_policy,
  ]

  tags = {
    Name = "${var.project_name}-cluster-${var.environment}"
  }
}

# EKS Node Groups
resource "aws_eks_node_group" "iworkz_nodes" {
  cluster_name    = aws_eks_cluster.iworkz_cluster.name
  node_group_name = "${var.project_name}-nodes-${var.environment}"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.private_subnets[*].id
  instance_types  = var.node_instance_types

  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }

  update_config {
    max_unavailable = 1
  }

  ami_type       = "AL2_x86_64"
  capacity_type  = "ON_DEMAND"
  disk_size      = var.node_disk_size

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]

  tags = {
    Name = "${var.project_name}-node-group-${var.environment}"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "iworkz_db_subnet_group" {
  name       = "${var.project_name}-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private_subnets[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group-${var.environment}"
  }
}

# RDS Instance
resource "aws_db_instance" "iworkz_postgres" {
  identifier = "${var.project_name}-postgres-${var.environment}"

  engine         = "postgres"
  engine_version = var.postgres_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.iworkz_db_subnet_group.name

  backup_retention_period = var.db_backup_retention_period
  backup_window          = var.db_backup_window
  maintenance_window     = var.db_maintenance_window

  multi_az               = var.environment == "production" ? true : false
  publicly_accessible   = false
  skip_final_snapshot   = var.environment != "production"
  deletion_protection   = var.environment == "production" ? true : false

  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_enhanced_monitoring.arn

  tags = {
    Name = "${var.project_name}-postgres-${var.environment}"
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "iworkz_cache_subnet_group" {
  name       = "${var.project_name}-cache-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private_subnets[*].id
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "iworkz_redis" {
  replication_group_id         = "${var.project_name}-redis-${var.environment}"
  description                  = "Redis cluster for iWORKZ platform"
  
  node_type                    = var.redis_node_type
  port                        = 6379
  parameter_group_name        = "default.redis7"
  
  num_cache_clusters         = var.redis_num_cache_nodes
  automatic_failover_enabled = var.redis_num_cache_nodes > 1
  multi_az_enabled          = var.redis_num_cache_nodes > 1
  
  subnet_group_name = aws_elasticache_subnet_group.iworkz_cache_subnet_group.name
  security_group_ids = [aws_security_group.redis_sg.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = var.redis_auth_token
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.elasticache.name
    destination_type = "cloudwatch-logs"
    log_format      = "text"
    log_type        = "slow-log"
  }

  tags = {
    Name = "${var.project_name}-redis-${var.environment}"
  }
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.iworkz_cluster.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = aws_eks_cluster.iworkz_cluster.vpc_config[0].cluster_security_group_id
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = aws_eks_cluster.iworkz_cluster.name
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.iworkz_postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.iworkz_redis.configuration_endpoint_address
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.iworkz_vpc.id
}

output "private_subnets" {
  description = "List of IDs of private subnets"
  value       = aws_subnet.private_subnets[*].id
}

output "public_subnets" {
  description = "List of IDs of public subnets"
  value       = aws_subnet.public_subnets[*].id
}