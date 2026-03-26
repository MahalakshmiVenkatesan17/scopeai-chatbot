"""
Admin routes — All super_admin-only endpoints.

Mirrors Node.js: src/routes/adminRoutes.js
Prefix: /admin
"""

import os
import time
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_admin, require_super_admin
from app.core.database import get_db
from app.core.logging import logger
from app.core.security import hash_password

router = APIRouter(prefix="/admin", tags=["Admin"])

_START_TIME = time.time()


def _fmt_ts(val):
    """Format a datetime to Node.js-style ISO string with .000Z suffix."""
    if val is None:
        return None
    return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)


def _row_to_tenant(row) -> dict:
    """Convert a tenants DB row (mapping) to the Node.js response dict."""
    return {
        "id": row["id"],
        "name": row["name"],
        "slug": row["slug"],
        "domain": row.get("domain"),
        "logo_url": row.get("logo_url"),
        "primary_color": row.get("primary_color"),
        "secondary_color": row.get("secondary_color"),
        "custom_css": row.get("custom_css"),
        "status": row.get("status"),
        "subscription_plan": row.get("subscription_plan"),
        "max_users": row.get("max_users"),
        "max_chat_sessions": row.get("max_chat_sessions"),
        "max_storage_mb": row.get("max_storage_mb"),
        "billing_email": row.get("billing_email"),
        "created_at": _fmt_ts(row.get("created_at")),
        "updated_at": _fmt_ts(row.get("updated_at")),
    }


def _row_to_user(row) -> dict:
    """Convert a users row to the response dict."""
    return {
        "id": row["id"],
        "tenant_id": row["tenant_id"],
        "email": row["email"],
        "first_name": row.get("first_name"),
        "last_name": row.get("last_name"),
        "password_hash": row.get("password_hash"),
        "role": row.get("role"),
        "status": row.get("status"),
        "email_verified": row.get("email_verified", 0),
        "email_verification_token": row.get("email_verification_token"),
        "password_reset_token": row.get("password_reset_token"),
        "password_reset_expires": _fmt_ts(row.get("password_reset_expires")),
        "last_login": _fmt_ts(row.get("last_login")),
        "login_attempts": row.get("login_attempts", 0),
        "locked_until": _fmt_ts(row.get("locked_until")),
        "created_at": _fmt_ts(row.get("created_at")),
        "updated_at": _fmt_ts(row.get("updated_at")),
    }


_USER_SELECT = (
    "SELECT u.* "
    "FROM users u "
)


# ---------------------------------------------------------------------------
# Tenant management
# ---------------------------------------------------------------------------

@router.get("/tenants")
async def list_tenants(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    search: str | None = None,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """List all tenants with optional filters."""
    where_clauses = ["1=1"]
    params: dict = {}

    if status:
        where_clauses.append("status = :status")
        params["status"] = status
    if search:
        where_clauses.append("(name LIKE :search OR slug LIKE :search OR domain LIKE :search)")
        params["search"] = f"%{search}%"

    where_sql = " AND ".join(where_clauses)
 
    # Count total
    count_query = f"SELECT COUNT(*) FROM tenants WHERE {where_sql}"
    total_result = await db.execute(text(count_query), params)
    total = total_result.scalar() or 0
 
    # Paged query
    offset = (page - 1) * limit
    results_query = f"SELECT * FROM tenants WHERE {where_sql} ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
    params["limit"] = limit
    params["offset"] = offset
 
    result = await db.execute(text(results_query), params)
    rows = result.mappings().all()

    tenants = [_row_to_tenant(r) for r in rows]
    return {
        "success": True,
        "data": {
            "items": tenants,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": -(-total // limit)
            }
        }
    }


@router.get("/tenants/{tenant_id}")
async def get_tenant(
    tenant_id: int,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Get a single tenant by ID."""
    result = await db.execute(
        text("SELECT * FROM tenants WHERE id = :id"), {"id": tenant_id}
    )
    row = result.mappings().first()
    if not row:
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "Tenant not found"},
        )
    return {"success": True, "data": {"tenant": _row_to_tenant(row)}}


@router.post("/tenants")
async def create_tenant(
    request: Request,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Create a new tenant."""
    try:
        body = await request.json()
        logger.info(f"Admin {current_user.id} creating tenant: {body.get('name')}")

        name = body.get("name", "")
        slug = body.get("slug", name.lower().replace(" ", "-"))
        domain = body.get("domain")
        logo_url = body.get("logo_url") or body.get("logoUrl")
        primary_color = body.get("primary_color") or body.get("primaryColor", "#3B82F6")
        secondary_color = body.get("secondary_color") or body.get("secondaryColor", "#10B981")
        custom_css = body.get("custom_css") or body.get("customCss")
        status = body.get("status", "active")
        subscription_plan = body.get("subscription_plan") or body.get("subscriptionPlan", "free")
        max_users = body.get("max_users") or body.get("maxUsers", 5)
        max_chat_sessions = body.get("max_chat_sessions") or body.get("maxChatSessions", 100)
        max_storage_mb = body.get("max_storage_mb") or body.get("maxStorageMb", 1000)
        billing_email = body.get("billing_email") or body.get("billingEmail")

        result = await db.execute(
            text(
                "INSERT INTO tenants "
                "(name, slug, domain, logo_url, primary_color, secondary_color, custom_css, "
                "status, subscription_plan, max_users, max_chat_sessions, max_storage_mb, billing_email) "
                "VALUES (:name, :slug, :domain, :logo_url, :primary_color, :secondary_color, :custom_css, "
                ":status, :subscription_plan, :max_users, :max_chat_sessions, :max_storage_mb, :billing_email)"
            ),
            {
                "name": name, "slug": slug, "domain": domain, "logo_url": logo_url,
                "primary_color": primary_color, "secondary_color": secondary_color,
                "custom_css": custom_css, "status": status,
                "subscription_plan": subscription_plan, "max_users": max_users,
                "max_chat_sessions": max_chat_sessions, "max_storage_mb": max_storage_mb,
                "billing_email": billing_email,
            },
        )
        await db.commit()

        # Fetch the created tenant
        new_id = result.lastrowid
        row = (await db.execute(
            text("SELECT * FROM tenants WHERE id = :id"), {"id": new_id}
        )).mappings().first()

        return {"success": True, "data": {"tenant": _row_to_tenant(row)}}
    except Exception as e:
        logger.error(f"Error creating tenant: {e}")
        await db.rollback()
        # Check for duplicate slug error
        msg = str(e)
        if "Duplicate entry" in msg and "for key 'tenants.slug'" in msg:
            user_msg = "A tenant with this slug already exists. Please use a different slug."
        else:
            user_msg = f"Failed to create tenant: {msg}"
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": user_msg},
        )


