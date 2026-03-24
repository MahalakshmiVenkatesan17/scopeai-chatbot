from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class TenantContextMiddleware(BaseHTTPMiddleware):
    """Extracts tenant context from request — mirrors Node.js tenantContextMiddleware."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Tenant context is primarily derived from JWT payload (handled in dependencies)
        # This middleware sets up the state for use in request processing
        request.state.tenant_id = None
        request.state.tenant_slug = None

        # Check for tenant header (for API key auth or public endpoints)
        tenant_header = request.headers.get("X-Tenant-ID")
        if tenant_header:
            try:
                request.state.tenant_id = int(tenant_header)
            except ValueError:
                pass

        tenant_slug_header = request.headers.get("X-Tenant-Slug")
        if tenant_slug_header:
            request.state.tenant_slug = tenant_slug_header

        response = await call_next(request)
        return response
