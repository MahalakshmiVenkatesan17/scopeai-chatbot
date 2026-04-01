from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
import base64

from app.api.deps import CurrentUser, get_current_user
from app.core.database import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
async def login(body: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    
    # Decode Base64 password (it's masked in network payload)
    try:
        raw_pw = body.password.get_secret_value()
        decoded_password = base64.b64decode(raw_pw).decode('utf-8')
    except Exception:
        # Fallback to cleartext if decoding fails
        decoded_password = body.password.get_secret_value()

    result = await service.login(
        email=body.email,
        password=decoded_password,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    return {"success": True, "data": result, "message": "Login successful"}


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)

    # Decode Base64 password
    try:
        raw_pw = body.password.get_secret_value()
        decoded_password = base64.b64decode(raw_pw).decode('utf-8')
    except Exception:
        decoded_password = body.password.get_secret_value()

    result = await service.register(
        email=body.email,
        password=decoded_password,
        first_name=body.firstName,
        last_name=body.lastName,
        tenant_slug=body.tenantSlug,
        tenant_name=body.tenant_name,
        role=body.role,
    )
    return {"success": True, "data": result, "message": "Registration successful. Please verify your email."}


@router.post("/refresh-token")
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.refresh_token(body.refresh_token)
    return {"success": True, "data": result, "message": "Token refreshed"}


@router.post("/logout")
async def logout(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.logout(current_user.session_id)
    return {"success": True, "message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.forgot_password(body.email)
    return {"success": True, "data": result, "message": result["message"]}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)

    # Decode Base64 password
    try:
        raw_pw = body.new_password.get_secret_value()
        decoded_password = base64.b64decode(raw_pw).decode('utf-8')
    except Exception:
        decoded_password = body.new_password.get_secret_value()

    await service.reset_password(body.token, decoded_password)
    return {"success": True, "message": "Password reset successful"}


@router.get("/verify-email/{token}")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.verify_email(token)
    return {"success": True, "data": result, "message": "Email verified"}


@router.get("/profile")
async def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.user_repo import UserRepository
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(current_user.id)
    if not user:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "User not found"}}
    return {
        "success": True,
        "data": {
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "role": user.role,
            "status": user.status,
            "tenantId": user.tenant_id,
            "emailVerified": user.email_verified,
            "lastLogin": user.last_login.isoformat() if user.last_login else None,
            "createdAt": user.created_at.isoformat() if user.created_at else None,
        },
    }