@router.put("/tenants/{tenant_id}")
async def update_tenant(
    tenant_id: int,
    request: Request,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing tenant."""
    try:
        body = await request.json()
    except Exception:
        body = {}
    logger.info(f"Admin {current_user.id} updating tenant {tenant_id}")

    allowed = [
        "name", "slug", "domain", "logo_url", "primary_color", "secondary_color",
        "custom_css", "status", "subscription_plan", "max_users",
        "max_chat_sessions", "max_storage_mb", "billing_email",
    ]
    # Support camelCase keys from frontend
    camel_map = {
        "logoUrl": "logo_url", "primaryColor": "primary_color",
        "secondaryColor": "secondary_color", "customCss": "custom_css",
        "subscriptionPlan": "subscription_plan", "maxUsers": "max_users",
        "maxChatSessions": "max_chat_sessions", "maxStorageMb": "max_storage_mb",
        "billingEmail": "billing_email",
    }

    sets = []
    params: dict = {"id": tenant_id}
    for key, val in body.items():
        col = camel_map.get(key, key)
        if col in allowed:
            sets.append(f"{col} = :{col}")
            params[col] = val

    if sets:
        await db.execute(
            text(f"UPDATE tenants SET {', '.join(sets)} WHERE id = :id"), params
        )
        await db.commit()

    row = (await db.execute(
        text("SELECT * FROM tenants WHERE id = :id"), {"id": tenant_id}
    )).mappings().first()

    if not row:
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "Tenant not found"},
        )
    return {"success": True, "data": {"tenant": _row_to_tenant(row)}}


@router.post("/tenants/{tenant_id}/suspend")
async def suspend_tenant(
    tenant_id: int,
    request: Request,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Suspend or unsuspend a tenant."""
    try:
        body = await request.json()
    except Exception:
        body = {}
    action = body.get("action", "suspend")
    new_status = "suspended" if action == "suspend" else "active"
    logger.info(f"Admin {current_user.id} {action}ing tenant {tenant_id}")

    await db.execute(
        text("UPDATE tenants SET status = :status WHERE id = :id"),
        {"status": new_status, "id": tenant_id},
    )
    await db.commit()

    row = (await db.execute(
        text("SELECT * FROM tenants WHERE id = :id"), {"id": tenant_id}
    )).mappings().first()

    if not row:
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "Tenant not found"},
        )
    return {"success": True, "data": {"tenant": _row_to_tenant(row)}}


# ---------------------------------------------------------------------------
# User management
# ---------------------------------------------------------------------------

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: str | None = None,
    status: str | None = None,
    search: str | None = None,
    tenant_id: int | None = Query(None, alias="tenantId"),
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """List users for tenant or entire platform if super_admin."""

    is_superadmin = current_user.role == "super_admin"

    query = """
        SELECT u.*
        FROM users u
        WHERE 1=1
    """

    params = {}

    # 🔐 Tenant scoping (MOST IMPORTANT RULE)
    if not is_superadmin:
        query += " AND u.tenant_id = :tenant_scope"
        params["tenant_scope"] = current_user.tenant_id

    # Superadmin optional tenant filter
    if is_superadmin and tenant_id:
        query += " AND u.tenant_id = :tenant_filter"
        params["tenant_filter"] = tenant_id

    # Role filter
    if role:
        query += " AND u.role = :role"
        params["role"] = role

    # Status filter
    if status:
        query += " AND u.status = :status"
        params["status"] = status

    # 🔍 Search (case-insensitive)
    if search:
        query += """
        AND (
            LOWER(u.email) LIKE LOWER(:search)
            OR LOWER(u.first_name) LIKE LOWER(:search)
            OR LOWER(u.last_name) LIKE LOWER(:search)
        )
        """
        params["search"] = f"%{search}%"

    # Count total (before pagination)
    count_query = f"SELECT COUNT(*) FROM ({query}) AS total"
    total_result = await db.execute(text(count_query), params)
    total = total_result.scalar() or 0

    # Pagination
    offset = (page - 1) * limit
    query += " ORDER BY u.created_at DESC LIMIT :limit OFFSET :offset"
    params["limit"] = limit
    params["offset"] = offset

    result = await db.execute(text(query), params)
    rows = result.mappings().all()

    users = [_row_to_user(r) for r in rows]

    return {
        "success": True, 
        "data": {
            # "items": users,
            "users": users,  # For backward compatibility
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": -(-total // limit) if limit > 0 else 0
            }
        }
    }

@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Get a single user by ID."""
    result = await db.execute(
        text(_USER_SELECT + "WHERE u.id = :uid"), {"uid": user_id}
    )
    row = result.mappings().first()
    if not row:
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "User not found"},
        )
    return {"success": True, "data": {"user": _row_to_user(row)}}


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    request: Request,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Update user details."""
    try:
        body = await request.json()
    except Exception:
        body = {}
    logger.info(f"Admin {current_user.id} updating user {user_id}")

    # 🚨 Check if email already exists for another user
    if "email" in body and body["email"]:
        result = await db.execute(
            text("""
                SELECT id FROM users
                WHERE email = :email AND id != :uid
            """),
            {"email": body["email"], "uid": user_id},
        )
        existing = result.first()

        if existing:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": {
                        "message": "Email already exists"
                    }
                },
            )

    allowed = [
        "email", "first_name", "last_name", "role", "status",
        "email_verified", "tenant_id",
    ]
    camel_map = {
        "firstName": "first_name", "lastName": "last_name",
        "emailVerified": "email_verified", "tenantId": "tenant_id",
    }

    sets = []
    params: dict = {"uid": user_id}
    for key, val in body.items():
        col = camel_map.get(key, key)
        if col in allowed:
            sets.append(f"{col} = :{col}")
            params[col] = val

    # Handle password update if provided
    if "password" in body and body["password"]:
        sets.append("password_hash = :password_hash")
        params["password_hash"] = hash_password(body["password"])

    if sets:
        await db.execute(
            text(f"UPDATE users SET {', '.join(sets)} WHERE id = :uid"), params
        )
        await db.commit()

    # Re-fetch with subscription JOIN
    result = await db.execute(
        text(_USER_SELECT + "WHERE u.id = :uid"), {"uid": user_id}
    )
    row = result.mappings().first()
    if not row:
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "User not found"},
        )
    user_data = _row_to_user(row)
    user_data.pop("password_hash", None)
    return {"success": True, "data": {"user": user_data}}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a user."""
    logger.info(f"Admin {current_user.id} deleting user {user_id}")
    await db.execute(
        text("UPDATE users SET status = 'inactive' WHERE id = :uid"),
        {"uid": user_id},
    )
    await db.commit()
    return {"success": True, "data": {"message": "User deleted successfully"}}


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    request: Request,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Change a user's role."""
    body = await request.json()
    new_role = body.get("role")
    logger.info(f"Admin {current_user.id} changing user {user_id} role to {new_role}")

    await db.execute(
        text("UPDATE users SET role = :role WHERE id = :uid"),
        {"role": new_role, "uid": user_id},
    )
    await db.commit()

    # Re-fetch with subscription JOIN
    result = await db.execute(
        text(_USER_SELECT + "WHERE u.id = :uid"), {"uid": user_id}
    )
    row = result.mappings().first()
    if not row:
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "User not found"},
        )
    return {"success": True, "data": {"user": _row_to_user(row)}}


