from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, Field


class SubscriptionPlanResponse(BaseModel):
    id: int
    plan_name: str = Field(alias="planName")
    description: Optional[str] = None
    price: Decimal
    billing_cycle: str = Field(alias="billingCycle")
    concurrent_users: Optional[int] = Field(default=None, alias="concurrentUsers")
    document_collections_limit: Optional[int] = Field(default=None, alias="documentCollectionsLimit")
    max_file_upload_mb: Optional[int] = Field(default=None, alias="maxFileUploadMb")
    storage_limit_gb: Optional[int] = Field(default=None, alias="storageLimitGb")
    card_color: str = Field(alias="cardColor")
    icon_color: str = Field(alias="iconColor")
    icon_bg_color: str = Field(alias="iconBgColor")
    has_advanced_analytics: bool = Field(alias="hasAdvancedAnalytics")
    has_priority_support: bool = Field(alias="hasPrioritySupport")
    has_chat_interface: bool = Field(alias="hasChatInterface")
    has_semantic_search: bool = Field(alias="hasSemanticSearch")
    has_custom_integrations: bool = Field(alias="hasCustomIntegrations")
    has_unlimited_storage: bool = Field(alias="hasUnlimitedStorage")
    has_unlimited_uploads: bool = Field(alias="hasUnlimitedUploads")
    has_community_support: bool = Field(alias="hasCommunitySupport")
    has_dedicated_support: bool = Field(alias="hasDedicatedSupport")
    is_active: bool = Field(alias="isActive")
    features: Optional[dict[str, Any]] = None
    document_collections: Optional[int] = Field(default=None, alias="documentCollections")
    razorpay_plan_id: str = Field(alias="razorpayPlanId")
    stripe_plan_id: Optional[str] = Field(default=None, alias="stripePlanId")
    stripe_price_id: str = Field(alias="stripePriceId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class SubscriptionResponse(BaseModel):
    id: int
    tenant_id: int = Field(alias="tenantId")
    plan_name: str = Field(alias="planName")
    plan_id: str = Field(alias="planId")
    subscription_status: str = Field(alias="subscriptionStatus")
    billing_cycle: str = Field(alias="billingCycle")
    amount: Decimal
    currency: str
    payment_type: Optional[str] = Field(default=None, alias="paymentType")
    subscription_id: Optional[str] = Field(default=None, alias="subscriptionId")
    current_period_start: Optional[datetime] = Field(default=None, alias="currentPeriodStart")
    current_period_end: Optional[datetime] = Field(default=None, alias="currentPeriodEnd")
    cancelled_at: Optional[datetime] = Field(default=None, alias="cancelledAt")
    payment_id: Optional[str] = Field(default=None, alias="paymentId")
    invoice_data: Optional[dict[str, Any]] = Field(default=None, alias="invoiceData")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class RazorpaySubscriptionResponse(BaseModel):
    """Razorpay API subscription response format"""
    id: str
    entity: str = "subscription"
    plan_id: str = Field(alias="planId")
    customer_email: Optional[str] = Field(default=None, alias="customerEmail")
    status: str
    current_start: Optional[datetime] = Field(default=None, alias="currentStart")
    current_end: Optional[datetime] = Field(default=None, alias="currentEnd")
    ended_at: Optional[datetime] = Field(default=None, alias="endedAt")
    quantity: int = 1
    notes: dict[str, Any] = {}
    charge_at: Optional[int] = Field(default=None, alias="chargeAt")
    start_at: Optional[int] = Field(default=None, alias="startAt")
    end_at: Optional[int] = Field(default=None, alias="endAt")
    auth_attempts: int = 0
    total_count: int = Field(alias="totalCount")
    paid_count: int = 0
    customer_notify: bool = True
    created_at: int = Field(alias="createdAt")
    expire_by: Optional[int] = Field(default=None, alias="expireBy")
    short_url: str = Field(alias="shortUrl")
    has_scheduled_changes: bool = False
    change_scheduled_at: Optional[int] = Field(default=None, alias="changeScheduledAt")
    source: str = "api"
    remaining_count: int = Field(alias="remainingCount")

    model_config = {"populate_by_name": True, "by_alias": True}


class CreateSubscriptionRequest(BaseModel):
    plan_id: str = Field(alias="planId")
    plan_name: str = Field(alias="planName")
    billing_cycle: str = Field(default="monthly", alias="billingCycle")
    amount: Decimal
    currency: str = "INR"
    payment_type: str = "razorpay"
    customer_name: Optional[str] = Field(default=None, alias="customerName")
    customer_email: Optional[str] = Field(default=None, alias="customerEmail")
    notes: Optional[dict[str, Any]] = None

    model_config = {"populate_by_name": True}


class InvoiceResponse(BaseModel):
    id: int
    tenant_id: int = Field(alias="tenantId")
    subscription_id: Optional[int] = Field(default=None, alias="subscriptionId")
    invoice_number: str = Field(alias="invoiceNumber")
    status: str
    amount_due: Decimal = Field(alias="amountDue")
    amount_paid: Decimal = Field(alias="amountPaid")
    currency: str
    due_date: Optional[date] = Field(default=None, alias="dueDate")
    paid_at: Optional[datetime] = Field(default=None, alias="paidAt")
    created_at: datetime = Field(alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class PlanResponse(BaseModel):
    id: Optional[int] = None
    name: str
    slug: str
    description: Optional[str] = None
    price_monthly: Decimal = Field(alias="priceMonthly")
    price_yearly: Decimal = Field(alias="priceYearly")
    features: Optional[dict[str, Any]] = None
    max_users: int = Field(alias="maxUsers")
    max_chat_sessions: int = Field(alias="maxChatSessions")
    max_storage_mb: int = Field(alias="maxStorageMb")
    is_active: bool = Field(default=True, alias="isActive")

    model_config = {"populate_by_name": True, "by_alias": True}


class CreatePlanRequest(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price_monthly: Decimal = Field(alias="priceMonthly")
    price_yearly: Decimal = Field(alias="priceYearly")
    features: Optional[dict[str, Any]] = None
    max_users: int = Field(alias="maxUsers")
    max_chat_sessions: int = Field(alias="maxChatSessions")
    max_storage_mb: int = Field(alias="maxStorageMb")

    model_config = {"populate_by_name": True}


class OrderCreateRequest(BaseModel):
    plan_id: str = Field(alias="planId")
    billing_cycle: str = Field(default="monthly", alias="billingCycle")
    amount: Decimal
    currency: str = "INR"

    model_config = {"populate_by_name": True}


class OrderResponse(BaseModel):
    id: str
    amount: int
    currency: str
    status: str
    receipt: Optional[str] = None
    created_at: Optional[datetime] = Field(default=None, alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str = Field(alias="razorpayOrderId")
    razorpay_payment_id: str = Field(alias="razorpayPaymentId")
    razorpay_signature: str = Field(alias="razorpaySignature")

    model_config = {"populate_by_name": True}


class CapturePaymentRequest(BaseModel):
    amount: int
    currency: str = "INR"


class StripeCheckoutRequest(BaseModel):
    plan_id: str = Field(alias="planId")
    billing_cycle: str = Field(default="monthly", alias="billingCycle")
    success_url: Optional[str] = Field(default=None, alias="successUrl")
    cancel_url: Optional[str] = Field(default=None, alias="cancelUrl")

    model_config = {"populate_by_name": True}


class StripeVerifyPaymentRequest(BaseModel):
    session_id: str = Field(alias="sessionId")

    model_config = {"populate_by_name": True}


class PaymentFilterParams(BaseModel):
    status: Optional[str] = None
    start_date: Optional[date] = Field(default=None, alias="startDate")
    end_date: Optional[date] = Field(default=None, alias="endDate")

    model_config = {"populate_by_name": True}
