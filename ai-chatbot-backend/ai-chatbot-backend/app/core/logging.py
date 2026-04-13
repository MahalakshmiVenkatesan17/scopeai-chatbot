import sys
from pathlib import Path

from loguru import logger

from app.core.config import settings


def setup_logging() -> None:
    """Configure loguru for production and development environments."""
    logger.remove()

    # Detect production environment — set WARNING to stay under Railway's 500 logs/sec cap
    is_production = getattr(settings, "ENVIRONMENT", "development").lower() == "production"
    effective_level = "WARNING" if is_production else settings.LOG_LEVEL

    # ── Console sink ────────────────────────────────────────────────────────
    # NOTE: No enqueue=True here. Railway captures stdout directly — adding a
    # queue between loguru and stdout causes the async event loop to stall when
    # Railway drops messages and the queue backs up. Direct writes are safe.
    sink = sys.stdout
    if sys.platform == "win32":
        import io
        sink = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    logger.add(
        sink,
        level=effective_level,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        colorize=True,
        # No enqueue — direct stdout write avoids event-loop stalls on Railway
    )

    # ── File sinks (development only) ───────────────────────────────────────
    # Railway is ephemeral — file sinks are useless in production and their
    # enqueue=True queues are the primary cause of the 500 errors under load.
    if not is_production:
        log_file_path = Path(settings.LOG_FILE)
        try:
            log_file_path.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.warning("Could not create log directory {}: {}", log_file_path.parent, e)
            return

        try:
            logger.add(
                settings.LOG_FILE,
                level=settings.LOG_LEVEL,
                format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
                rotation=settings.LOG_MAX_SIZE,
                retention=settings.LOG_MAX_FILES,
                compression="gz",
                serialize=False,
                enqueue=True,  # Safe in dev — no Railway log cap
            )
        except Exception as e:
            logger.warning("Could not add log file sink {}: {}", settings.LOG_FILE, e)

        try:
            logger.add(
                settings.LOG_FILE.replace(".log", ".error.log"),
                level="ERROR",
                format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
                rotation=settings.LOG_MAX_SIZE,
                retention=settings.LOG_MAX_FILES,
                compression="gz",
                enqueue=True,
            )
        except Exception as e:
            logger.warning("Could not add error log file sink: {}", e)


__all__ = ["logger", "setup_logging"]