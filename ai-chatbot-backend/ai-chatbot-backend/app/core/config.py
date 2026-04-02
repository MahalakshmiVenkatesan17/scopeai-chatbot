import os
from pathlib import Path
from typing import Optional, cast
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server
    APP_ENV: str = Field(default="development")
    APP_PORT: int = Field(default=8000)
    API_VERSION: str = Field(default="v1")
    DEBUG: bool = Field(default=False)

    # Database (MySQL)
    DATABASE_URL: Optional[str] = Field(default=None)
    DB_HOST: str = Field(default="localhost")
    DB_PORT: int = Field(default=3306)
    DB_USER: str = Field(default="root")
    DB_PASSWORD: str = Field(default="")
    DB_NAME: str = Field(default="ai_chatbot_saas")
    DB_POOL_SIZE: int = Field(default=20)
    DB_POOL_TIMEOUT: int = Field(default=60)

    # Redis
    REDIS_URL: Optional[str] = Field(default=None)
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)
    REDIS_PASSWORD: Optional[str] = Field(default=None)
    REDIS_DB: int = Field(default=0)

    # JWT
    JWT_SECRET: str = Field(min_length=32)
    JWT_REFRESH_SECRET: str = Field(min_length=32)
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15)
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # OpenAI
    DEFAULT_OPENAI_API_KEY: str = Field(min_length=1)
    OPENAI_MODEL: str = Field(default="gpt-4")
    OPENAI_EMBEDDING_MODEL: str = Field(default="text-embedding-3-small")
    OPENAI_MAX_TOKENS: int = Field(default=4000)
    OPENAI_TEMPERATURE: float = Field(default=0.7)

    # Weaviate
    WEAVIATE_URL: str = Field(default="http://localhost:8080")
    WEAVIATE_API_KEY: Optional[str] = Field(default=None)
    # Optional gRPC overrides for cloud/Railway where gRPC is on a separate
    # host/port or not exposed at all. Leave unset to use the HTTP host.
    WEAVIATE_GRPC_HOST: Optional[str] = Field(default=None)
    WEAVIATE_GRPC_PORT: Optional[int] = Field(default=None)

    # LangSmith
    LANGCHAIN_TRACING_V2: bool = Field(default=False)
    LANGCHAIN_API_KEY: Optional[str] = Field(default=None)
    LANGCHAIN_PROJECT: str = Field(default="ai-chatbot-backend")
    LANGCHAIN_ENDPOINT: str = Field(default="https://api.smith.langchain.com")

    # File Storage
    UPLOAD_DIR: str = Field(default=os.getenv("RAILWAY_VOLUME_MOUNT_PATH", "./uploads"))
    TEMP_DIR: str = Field(default="./temp")
    MAX_FILE_SIZE: int = Field(default=10485760)  # 10MB
    ALLOWED_FILE_TYPES: str = Field(default=".pdf,.txt,.docx")

    # Email
    EMAIL_SERVICE_PROVIDER: str = Field(default="sendgrid")
    EMAIL_API_KEY: Optional[str] = Field(default=None)
    EMAIL_FROM: Optional[str] = Field(default=None)
    EMAIL_FROM_NAME: str = Field(default="AI Chatbot Platform")

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = Field(default=None)
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(default=None)
    STRIPE_SUCCESS_URL: Optional[str] = Field(default=None)
    STRIPE_CANCEL_URL: Optional[str] = Field(default=None)

    # Razorpay
    RAZORPAY_KEY_ID: Optional[str] = Field(default=None)
    RAZORPAY_KEY_SECRET: Optional[str] = Field(default=None)

    # Security
    CORS_ORIGINS: str = Field(default="http://localhost:3000,http://localhost:8000")
    BCRYPT_ROUNDS: int = Field(default=12)
    RATE_LIMIT_WINDOW_MS: int = Field(default=900000)  # 15 minutes
    RATE_LIMIT_MAX_REQUESTS: int = Field(default=100)
    SESSION_SECRET: Optional[str] = Field(default=None)

    # Logging
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FILE: str = Field(default="./logs/app.log")
    LOG_MAX_SIZE: str = Field(default="10 MB")
    LOG_MAX_FILES: int = Field(default=5)

    # Monitoring
    HEALTH_CHECK_INTERVAL: int = Field(default=30000)
    METRICS_ENABLED: bool = Field(default=False)

    # Encryption
    ENCRYPTION_KEY: Optional[str] = Field(default=None)

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def is_test(self) -> bool:
        return self.APP_ENV == "test"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def allowed_file_types_list(self) -> list[str]:
        return [ft.strip() for ft in self.ALLOWED_FILE_TYPES.split(",")]

    @property
    def upload_dir_path(self) -> Path:
        """Returns the absolute path to the upload directory helper."""
        return Path(self.UPLOAD_DIR).absolute()

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            # We cast to str because self.DATABASE_URL is Optional[str] but we know it's not None here
            return cast(str, self.DATABASE_URL)
        password = quote_plus(self.DB_PASSWORD)
        return (
            f"mysql+aiomysql://{self.DB_USER}:{password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    @property
    def sync_database_url(self) -> str:
        """Sync URL for Alembic migrations."""
        password = quote_plus(self.DB_PASSWORD).replace("%", "%%")
        return (
            f"mysql+pymysql://{self.DB_USER}:{password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    @property
    def redis_connection_url(self) -> str:
        if self.REDIS_URL:
            # We cast to str because self.REDIS_URL is Optional[str] but we know it's not None here
            return cast(str, self.REDIS_URL)
        password_part = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{password_part}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


settings = Settings()
