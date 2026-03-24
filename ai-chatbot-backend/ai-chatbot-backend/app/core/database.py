import time
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import logger


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    settings.database_url,
    pool_size=min(settings.DB_POOL_SIZE, 5),
    max_overflow=5,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=1800,
    pool_pre_ping=True,
    echo=False,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_database() -> None:
    """Test database connectivity on startup."""
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise


async def close_database() -> None:
    await engine.dispose()
    logger.info("Database pool closed")


async def check_database_health() -> dict:
    start_time = time.time()
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        response_time = int((time.time() - start_time) * 1000)
        pool_status = engine.pool.status()
        return {
            "status": "healthy",
            "details": {
                "connected": True,
                "pool": {
                    "size": engine.pool.size(),
                    "checkedin": engine.pool.checkedin(),
                    "checkedout": engine.pool.checkedout(),
                    "overflow": engine.pool.overflow(),
                },
                "responseTime": response_time,
                "poolStatus": pool_status,
            },
        }
    except Exception as e:
        response_time = int((time.time() - start_time) * 1000)
        return {
            "status": "unhealthy",
            "details": {
                "connected": False,
                "pool": {
                    "size": 0,
                    "checkedin": 0,
                    "checkedout": 0,
                    "overflow": 0,
                },
                "responseTime": response_time,
                "error": str(e),
            },
        }
