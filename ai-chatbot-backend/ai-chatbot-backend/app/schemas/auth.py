from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, SecretStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: SecretStr = Field(min_length=1)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: SecretStr = Field(min_length=6)
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    tenantSlug: Optional[str] = None
    tenant_name: Optional[str] = None
    role: Optional[str] = None
    


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(alias="refreshToken")

    model_config = {"populate_by_name": True}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: SecretStr = Field(min_length=6, alias="newPassword")

    model_config = {"populate_by_name": True}


class TokenResponse(BaseModel):
    access_token: str = Field(alias="accessToken")
    refresh_token: str = Field(alias="refreshToken")
    token_type: str = Field(default="Bearer", alias="tokenType")
    expires_in: int = Field(alias="expiresIn")

    model_config = {"populate_by_name": True, "by_alias": True}


class UserProfileResponse(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = Field(default=None, alias="firstName")
    last_name: Optional[str] = Field(default=None, alias="lastName")
    role: str
    status: str
    tenant_id: Optional[int] = Field(default=None, alias="tenantId")
    email_verified: bool = Field(alias="emailVerified")
    last_login: Optional[datetime] = Field(default=None, alias="lastLogin")
    created_at: datetime = Field(alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True, "from_attributes": True}
