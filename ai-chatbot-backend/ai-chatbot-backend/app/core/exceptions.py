from typing import Any, Optional

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.logging import logger


class AppException(HTTPException):
    """Base application exception matching Node.js error format."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[dict[str, Any]] = None,
    ):
        self.code = code
        self.error_message = message
        self.details = details or {}
        super().__init__(status_code=status_code, detail=message)


class BadRequestError(AppException):
    def __init__(self, message: str = "Bad request", code: str = "BAD_REQUEST", details: Optional[dict] = None):
        super().__init__(400, code, message, details)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Unauthorized", code: str = "UNAUTHORIZED", details: Optional[dict] = None):
        super().__init__(401, code, message, details)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden", code: str = "FORBIDDEN", details: Optional[dict] = None):
        super().__init__(403, code, message, details)


class NotFoundError(AppException):
    def __init__(self, message: str = "Not found", code: str = "NOT_FOUND", details: Optional[dict] = None):
        super().__init__(404, code, message, details)


class ConflictError(AppException):
    def __init__(self, message: str = "Conflict", code: str = "CONFLICT", details: Optional[dict] = None):
        super().__init__(409, code, message, details)


class RateLimitError(AppException):
    def __init__(self, message: str = "Too many requests", code: str = "RATE_LIMIT_EXCEEDED"):
        super().__init__(429, code, message)


class InternalError(AppException):
    def __init__(self, message: str = "Internal server error", code: str = "INTERNAL_ERROR"):
        super().__init__(500, code, message)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle AppException — returns Node.js-compatible error format."""
    logger.error(
        f"AppException: {exc.code} - {exc.error_message}",
        extra={"path": str(request.url), "method": request.method},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.error_message,
                "details": exc.details,
            },
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle generic HTTPException in Node.js-compatible format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_ERROR",
                "message": str(exc.detail),
                "details": {},
            },
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unhandled exceptions."""
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Internal server error",
                "details": {},
            },
        },
    )
