import asyncio
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import logger
from app.core.database import async_session_factory
from app.models.analytics import ApiUsageLog


async def _save_api_usage_log(
    tenant_id: int,
    user_id,
    endpoint: str,
    method: str,
    status_code: int,
    response_time_ms: int,
    ip_address: str,
    user_agent: str | None,
) -> None:
    """Write API usage log in the background — does NOT block the HTTP response."""
    try:
        async with async_session_factory() as db:
            log_entry = ApiUsageLog(
                tenant_id=tenant_id,
                user_id=user_id,
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                response_time_ms=response_time_ms,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            db.add(log_entry)
            await db.commit()
    except Exception as e:
        logger.error(f"Failed to log API usage: {e}")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs request/response with timing — mirrors Node.js requestLoggingMiddleware."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()
        request_id = getattr(request.state, "request_id", "unknown")

        # Log incoming request
        logger.info(
            f"--> {request.method} {request.url.path}",
            request_id=request_id,
            method=request.method,
            path=str(request.url.path),
            query=str(request.query_params),
            ip=request.client.host if request.client else "unknown",
        )

        response = await call_next(request)

        # Log response
        duration_ms = int((time.time() - start_time) * 1000)
        log_func = logger.info if response.status_code < 400 else logger.warning
        if response.status_code >= 500:
            log_func = logger.error

        log_func(
            f"<-- {request.method} {request.url.path} {response.status_code} {duration_ms}ms",
            request_id=request_id,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )

        # Fire-and-forget DB write — response is sent immediately, logging happens in background
        if "/api/" in request.url.path:
            tenant_id = getattr(request.state, "tenant_id", None)
            if not tenant_id:
                tenant_header = request.headers.get("X-Tenant-ID")
                if tenant_header:
                    try:
                        tenant_id = int(tenant_header)
                    except (ValueError, TypeError):
                        tenant_id = None

            if tenant_id:
                asyncio.create_task(
                    _save_api_usage_log(
                        tenant_id=tenant_id,
                        user_id=getattr(request.state, "user_id", None),
                        endpoint=str(request.url.path),
                        method=request.method,
                        status_code=response.status_code,
                        response_time_ms=duration_ms,
                        ip_address=request.client.host if request.client else "unknown",
                        user_agent=request.headers.get("User-Agent"),
                    )
                )

        # Add timing header
        response.headers["X-Response-Time"] = f"{duration_ms}ms"
        return response
