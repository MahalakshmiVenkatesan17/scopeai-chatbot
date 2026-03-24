"""
Plans routes — Public & admin CRUD for subscription plans.

Mirrors Node.js: src/routes/planRoutes.js
Prefix: /plans
"""

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_super_admin
from app.core.database import get_db
from app.core.logging import logger

router = APIRouter(prefix="/plans", tags=["Plans"])


# ---------------------------------------------------------------------------
# Admin — create a plan
# ---------------------------------------------------------------------------

@router.post("")
async def create_plan(
    request: Request,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Create a new subscription plan (admin only)."""
    import time as _time
    body = await request.json()
    logger.info(f"Admin {current_user.id} creating plan: {body.get('name')}")
    # Return Razorpay plan object structure (placeholder until Razorpay integration)
    return {
        "success": True,
        "data": {
            "id": f"plan_{body.get('name', 'new')[:8]}",
            "entity": "plan",
            "interval": body.get("interval", 1),
            "period": body.get("period", "monthly"),
            "item": {
                "id": None,
                "active": True,
                "name": body.get("name"),
                "description": body.get("description"),
                "amount": body.get("amount", 0),
                "currency": body.get("currency", "INR"),
            },
            "notes": body.get("notes", {}),
            "created_at": int(_time.time()),
        },
    }


# ---------------------------------------------------------------------------
# Public — list & get plans
# ---------------------------------------------------------------------------

@router.get("")
async def list_plans(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    active_only: bool = Query(True, alias="activeOnly"),
    db: AsyncSession = Depends(get_db),
):
    """List all available subscription plans (Razorpay collection format)."""
    # TODO: wire up RazorpayService.listPlans — return actual Razorpay response
    return {
        "success": True,
        "data": {
            "entity": "collection",
            "count": 0,
            "items": [],
        },
    }


@router.get("/{plan_id}")
async def get_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single plan by ID (Razorpay plan object format)."""
    # TODO: wire up RazorpayService.getPlan — return actual Razorpay response
    return {
        "success": True,
        "data": {
            "id": plan_id,
            "entity": "plan",
            "interval": 1,
            "period": "monthly",
            "item": {
                "id": None,
                "active": True,
                "name": None,
                "description": None,
                "amount": 0,
                "currency": "INR",
            },
            "notes": {},
            "created_at": None,
        },
    }


# ---------------------------------------------------------------------------
# Admin — delete a plan
# ---------------------------------------------------------------------------

@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: int,
    current_user: CurrentUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db),
):
    """Delete a subscription plan (admin only)."""
    logger.info(f"Admin {current_user.id} deleting plan {plan_id}")
    # TODO: wire up SubscriptionPlanService.delete
    return {"success": True, "message": "Plan deleted"}
