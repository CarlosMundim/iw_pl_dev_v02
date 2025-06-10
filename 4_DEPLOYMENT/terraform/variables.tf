# =============================================================================
# Terraform Variables for iWORKZ Platform Infrastructure
# =============================================================================

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production"
  }
}

# =============================================================================
# NETWORKING VARIABLES
# =============================================================================
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnets" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# =============================================================================
# EKS VARIABLES
# =============================================================================
variable "kubernetes_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.27"
}

variable "node_instance_types" {
  description = "Instance types for EKS managed node groups"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

variable "spot_instance_types" {
  description = "Instance types for EKS spot node groups"
  type        = list(string)
  default     = ["t3.medium", "t3.large", "t3.xlarge"]
}

variable "node_group_min_size" {
  description = "Minimum number of nodes in node group"
  type        = number
  default     = 1
}

variable "node_group_max_size" {
  description = "Maximum number of nodes in node group"
  type        = number
  default     = 10
}

variable "node_group_desired_size" {
  description = "Desired number of nodes in node group"
  type        = number
  default     = 3
}

# =============================================================================
# DATABASE VARIABLES
# =============================================================================
variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15.3"
}

variable "postgres_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "postgres_allocated_storage" {
  description = "Allocated storage for RDS instance (GB)"
  type        = number
  default     = 20
}

variable "postgres_max_allocated_storage" {
  description = "Maximum allocated storage for RDS instance (GB)"
  type        = number
  default     = 100
}

variable "postgres_username" {
  description = "Username for the master DB user"
  type        = string
  default     = "iworkz_admin"
}

variable "postgres_password" {
  description = "Password for the master DB user"
  type        = string
  sensitive   = true
}

# =============================================================================
# REDIS VARIABLES
# =============================================================================
variable "redis_version" {
  description = "Redis version"
  type        = string
  default     = "7.0"
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_clusters" {
  description = "Number of cache clusters in replication group"
  type        = number
  default     = 1
}

variable "redis_auth_token" {
  description = "Auth token for Redis"
  type        = string
  sensitive   = true
}

# =============================================================================
# DOMAIN AND SSL VARIABLES
# =============================================================================
variable "domain_name" {
  description = "Primary domain name for the application"
  type        = string
  default     = "iworkz.com"
}

variable "certificate_arn" {
  description = "ARN of SSL certificate in ACM"
  type        = string
  default     = ""
}

# =============================================================================
# MONITORING VARIABLES
# =============================================================================
variable "enable_monitoring" {
  description = "Enable monitoring and logging"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 30
}

# =============================================================================
# BACKUP VARIABLES
# =============================================================================
variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

# =============================================================================
# SCALING VARIABLES
# =============================================================================
variable "enable_autoscaling" {
  description = "Enable cluster autoscaling"
  type        = bool
  default     = true
}

variable "min_replicas" {
  description = "Minimum number of replicas for applications"
  type        = number
  default     = 2
}

variable "max_replicas" {
  description = "Maximum number of replicas for applications"
  type        = number
  default     = 10
}

# =============================================================================
# SECURITY VARIABLES
# =============================================================================
variable "enable_encryption" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for critical resources"
  type        = bool
  default     = false
}

# =============================================================================
# FEATURE FLAGS
# =============================================================================
variable "enable_spot_instances" {
  description = "Enable spot instances for cost optimization"
  type        = bool
  default     = false
}

variable "enable_multi_az" {
  description = "Enable multi-AZ deployment"
  type        = bool
  default     = false
}

variable "enable_performance_insights" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = false
}

# =============================================================================
# ENVIRONMENT-SPECIFIC DEFAULTS
# =============================================================================
locals {
  environment_defaults = {
    dev = {
      postgres_instance_class = "db.t3.micro"
      redis_node_type        = "cache.t3.micro"
      node_group_min_size    = 1
      node_group_desired_size = 1
      backup_retention_period = 1
      enable_multi_az        = false
      enable_deletion_protection = false
    }
    
    staging = {
      postgres_instance_class = "db.t3.small"
      redis_node_type        = "cache.t3.small"
      node_group_min_size    = 2
      node_group_desired_size = 2
      backup_retention_period = 7
      enable_multi_az        = false
      enable_deletion_protection = false
    }
    
    production = {
      postgres_instance_class = "db.t3.medium"
      redis_node_type        = "cache.t3.medium"
      node_group_min_size    = 3
      node_group_desired_size = 3
      backup_retention_period = 30
      enable_multi_az        = true
      enable_deletion_protection = true
    }
  }
}

# =============================================================================
# TAGS
# =============================================================================
variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}