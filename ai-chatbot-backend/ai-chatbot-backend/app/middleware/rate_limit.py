from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

# Rate limiter using client IP — mirrors Node.js strictRateLimitMiddleware
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_MAX_REQUESTS}/15minutes"],
    storage_uri=settings.redis_connection_url if settings.REDIS_URL else "memory://",
)
