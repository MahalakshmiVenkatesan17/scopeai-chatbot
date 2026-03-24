from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class TenantResponse(BaseModel):
    id: int
    name: str
    slug: str
    domain: Optional[str] = None
    logo_url: Optional[str] = Field(default=None, alias="logoUrl")
    primary_color: str = Field(alias="primaryColor")
    secondary_color: str = Field(alias="secondaryColor")
    status: str
    subscription_plan: str = Field(alias="subscriptionPlan")
    max_users: int = Field(alias="maxUsers")
    max_chat_sessions: int = Field(alias="maxChatSessions")
    max_storage_mb: int = Field(alias="maxStorageMb")
    billing_email: Optional[str] = Field(default=None, alias="billingEmail")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class TenantUpdateRequest(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    logo_url: Optional[str] = Field(default=None, alias="logoUrl")
    primary_color: Optional[str] = Field(default=None, alias="primaryColor")
    secondary_color: Optional[str] = Field(default=None, alias="secondaryColor")
    billing_email: Optional[str] = Field(default=None, alias="billingEmail")
    custom_css: Optional[str] = Field(default=None, alias="customCss")

    model_config = {"populate_by_name": True}


class TenantSettingsResponse(BaseModel):
    settings: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True, "by_alias": True}


class TenantSettingsUpdateRequest(BaseModel):
    settings: dict[str, Any]


class SubscriptionUpdateRequest(BaseModel):
    plan_name: Optional[str] = Field(default=None, alias="planName")
    billing_cycle: Optional[str] = Field(default=None, alias="billingCycle")

    model_config = {"populate_by_name": True}


class UsageLimitsResponse(BaseModel):
    max_users: int = Field(alias="maxUsers")
    max_chat_sessions: int = Field(alias="maxChatSessions")
    max_storage_mb: int = Field(alias="maxStorageMb")

    model_config = {"populate_by_name": True, "by_alias": True}


class CurrentUsageResponse(BaseModel):
    users: int
    chat_sessions: int = Field(alias="chatSessions")
    storage_used_mb: float = Field(alias="storageUsedMb")
    documents: int

    model_config = {"populate_by_name": True, "by_alias": True}
