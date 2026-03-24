from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plan_name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    billing_cycle: Mapped[str] = mapped_column(
        Enum("monthly", "yearly", name="billing_cycle"), default="monthly"
    )
    concurrent_users: Mapped[int | None] = mapped_column(Integer, nullable=True)
    document_collections_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_file_upload_mb: Mapped[int | None] = mapped_column(Integer, nullable=True)
    storage_limit_gb: Mapped[int | None] = mapped_column(Integer, nullable=True)
    card_color: Mapped[str] = mapped_column(String(20), default="#FFFFFF")
    icon_color: Mapped[str] = mapped_column(String(20), default="#000000")
    icon_bg_color: Mapped[str] = mapped_column(String(20), default="#F0F0F0")
    has_advanced_analytics: Mapped[bool] = mapped_column(default=False)
    has_priority_support: Mapped[bool] = mapped_column(default=False)
    has_chat_interface: Mapped[bool] = mapped_column(default=True)
    has_semantic_search: Mapped[bool] = mapped_column(default=False)
    has_custom_integrations: Mapped[bool] = mapped_column(default=False)
    has_unlimited_storage: Mapped[bool] = mapped_column(default=False)
    has_unlimited_uploads: Mapped[bool] = mapped_column(default=False)
    has_community_support: Mapped[bool] = mapped_column(default=False)
    has_dedicated_support: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    document_collections: Mapped[int | None] = mapped_column(Integer, nullable=True)
    razorpay_plan_id: Mapped[str] = mapped_column(String(255), nullable=False)
    stripe_plan_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_price_id: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("idx_subscription_plan_name", "plan_name"),
        Index("idx_subscription_plan_active", "is_active"),
    )


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(100), nullable=False)
    plan_id: Mapped[str] = mapped_column(String(255), nullable=False)
    subscription_status: Mapped[str] = mapped_column(
        Enum("active", "cancelled", "expired", "past_due", name="subscription_status"),
        default="active",
    )
    billing_cycle: Mapped[str] = mapped_column(
        Enum("monthly", "yearly", name="billing_cycle"), default="monthly"
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    payment_type: Mapped[str | None] = mapped_column(
        Enum("razorpay", "stripe", name="payment_type"), nullable=True
    )
    subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    current_period_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    invoice_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription")

    __table_args__ = (
        Index("idx_subscription_tenant", "tenant_id"),
        Index("idx_subscription_status", "subscription_status"),
        Index("idx_subscription_stripe", "subscription_id"),
    )


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    subscription_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True
    )
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("draft", "sent", "paid", "overdue", "cancelled", name="invoice_status"),
        default="draft",
    )
    amount_due: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    stripe_invoice_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    subscription = relationship("Subscription", back_populates="invoices")

    __table_args__ = (
        Index("idx_invoice_tenant", "tenant_id"),
        Index("idx_invoice_status", "status"),
        Index("idx_invoice_number", "invoice_number"),
    )
