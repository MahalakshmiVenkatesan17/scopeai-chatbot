from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user
from app.core.database import get_db
from app.core.exceptions import BadRequestError, NotFoundError
from app.core.security import hash_password, verify_password
from app.repositories.user_repo import UserRepository, UserSessionRepository
from app.schemas.user import ChangePasswordRequest, NotificationSettingsRequest, SignupRequest, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/signup")
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    from app.services.auth_service import AuthService
    service = AuthService(db)
    result = await service.register(
        email=body.email,
        password=body.password,
        first_name=body.first_name,
        last_name=body.last_name,
        tenant_slug=body.tenant_slug,
    )
    return {"success": True, "data": result, "message": "Signup successful"}


@router.get("/profile")
async def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import text
    result = await db.execute(
        text(
            "SELECT u.*, "
            "s.id AS plan_id, "
            "s.subscription_id, "
            "s.subscription_status, "
            "s.plan_name, "
            "s.created_at AS subscribed_date, "
            "COALESCE(s.amount, 0.00) AS amount "
            "FROM users u "
            "LEFT JOIN subscriptions s ON u.tenant_id = s.tenant_id AND s.subscription_status = 'active' "
            "WHERE u.id = :user_id"
        ),
        {"user_id": current_user.id},
    )
    row = result.mappings().first()
    if not row:
        raise NotFoundError("User not found")

    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)

    return {
        "success": True,
        "data": {
            "user": {
                "id": row["id"],
                "tenant_id": row["tenant_id"],
                "plan_id": row.get("plan_id"),
                "subscription_id": row.get("subscription_id"),
                "subscription_status": row.get("subscription_status"),
                "plan_name": row.get("plan_name"),
                "email": row["email"],
                "first_name": row.get("first_name"),
                "last_name": row.get("last_name"),
                "role": row["role"],
                "status": row["status"],
                "email_verified": row.get("email_verified", 0),
                "email_verification_token": row.get("email_verification_token"),
                "password_reset_token": row.get("password_reset_token"),
                "password_reset_expires": fmt_ts(row.get("password_reset_expires")),
                "last_login": fmt_ts(row.get("last_login")),
                "login_attempts": row.get("login_attempts", 0),
                "locked_until": fmt_ts(row.get("locked_until")),
                "created_at": fmt_ts(row.get("created_at")),
                "updated_at": fmt_ts(row.get("updated_at")),
                "subscribed_date": fmt_ts(row.get("subscribed_date")),
                "amount": str(row.get("amount", "0.00")),
            }
        },
    }


@router.put("/profile")
async def update_profile(
    body: UserUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    update_data = body.model_dump(exclude_none=True)
    user = await repo.update_by_id(current_user.id, update_data)
    return {"success": True, "data": {"id": user.id}, "message": "Profile updated"}


@router.put("/password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(current_user.id)
    if not user or not verify_password(body.current_password, user.password_hash):
        raise BadRequestError("Current password is incorrect", code="INVALID_PASSWORD")
    await repo.update_by_id(user.id, {"password_hash": hash_password(body.new_password)})
    return {"success": True, "message": "Password changed successfully"}


@router.get("/sessions")
async def get_sessions(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserSessionRepository(db)
    sessions = await repo.get_by_user(current_user.id)
    return {
        "success": True,
        "data": [
            {
                "id": s.id,
                "ipAddress": s.ip_address,
                "userAgent": s.user_agent,
                "expiresAt": s.expires_at.isoformat() if s.expires_at else None,
                "createdAt": s.created_at.isoformat() if s.created_at else None,
                "isCurrent": s.id == current_user.session_id,
            }
            for s in sessions
        ],
    }


@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserSessionRepository(db)
    session = await repo.get_by_id(session_id)
    if not session or session.user_id != current_user.id:
        raise NotFoundError("Session not found")
    await repo.delete_by_id(session_id)
    return {"success": True, "message": "Session revoked"}


@router.delete("/sessions")
async def revoke_all_sessions(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserSessionRepository(db)
    count = await repo.delete_all_by_user(current_user.id)
    return {"success": True, "message": f"{count} sessions revoked"}


@router.get("/notifications")
async def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import func, select
    from app.models.system import Notification
    offset = (page - 1) * limit
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(offset).limit(limit)
    )
    notifications = result.scalars().all()
    total = await db.execute(
        select(func.count()).select_from(Notification).where(Notification.user_id == current_user.id)
    )
    total_count = total.scalar() or 0
    return {
        "success": True,
        "data": [
            {
                "id": n.id, "type": n.type, "title": n.title, "message": n.message,
                "isRead": n.is_read, "createdAt": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifications
        ],
        "pagination": {"page": page, "limit": limit, "total": total_count, "totalPages": -(-total_count // limit)},
    }


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import update
    from app.models.system import Notification
    from datetime import datetime, timezone
    await db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"success": True, "message": "Notification marked as read"}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import update
    from app.models.system import Notification
    from datetime import datetime, timezone
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"success": True, "message": "All notifications marked as read"}


@router.get("/usage")
async def get_usage(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.analytics_repo import AnalyticsRepository
    repo = AnalyticsRepository(db)
    stats = await repo.get_usage_stats(current_user.tenant_id)
    return {"success": True, "data": stats}


@router.delete("/account")
async def delete_account(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    session_repo = UserSessionRepository(db)
    await session_repo.delete_all_by_user(current_user.id)
    await repo.delete_by_id(current_user.id)
    return {"success": True, "message": "Account deleted successfully"}


@router.get("/export")
async def export_user_data(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(current_user.id)
    session_repo = UserSessionRepository(db)
    sessions = await session_repo.get_by_user(current_user.id)
    return {
        "success": True,
        "data": {
            "user": {
                "id": user.id, "email": user.email,
                "firstName": user.first_name, "lastName": user.last_name,
                "role": user.role, "createdAt": user.created_at.isoformat() if user.created_at else None,
            },
            "sessions": [{"id": s.id, "createdAt": s.created_at.isoformat() if s.created_at else None} for s in sessions],
        },
    }


@router.put("/notifications/settings")
async def update_notification_settings(
    body: NotificationSettingsRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.tenant_repo import TenantConfigRepository
    config_repo = TenantConfigRepository(db)
    if body.email_notifications is not None:
        await config_repo.set_config(
            current_user.tenant_id,
            f"user_{current_user.id}_email_notifications",
            str(body.email_notifications).lower(),
            "boolean",
            current_user.id,
        )
    return {"success": True, "message": "Notification settings updated"}
