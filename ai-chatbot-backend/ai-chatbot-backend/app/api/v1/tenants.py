from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, require_admin
from app.core.database import get_db
from app.core.exceptions import ForbiddenError, NotFoundError
from app.repositories.tenant_repo import TenantConfigRepository, TenantRepository
from app.repositories.user_repo import UserRepository
from app.schemas.tenant import (
    SubscriptionUpdateRequest,
    TenantUpdateRequest,
)

router = APIRouter(prefix="/tenants", tags=["Tenants"])


@router.get("/info")
async def get_tenant_info(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantRepository(db)
    tenant = await repo.get_by_id(current_user.tenant_id)
    if not tenant:
        raise NotFoundError("Tenant not found")
    return {
        "success": True,
        "data": {
            "id": tenant.id, "name": tenant.name, "slug": tenant.slug,
            "domain": tenant.domain, "logoUrl": tenant.logo_url,
            "primaryColor": tenant.primary_color, "secondaryColor": tenant.secondary_color,
            "status": tenant.status, "subscriptionPlan": tenant.subscription_plan,
            "maxUsers": tenant.max_users, "maxChatSessions": tenant.max_chat_sessions,
            "maxStorageMb": tenant.max_storage_mb, "billingEmail": tenant.billing_email,
            "createdAt": tenant.created_at.isoformat() if tenant.created_at else None,
            "updatedAt": tenant.updated_at.isoformat() if tenant.updated_at else None,
        },
    }


@router.put("/info")
async def update_tenant_info(
    body: TenantUpdateRequest,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantRepository(db)
    update_data = body.model_dump(exclude_none=True)
    tenant = await repo.update_by_id(current_user.tenant_id, update_data)
    return {"success": True, "data": {"id": tenant.id}, "message": "Tenant updated"}


@router.get("/users")
async def get_tenant_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    offset = (page - 1) * limit
    users = await repo.get_by_tenant(current_user.tenant_id, skip=offset, limit=limit)
    total = await repo.count_by_tenant(current_user.tenant_id)
    return {
        "success": True,
        "data": [
            {
                "id": u.id, "email": u.email, "firstName": u.first_name,
                "lastName": u.last_name, "role": u.role, "status": u.status,
                "lastLogin": u.last_login.isoformat() if u.last_login else None,
                "createdAt": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": -(-total // limit)},
    }


@router.post("/users/invite")
async def invite_user(
    body: dict,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    from app.services.auth_service import AuthService
    service = AuthService(db)
    import secrets
    temp_password = secrets.token_urlsafe(12)
    result = await service.register(
        email=body.get("email"),
        password=temp_password,
        first_name=body.get("firstName"),
        last_name=body.get("lastName"),
        tenant_slug=None,
    )
    # Override role if specified
    if body.get("role"):
        user_repo = UserRepository(db)
        await user_repo.update_by_id(result["id"], {"role": body["role"], "tenant_id": current_user.tenant_id})
    return {"success": True, "data": result, "message": "User invited"}


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    body: dict,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user or user.tenant_id != current_user.tenant_id:
        raise NotFoundError("User not found")
    await repo.update_by_id(user_id, {"role": body.get("role")})
    return {"success": True, "message": "User role updated"}


@router.delete("/users/{user_id}")
async def remove_user(
    user_id: int,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user or user.tenant_id != current_user.tenant_id:
        raise NotFoundError("User not found")
    if user_id == current_user.id:
        raise ForbiddenError("Cannot remove yourself")
    await repo.delete_by_id(user_id)
    return {"success": True, "message": "User removed"}


@router.get("/analytics")
async def get_tenant_analytics(
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.analytics_repo import AnalyticsRepository
    repo = AnalyticsRepository(db)
    stats = await repo.get_dashboard_stats(current_user.tenant_id)
    return {"success": True, "data": stats}


@router.get("/subscription")
async def get_subscription(
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.subscription_repo import SubscriptionRepository
    repo = SubscriptionRepository(db)
    sub = await repo.get_active_by_tenant(current_user.tenant_id)
    if not sub:
        return {"success": True, "data": None, "message": "No active subscription"}
    return {
        "success": True,
        "data": {
            "id": sub.id, "planName": sub.plan_name, "status": sub.status,
            "billingCycle": sub.billing_cycle, "amount": float(sub.amount),
            "currency": sub.currency,
            "currentPeriodStart": sub.current_period_start.isoformat() if sub.current_period_start else None,
            "currentPeriodEnd": sub.current_period_end.isoformat() if sub.current_period_end else None,
        },
    }


@router.put("/subscription")
async def update_subscription(
    body: SubscriptionUpdateRequest,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "message": "Subscription update initiated"}


@router.get("/billing/history")
async def get_billing_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.invoice_repo import InvoiceRepository
    repo = InvoiceRepository(db)
    invoices = await repo.get_by_tenant(current_user.tenant_id, skip=(page - 1) * limit, limit=limit)
    return {
        "success": True,
        "data": [
            {
                "id": i.id, "invoiceNumber": i.invoice_number, "status": i.status,
                "amountDue": float(i.amount_due), "amountPaid": float(i.amount_paid),
                "currency": i.currency,
                "dueDate": i.due_date.isoformat() if i.due_date else None,
                "createdAt": i.created_at.isoformat() if i.created_at else None,
            }
            for i in invoices
        ],
    }


@router.get("/usage/limits")
async def get_usage_limits(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantRepository(db)
    tenant = await repo.get_by_id(current_user.tenant_id)
    return {
        "success": True,
        "data": {
            "maxUsers": tenant.max_users,
            "maxChatSessions": tenant.max_chat_sessions,
            "maxStorageMb": tenant.max_storage_mb,
        },
    }


@router.get("/usage/current")
async def get_current_usage(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantRepository(db)
    usage = await repo.get_current_usage(current_user.tenant_id)
    return {"success": True, "data": usage}


@router.get("/settings")
async def get_settings(
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantConfigRepository(db)
    configs = await repo.get_configs_as_dict(current_user.tenant_id)
    return {"success": True, "data": {"settings": configs}}


@router.put("/settings")
async def update_settings(
    body: dict,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantConfigRepository(db)
    settings_data = body.get("settings", {})
    for key, value in settings_data.items():
        await repo.set_config(current_user.tenant_id, key, str(value), updated_by=current_user.id)
    return {"success": True, "message": "Settings updated"}
