"""
Invoices routes — Invoice retrieval for users & admins.

Mirrors Node.js: src/routes/invoiceRoutes.js
Prefix: /invoices
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user, require_super_admin
from app.core.database import get_db
from app.core.logging import logger

router = APIRouter(prefix="/invoices", tags=["Invoices"])


# ---------------------------------------------------------------------------
# Authenticated user — own invoices
# ---------------------------------------------------------------------------

@router.get("")
async def list_invoices(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List invoices for the authenticated user."""
    logger.info(f"User {current_user.id} listing invoices")
    # TODO: wire up InvoiceRepository.getByUser
    return {
        "success": True,
        "data": [],
        "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 0},
        "message": "Invoices retrieved",
    }


@router.get("/subscription/{subscription_id}")
async def get_invoices_by_subscription(
    subscription_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get invoices for a specific subscription."""
    logger.info(f"User {current_user.id} fetching invoices for subscription {subscription_id}")
    # TODO: wire up InvoiceRepository.getBySubscription
    return {
        "success": True,
        "data": [],
        "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 0},
        "message": "Subscription invoices retrieved",
    }


# ---------------------------------------------------------------------------
# Admin — invoices by user
# -----------------------------------s----------------------------------------

@router.get("/user/{user_id}")
async def get_invoices_by_user(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Admin: list invoices for a specific user."""
    logger.info(f"Admin {current_user.id} fetching invoices for user {user_id}")
    # TODO: wire up InvoiceRepository.getByUser (cross-tenant)
    return {
        "success": True,
        "data": [],
        "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 0},
        "message": "User invoices retrieved",
    }


@router.get("/user/{user_id}/subscription/{subscription_id}")
async def get_user_subscription_invoices(
    user_id: int,
    subscription_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Admin: list invoices for a specific user's subscription."""
    logger.info(
        f"Admin {current_user.id} fetching invoices for user {user_id} "
        f"subscription {subscription_id}"
    )
    # TODO: wire up InvoiceRepository.getByUserSubscription
    return {
        "success": True,
        "data": [],
        "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 0},
        "message": "User subscription invoices retrieved",
    }


# ---------------------------------------------------------------------------
# Single invoice lookup
# ---------------------------------------------------------------------------

@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single invoice by ID."""
    logger.info(f"User {current_user.id} fetching invoice {invoice_id}")
    # TODO: wire up InvoiceRepository.getById
    return {"success": True, "data": None, "message": "Invoice retrieved"}
