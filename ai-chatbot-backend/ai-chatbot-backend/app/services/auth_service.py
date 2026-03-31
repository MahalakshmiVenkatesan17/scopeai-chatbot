import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import BadRequestError, ConflictError, NotFoundError, UnauthorizedError
from app.core.logging import logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.tenant import Tenant
from app.models.user import User
from app.repositories.tenant_repo import TenantRepository
from app.repositories.user_repo import UserRepository, UserSessionRepository
from sqlalchemy import text


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.session_repo = UserSessionRepository(db)
        self.tenant_repo = TenantRepository(db)

    async def login(
        self, email: str, password: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> dict[str, Any]:
        # Find user by email (across all tenants)
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise UnauthorizedError(message="Invalid email or password", code="INVALID_CREDENTIALS")

        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.utcnow():
            raise UnauthorizedError(message="Account is temporarily locked", code="ACCOUNT_LOCKED")

        # Verify password
        if not verify_password(password, user.password_hash):
            await self.user_repo.increment_login_attempts(user.id)
            # Lock after 5 failed attempts
            if user.login_attempts >= 4:
                from sqlalchemy import update as sa_update
                await self.db.execute(
                    sa_update(User)
                    .where(User.id == user.id)
                    .values(locked_until=datetime.now(timezone.utc) + timedelta(minutes=30))
                )
                await self.db.commit()
            raise UnauthorizedError(message="Invalid email or password", code="INVALID_CREDENTIALS")

        # Check user status
        if user.status != "active":
            raise UnauthorizedError(message="Your account is inactive. Please contact your administrator.", code="USER_INACTIVE")

        # Create session
        session_id = f"sess_{uuid.uuid4().hex[:20]}"
        await self.session_repo.create({
            "id": session_id,
            "user_id": user.id,
            "tenant_id": user.tenant_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        })

        # Update last login
        await self.user_repo.update_last_login(user.id)

        # Generate tokens
        token_data = {
            "userId": user.id,
            "email": user.email,
            "role": user.role,
            "tenantId": user.tenant_id,
            "sessionId": session_id,
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        logger.info(f"User logged in: {user.email} (tenant_id={user.tenant_id})")
        # Fetch user + active subscription info to match frontend response shape
        try:
            q = (
                "SELECT u.*, "
                "s.id AS plan_id, "
                "s.subscription_id, "
                "s.subscription_status, "
                "s.plan_name, "
                "s.created_at AS subscribed_date, "
                "COALESCE(s.amount, 0.00) AS amount "
                "FROM users u "
                "LEFT JOIN subscriptions s ON u.tenant_id = s.tenant_id "
                "AND s.subscription_status = 'active' "
                "WHERE u.id = :uid "
                "ORDER BY s.id DESC "
                "LIMIT 1"
            )
            result = await self.db.execute(text(q), {"uid": user.id})
            row = result.mappings().first()
        except Exception:
            row = None

        # Build user payload with snake_case keys
        if row:
            u = dict(row)
            user_payload = {
                "id": u.get("id"),
                "tenant_id": u.get("tenant_id"),
                "plan_id": u.get("plan_id"),
                "subscription_id": u.get("subscription_id"),
                "subscription_status": u.get("subscription_status"),
                "plan_name": u.get("plan_name"),
                "email": u.get("email"),
                "first_name": u.get("first_name"),
                "last_name": u.get("last_name"),
                "role": u.get("role"),
                "status": u.get("status"),
                "email_verified": int(bool(u.get("email_verified"))),
                "email_verification_token": u.get("email_verification_token"),
                "password_reset_token": u.get("password_reset_token"),
                "password_reset_expires": u.get("password_reset_expires"),
                "last_login": u.get("last_login").isoformat() + ".000Z" if u.get("last_login") else None,
                "login_attempts": u.get("login_attempts", 0),
                "locked_until": u.get("locked_until"),
                "created_at": u.get("created_at").isoformat() + ".000Z" if u.get("created_at") else None,
                "updated_at": u.get("updated_at").isoformat() + ".000Z" if u.get("updated_at") else None,
                "subscribed_date": u.get("subscribed_date"),
                "amount": str(u.get("amount")) if u.get("amount") is not None else None,
            }
        else:
            user_payload = {
                "id": user.id,
                "tenant_id": user.tenant_id,
                "plan_id": None,
                "subscription_id": None,
                "subscription_status": None,
                "plan_name": None,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "status": user.status,
                "email_verified": int(bool(user.email_verified)),
                "email_verification_token": user.email_verification_token,
                "password_reset_token": user.password_reset_token,
                "password_reset_expires": user.password_reset_expires,
                "last_login": user.last_login.isoformat() + ".000Z" if user.last_login else None,
                "login_attempts": user.login_attempts,
                "locked_until": user.locked_until,
                "created_at": user.created_at.isoformat() + ".000Z" if user.created_at else None,
                "updated_at": user.updated_at.isoformat() + ".000Z" if user.updated_at else None,
                "subscribed_date": None,
                "amount": None,
            }

        return {
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "tokenType": "Bearer",
            "expiresIn": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user_payload,
        }

    async def register(
        self,
        email: str,
        password: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        tenant_slug: Optional[str] = None,
        tenant_name: Optional[str] = None,
        role: Optional[str] = None,
    ) -> dict[str, Any]:
        # Check if user exists
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise ConflictError(message="User with this email already exists", code="EMAIL_EXISTS")

        # Get or create tenant
        tenant = None
        if tenant_slug:
            tenant = await self.tenant_repo.get_by_slug(tenant_slug)
            if not tenant:
                raise NotFoundError(message="Tenant not found", code="TENANT_NOT_FOUND")
        elif tenant_name:
            slug = tenant_name.lower().replace(" ", "-").replace("_", "-")
            existing_tenant = await self.tenant_repo.get_by_slug(slug)
            if existing_tenant:
                raise ConflictError(message="Tenant slug already exists", code="TENANT_EXISTS")
            tenant = await self.tenant_repo.create({
                "name": tenant_name,
                "slug": slug,
                "status": "active",
                "subscription_plan": "free",
            })
        else:
            # Default tenant
            tenant = await self.tenant_repo.get_by_slug("superadmin")
            if not tenant:
                tenant = await self.tenant_repo.create({
                    "name": "Superadmin",
                    "slug": "superadmin",
                    "status": "active",
                    "subscription_plan": "free",
                })

        # Determine role
        user_count = await self.user_repo.count_by_tenant(tenant.id)
        if role is not None:
            db_role = role
        else:
            db_role = "tenant_admin" if user_count == 0 else "customer"

        # Create verification token
        verification_token = secrets.token_urlsafe(32)

        # Create user
        user = await self.user_repo.create({
            "tenant_id": tenant.id,
            "email": email,
            "password_hash": hash_password(password),
            "first_name": first_name,
            "last_name": last_name,
            "role": db_role,
            "status": "active",
            "email_verification_token": verification_token,
        })

        logger.info(f"User registered: {email} (tenant_id={tenant.id}, role={role})")

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "status": "pending",
            },
        }

    async def refresh_token(self, refresh_token_str: str) -> dict[str, Any]:
        payload = decode_refresh_token(refresh_token_str)
        if not payload:
            raise UnauthorizedError(message="Invalid refresh token", code="INVALID_REFRESH_TOKEN")

        user_id = payload.get("userId")
        session_id = payload.get("sessionId")

        # Verify session still exists
        session = await self.session_repo.get_by_id(session_id)
        if not session:
            raise UnauthorizedError(message="Session expired", code="SESSION_EXPIRED")

        # Verify user
        user = await self.user_repo.get_by_id(user_id)
        if not user or user.status != "active":
            raise UnauthorizedError(message="User not found or inactive", code="USER_INACTIVE")

        # Generate new access token
        token_data = {
            "userId": user.id,
            "email": user.email,
            "role": user.role,
            "tenantId": user.tenant_id,
            "sessionId": session_id,
        }

        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        return {
            "accessToken": new_access_token,
            "refreshToken": new_refresh_token,
            "tokenType": "Bearer",
            "expiresIn": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def logout(self, session_id: str) -> None:
        await self.session_repo.delete_by_id(session_id)
        logger.info(f"Session invalidated: {session_id}")

    async def forgot_password(self, email: str) -> dict[str, Any]:
        user = await self.user_repo.get_by_email(email)
        if not user:
            # Don't reveal if email exists
            return {"message": "If the email exists, a reset link has been sent"}

        reset_token = secrets.token_urlsafe(32)
        await self.user_repo.update_by_id(user.id, {
            "password_reset_token": reset_token,
            "password_reset_expires": datetime.now(timezone.utc) + timedelta(hours=1),
        })

        logger.info(f"Password reset requested for: {email}")
        return {"message": "If the email exists, a reset link has been sent", "resetToken": reset_token}

    async def reset_password(self, token: str, new_password: str) -> None:
        user = await self.user_repo.get_by_reset_token(token)
        if not user:
            raise BadRequestError(message="Invalid or expired reset token", code="INVALID_RESET_TOKEN")

        await self.user_repo.update_by_id(user.id, {
            "password_hash": hash_password(new_password),
            "password_reset_token": None,
            "password_reset_expires": None,
            "login_attempts": 0,
            "locked_until": None,
        })

        # Invalidate all sessions
        await self.session_repo.delete_all_by_user(user.id)
        logger.info(f"Password reset completed for: {user.email}")

    async def verify_email(self, token: str) -> dict[str, Any]:
        user = await self.user_repo.get_by_verification_token(token)
        if not user:
            raise BadRequestError(message="Invalid verification token", code="INVALID_VERIFICATION_TOKEN")

        await self.user_repo.update_by_id(user.id, {
            "email_verified": True,
            "email_verification_token": None,
        })

        logger.info(f"Email verified for: {user.email}")
        return {"message": "Email verified successfully"}
