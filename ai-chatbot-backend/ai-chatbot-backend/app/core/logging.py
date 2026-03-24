import sys

from loguru import logger

from app.core.config import settings


def setup_logging() -> None:
    """Configure loguru to match Winston logging from Node.js project."""
    # Remove default handler
    logger.remove()

    # Console handler (use utf-8 wrapper on Windows to avoid cp1252 encoding errors)
    sink = sys.stdout
    if sys.platform == "win32":
        import io
        sink = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    logger.add(
        sink,
        level=settings.LOG_LEVEL,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        colorize=True,
    )

    # File handler with rotation (matches Winston file transport)
    logger.add(
        settings.LOG_FILE,
        level=settings.LOG_LEVEL,
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
        rotation=settings.LOG_MAX_SIZE,
        retention=settings.LOG_MAX_FILES,
        compression="gz",
        serialize=False,
        enqueue=True,  # Thread-safe
    )

    # Error-specific file
    logger.add(
        settings.LOG_FILE.replace(".log", ".error.log"),
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
        rotation=settings.LOG_MAX_SIZE,
        retention=settings.LOG_MAX_FILES,
        compression="gz",
        enqueue=True,
    )


# Export logger for use across the app
__all__ = ["logger", "setup_logging"]
