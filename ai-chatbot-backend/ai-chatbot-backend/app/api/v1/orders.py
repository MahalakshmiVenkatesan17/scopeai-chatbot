"""
Orders routes — Razorpay order management.

Mirrors Node.js: src/routes/orderRoutes.js
Prefix: /orders
"""

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user
from app.core.database import get_db
from app.core.logging import logger

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("")
async def create_order(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Razorpay order for one-time payment."""
    body = await request.json()
    amount = body.get("amount", 0)
    currency = body.get("currency", "INR")
    receipt = body.get("receipt", "")
    notes = body.get("notes", {})
    logger.info(f"User {current_user.id} creating order (amount={amount}, currency={currency})")
    # TODO: wire up RazorpayService.createOrder — return actual Razorpay response
    import time
    return {
        "success": True,
        "data": {
            "amount": amount,
            "amount_due": amount,
            "amount_paid": 0,
            "attempts": 0,
            "created_at": int(time.time()),
            "currency": currency,
            "entity": "order",
            "id": None,
            "notes": notes,
            "offer_id": None,
            "receipt": receipt,
            "status": "created",
        },
    }


@router.get("")
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List orders for the authenticated user (Razorpay collection format)."""
    logger.info(f"User {current_user.id} listing orders")
    # TODO: wire up RazorpayService.listOrders — return actual Razorpay response
    return {
        "success": True,
        "data": {
            "entity": "collection",
            "count": 0,
            "items": [],
        },
    }


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single order by Razorpay order ID."""
    logger.info(f"User {current_user.id} fetching order {order_id}")
    # TODO: wire up OrderRepository.getById
    return {"success": True, "data": None, "message": "Order retrieved"}


@router.get("/{order_id}/payments")
async def get_order_payments(
    order_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get payments associated with an order (Razorpay collection format)."""
    logger.info(f"User {current_user.id} fetching payments for order {order_id}")
    # TODO: wire up RazorpayService.getOrderPayments — return actual Razorpay response
    return {
        "success": True,
        "data": {
            "entity": "collection",
            "count": 0,
            "items": [],
        },
    }
