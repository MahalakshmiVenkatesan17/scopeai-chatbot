"""
Payments routes — Razorpay payment operations.

Mirrors Node.js: src/routes/paymentRoutes.js
Prefix: /payments
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, require_super_admin
from app.core.database import get_db
from app.core.logging import logger

router = APIRouter(prefix="/payments", tags=["Payments"])


# ---------------------------------------------------------------------------
# Authenticated user — own payments
# ---------------------------------------------------------------------------

@router.get("")
async def list_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List payments for the authenticated user."""
    logger.info(f"User {current_user.id} listing payments")
    # TODO: wire up PaymentRepository.getByUser
    return {
        "success": True,
        "data": [],
        "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 0},
        "message": "Payments retrieved",
    }


@router.get("/active")
async def get_active_payments(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get currently active (successful) payments for the user."""
    from sqlalchemy import text
    result = await db.execute(
        text(
            "SELECT s.* FROM subscriptions s "
            "WHERE s.tenant_id = :tid AND s.subscription_status = 'active' "
            "ORDER BY s.created_at DESC LIMIT 1"
        ),
        {"tid": current_user.tenant_id},
    )
    row = result.mappings().first()
    if not row:
        return {"success": True, "data": None}

    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)

    return {
        "success": True,
        "data": {
            "id": row["id"],
            "user_id": current_user.id,
            "tenant_id": row["tenant_id"],
            "subscription_id": row.get("subscription_id"),
            "plan_id": row.get("plan_id"),
            "plan_name": row.get("plan_name"),
            "payment_id": row.get("payment_id"),
            "amount": float(row.get("amount", 0)),
            "currency": row.get("currency", "INR"),
            "status": row.get("subscription_status"),
            "subscription_status": row.get("subscription_status"),
            "subscribed_date": fmt_ts(row.get("created_at")),
            "payment_date": fmt_ts(row.get("current_period_start")),
            "start_date": fmt_ts(row.get("current_period_start")),
            "end_date": fmt_ts(row.get("current_period_end")),
            "total_count": 0,
            "quantity": 1,
            "notes": {},
            "created_at": fmt_ts(row.get("created_at")),
            "updated_at": fmt_ts(row.get("updated_at")),
        },
    }


@router.get("/filter")
async def filter_payments(
    status: str | None = None,
    method: str | None = None,
    from_date: str | None = Query(None, alias="fromDate"),
    to_date: str | None = Query(None, alias="toDate"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Filter payments by status, method, date range."""
    logger.info(f"User {current_user.id} filtering payments")
    # TODO: wire up PaymentRepository.filter
    return {
        "success": True,
        "data": [],
        "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 0},
        "message": "Payments filtered",
    }


# ---------------------------------------------------------------------------
# Subscription-level payment lookup
# ---------------------------------------------------------------------------

@router.get("/subscription/{subscription_id}")
async def get_payments_by_subscription(
    subscription_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get payments linked to a Razorpay subscription."""
    logger.info(f"User {current_user.id} fetching payments for subscription {subscription_id}")
    # TODO: wire up PaymentRepository.getBySubscription
    return {"success": True, "data": [], "message": "Subscription payments retrieved"}


# ---------------------------------------------------------------------------
# Admin — payments for a specific user
# ---------------------------------------------------------------------------

@router.get("/user/{user_id}")
async def get_payments_by_user(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Admin: list payments for a specific user."""
    from sqlalchemy import text
    # Get the user's tenant, then their subscription
    result = await db.execute(
        text(
            "SELECT s.*, u.id AS user_id FROM subscriptions s "
            "JOIN users u ON u.tenant_id = s.tenant_id "
            "WHERE u.id = :uid "
            "ORDER BY s.created_at DESC LIMIT 1"
        ),
        {"uid": user_id},
    )
    row = result.mappings().first()
    if not row:
        return {"success": True, "data": None}

    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)

    return {
        "success": True,
        "data": {
            "id": row["id"],
            "user_id": row["user_id"],
            "tenant_id": row["tenant_id"],
            "subscription_id": row.get("subscription_id"),
            "plan_id": row.get("plan_id"),
            "plan_name": row.get("plan_name"),
            "payment_id": row.get("payment_id"),
            "amount": float(row.get("amount", 0)),
            "currency": row.get("currency", "INR"),
            "status": row.get("subscription_status"),
            "subscription_status": row.get("subscription_status"),
            "subscribed_date": fmt_ts(row.get("created_at")),
            "payment_date": fmt_ts(row.get("current_period_start")),
            "start_date": fmt_ts(row.get("current_period_start")),
            "end_date": fmt_ts(row.get("current_period_end")),
            "total_count": 0,
            "quantity": 1,
            "notes": {},
            "created_at": fmt_ts(row.get("created_at")),
            "updated_at": fmt_ts(row.get("updated_at")),
        },
    }


# ---------------------------------------------------------------------------
# Capture a payment
# ---------------------------------------------------------------------------

@router.post("/{payment_id}/capture")
async def capture_payment(
    payment_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Capture an authorized Razorpay payment."""
    logger.info(f"User {current_user.id} capturing payment {payment_id}")
    # TODO: wire up RazorpayService.capturePayment
    # Return Razorpay payment object structure (placeholder)
    return {
        "success": True,
        "data": {
            "id": payment_id,
            "entity": "payment",
            "amount": 0,
            "currency": "INR",
            "status": "captured",
            "order_id": None,
            "invoice_id": None,
            "international": False,
            "method": None,
            "amount_refunded": 0,
            "refund_status": None,
            "captured": True,
            "description": None,
            "card_id": None,
            "bank": None,
            "wallet": None,
            "vpa": None,
            "email": current_user.email,
            "contact": None,
            "customer_id": None,
            "notes": {},
            "fee": 0,
            "tax": 0,
        },
    }