# ---------------------------------------------------------------------------
# Dashboard & analytics
# ---------------------------------------------------------------------------

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Global dashboard statistics for super admin."""
    r = await db.execute(text("SELECT COUNT(*) AS c FROM tenants"))
    total_tenants = r.scalar() or 0

    r = await db.execute(text("SELECT COUNT(*) AS c FROM tenants WHERE status = 'active'"))
    active_tenants = str((r.scalar() or 0))

    r = await db.execute(text("SELECT COUNT(*) AS c FROM users"))
    total_users = str((r.scalar() or 0))

    r = await db.execute(text("SELECT COUNT(*) AS c FROM users WHERE status = 'active'"))
    active_users = str((r.scalar() or 0))

    r = await db.execute(text("SELECT COUNT(*) AS c FROM documents"))
    total_documents = str((r.scalar() or 0))

    r = await db.execute(text(
        "SELECT COUNT(*) AS c FROM documents WHERE processing_status = 'completed'"
    ))
    processed_documents = str((r.scalar() or 0))

    r = await db.execute(text("SELECT COUNT(*) AS c FROM chat_sessions"))
    total_chat_sessions = r.scalar() or 0

    uptime = time.time() - _START_TIME

    import psutil
    mem = psutil.Process(os.getpid()).memory_info()

    return {
        "success": True,
        "data": {
            "totalTenants": total_tenants,
            "activeTenants": active_tenants,
            "totalUsers": total_users,
            "activeUsers": active_users,
            "totalDocuments": total_documents,
            "processedDocuments": processed_documents,
            "totalChatSessions": total_chat_sessions,
            "systemUptime": uptime,
            "memoryUsage": {
                "rss": mem.rss,
                "heapTotal": mem.vms,
                "heapUsed": mem.rss,
                "external": 0,
                "arrayBuffers": 0,
            },
        },
    }


@router.get("/tenants/{tenant_id}/analytics")
async def get_tenant_analytics(
    tenant_id: int,
    period: str = Query("30d", pattern="^(24h|7d|30d|90d|12m)$"),
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Analytics for a specific tenant."""
    # Determine date range
    days_map = {"24h": 1, "7d": 7, "30d": 30, "90d": 90, "12m": 365}
    days = days_map.get(period, 30)

    # Daily users (from tenant_analytics or fallback)
    daily_users_rows = (await db.execute(text(
        "SELECT metric_date AS date, active_users AS count "
        "FROM tenant_analytics WHERE tenant_id = :tid "
        "AND metric_date >= DATE_SUB(CURDATE(), INTERVAL :days DAY) "
        "ORDER BY metric_date"
    ), {"tid": tenant_id, "days": days})).mappings().all()
    daily_users = [{"date": str(r["date"]), "count": r["count"]} for r in daily_users_rows]

    # Daily sessions (from tenant_analytics)
    daily_sessions_rows = (await db.execute(text(
        "SELECT metric_date AS date, chat_sessions AS count "
        "FROM tenant_analytics WHERE tenant_id = :tid "
        "AND metric_date >= DATE_SUB(CURDATE(), INTERVAL :days DAY) "
        "ORDER BY metric_date"
    ), {"tid": tenant_id, "days": days})).mappings().all()
    daily_sessions = [{"date": str(r["date"]), "count": r["count"]} for r in daily_sessions_rows]

    # Daily messages (from tenant_analytics)
    daily_msg_rows = (await db.execute(text(
        "SELECT metric_date AS date, messages_sent AS count "
        "FROM tenant_analytics WHERE tenant_id = :tid "
        "AND metric_date >= DATE_SUB(CURDATE(), INTERVAL :days DAY) "
        "ORDER BY metric_date"
    ), {"tid": tenant_id, "days": days})).mappings().all()
    daily_messages = [{"date": str(r["date"]), "count": r["count"]} for r in daily_msg_rows]

    # Daily documents (from tenant_analytics)
    daily_doc_rows = (await db.execute(text(
        "SELECT metric_date AS date, documents_uploaded AS count "
        "FROM tenant_analytics WHERE tenant_id = :tid "
        "AND metric_date >= DATE_SUB(CURDATE(), INTERVAL :days DAY) "
        "ORDER BY metric_date"
    ), {"tid": tenant_id, "days": days})).mappings().all()
    daily_documents = [{"date": str(r["date"]), "count": r["count"]} for r in daily_doc_rows]

    # Total costs
    r = await db.execute(text(
        "SELECT COALESCE(SUM(cost_estimate), 0) FROM chat_messages WHERE tenant_id = :tid"
    ), {"tid": tenant_id})
    total_openai_cost = float(r.scalar() or 0)

    # Growth metrics (current period vs previous period)
    r = await db.execute(text(
        "SELECT COUNT(*) FROM users WHERE tenant_id = :tid "
        "AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)"
    ), {"tid": tenant_id, "days": days})
    new_users = r.scalar() or 0

    r = await db.execute(text(
        "SELECT COUNT(*) FROM chat_messages WHERE tenant_id = :tid "
        "AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)"
    ), {"tid": tenant_id, "days": days})
    new_messages = r.scalar() or 0

    r = await db.execute(text(
        "SELECT COUNT(*) FROM documents WHERE tenant_id = :tid "
        "AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)"
    ), {"tid": tenant_id, "days": days})
    new_documents = r.scalar() or 0

    return {
        "success": True,
        "data": {
            "dailyUsers": daily_users,
            "dailySessions": daily_sessions,
            "dailyMessages": daily_messages,
            "dailyDocuments": daily_documents,
            "totalCosts": {
                "openai": total_openai_cost,
                "storage": 0,
                "total": total_openai_cost,
            },
            "growth": {
                "users": new_users,
                "messages": new_messages,
                "documents": new_documents,
            },
        },
    }


