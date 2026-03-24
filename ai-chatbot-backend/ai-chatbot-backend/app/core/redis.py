import json
import time
from typing import Any, Optional

import redis.asyncio as aioredis

from app.core.config import settings
from app.core.logging import logger

redis_client: Optional[aioredis.Redis] = None


async def create_redis_client() -> aioredis.Redis:
    global redis_client
    if redis_client:
        return redis_client

    redis_client = aioredis.from_url(
        settings.redis_connection_url,
        encoding="utf-8",
        decode_responses=True,
        max_connections=10,
        socket_connect_timeout=10,
        socket_timeout=5,
        retry_on_timeout=True,
    )

    try:
        await redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        redis_client = None
        raise

    return redis_client


def get_redis_client() -> aioredis.Redis:
    if not redis_client:
        raise RuntimeError("Redis client not initialized. Call create_redis_client() first.")
    return redis_client


async def close_redis_connection() -> None:
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
        logger.info("Redis connection closed")


class CacheService:
    """Cache helper matching Node.js cacheService interface."""

    @staticmethod
    async def get(key: str) -> Any:
        try:
            client = get_redis_client()
            value = await client.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Cache get error: key={key}, error={e}")
            return None

    @staticmethod
    async def set(key: str, value: Any, ttl_seconds: Optional[int] = None) -> bool:
        try:
            client = get_redis_client()
            serialized = json.dumps(value, default=str)
            if ttl_seconds:
                await client.setex(key, ttl_seconds, serialized)
            else:
                await client.set(key, serialized)
            return True
        except Exception as e:
            logger.error(f"Cache set error: key={key}, ttl={ttl_seconds}, error={e}")
            return False

    @staticmethod
    async def delete(key: str) -> bool:
        try:
            client = get_redis_client()
            result = await client.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Cache delete error: key={key}, error={e}")
            return False

    @staticmethod
    async def exists(key: str) -> bool:
        try:
            client = get_redis_client()
            result = await client.exists(key)
            return result > 0
        except Exception as e:
            logger.error(f"Cache exists error: key={key}, error={e}")
            return False

    @staticmethod
    async def expire(key: str, ttl_seconds: int) -> bool:
        try:
            client = get_redis_client()
            result = await client.expire(key, ttl_seconds)
            return bool(result)
        except Exception as e:
            logger.error(f"Cache expire error: key={key}, ttl={ttl_seconds}, error={e}")
            return False

    @staticmethod
    async def ttl(key: str) -> int:
        try:
            client = get_redis_client()
            return await client.ttl(key)
        except Exception as e:
            logger.error(f"Cache TTL error: key={key}, error={e}")
            return -1

    @staticmethod
    async def keys(pattern: str) -> list[str]:
        try:
            client = get_redis_client()
            return await client.keys(pattern)
        except Exception as e:
            logger.error(f"Cache keys error: pattern={pattern}, error={e}")
            return []

    @staticmethod
    async def flush_pattern(pattern: str) -> int:
        try:
            client = get_redis_client()
            matched_keys = await client.keys(pattern)
            if not matched_keys:
                return 0
            return await client.delete(*matched_keys)
        except Exception as e:
            logger.error(f"Cache flush pattern error: pattern={pattern}, error={e}")
            return 0

    # Session-specific methods
    @staticmethod
    async def set_session(session_id: str, session_data: Any, ttl_seconds: int = 86400) -> bool:
        return await CacheService.set(f"session:{session_id}", session_data, ttl_seconds)

    @staticmethod
    async def get_session(session_id: str) -> Any:
        return await CacheService.get(f"session:{session_id}")

    @staticmethod
    async def delete_session(session_id: str) -> bool:
        return await CacheService.delete(f"session:{session_id}")

    # Rate limiting
    @staticmethod
    async def increment_rate_limit(
        key: str, window_seconds: int, max_requests: int
    ) -> dict:
        try:
            client = get_redis_client()
            now = int(time.time() * 1000)
            window_key = f"rate_limit:{key}:{now // (window_seconds * 1000)}"

            pipe = client.pipeline()
            pipe.incr(window_key)
            pipe.expire(window_key, window_seconds)
            results = await pipe.execute()

            count = results[0]
            reset_time = ((now // (window_seconds * 1000)) + 1) * window_seconds * 1000

            return {
                "count": count,
                "is_allowed": count <= max_requests,
                "reset_time": reset_time,
            }
        except Exception as e:
            logger.error(f"Rate limit error: key={key}, error={e}")
            return {"count": 0, "is_allowed": True, "reset_time": int(time.time() * 1000)}


cache_service = CacheService()


async def check_redis_health() -> dict:
    start_time = time.time()
    try:
        client = get_redis_client()
        await client.ping()
        response_time = int((time.time() - start_time) * 1000)

        info = await client.info("memory")
        return {
            "status": "healthy",
            "details": {
                "connected": True,
                "responseTime": response_time,
                "memory": {
                    "used": info.get("used_memory_human", "unknown"),
                    "peak": info.get("used_memory_peak_human", "unknown"),
                },
            },
        }
    except Exception:
        response_time = int((time.time() - start_time) * 1000)
        return {
            "status": "unhealthy",
            "details": {
                "connected": False,
                "responseTime": response_time,
            },
        }
