# Redis Service

## Overview

High-performance in-memory data store used for caching, session management, and real-time features.

## Configuration

* **Version**: Redis 7+
* **Memory**: 2GB allocated
* **Persistence**: RDB + AOF
* **Clustering**: Single instance (dev), Redis Cluster (prod)
* **Security**: AUTH enabled, TLS in production

## Development Setup

```bash
# Start Redis container
docker-compose up redis -d

# Connect to Redis CLI
docker-compose exec redis redis-cli

# Monitor Redis
docker-compose exec redis redis-cli monitor

# Check Redis info
docker-compose exec redis redis-cli info
```

## Use Cases

### Caching Layer

* Database query results
* API response caching
* Computed data storage
* Frequently accessed objects

### Session Management

* User session storage
* JWT token blacklisting
* Temporary authentication codes
* Rate limiting counters

### Real-time Features

* WebSocket connection management
* Real-time notifications
* Live chat message queuing
* Activity feeds

### Background Jobs

* Job queue management
* Task scheduling
* Progress tracking
* Result storage

## Data Structures Used

### Strings

```redis
# User sessions
SET session:user:123 "jwt_token_here" EX 3600

# API rate limiting
INCR rate_limit:api:user:123
EXPIRE rate_limit:api:user:123 60

# Feature flags
SET feature:ai_matching:enabled "true"
```

### Hashes

```redis
# User profile cache
HSET user:123 name "John Doe" email "john@example.com" role "candidate"

# Job application cache
HSET application:456 job_id "789" candidate_id "123" status "pending"
```

### Lists

```redis
# Recent activities
LPUSH user:123:activities "Applied to job X"
LTRIM user:123:activities 0 99  # Keep last 100

# Message queues
LPUSH job_queue "process_application:456"
```

### Sets

```redis
# User skills
SADD user:123:skills "javascript" "python" "react"

# Job requirements
SADD job:789:requirements "javascript" "nodejs" "mongodb"

# Online users
SADD online_users "user:123" "user:456"
```

### Sorted Sets

```redis
# Leaderboards
ZADD user_scores 1500 "user:123" 1200 "user:456"

# Job recommendations by score
ZADD user:123:job_recommendations 0.95 "job:789" 0.87 "job:456"

# Recent applications
ZADD recent_applications 1640995200 "app:123" 1640995300 "app:124"
```

### Streams

```redis
# Real-time events
XADD events * event_type "job_applied" user_id "123" job_id "789"

# Notification stream
XADD notifications * user_id "123" type "message" content "New job match found"
```

## Redis Modules

### RedisJSON

```redis
# Store complex JSON objects
JSON.SET user:123 $ '{"name":"John","skills":["js","python"],"preferences":{"remote":true}}'

# Query JSON data
JSON.GET user:123 $.skills
```

### RediSearch

```redis
# Create search index for jobs
FT.CREATE jobs_idx ON JSON PREFIX 1 job: SCHEMA $.title AS title TEXT $.location AS location TAG
```

## Performance Optimization

### Memory Optimization

```redis
# Use appropriate data types
# Compress large values
# Set TTL for temporary data
# Monitor memory usage

# Redis configuration
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### Connection Pooling

```javascript
// Node.js Redis connection pool
const redis = require('ioredis');
const cluster = new redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 }
]);
```

## Monitoring and Alerts

### Key Metrics

* Memory usage and fragmentation
* Commands per second
* Hit/miss ratio for cache
* Connection count
* Slow log analysis

### Redis CLI Commands

```bash
# Monitor performance
INFO memory
INFO stats
INFO clients

# Check slow queries
SLOWLOG GET 10

# Monitor commands
MONITOR

# Check key space
INFO keyspace
```

## Backup and Persistence

### RDB Snapshots

```redis
# Manual snapshot
BGSAVE

# Automatic snapshots
save 900 1      # Save if at least 1 key changed in 900 seconds
save 300 10     # Save if at least 10 keys changed in 300 seconds
save 60 10000   # Save if at least 10000 keys changed in 60 seconds
```

### AOF (Append Only File)

```redis
# Enable AOF
appendonly yes
appendfsync everysec

# AOF rewrite
BGREWRITEAOF
```

## Security Configuration

```redis
# Set password
requirepass your_strong_password

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG_abc123"

# Bind to specific interfaces
bind 127.0.0.1 10.0.0.1

# Enable TLS (production)
tls-port 6380
tls-cert-file /etc/redis/tls/redis.crt
tls-key-file /etc/redis/tls/redis.key
```
