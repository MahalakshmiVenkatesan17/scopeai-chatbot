from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    tenant_id: Mapped[int] = mapped_column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    session_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    context_documents: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    session_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("active", "ended", "archived", name="session_status"), default="active"
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_activity: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tenant = relationship("Tenant", back_populates="chat_sessions")
    user = relationship("User")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_session_tenant", "tenant_id"),
        Index("idx_session_user", "user_id"),
        Index("idx_session_status", "status"),
        Index("idx_session_activity", "last_activity"),
        Index("idx_chat_sessions_tenant_activity", "tenant_id", "last_activity"),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False
    )
    tenant_id: Mapped[int] = mapped_column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    message_type: Mapped[str] = mapped_column(
        Enum("user", "assistant", "system", name="message_type"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    token_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    context_chunks: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    processing_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cost_estimate: Mapped[Decimal | None] = mapped_column(Numeric(10, 6), nullable=True)
    feedback_rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    feedback_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    message_metadata: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)
    # Voice message fields
    audio_file_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_voice_message: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="messages")

    __table_args__ = (
        Index("idx_message_session", "session_id"),
        Index("idx_message_tenant", "tenant_id"),
        Index("idx_message_type", "message_type"),
        Index("idx_message_created", "created_at"),
        Index("idx_chat_messages_session_created", "session_id", "created_at"),
    )
