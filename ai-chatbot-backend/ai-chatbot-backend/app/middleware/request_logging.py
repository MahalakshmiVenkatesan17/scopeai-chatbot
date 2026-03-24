import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import logger
from app.core.database import async_session_factory
from app.models.analytics import ApiUsageLog


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

        # Save to database (api_usage_logs)
        if "/api/" in request.url.path:
            try:
                tenant_id = getattr(request.state, "tenant_id", None)
                if not tenant_id:
                    # Fallback to header if state not set (though dependencies.py should handle it)
                    tenant_header = request.headers.get("X-Tenant-ID")
                    if tenant_header:
                        try:
                            tenant_id = int(tenant_header)
                        except (ValueError, TypeError):
                            tenant_id = None

                if tenant_id:
                    async with async_session_factory() as db:
                        log_entry = ApiUsageLog(
                            tenant_id=tenant_id,
                            user_id=getattr(request.state, "user_id", None),
                            endpoint=str(request.url.path),
                            method=request.method,
                            status_code=response.status_code,
                            response_time_ms=duration_ms,
                            ip_address=request.client.host if request.client else "unknown",
                            user_agent=request.headers.get("User-Agent"),
                        )
                        db.add(log_entry)
                        await db.commit()
            except Exception as e:
                logger.error(f"Failed to log API usage: {e}")

        # Add timing header
        response.headers["X-Response-Time"] = f"{duration_ms}ms"
        return response
