"""
AI Chatbot SaaS Backend — FastAPI + Uvicorn + LangGraph + OpenAI + Weaviate + MySQL
Mirrors Node.js Express server at ai-chatbot-backend-node/src/server.ts
"""

import time
from contextlib import asynccontextmanager

import socketio
from fastapi import FastAPI, HTTPException, Request
# from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import check_database_health, close_database, init_database
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
)
from app.core.logging import logger, setup_logging
from app.core.redis import (
    check_redis_health,
    close_redis_connection,
    create_redis_client,
)
from app.middleware.rate_limit import limiter
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.tenant_context import TenantContextMiddleware
from app.websocket.manager import sio

from app.middleware.cors import DynamicCORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown — mirrors Node.js server.ts startup sequence."""
    # Limit the default thread pool to prevent thread explosion from
    # asyncio.to_thread() calls (Weaviate sync client, PDF extraction, etc.)
    import asyncio
    import concurrent.futures

    loop = asyncio.get_running_loop()
    loop.set_default_executor(concurrent.futures.ThreadPoolExecutor(max_workers=4))

    # Startup
    setup_logging()
    logger.info("Starting AI Chatbot Backend (Python/FastAPI)...")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Port: {settings.APP_PORT}")

    # Initialize database
    try:
        await init_database()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Database connection failed (non-fatal at startup): {e}")
        logger.warning("Server will start but database operations will fail until MySQL is available")

    # Initialize Redis
    try:
        await create_redis_client()
        logger.info("Redis initialized")
    except Exception as e:
        logger.warning(f"Redis not available (non-fatal): {e}")

    # Initialize Weaviate schema
    try:
        from app.services.weaviate_service import WeaviateService

        weaviate_svc = WeaviateService.get_instance()
        weaviate_svc.initialize_schema()
        logger.info("Weaviate schema initialized")
    except Exception as e:
        logger.warning(f"Weaviate not available (non-fatal): {e}")

    # Initialize LangSmith tracing (auto-enabled via env vars)
    if settings.LANGCHAIN_TRACING_V2 and settings.LANGCHAIN_API_KEY:
        import os

        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
        os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT
        os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGCHAIN_ENDPOINT
        logger.info(f"LangSmith tracing enabled (project: {settings.LANGCHAIN_PROJECT})")

    logger.info("All services initialized successfully")
    logger.info(f"API docs available at http://localhost:{settings.APP_PORT}/docs")

    yield

    # Shutdown
    logger.info("Shutting down...")
    try:
        from app.services.weaviate_service import WeaviateService

        WeaviateService.get_instance().close()
    except Exception:
        pass
    await close_database()
    await close_redis_connection()
    logger.info("Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="AI Chatbot SaaS Backend",
    description="Multi-tenant AI Chatbot with RAG — FastAPI + LangGraph + OpenAI + Weaviate",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# -- Exception handlers (matching Node.js error format) --
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# -- Rate limiter --
app.state.limiter = limiter

# -- Middleware stack (order matters — mirrors Node.js middleware/index.ts) --
# 1. Request ID
app.add_middleware(RequestIDMiddleware)

# 2. Request Logging
app.add_middleware(RequestLoggingMiddleware)

# 3. CORS (mirrors Node.js corsMiddleware)
app.add_middleware(
    DynamicCORSMiddleware,

)

# 4. Tenant Context
app.add_middleware(TenantContextMiddleware)


# -- Health check routes (mirrors Node.js /health, /api/health, /api/health/detailed) --
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "timestamp": time.time()}


@app.get("/api/health", tags=["Health"])
async def api_health():
    return {"status": "ok", "service": "ai-chatbot-backend", "timestamp": time.time()}


@app.get("/api/health/detailed", tags=["Health"])
async def detailed_health():
    db_health = await check_database_health()
    redis_health = await check_redis_health()

    # Weaviate health
    try:
        from app.services.weaviate_service import WeaviateService

        weaviate_health = WeaviateService.get_instance().health_check()
    except Exception:
        weaviate_health = {"status": "unhealthy", "details": {"connected": False}}

    overall = "healthy"
    if db_health["status"] == "unhealthy" or redis_health["status"] == "unhealthy":
        overall = "unhealthy"
    elif db_health["status"] == "degraded" or redis_health["status"] == "degraded":
        overall = "degraded"

    return {
        "status": overall,
        "services": {
            "database": db_health,
            "redis": redis_health,
            "weaviate": weaviate_health,
        },
        "timestamp": time.time(),
    }


# -- Mount API routes --
app.include_router(api_router)

# -- Mount Socket.IO (ASGI) --
socket_app = socketio.ASGIApp(sio, app)


def create_app():
    """Factory function for external use (e.g., Gunicorn/Uvicorn)."""
    return socket_app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:socket_app",
        host="0.0.0.0",
        port=settings.APP_PORT,
        reload=settings.is_development,
        log_level=settings.LOG_LEVEL.lower(),
    )