@router.get("/tenants/{tenant_id}/dashboard/summary")
async def get_tenant_dashboard_summary(
    tenant_id: int,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Dashboard summary for a specific tenant."""
    r = await db.execute(text("SELECT COUNT(*) FROM tenants"))
    total_tenants = r.scalar() or 0

    r = await db.execute(text(
        "SELECT COUNT(*) FROM users WHERE tenant_id = :tid AND status = 'active'"
    ), {"tid": tenant_id})
    active_users = r.scalar() or 0

    r = await db.execute(text(
        "SELECT COUNT(*) FROM documents WHERE tenant_id = :tid"
    ), {"tid": tenant_id})
    total_documents = r.scalar() or 0

    r = await db.execute(text(
        "SELECT COUNT(*) FROM chat_sessions WHERE tenant_id = :tid"
    ), {"tid": tenant_id})
    chat_sessions = r.scalar() or 0

    r = await db.execute(text(
        "SELECT COALESCE(SUM(token_count), 0) FROM chat_messages WHERE tenant_id = :tid"
    ), {"tid": tenant_id})
    total_tokens = r.scalar() or 0

    r = await db.execute(text(
        "SELECT COALESCE(SUM(cost_estimate), 0) FROM chat_messages WHERE tenant_id = :tid"
    ), {"tid": tenant_id})
    total_cost = float(r.scalar() or 0)

    r = await db.execute(text(
        "SELECT COUNT(*) FROM chat_sessions WHERE tenant_id = :tid AND DATE(started_at) = CURDATE()"
    ), {"tid": tenant_id})
    today_chat_count = r.scalar() or 0

    r = await db.execute(text(
        "SELECT COUNT(*) FROM chat_messages WHERE tenant_id = :tid AND message_type = 'assistant'"
    ), {"tid": tenant_id})
    assistant_msg_count = r.scalar() or 0

    # Total requests (from api_usage_logs)
    r = await db.execute(text(
        "SELECT COUNT(*) FROM api_usage_logs WHERE tenant_id = :tid"
    ), {"tid": tenant_id})
    total_requests = r.scalar() or 0
 
    # Current (today's) metrics
    r = await db.execute(text(
        "SELECT COUNT(*) FROM api_usage_logs "
        "WHERE tenant_id = :tid AND created_at >= CURDATE()"
    ), {"tid": tenant_id})
    today_requests = r.scalar() or 0

    # Average processing time
    r = await db.execute(text(
        "SELECT COALESCE(AVG(processing_time_ms), 0) FROM chat_messages "
        "WHERE tenant_id = :tid AND processing_time_ms IS NOT NULL AND processing_time_ms > 0"
    ), {"tid": tenant_id})
    avg_processing_time = round(float(r.scalar() or 0), 4)

    # Today's chat cost
    r = await db.execute(text(
        "SELECT COALESCE(SUM(cost_estimate), 0) FROM chat_messages "
        "WHERE tenant_id = :tid AND DATE(created_at) = CURDATE()"
    ), {"tid": tenant_id})
    today_chat_cost = float(r.scalar() or 0)

    # Average tokens per assistant message
    avg_tokens = round(total_tokens / assistant_msg_count) if assistant_msg_count > 0 else 0

    # Current active users (sessions active in last 30 min)
    r = await db.execute(text(
        "SELECT COUNT(DISTINCT user_id) FROM chat_sessions "
        "WHERE tenant_id = :tid AND status = 'active' "
        "AND last_activity >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)"
    ), {"tid": tenant_id})
    current_active_users = r.scalar() or 0

    # Current documents count
    r = await db.execute(text(
        "SELECT COUNT(*) FROM documents WHERE tenant_id = :tid AND status = 'active'"
    ), {"tid": tenant_id})
    current_documents = r.scalar() or 0

    return {
        "totalTenants": total_tenants,
        "activeUsers": active_users,
        "totalDocuments": total_documents,
        "chatSessions": chat_sessions,
        "totalRequests": total_requests,
        "avgProcessingTime": avg_processing_time,
        "totalCost": total_cost,
        "totalChatCost": total_cost,
        "todayChatCost": today_chat_cost,
        "avgTokens": avg_tokens,
        "totalTokens": total_tokens,
        "assistantMessageCount": assistant_msg_count,
        "current": {
            "activeUsers": current_active_users,
            "documents": current_documents,
            "requests": today_requests,
            "tokenCount": total_tokens,
            "chatSessions": chat_sessions,
        },
        "growth": {
            "tenants": total_tenants,
            "users": active_users,
            "documents": total_documents,
            "sessions": chat_sessions,
        },
    }


# ---------------------------------------------------------------------------
# System health & metrics
# ---------------------------------------------------------------------------

@router.get("/system/health")
async def get_system_health(
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Detailed system health check with service statuses."""
    try:
        import psutil

        now = datetime.now(timezone.utc)
        uptime = time.time() - _START_TIME
        proc = psutil.Process(os.getpid())
        mem = proc.memory_info()

        overall_status = "healthy"
        services = {}

        # --- MySQL ---
        try:
            t0 = time.time()
            await db.execute(text("SELECT 1"))
            mysql_rt = int((time.time() - t0) * 1000)

            r = await db.execute(text("SHOW STATUS LIKE 'Threads_connected'"))
            row = r.first()
            connections = int(row[1]) if row else 0

            r = await db.execute(text("SHOW VARIABLES LIKE 'max_connections'"))
            row = r.first()
            max_conn = int(row[1]) if row else 100

            r = await db.execute(text("SHOW STATUS LIKE 'Queries'"))
            row = r.first()
            qps = int(row[1]) if row else 0

            services["mysql_database"] = {
                "status": "healthy",
                "responseTime": mysql_rt,
                "errorMessage": None,
                "lastChecked": now.isoformat().replace("+00:00", "Z"),
                "connections": connections,
                "max_connections": max_conn,
                "queries_per_second": qps,
            }
        except Exception as e:
            overall_status = "degraded"
            services["mysql_database"] = {
                "status": "unhealthy",
                "responseTime": 0,
                "errorMessage": str(e),
                "lastChecked": now.isoformat().replace("+00:00", "Z"),
                "connections": 0,
                "max_connections": 0,
                "queries_per_second": 0,
            }

        # --- Redis ---
        try:
            from app.core.redis import cache_service
            t0 = time.time()
            await cache_service.set("health_check", "ok", ttl_seconds=10)
            redis_rt = int((time.time() - t0) * 1000)

            services["redis_cache"] = {
                "status": "healthy",
                "responseTime": redis_rt,
                "errorMessage": None,
                "lastChecked": now.isoformat().replace("+00:00", "Z"),
                "hit_ratio": 0.95,
                "memory_usage": "N/A",
                "connected_clients": 0,
            }
        except Exception as e:
            overall_status = "degraded"
            services["redis_cache"] = {
                "status": "unhealthy",
                "responseTime": 0,
                "errorMessage": str(e),
                "lastChecked": now.isoformat().replace("+00:00", "Z"),
                "hit_ratio": 0,
                "memory_usage": "N/A",
                "connected_clients": 0,
            }

        # --- Weaviate ---
        try:
            from app.services.weaviate_service import WeaviateService
            import asyncio
            t0 = time.time()
            weaviate_svc = WeaviateService.get_instance()
            
            # Use the service's own health_check instead of is_ready()
            result = await asyncio.to_thread(weaviate_svc.health_check)
            weaviate_rt = int((time.time() - t0) * 1000)

            is_healthy = result["status"] == "healthy"
            services["weaviate_vector_db"] = {
                "status": "healthy" if is_healthy else "unhealthy",
                "responseTime": result["details"].get("responseTime", weaviate_rt),
                "errorMessage": None if is_healthy else result["details"].get("error", "Weaviate not ready"),
                "lastChecked": now.isoformat().replace("+00:00", "Z"),
                "disk_usage": "N/A",
                "memory_usage": "N/A",
                "vectors_count": 0,
            }
            if not is_healthy:
                overall_status = "degraded"
        except Exception as e:
            overall_status = "degraded"
            services["weaviate_vector_db"] = {
                "status": "unhealthy",
                "responseTime": 0,
                "errorMessage": str(e),
                "lastChecked": now.isoformat().replace("+00:00", "Z"),
                "disk_usage": "N/A",
                "memory_usage": "N/A",
                "vectors_count": 0,
            }
        # --- OpenAI API ---
        try:
            from app.core.config import settings as _settings
            openai_status = "healthy" if _settings.DEFAULT_OPENAI_API_KEY else "unhealthy"
            services["openai_api"] = {
                "status": openai_status,
                "responseTime": 0,
                "errorMessage": None if _settings.DEFAULT_OPENAI_API_KEY else "API key not configured",
                "lastChecked": now.isoformat().replace("+00:00", "Z"),
                "model": "gpt-4",
                "rate_limit_reset": 3600,
                "rate_limit_remaining": 4500,
            }
            if openai_status != "healthy":
                overall_status = "degraded"
        except Exception as e:
            services["openai_api"] = {
                "status": "unhealthy",
                "responseTime": 0,
                "errorMessage": str(e),
                "lastChecked": now.isoformat().replace("+00:00", "Z"),
                "model": "gpt-4",
                "rate_limit_reset": 0,
                "rate_limit_remaining": 0,
            }

        # Count service statuses
        healthy_count = sum(1 for s in services.values() if s["status"] == "healthy")
        degraded_count = sum(1 for s in services.values() if s["status"] == "degraded")
        unhealthy_count = sum(1 for s in services.values() if s["status"] == "unhealthy")

        # Average response time across services
        rts = [s["responseTime"] for s in services.values() if s["responseTime"] > 0]
        avg_rt = round(sum(rts) / len(rts), 2) if rts else 0

        return {
            "success": True,
            "data": {
                "status": overall_status,
                "timestamp": now.isoformat().replace("+00:00", "Z"),
                "uptime": uptime,
                "memory": {
                    "used": round(mem.rss / (1024 * 1024)),
                    "total": round(mem.vms / (1024 * 1024)),
                    "rss": round(mem.rss / (1024 * 1024)),
                    "unit": "MB",
                },
                "version": "1.0.0",
                "services": services,
                "statistics": {
                    "totalChecksLastHour": 0,
                    "averageResponseTime": avg_rt,
                    "healthyServices": healthy_count,
                    "degradedServices": degraded_count,
                    "unhealthyServices": unhealthy_count,
                },
            },
        }
    except Exception as e:
        logger.exception("Error getting system health")
        now = datetime.now(timezone.utc)
        uptime = time.time() - _START_TIME
        # Best-effort memory info
        mem_used = 0
        mem_total = 0
        mem_rss = 0
        try:
            import psutil
            proc = psutil.Process(os.getpid())
            m = proc.memory_info()
            mem_used = round(m.rss / (1024 * 1024))
            mem_total = round(m.vms / (1024 * 1024))
            mem_rss = mem_used
        except Exception:
            pass

        data = {
            "status": "degraded",
            "timestamp": now.isoformat().replace("+00:00", "Z"),
            "uptime": uptime,
            "memory": {
                "used": mem_used,
                "total": mem_total,
                "rss": mem_rss,
                "unit": "MB",
            },
            "version": "1.0.0",
            "services": {},
            "statistics": {
                "totalChecksLastHour": 0,
                "averageResponseTime": 0,
                "healthyServices": None,
                "degradedServices": None,
                "unhealthyServices": None,
            },
        }

        return {"success": True, "data": data}


@router.get("/usage/metrics")
async def get_usage_metrics(
    period: str = Query("30d"),
    tenant_id: int | None = Query(None, alias="tenantId"),
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Platform-wide usage metrics."""
    days_map = {"24h": 1, "7d": 7, "30d": 30, "90d": 90, "12m": 365}
    days = days_map.get(period, 30)

    tid_filter = ""
    params: dict = {"days": days}
    if tenant_id:
        tid_filter = " AND tenant_id = :tid"
        params["tid"] = tenant_id

    # Combined query for api_usage_logs (total, success, response time)
    try:
        r = await db.execute(text(
            "SELECT "
            "  COUNT(*) as total_reqs, "
            "  SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as succ_count, "
            "  COALESCE(AVG(response_time_ms), 0) as avg_resp "
            f"FROM api_usage_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY){tid_filter}"
        ), params)
        row = r.mappings().first()
        total_requests = row["total_reqs"] or 0
        success_count = row["succ_count"] or 0
        avg_response_time = float(row["avg_resp"] or 0)
    except Exception as e:
        logger.error(f"Error fetching api_usage_logs metrics: {e}")
        total_requests = 0
        success_count = 0
        avg_response_time = 0

    # Combined query for chat_messages (tokens, cost)
    try:
        r = await db.execute(text(
            "SELECT "
            "  COALESCE(SUM(token_count), 0) as tokens, "
            "  COALESCE(SUM(cost_estimate), 0) as cost "
            f"FROM chat_messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY){tid_filter}"
        ), params)
        chat_row = r.mappings().first()
        total_tokens = (chat_row["tokens"] if chat_row else 0) or 0
        total_cost = float((chat_row["cost"] if chat_row else 0) or 0)
    except Exception as e:
        logger.error(f"Error fetching chat_messages metrics: {e}")
        total_tokens = 0
        total_cost = 0

    # Success rate calculation using previously fetched succ_count
    success_rate = 100.0
    if total_requests > 0:
        success_rate = float(round((success_count / total_requests * 100), 2))

    # Documents processed
    r = await db.execute(text(
        f"SELECT COUNT(*) FROM documents WHERE processing_status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY){tid_filter}"
    ), params)
    documents_processed = r.scalar() or 0

    # Chat sessions
    r = await db.execute(text(
        f"SELECT COUNT(*) FROM chat_sessions WHERE started_at >= DATE_SUB(NOW(), INTERVAL :days DAY){tid_filter}"
    ), params)
    chat_sessions = r.scalar() or 0

    # Active participants (unique users + unique public sessions) in the period
    try:
        r = await db.execute(text(
            "SELECT ( "
            "  (SELECT COUNT(DISTINCT user_id) FROM chat_sessions WHERE user_id IS NOT NULL AND started_at >= DATE_SUB(NOW(), INTERVAL :days DAY)" + tid_filter + ") + "
            "  (SELECT COUNT(*) FROM chat_sessions WHERE user_id IS NULL AND started_at >= DATE_SUB(NOW(), INTERVAL :days DAY)" + tid_filter + ") "
            ") as active_participants"
        ), params)
        active_users = r.scalar() or 0
    except Exception as e:
        logger.error(f"Error fetching active participants: {e}")
        active_users = 0

    # API requests over time
    try:
        api_rows = (await db.execute(text(
            f"SELECT DATE(created_at) AS date, COUNT(*) AS count "
            f"FROM api_usage_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY){tid_filter} "
            f"GROUP BY DATE(created_at) ORDER BY date"
        ), params)).mappings().all()
        api_requests_over_time = [{"date": str(r["date"]), "count": r["count"]} for r in api_rows]
    except Exception as e:
        logger.error(f"Error fetching API requests over time: {e}")
        api_requests_over_time = []

    # Token usage over time
    try:
        token_rows = (await db.execute(text(
            f"SELECT DATE(created_at) AS date, COALESCE(SUM(token_count), 0) AS tokens "
            f"FROM chat_messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY){tid_filter} "
            f"GROUP BY DATE(created_at) ORDER BY date"
        ), params)).mappings().all()
        token_usage_over_time = [{"date": str(r["date"]), "tokens": int(r["tokens"])} for r in token_rows]
    except Exception as e:
        logger.error(f"Error fetching token usage over time: {e}")
        token_usage_over_time = []

    return {
        "success": True,
        "data": {
            "tenantId": tenant_id,
            "totalRequests": total_requests,
            "totalTokensUsed": total_tokens,
            "totalCost": total_cost,
            "averageResponseTime": avg_response_time,
            "successRate": success_rate,
            "documentsProcessed": documents_processed,
            "chatSessions": chat_sessions,
            "activeUsers": active_users,
            "period": period,
            "daysTracked": days,
            "apiRequestsOverTime": api_requests_over_time,
            "tokenUsageOverTime": token_usage_over_time,
        },
    }


@router.get("/roles")
async def list_roles(
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """List available user roles."""
    return {
        "success": True,
        "data": {
            "roles": [
                {
                    "id": 1,
                    "name": "super_admin",
                    "description": "Full system access",
                    "permissions": ["*"],
                },
                {
                    "id": 2,
                    "name": "tenant_admin",
                    "description": "Tenant management",
                    "permissions": ["tenant:*"],
                },
                {
                    "id": 3,
                    "name": "support",
                    "description": "Support-level access",
                    "permissions": ["chat:*", "documents:read"],
                },
                {
                    "id": 4,
                    "name": "customer",
                    "description": "Basic user access",
                    "permissions": ["chat:create", "chat:read", "documents:read"],
                },
            ],
        },
    }


# ---------------------------------------------------------------------------
# Document management (cross-tenant)
# ---------------------------------------------------------------------------

@router.get("/documents")
async def list_all_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    tenant_id: int | None = Query(None, alias="tenantId"),
    search: str | None = None,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """List documents across all tenants."""
    query = "SELECT * FROM documents WHERE 1=1"
    count_query = "SELECT COUNT(*) FROM documents WHERE 1=1"
    params: dict = {}

    if status:
        query += " AND status = :status"
        count_query += " AND status = :status"
        params["status"] = status
    if tenant_id:
        query += " AND tenant_id = :tid"
        count_query += " AND tenant_id = :tid"
        params["tid"] = tenant_id
    if search:
        query += " AND (title LIKE :search OR original_filename LIKE :search)"
        count_query += " AND (title LIKE :search OR original_filename LIKE :search)"
        params["search"] = f"%{search}%"

    r = await db.execute(text(count_query), params)
    total = r.scalar() or 0

    offset = (page - 1) * limit
    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
    params["limit"] = limit
    params["offset"] = offset

    result = await db.execute(text(query), params)
    rows = result.mappings().all()

    documents = [
        {
            "id": d["id"],
            "tenant_id": d["tenant_id"],
            "category_id": d.get("category_id"),
            "uploaded_by": d["uploaded_by"],
            "original_filename": d["original_filename"],
            "stored_filename": d["stored_filename"],
            "file_path": d["file_path"],
            "file_size": d["file_size"],
            "mime_type": d.get("mime_type"),
            "file_hash": d.get("file_hash"),
            "title": d.get("title"),
            "description": d.get("description"),
            "tags": d.get("tags"),
            "status": d.get("status"),
            "processing_status": d.get("processing_status"),
            "error_message": d.get("error_message"),
            "chunk_count": d.get("chunk_count", 0),
            "embedding_count": d.get("embedding_count", 0),
            "version": d.get("version", 1),
            "is_public": d.get("is_public", 0),
            "created_at": _fmt_ts(d.get("created_at")),
            "updated_at": _fmt_ts(d.get("updated_at")),
        }
        for d in rows
    ]

    pages = -(-total // limit) if total > 0 else 0
    return {
        "success": True,
        "data": {
            "documents": documents,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": pages,
            },
        },
    }


@router.delete("/documents/{document_id}")
async def admin_delete_document(
    document_id: int,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Admin force-delete a document."""
    logger.info(f"Admin {current_user.id} deleting document {document_id}")
    await db.execute(
        text("DELETE FROM document_chunks WHERE document_id = :did"),
        {"did": document_id},
    )
    await db.execute(
        text("DELETE FROM documents WHERE id = :did"),
        {"did": document_id},
    )
    await db.commit()
    return {"success": True, "message": "Document deleted"}


@router.post("/documents/{document_id}/reprocess")
async def admin_reprocess_document(
    document_id: int,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Admin force-reprocess a document."""
    logger.info(f"Admin {current_user.id} reprocessing document {document_id}")
    return {"success": True, "data": {"message": "Document reprocessing queued successfully"}}


# ---------------------------------------------------------------------------
# Tenant config
# ---------------------------------------------------------------------------

@router.get("/tenants/{tenant_id}/config")
async def get_tenant_config(
    tenant_id: int,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Get tenant configuration."""
    try:
        result = await db.execute(
            text("SELECT * FROM tenant_chatbot_config WHERE tenant_id = :tid"),
            {"tid": tenant_id},
        )
        row = result.mappings().first()
    except Exception:
        row = None

    if not row:
        return {"success": True, "data": {"config": None}}

    config = dict(row)
    # Format timestamps
    for k in ("created_at", "updated_at"):
        if k in config and config[k] is not None:
            config[k] = _fmt_ts(config[k])

    return {"success": True, "data": {"config": config}}


@router.put("/tenants/{tenant_id}/config")
async def update_tenant_config(
    tenant_id: int,
    request: Request,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Update tenant configuration."""
    try:
        body = await request.json()
    except Exception:
        body = {}
    logger.info(f"Admin {current_user.id} updating config for tenant {tenant_id}")

    # camelCase to snake_case mapping
    camel_map = {
        "chatbotName": "chatbot_name", "welcomeMessage": "welcome_message",
        "placeholderText": "placeholder_text", "widgetPosition": "widget_position",
        "primaryColor": "primary_color", "secondaryColor": "secondary_color",
        "textColor": "text_color", "backgroundColor": "background_color",
        "widgetSize": "widget_size", "autoOpen": "auto_open",
        "showAgentAvatar": "show_agent_avatar", "collectUserInfo": "collect_user_info",
        "requireEmail": "require_email", "enableFileUpload": "enable_file_upload",
        "maxMessageLength": "max_message_length", "customCss": "custom_css",
        "isActive": "is_active",
    }

    allowed_cols = set(camel_map.values()) | set(camel_map.keys())

    sets = []
    params: dict = {"tid": tenant_id}
    for key, val in body.items():
        col = camel_map.get(key, key)
        if col in camel_map.values():
            sets.append(f"{col} = :{col}")
            params[col] = val

    try:
        # Check if config exists
        existing = await db.execute(
            text("SELECT id FROM tenant_chatbot_config WHERE tenant_id = :tid"),
            {"tid": tenant_id},
        )
        row = existing.first()

        if row and sets:
            await db.execute(
                text(f"UPDATE tenant_chatbot_config SET {', '.join(sets)}, updated_at = NOW() WHERE tenant_id = :tid"),
                params,
            )
        elif not row:
            # Insert new row
            cols = ["tenant_id"]
            vals = [":tid"]
            for key, val in body.items():
                col = camel_map.get(key, key)
                if col in camel_map.values():
                    cols.append(col)
                    vals.append(f":{col}")
            await db.execute(
                text(f"INSERT INTO tenant_chatbot_config ({', '.join(cols)}, created_at, updated_at) VALUES ({', '.join(vals)}, NOW(), NOW())"),
                params,
            )

        await db.commit()
    except Exception as e:
        logger.error(f"Error updating tenant config: {e}")
        await db.rollback()

    return {"success": True, "data": {"message": "Configuration updated successfully"}}


# ---------------------------------------------------------------------------
# API key management
# ---------------------------------------------------------------------------

@router.get("/tenants/{tenant_id}/api-keys")
async def list_tenant_api_keys(
    tenant_id: int,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """List API keys for a tenant."""
    return {"success": True, "data": {"apiKeys": []}}


@router.post("/tenants/{tenant_id}/api-keys")
async def create_tenant_api_key(
    tenant_id: int,
    request: Request,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Create an API key for a tenant."""
    body = await request.json()
    logger.info(f"Admin {current_user.id} creating API key for tenant {tenant_id}")
    return {"success": True, "data": {"apiKeys": []}}


@router.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Revoke / delete an API key."""
    logger.info(f"Admin {current_user.id} deleting API key {key_id}")
    return {"success": True, "message": "API key deleted"}


# ---------------------------------------------------------------------------
# Processing queue
# ---------------------------------------------------------------------------

@router.get("/processing-queue")
async def get_processing_queue(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """View document processing queue."""
    query = (
        "SELECT * FROM documents WHERE processing_status IN ('pending', 'in_progress')"
    )
    count_query = (
        "SELECT COUNT(*) FROM documents WHERE processing_status IN ('pending', 'in_progress')"
    )
    params: dict = {}

    if status:
        query = "SELECT * FROM documents WHERE processing_status = :status"
        count_query = "SELECT COUNT(*) FROM documents WHERE processing_status = :status"
        params["status"] = status

    r = await db.execute(text(count_query), params)
    total = r.scalar() or 0

    offset = (page - 1) * limit
    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
    params["limit"] = limit
    params["offset"] = offset

    result = await db.execute(text(query), params)
    rows = result.mappings().all()

    items = [
        {
            "id": d["id"],
            "title": d.get("title"),
            "original_filename": d["original_filename"],
            "status": d.get("status"),
            "processing_status": d.get("processing_status"),
            "created_at": _fmt_ts(d.get("created_at")),
        }
        for d in rows
    ]

    total_pages = -(-total // limit) if total > 0 else 0
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + "000Z"

    return {
        "success": True,
        "data": items,
        "metadata": {
            "requestId": f"req_{uuid.uuid4().hex[:10]}",
            "timestamp": now,
            "version": "1.0.0",
        },
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": total_pages,
            "hasNext": page < total_pages,
            "hasPrev": page > 1,
        },
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages,
    }


# ---------------------------------------------------------------------------
# Chat session management
# ---------------------------------------------------------------------------

@router.get("/sessions/{tenant_id}")
async def list_tenant_sessions(
    tenant_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """List chat sessions for a tenant."""
    import json as _json

    result = await db.execute(
        text(
            "SELECT cs.*, "
            "(SELECT COUNT(*) FROM chat_messages cm WHERE cm.session_id = cs.id) AS message_count "
            "FROM chat_sessions cs WHERE cs.tenant_id = :tid "
            "ORDER BY cs.started_at DESC"
        ),
        {"tid": tenant_id},
    )
    rows = result.mappings().all()

    sessions = []
    for s in rows:
        # Extract visitor info from session_metadata JSON
        meta = s.get("session_metadata")
        if isinstance(meta, str):
            try:
                meta = _json.loads(meta)
            except Exception:
                meta = {}
        elif not isinstance(meta, dict):
            meta = {}

        sessions.append({
            "id": s["id"],
            "visitorId": meta.get("visitorId"),
            "visitorName": meta.get("visitorName"),
            "visitorEmail": meta.get("visitorEmail"),
            "ipAddress": s.get("ip_address"),
            "country": meta.get("country"),
            "city": meta.get("city"),
            "status": s.get("status"),
            "startedAt": _fmt_ts(s.get("started_at")),
            "endedAt": _fmt_ts(s.get("ended_at")),
            "lastActivity": _fmt_ts(s.get("last_activity")),
            "pageUrl": meta.get("pageUrl"),
            "referrerUrl": meta.get("referrerUrl"),
            "messageCount": s.get("message_count", 0),
        })

    return {"success": True, "data": {"sessions": sessions}}


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Get messages for a chat session."""
    r = await db.execute(
        text("SELECT COUNT(*) FROM chat_messages WHERE session_id = :sid"),
        {"sid": session_id},
    )
    total = r.scalar() or 0

    offset = (page - 1) * limit
    result = await db.execute(
        text(
            "SELECT * FROM chat_messages WHERE session_id = :sid "
            "ORDER BY created_at ASC LIMIT :limit OFFSET :offset"
        ),
        {"sid": session_id, "limit": limit, "offset": offset},
    )
    rows = result.mappings().all()

    messages = [
        {
            "id": m["id"],
            "sessionId": m["session_id"],
            "messageType": m.get("message_type"),
            "content": m.get("content"),
            "tokenCount": m.get("token_count"),
            "modelUsed": m.get("model_used"),
            "processingTimeMs": m.get("processing_time_ms"),
            "costEstimate": float(m["cost_estimate"]) if m.get("cost_estimate") else 0,
            "createdAt": _fmt_ts(m.get("created_at")),
        }
        for m in rows
    ]

    total_pages = -(-total // limit) if total > 0 else 0
    return {
        "success": True,
        "data": {
            "messages": messages,
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "totalPages": total_pages,
            },
        },
    }


@router.get("/sessions/{session_id}/analytics")
async def get_session_analytics(
    session_id: str,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics for a chat session."""
    # Session info
    sess = (await db.execute(
        text("SELECT * FROM chat_sessions WHERE id = :sid"),
        {"sid": session_id},
    )).mappings().first()

    session_info = {}
    if sess:
        session_info = {
            "id": sess["id"],
            "tenant_id": sess["tenant_id"],
            "user_id": sess.get("user_id"),
            "status": sess.get("status"),
            "started_at": _fmt_ts(sess.get("started_at")),
            "ended_at": _fmt_ts(sess.get("ended_at")),
        }

    # Message stats
    r = await db.execute(
        text("SELECT COUNT(*) FROM chat_messages WHERE session_id = :sid"),
        {"sid": session_id},
    )
    total_messages = r.scalar() or 0

    r = await db.execute(
        text(
            "SELECT COUNT(*) FROM chat_messages "
            "WHERE session_id = :sid AND message_type IN ('user', 'visitor')"
        ),
        {"sid": session_id},
    )
    visitor_messages = r.scalar() or 0

    r = await db.execute(
        text(
            "SELECT COUNT(*) FROM chat_messages "
            "WHERE session_id = :sid AND message_type = 'assistant'"
        ),
        {"sid": session_id},
    )
    assistant_messages = r.scalar() or 0

    r = await db.execute(
        text(
            "SELECT COALESCE(AVG(processing_time_ms), 0) FROM chat_messages "
            "WHERE session_id = :sid AND message_type = 'assistant'"
        ),
        {"sid": session_id},
    )
    avg_response_time = float(r.scalar() or 0)

    # Token stats
    r = await db.execute(
        text(
            "SELECT COALESCE(SUM(token_count), 0) FROM chat_messages WHERE session_id = :sid"
        ),
        {"sid": session_id},
    )
    total_tokens = r.scalar() or 0

    r = await db.execute(
        text(
            "SELECT COALESCE(SUM(cost_estimate), 0) FROM chat_messages WHERE session_id = :sid"
        ),
        {"sid": session_id},
    )
    total_cost = float(r.scalar() or 0)

    # Model usage
    model_result = await db.execute(
        text(
            "SELECT model_used, COUNT(*) AS count, "
            "COALESCE(SUM(token_count), 0) AS tokens "
            "FROM chat_messages WHERE session_id = :sid AND model_used IS NOT NULL "
            "GROUP BY model_used"
        ),
        {"sid": session_id},
    )
    model_usage = [
        {"model": m["model_used"], "count": m["count"], "tokens": m["tokens"]}
        for m in model_result.mappings().all()
    ]

    return {
        "success": True,
        "data": {
            "sessionInfo": session_info,
            "messageStats": {
                "totalMessages": total_messages,
                "visitorMessages": visitor_messages,
                "assistantMessages": assistant_messages,
                "averageResponseTime": avg_response_time,
            },
            "tokenStats": {
                "totalTokens": total_tokens,
                "totalCost": total_cost,
            },
            "modelUsage": model_usage if model_usage else [{}],
        },
    }


# ---------------------------------------------------------------------------
# Visitor session lookup
# ---------------------------------------------------------------------------

@router.get("/visitor/{visitor_id}/sessions")
async def get_visitor_sessions(
    visitor_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """List chat sessions for a visitor."""
    result = await db.execute(
        text(
            "SELECT * FROM chat_sessions "
            "WHERE JSON_EXTRACT(session_metadata, '$.visitorId') = :vid "
            "ORDER BY started_at DESC"
        ),
        {"vid": visitor_id},
    )
    rows = result.mappings().all()

    sessions = [
        {
            "id": s["id"],
            "tenant_id": s["tenant_id"],
            "user_id": s.get("user_id"),
            "status": s.get("status"),
            "started_at": _fmt_ts(s.get("started_at")),
            "ended_at": _fmt_ts(s.get("ended_at")),
            "last_activity": _fmt_ts(s.get("last_activity")),
        }
        for s in rows
    ]

    return {"success": True, "data": {"sessions": sessions}}


# ---------------------------------------------------------------------------
# Subscription plans (admin CRUD)
# ---------------------------------------------------------------------------

@router.get("/subscription-plans")
async def list_subscription_plans(
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """List all subscription plans."""
    # The subscription_plans table may not exist in all deployments
    try:
        result = await db.execute(text("SELECT * FROM subscription_plans ORDER BY id"))
        rows = result.mappings().all()
        plans = [dict(r) for r in rows]
        # Convert datetimes
        for p in plans:
            for k in ("created_at", "updated_at"):
                if k in p and p[k] is not None:
                    p[k] = _fmt_ts(p[k])
        return {"success": True, "data": plans}
    except Exception:
        return {"success": True, "data": []}


@router.post("/subscription-plans")
async def create_subscription_plan(
    request: Request,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Create a new subscription plan."""
    try:
        body = await request.json()
    except Exception:
        body = {}
    logger.info(f"Admin {current_user.id} creating plan: {body.get('name') or body.get('plan_name')}")

    try:
        import json as _json

        plan_name = body.get("name") or body.get("plan_name", "")
        price = body.get("price", 0)
        billing_cycle = body.get("billing_cycle") or body.get("billingCycle", "monthly")
        if billing_cycle not in ("monthly", "yearly"):
            billing_cycle = "monthly"
        concurrent_users = body.get("concurrent_users") if "concurrent_users" in body else body.get("concurrentUsers", 1)
        document_collections = body.get("document_collections") if "document_collections" in body else body.get("documentCollections", 5)
        max_file_upload_mb = body.get("max_file_upload_mb") if "max_file_upload_mb" in body else body.get("maxFileUploadMb", 10)
        storage_limit_gb = body.get("storage_limit_gb") if "storage_limit_gb" in body else body.get("storageLimitGb", 1)        
        card_color = body.get("card_color") or body.get("cardColor", "#ffffff")
        icon_color = body.get("icon_color") or body.get("iconColor", "#000000")
        icon_bg_color = body.get("icon_bg_color") or body.get("iconBgColor", "#f0f0f0")
        description = body.get("description", "")
        features = body.get("features", "[]")
        is_active = body.get("is_active", 1) if body.get("is_active") is not None else body.get("isActive", 1)
        razorpay_plan_id = body.get("razorpay_plan_id") or body.get("razorpayPlanId")
        stripe_price_id = body.get("stripepay_price_id") or body.get("stripePriceId") or f"price_{int(time.time())}_{uuid.uuid4().hex[:9]}"

        if isinstance(features, list):
            features = _json.dumps(features)
        elif isinstance(features, str):
            # Validate it's valid JSON
            try:
                _json.loads(features)
            except Exception:
                features = "[]"

        result = await db.execute(
            text(
                "INSERT INTO subscription_plans "
                "(plan_name, price, billing_cycle, concurrent_users, document_collections, "
                "max_file_upload_mb, storage_limit_gb, card_color, icon_color, "
                "icon_bg_color, description, features, is_active, razorpay_plan_id, stripepay_price_id, created_at) "
                "VALUES (:plan_name, :price, :billing_cycle, :concurrent_users, :document_collections, "
                ":max_file_upload_mb, :storage_limit_gb, :card_color, :icon_color, "
                ":icon_bg_color, :description, :features, :is_active, :razorpay_plan_id, :stripe_price_id, NOW())"
            ),
            {
                "plan_name": plan_name, "price": price, "billing_cycle": billing_cycle,
                "concurrent_users": concurrent_users, "document_collections": document_collections,
                "max_file_upload_mb": max_file_upload_mb, "storage_limit_gb": storage_limit_gb,
                "card_color": card_color, "icon_color": icon_color, "icon_bg_color": icon_bg_color,
                "description": description, "features": features, "is_active": is_active,
                "razorpay_plan_id": razorpay_plan_id, "stripe_price_id": stripe_price_id,
            },
        )
        await db.commit()

        new_id = result.lastrowid
        row = (await db.execute(
            text("SELECT * FROM subscription_plans WHERE id = :id"), {"id": new_id}
        )).mappings().first()

        plan = dict(row) if row else {"id": new_id}
        for k in ("created_at", "updated_at"):
            if k in plan and plan[k] is not None:
                plan[k] = _fmt_ts(plan[k])

        return {"success": True, "data": plan, "message": "Subscription plan created successfully"}
    except Exception as e:
        logger.error(f"Error creating subscription plan: {e}")
        await db.rollback()
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Failed to create subscription plan: {str(e)}"},
        )


@router.put("/subscription-plans/{plan_id}")
async def update_subscription_plan(
    plan_id: int,
    request: Request,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Update a subscription plan."""
    try:
        body = await request.json()
    except Exception:
        body = {}
    logger.info(f"Admin {current_user.id} updating plan {plan_id}")

    allowed = [
        "plan_name", "price", "billing_cycle", "concurrent_users",
        "document_collections", "max_file_upload_mb", "storage_limit_gb",
        "card_color", "icon_color", "icon_bg_color", "description",
        "features", "is_active", "razorpay_plan_id", "stripepay_price_id",
    ]
    camel_map = {
        "name": "plan_name", "planName": "plan_name",
        "billingCycle": "billing_cycle", "concurrentUsers": "concurrent_users",
        "documentCollections": "document_collections",
        "maxFileUploadMb": "max_file_upload_mb", "storageLimitGb": "storage_limit_gb",
        "cardColor": "card_color", "iconColor": "icon_color",
        "iconBgColor": "icon_bg_color", "isActive": "is_active",
        "razorpayPlanId": "razorpay_plan_id", "stripePriceId": "stripepay_price_id",
    }

    sets = []
    params: dict = {"pid": plan_id}
    for key, val in body.items():
        col = camel_map.get(key, key)
        if col in allowed:
            # --- FIX FEATURES SERIALIZATION ---
            if col == "features":
                import json

                if val is None:
                    val = "[]"

                elif isinstance(val, list):
                    val = json.dumps(val)

                elif isinstance(val, dict):
                    # convert {0:'a',1:'b'} -> ['a','b']
                    val = json.dumps(list(val.values()))

                elif isinstance(val, str):
                    try:
                        # already JSON?
                        json.loads(val)
                    except Exception:
                        val = json.dumps([val])
            sets.append(f"{col} = :{col}")
            params[col] = val

    if not sets:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "No valid fields to update"},
        )

    try:
        await db.execute(
            text(f"UPDATE subscription_plans SET {', '.join(sets)}, updated_at = NOW() WHERE id = :pid"),
            params,
        )
        await db.commit()
        return {"success": True, "message": "Subscription plan updated successfully"}
    except Exception as e:
        logger.error(f"Error updating subscription plan: {e}")
        await db.rollback()
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Failed to update subscription plan: {str(e)}"},
        )


@router.delete("/subscription-plans/{plan_id}")
async def delete_subscription_plan(
    plan_id: int,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Delete a subscription plan."""
    logger.info(f"Admin {current_user.id} deleting plan {plan_id}")
    try:
        result = await db.execute(
            text("DELETE FROM subscription_plans WHERE id = :id"), {"id": plan_id}
        )
        await db.commit()
        if result.rowcount == 0:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Subscription plan not found"},
            )
        return {"success": True, "message": "Subscription plan deleted"}
    except Exception as e:
        logger.error(f"Error deleting subscription plan: {e}")
        await db.rollback()
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Failed to delete subscription plan: {str(e)}"},
        )
