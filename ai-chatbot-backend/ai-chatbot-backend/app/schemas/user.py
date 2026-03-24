from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = Field(default=None, alias="firstName")
    last_name: Optional[str] = Field(default=None, alias="lastName")
    role: str
    status: str
    tenant_id: int = Field(alias="tenantId")
    email_verified: bool = Field(alias="emailVerified")
    last_login: Optional[datetime] = Field(default=None, alias="lastLogin")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(default=None, alias="firstName")
    last_name: Optional[str] = Field(default=None, alias="lastName")
    email: Optional[EmailStr] = None

    model_config = {"populate_by_name": True}


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(alias="currentPassword")
    new_password: str = Field(min_length=6, alias="newPassword")

    model_config = {"populate_by_name": True}


class UserSessionResponse(BaseModel):
    id: str
    ip_address: Optional[str] = Field(default=None, alias="ipAddress")
    user_agent: Optional[str] = Field(default=None, alias="userAgent")
    expires_at: datetime = Field(alias="expiresAt")
    created_at: datetime = Field(alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: Optional[str] = Field(default=None, alias="firstName")
    last_name: Optional[str] = Field(default=None, alias="lastName")
    tenant_slug: Optional[str] = Field(default=None, alias="tenantSlug")

    model_config = {"populate_by_name": True}


class InviteUserRequest(BaseModel):
    email: EmailStr
    role: str = "customer"
    first_name: Optional[str] = Field(default=None, alias="firstName")
    last_name: Optional[str] = Field(default=None, alias="lastName")

    model_config = {"populate_by_name": True}


class UpdateRoleRequest(BaseModel):
    role: str


class NotificationSettingsRequest(BaseModel):
    email_notifications: Optional[bool] = Field(default=None, alias="emailNotifications")
    push_notifications: Optional[bool] = Field(default=None, alias="pushNotifications")

    model_config = {"populate_by_name": True}
