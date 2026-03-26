import json
from typing import Optional

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.logging import logger
from app.core.redis import redis_client
from app.core.security import decode_access_token
from app.models.user import User, UserSession

# Mirrors Node.js req.user shape
UserRole = str  # "super_admin" | "tenant_admin" | "support" | "customer"

# HTTPBearer scheme — adds "Authorize" button to Swagger UI
bearer_scheme = HTTPBearer(auto_error=False)

# Cache TTL for auth lookups — short enough to reflect revocations quickly
_AUTH_CACHE_TTL = 300  # 5 minutes


class CurrentUser:
    """Mirrors Node.js req.user object."""

    def __init__(self, id: int, email: str, role: str, tenant_id: Optional[int], session_id: str):
        self.id = id
        self.email = email
        self.role = role
        self.tenant_id = tenant_id
        self.session_id = session_id


async def _get_cached_auth(session_id: str) -> Optional[dict]:
    """Try to load auth result from Redis cache."""
    if not redis_client:
        return None
    try:
        raw = await redis_client.get(f"auth:session:{session_id}")
        return json.loads(raw) if raw else None
    except Exception:
        return None


async def _set_cached_auth(session_id: str, data: dict) -> None:
    """Cache auth result in Redis for _AUTH_CACHE_TTL seconds."""
    if not redis_client:
        return
    try:
        await redis_client.setex(f"auth:session:{session_id}", _AUTH_CACHE_TTL, json.dumps(data))
    except Exception:
        pass


async def invalidate_auth_cache(session_id: str) -> None:
    """Call this on logout / session revocation to clear the cache entry."""
    if not redis_client:
        return
    try:
        await redis_client.delete(f"auth:session:{session_id}")
    except Exception:
        pass


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    """Authenticate JWT token — mirrors Node.js authMiddleware.authenticate.
    Uses Redis cache to avoid 2 MySQL queries on every authenticated request.
    """
    if not credentials:
        raise UnauthorizedError(message="Access token is required", code="MISSING_TOKEN")

    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        logger.warning(f"Invalid JWT token: {token[:20]}...")
        raise UnauthorizedError(message="Invalid or expired token", code="INVALID_TOKEN")

    user_id = payload.get("userId")
    email = payload.get("email")
    role = payload.get("role")
    tenant_id = payload.get("tenantId")
    session_id = payload.get("sessionId")

    if not all([user_id, email, role, session_id]):
        raise UnauthorizedError(message="Invalid token payload", code="INVALID_TOKEN")

    # --- Redis cache hit: skip both MySQL queries ---
    cached = await _get_cached_auth(session_id)
    if cached and cached.get("user_active"):
        request.state.tenant_id = tenant_id
        request.state.user_id = user_id
        return CurrentUser(
            id=user_id,
            email=email,
            role=role,
            tenant_id=tenant_id,
            session_id=session_id,
        )

    # --- Cache miss: hit MySQL (2 queries) and populate cache ---
    # Verify session is still valid
    result = await db.execute(
        select(UserSession).where(
            UserSession.id == session_id,
            UserSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise UnauthorizedError(message="Session is no longer valid", code="INVALID_SESSION")

    # Verify user is still active
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or user.status != "active":
        raise UnauthorizedError(message="User account is not active", code="USER_INACTIVE")

    # Store in Redis so next requests skip MySQL
    await _set_cached_auth(session_id, {"user_active": True, "user_id": user_id})

    # Set state for middleware/logging
    request.state.tenant_id = tenant_id
    request.state.user_id = user_id

    return CurrentUser(
        id=user_id,
        email=email,
        role=role,
        tenant_id=tenant_id,
        session_id=session_id,
    )


async def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[CurrentUser]:
    """Optional authentication — mirrors Node.js authMiddleware.optionalAuth."""
    if not credentials:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("userId")
    if not user_id:
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or user.status != "active":
        return None

    # Set state for middleware/logging
    request.state.tenant_id = payload.get("tenantId")
    request.state.user_id = user_id

    return CurrentUser(
        id=user_id,
        email=payload.get("email", ""),
        role=payload.get("role", "customer"),
        tenant_id=payload.get("tenantId"),
        session_id=payload.get("sessionId", ""),
    )


def require_role(allowed_roles: list[str]):
    """Dependency factory — mirrors Node.js authMiddleware.requireRole."""

    async def _check_role(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            logger.warning(
                f"Insufficient permissions: user={current_user.id}, "
                f"role={current_user.role}, required={allowed_roles}"
            )
            raise ForbiddenError(message="Insufficient permissions", code="INSUFFICIENT_PERMISSIONS")
        return current_user

    return _check_role


def require_admin():
    """Mirrors Node.js authMiddleware.requireAdmin."""
    return require_role(["super_admin", "tenant_admin"])


def require_super_admin():
    """Mirrors Node.js authMiddleware.requireSuperAdmin."""
    return require_role(["super_admin"])


