# Container Guide

## Docker Services Overview

The iWORKZ platform uses Docker containers for consistent development and deployment environments.

---

## Service Configuration

### Frontend Services

```yaml
# Web Frontend
web-frontend:
  build: ./2_SERVICES/web-frontend
  ports: ["3000:3000"]
  environment:
    - NODE_ENV=development
    - NEXT_PUBLIC_API_URL=http://localhost:8000

# Mobile App (Development Server)
mobile-app-dev:
  build: ./2_SERVICES/mobile-app
  ports: ["19000:19000", "19001:19001", "19002:19002"]
  
# Investors Website
investors-website:
  build: ./2_SERVICES/investors-website
  ports: ["3001:3000"]
```

### Backend Services

```yaml
# API Gateway
backend-api:
  build: ./2_SERVICES/backend-api
  ports: ["8000:8000"]
  depends_on: [db-postgres, redis]
  
# AI Agent Service
ai-agent:
  build: ./2_SERVICES/ai-agent
  ports: ["8001:8000"]
  environment:
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    
# Matching Engine
matching-engine:
  build: ./2_SERVICES/matching-engine
  ports: ["8002:8000"]
```

### Data Services

```yaml
# PostgreSQL Database
db-postgres:
  image: postgres:15
  ports: ["5432:5432"]
  environment:
    - POSTGRES_DB=iworkz
    - POSTGRES_USER=iworkz_user
    - POSTGRES_PASSWORD=${DB_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
    
# Redis Cache
redis:
  image: redis:7-alpine
  ports: ["6379:6379"]
  volumes:
    - redis_data:/data
    
# Elasticsearch
search:
  image: elasticsearch:8.8.0
  ports: ["9200:9200", "9300:9300"]
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
```

---

## Container Management

### Development Workflow

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Rebuild service
docker-compose build [service-name]

# Execute commands in container
docker-compose exec [service-name] bash
```

### Production Considerations

* Use multi-stage builds for smaller images
* Implement health checks for all services
* Set resource limits and reservations
* Use secrets management for sensitive data
* Enable logging drivers for centralized logs

### Networking

* Services communicate via internal Docker network
* External access only through exposed ports
* Use service names for inter-service communication
* Implement service discovery for dynamic scaling

### Data Persistence

* Database data persisted in named volumes
* Application logs mounted to host filesystem
* Configuration files mounted as bind mounts
* Backup strategies for critical data

### Monitoring

```yaml
# Prometheus
prometheus:
  image: prom/prometheus
  ports: ["9090:9090"]
  
# Grafana
grafana:
  image: grafana/grafana
  ports: ["3100:3000"]
```
