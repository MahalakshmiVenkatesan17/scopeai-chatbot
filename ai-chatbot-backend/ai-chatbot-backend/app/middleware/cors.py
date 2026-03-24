"""
Dynamic CORS middleware for multi-tenant widget embeds.
- Public widget endpoints (/api/v1/public/*): allow ALL origins
- Authenticated endpoints: echo origin back (JWT guards access)
- file:// and sandboxed iframe origins ("null"): treated as wildcard on public paths
"""
 
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp
 
from app.core.logging import logger
from app.core.config import settings
 
PUBLIC_PREFIXES = (
    "/api/v1/public/",      # widget config, session init, messaging
    "/api/v1/chat/session", # session bootstrap (if not under /public/)
    "/api/v1/chat/config",  # tenant config (if not under /public/)
    "/health",
    "/api/health",
)
 
ALWAYS_ALLOW_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
ALWAYS_ALLOW_HEADERS = (
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, "
    "X-Tenant-Slug, X-Tenant-ID, X-Session-ID, X-Request-ID"
)
 
 
class DynamicCORSMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, allow_all_for_public: bool = True):
        super().__init__(app)
        self.allow_all_for_public = allow_all_for_public
        logger.info(f"DynamicCORSMiddleware loaded. Public prefixes: {PUBLIC_PREFIXES}")
 
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        path = request.url.path
        is_public = any(path.startswith(prefix) for prefix in PUBLIC_PREFIXES)
 
        # Preflight fast-path — never hits your route handlers
        if request.method == "OPTIONS":
            allowed_origin = self._resolve_origin(origin, is_public)
            return Response(status_code=204, headers=self._cors_headers(allowed_origin))
 
        response = await call_next(request)
        allowed_origin = self._resolve_origin(origin, is_public)
        for k, v in self._cors_headers(allowed_origin).items():
            response.headers[k] = v
        return response
 
    def _resolve_origin(self, origin: str, is_public: bool) -> str:
        if is_public and self.allow_all_for_public:
            # allow file:// and unknown origins
            if not origin or origin == "null":
                logger.debug(f"CORS: Public route, origin missing/null. Allowing *")
                return "*"
            logger.debug(f"CORS: Public route. Allowing {origin}")
            return origin
 
        # private endpoints
        if not origin or origin == "null":
            logger.debug(f"CORS: Private route, origin missing/null. Denying.")
            return ""
       
        # Check against allowlist from settings
        allowed_origins = settings.cors_origins_list
        if origin in allowed_origins or "*" in allowed_origins:
            logger.debug(f"CORS: Private route. Origin {origin} found in allowlist. Allowing.")
            return origin
 
        # Fallback: if it's an authenticated route but from a known dev origin, allow it
        if "localhost" in origin or "127.0.0.1" in origin:
            logger.debug(f"CORS: Private route. Origin {origin} looks like localhost. Allowing.")
            return origin
       
        logger.warning(f"CORS: Private route. Origin {origin} NOT in allowlist. But echoing anyway for flexibility.")
        return origin
 
    @staticmethod  # ✅ single decorator only
    def _cors_headers(allowed_origin: str) -> dict:
        headers = {
            "Access-Control-Allow-Methods": ALWAYS_ALLOW_METHODS,
            "Access-Control-Allow-Headers": ALWAYS_ALLOW_HEADERS,
            "Access-Control-Expose-Headers": "X-Request-ID, X-Response-Time",
            "Access-Control-Max-Age": "600",
            "Vary": "Origin",
        }
 
        if allowed_origin == "*":
            headers["Access-Control-Allow-Origin"] = "*"
 
        elif allowed_origin:
            headers["Access-Control-Allow-Origin"] = allowed_origin
            headers["Access-Control-Allow-Credentials"] = "true"
 
        return headers