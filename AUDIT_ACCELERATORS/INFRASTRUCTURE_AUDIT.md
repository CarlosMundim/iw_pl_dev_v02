# iWORKZ Infrastructure Security Audit Guide

## 🏗️ Infrastructure Components Found

### ECS Task Definitions (Least-Privilege IAM Review Needed)

**Primary Task Definitions:**
```
/2_SERVICES/web-frontend/task-definition.json              # Main frontend service
/2_SERVICES/web-frontend/task-definition-app.json          # App service 
/2_SERVICES/web-frontend/task-definition-api.json          # API service
/2_SERVICES/web-frontend/task-definition-jobs.json         # Jobs service
/2_SERVICES/web-frontend/task-definition-talent.json       # Talent service
/2_SERVICES/web-frontend/task-definition-docs.json         # Documentation
/2_SERVICES/web-frontend/task-definition-support.json      # Support service
```

**IAM Review Focus Areas:**
- Container execution roles (AmazonECSTaskExecutionRolePolicy)
- Task roles for AWS service access
- Environment variable injection permissions
- CloudWatch logging permissions
- ECR image pull permissions

### Docker Configuration Security

**Container Images:**
```
/2_SERVICES/web-frontend/Dockerfile                        # Main frontend
/2_SERVICES/web-frontend/docker-app.dockerfile             # App-specific
/2_SERVICES/web-frontend/docker-api.dockerfile             # API-specific  
/2_SERVICES/web-frontend/docker-jobs.dockerfile            # Jobs service
/2_SERVICES/web-frontend/docker-talent.dockerfile          # Talent service
/2_SERVICES/web-frontend/docker-docs.dockerfile            # Docs service
/2_SERVICES/web-frontend/docker-support.dockerfile         # Support service
```

**Security Review Points:**
- Base image vulnerabilities (node:18-alpine)
- Non-root user execution
- Secrets management in build process
- Multi-stage build optimization
- Container escape prevention

### Database Security Configuration

**PostgreSQL RDS Setup:**
- **Host:** iworkz-production-db.catiqcgianiw.us-east-1.rds.amazonaws.com
- **Engine:** PostgreSQL 14+ with pgvector extension
- **Row-Level Security:** Implemented for multi-tenant isolation
- **Encryption:** At-rest and in-transit encryption enabled

**Cultural Intelligence Database:**
- Vector similarity search with pgvector
- Bias monitoring and audit trails
- YAML configuration validation
- Performance optimization with selective indexing

### Network Security

**VPC Configuration:**
- Public subnets: 2 AZs for load balancer
- Private subnets: 2 AZs for application and database
- NAT gateways for outbound internet access
- Security groups with least-privilege rules

**Load Balancer Setup:**
- Application Load Balancer (ALB) for HTTP/HTTPS traffic
- SSL/TLS termination with ACM certificates
- WAF integration for web application firewall
- Health check configuration

## 🔐 Security Policies to Audit

### IAM Roles and Policies

**ECS Task Execution Role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability", 
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

**Application Task Role:**
```json
{
  "Version": "2012-10-17", 
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "rds:DescribeDBInstances",
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:secretsmanager:*:916273703822:secret:iworkz-*",
        "arn:aws:rds:*:916273703822:db:iworkz-*",
        "arn:aws:s3:::iworkz-assets-production/*"
      ]
    }
  ]
}
```

### Security Groups

**ALB Security Group:**
- Inbound: Port 80 (HTTP) and 443 (HTTPS) from 0.0.0.0/0
- Outbound: All traffic to application security group

**Application Security Group:**
- Inbound: Port 3000 from ALB security group only
- Outbound: Port 5432 to database security group
- Outbound: Port 443 for external API calls

**Database Security Group:**
- Inbound: Port 5432 from application security group only
- Outbound: None

## 🚨 Critical Security Review Items

### 1. Environment Variable Injection
**Files to Audit:**
- Task definitions for hardcoded secrets
- Environment variable management
- Secrets Manager integration

### 2. Container Security
**Review Areas:**
- Dockerfile USER directives (non-root)
- COPY vs ADD usage
- Exposed ports and services
- Build-time secret handling

### 3. Database Access
**Security Controls:**
- Connection encryption enforcement
- Role-based access control
- Query logging and monitoring
- Backup encryption

### 4. API Security
**Endpoints to Test:**
- Authentication bypass attempts
- Authorization escalation
- Input validation and sanitization
- Rate limiting effectiveness

### 5. Cultural Intelligence Algorithm
**Bias Monitoring:**
- Demographic fairness testing
- Cultural stereotype detection
- Algorithmic transparency
- Audit trail completeness

## 📊 Monitoring and Logging

**CloudWatch Configuration:**
- Application logs: /ecs/iworkz-web-frontend
- Database logs: RDS PostgreSQL logs
- Load balancer access logs
- WAF logs and blocked requests

**Metrics to Monitor:**
- Failed authentication attempts
- Database connection failures
- API response time anomalies
- Cultural matching bias indicators

## 🔧 Deployment Security

**Deployment Scripts:**
```
/deploy-web-frontend.sh                     # Main deployment script
/4_DEPLOYMENT/scripts/deploy-platform.sh   # Full platform deployment
/4_DEPLOYMENT/staging/deploy-staging.sh    # Staging deployment
```

**Security Considerations:**
- Blue-green deployment strategy
- Rollback capabilities
- Health check validation
- Zero-downtime deployment

---

**Next Steps for Chachie:**
1. Review IAM policies for least-privilege compliance
2. Scan container images for vulnerabilities
3. Test API endpoints for security weaknesses
4. Validate cultural algorithm bias monitoring
5. Audit database security configurations