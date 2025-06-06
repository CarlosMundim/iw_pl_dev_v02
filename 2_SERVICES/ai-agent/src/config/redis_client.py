"""
Redis client configuration and connection management
"""

import json
import pickle
from typing import Any, Optional, Union
import redis.asyncio as redis

from src.config.settings import get_settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)
settings = get_settings()

# Global Redis client
redis_client: Optional[redis.Redis] = None


async def init_redis() -> None:
    """Initialize Redis connection"""
    global redis_client
    
    try:
        # Parse Redis URL
        redis_url = settings.redis_url
        if settings.redis_password:
            # Add password to URL if provided
            if "://" in redis_url:
                protocol, rest = redis_url.split("://", 1)
                if "@" not in rest:
                    redis_url = f"{protocol}://:{settings.redis_password}@{rest}"
        
        # Create Redis client
        redis_client = redis.from_url(
            redis_url,
            db=settings.redis_db,
            decode_responses=False,  # We'll handle encoding ourselves
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30
        )
        
        # Test connection
        await redis_client.ping()
        logger.info("Redis connection initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize Redis: {e}")
        raise


async def close_redis() -> None:
    """Close Redis connection"""
    global redis_client
    
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")


async def check_redis_health() -> dict:
    """Check Redis health"""
    try:
        if not redis_client:
            return {"status": "not_initialized"}
        
        # Test ping
        ping_result = await redis_client.ping()
        if ping_result:
            # Get Redis info
            info = await redis_client.info()
            return {
                "status": "healthy",
                "connected_clients": info.get("connected_clients", 0),
                "used_memory": info.get("used_memory_human", "unknown"),
                "version": info.get("redis_version", "unknown")
            }
        else:
            return {"status": "unhealthy", "reason": "Ping failed"}
            
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}


class RedisManager:
    """Redis operations manager with caching utilities"""
    
    def __init__(self):
        self.client = redis_client
        self.default_ttl = settings.cache_ttl
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get value from Redis with automatic deserialization"""
        try:
            if not self.client:
                return default
            
            value = await self.client.get(key)
            if value is None:
                return default
            
            # Try JSON first, then pickle for complex objects
            try:
                return json.loads(value.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                try:
                    return pickle.loads(value)
                except pickle.PickleError:
                    return value.decode('utf-8') if isinstance(value, bytes) else value
                    
        except Exception as e:
            logger.error(f"Redis get error for key {key}: {e}")
            return default
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in Redis with automatic serialization"""
        try:
            if not self.client:
                return False
            
            # Serialize value
            if isinstance(value, (dict, list, tuple)):
                try:
                    serialized_value = json.dumps(value)
                except (TypeError, ValueError):
                    serialized_value = pickle.dumps(value)
            elif isinstance(value, str):
                serialized_value = value
            else:
                serialized_value = pickle.dumps(value)
            
            # Set with TTL
            if ttl is None:
                ttl = self.default_ttl
            
            await self.client.set(key, serialized_value, ex=ttl)
            return True
            
        except Exception as e:
            logger.error(f"Redis set error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from Redis"""
        try:
            if not self.client:
                return False
            
            deleted = await self.client.delete(key)
            return deleted > 0
            
        except Exception as e:
            logger.error(f"Redis delete error for key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis"""
        try:
            if not self.client:
                return False
            
            return await self.client.exists(key) > 0
            
        except Exception as e:
            logger.error(f"Redis exists error for key {key}: {e}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for existing key"""
        try:
            if not self.client:
                return False
            
            return await self.client.expire(key, ttl)
            
        except Exception as e:
            logger.error(f"Redis expire error for key {key}: {e}")
            return False
    
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment numeric value"""
        try:
            if not self.client:
                return None
            
            return await self.client.incrby(key, amount)
            
        except Exception as e:
            logger.error(f"Redis increment error for key {key}: {e}")
            return None
    
    async def get_or_set(self, key: str, fetch_func, ttl: Optional[int] = None) -> Any:
        """Get value from cache or fetch and cache it"""
        try:
            # Try to get from cache
            cached_value = await self.get(key)
            if cached_value is not None:
                return cached_value
            
            # Fetch new value
            if callable(fetch_func):
                if asyncio.iscoroutinefunction(fetch_func):
                    new_value = await fetch_func()
                else:
                    new_value = fetch_func()
            else:
                new_value = fetch_func
            
            # Cache the new value
            if new_value is not None:
                await self.set(key, new_value, ttl)
            
            return new_value
            
        except Exception as e:
            logger.error(f"Redis get_or_set error for key {key}: {e}")
            # If caching fails, try to return the fetched value
            try:
                if callable(fetch_func):
                    if asyncio.iscoroutinefunction(fetch_func):
                        return await fetch_func()
                    else:
                        return fetch_func()
                else:
                    return fetch_func
            except Exception as fetch_error:
                logger.error(f"Fetch function also failed: {fetch_error}")
                return None
    
    # Embedding-specific methods
    async def cache_embedding(self, text: str, embedding: list, model: str = "default") -> bool:
        """Cache text embedding"""
        key = f"embedding:{model}:{hash(text)}"
        return await self.set(key, embedding, ttl=settings.embedding_cache_ttl)
    
    async def get_cached_embedding(self, text: str, model: str = "default") -> Optional[list]:
        """Get cached embedding"""
        key = f"embedding:{model}:{hash(text)}"
        return await self.get(key)
    
    # Matching-specific methods
    async def cache_match_result(self, job_id: str, talent_id: str, result: dict) -> bool:
        """Cache matching result"""
        key = f"match:{job_id}:{talent_id}"
        return await self.set(key, result, ttl=3600)  # Cache for 1 hour
    
    async def get_cached_match(self, job_id: str, talent_id: str) -> Optional[dict]:
        """Get cached matching result"""
        key = f"match:{job_id}:{talent_id}"
        return await self.get(key)
    
    # Rate limiting methods
    async def check_rate_limit(self, identifier: str, limit: int, window: int) -> tuple[bool, int]:
        """Check rate limit for identifier"""
        try:
            key = f"rate_limit:{identifier}"
            current = await self.client.get(key)
            
            if current is None:
                # First request
                await self.client.set(key, 1, ex=window)
                return True, limit - 1
            
            current_count = int(current)
            if current_count >= limit:
                return False, 0
            
            # Increment counter
            await self.client.incr(key)
            return True, limit - current_count - 1
            
        except Exception as e:
            logger.error(f"Rate limit check error: {e}")
            return True, limit  # Allow request if rate limiting fails


# Import asyncio here to avoid circular imports
import asyncio