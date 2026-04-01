"""
Subscriptions routes — Razorpay subscription lifecycle.

Mirrors Node.js: src/routes/subscriptionRoutes.js
Prefix: /subscriptions
"""

import hmac
import hashlib
import json

from fastapi import APIRouter, Depends, Query, Request, HTTPException
from sqlalchemy import text
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.logging import logger

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


# ---------------------------------------------------------------------------
# Public (no auth)
# ---------------------------------------------------------------------------

@router.get("/test")
async def test_subscriptions():
    """Health-check for the subscriptions module."""
    return {"success": True, "data": None, "message": "Subscriptions route is working"}


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Razorpay webhook receiver.

    Accepts raw body and verifies the X-Razorpay-Signature header using
    RAZORPAY_KEY_SECRET (if configured). In development mode without a secret,
    allows unauthenticated webhooks for testing.
    """
    from app.services.razorpay_webhook_service import RazorpayWebhookService

    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    # Verify signature only if secret is configured
    if settings.RAZORPAY_KEY_SECRET:
        expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            logger.warning("Razorpay webhook signature mismatch")
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": {"code": "INVALID_SIGNATURE", "message": "Invalid webhook signature"}},
            )
    else:
        # In development without a secret, log warning but allow webhook
        if settings.is_development:
            logger.warning("Razorpay webhook secret not configured; allowing unauthenticated webhook for testing")
        else:
            logger.error("Razorpay webhook secret not configured in production!")
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": {"code": "MISSING_SECRET", "message": "Webhook secret not configured"}},
            )

    # Parse after verification
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": {"code": "INVALID_BODY", "message": "Invalid JSON body"}},
        )

    event = payload.get("event", "unknown")
    logger.info(f"Razorpay webhook received: {event}")

    # Route to service handler
    try:
        service = RazorpayWebhookService(db)
        result = await service.handle(event, payload)
        return {
            "success": result.get("success", True),
            "message": result.get("message", f"Webhook processed: {event}"),
            "data": result,
        }
    except Exception as e:
        logger.error(f"Error processing Razorpay webhook: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": {"code": "WEBHOOK_ERROR", "message": str(e)}},
        )


@router.post("/stripe-webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Stripe webhook receiver.

    Verifies the Stripe-Signature header and processes webhook events.
    Requires STRIPE_WEBHOOK_SECRET in settings.
    """
    from app.services.stripe_webhook_service import StripeWebhookService

    raw_body = await request.body()
    stripe_signature = request.headers.get("Stripe-Signature", "")

    # Verify signature
    if settings.STRIPE_WEBHOOK_SECRET:
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            event = stripe.Webhook.construct_event(
                raw_body, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            logger.warning(f"Stripe webhook signature verification failed: {str(e)}")
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": {"code": "INVALID_SIGNATURE", "message": "Invalid webhook signature"}},
            )
    else:
        try:
            payload = await request.json()
            event = payload
        except Exception:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": {"code": "INVALID_BODY", "message": "Invalid JSON body"}},
            )

    event_type = event.get("type", "unknown")
    logger.info(f"Stripe webhook received: {event_type}")

    # Route to service handler
    try:
        service = StripeWebhookService(db)
        result = await service.handle(event_type, event)
        return {
            "success": result.get("success", True),
            "message": result.get("message", f"Webhook processed: {event_type}"),
            "data": result,
        }
    except Exception as e:
        logger.error(f"Error processing Stripe webhook: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": {"code": "WEBHOOK_ERROR", "message": str(e)}},
        )


# ---------------------------------------------------------------------------
# Authenticated
# ---------------------------------------------------------------------------

@router.get("/config")
async def get_subscription_config(
    current_user: CurrentUser = Depends(get_current_user),
):
    """Return Razorpay public config (key_id, etc.)."""
    return {
        "success": True,
        "data": {
            "razorpayKeyId": settings.RAZORPAY_KEY_ID,
            "currency": "INR",
        },
        "message": "Subscription config retrieved",
    }


@router.post("")
async def create_subscription(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Razorpay subscription for the current user."""
    from sqlalchemy import text
    from datetime import datetime, timedelta, timezone
    from app.services.razorpay_service import razorpay_service
    import time

    body = await request.json()
    plan_id = body.get("plan_id") or body.get("planId")
    if not plan_id:
        raise HTTPException(status_code=400, detail="planId is required for paid subscriptions")
    
    notes = body.get("notes", {})
    
    # Extract plan_name from notes or top-level
    plan_name = body.get("planName") or body.get("plan_name") or notes.get("plan_name")
    if not plan_name:
        raise HTTPException(status_code=400, detail="planName is required for paid subscriptions")
    
    # Extract billing details from notes or top-level
    billing_cycle = body.get("billingCycle") or body.get("billing_cycle") or notes.get("billing_cycle", "monthly")
    
    # Extract amount - check for None explicitly to allow 0 as valid value
    if body.get("amount") is not None:
        amount = int(body.get("amount")) if body.get("amount") else 0
    else:
        billing_price = notes.get("billing_price")
        amount = int(billing_price) if billing_price else 0
    
    currency = body.get("currency", "INR")
    payment_type = body.get("paymentType") or body.get("payment_type", "razorpay")
    total_count = body.get("total_count", 12)
    quantity = body.get("quantity", 1)
    customer_notify = body.get("customer_notify", 1)
    
    logger.info(f"User {current_user.id} creating subscription for plan {plan_id}")

    try:
        # Create Razorpay subscription via API
        razorpay_response = razorpay_service.create_subscription(
            plan_id=plan_id,
            total_count=total_count,
            quantity=quantity,
            customer_notify=customer_notify,
            notes=notes,
        )
        
        if not razorpay_response or "error" in razorpay_response:
            error_msg = razorpay_response.get("error", {}).get("description", "Unknown error") if razorpay_response else "Failed to create subscription"
            logger.error(f"Razorpay API error: {error_msg}")
            raise HTTPException(status_code=400, detail=f"Failed to create subscription: {error_msg}")
        
        subscription_id = razorpay_response.get("id")
        razorpay_status = razorpay_response.get("status")
        
        now = datetime.now(timezone.utc)
        period_end = now + timedelta(days=30 if billing_cycle.lower() == "monthly" else 365)
        
        # Store in local database for reference
        result = await db.execute(
            text(
                "INSERT INTO subscriptions "
                "(tenant_id, plan_id, plan_name, subscription_status, billing_cycle, amount, currency, "
                "payment_type, subscription_id, current_period_start, current_period_end, created_at, updated_at) "
                "VALUES (:tid, :plan_id, :plan_name, :status, :billing_cycle, :amount, :currency, "
                ":payment_type, :sub_id, :period_start, :period_end, NOW(), NOW())"
            ),
            {
                "tid": current_user.tenant_id,
                "plan_id": plan_id,
                "plan_name": plan_name,
                "status": razorpay_status or "created",
                "billing_cycle": billing_cycle,
                "amount": amount,
                "currency": currency,
                "payment_type": payment_type,
                "sub_id": subscription_id,
                "period_start": now,
                "period_end": period_end,
            },
        )
        await db.commit()

        subscription_db_id = result.lastrowid
        
        # Create a payment record (for invoice tracking)
        invoice_number = f"INV-{subscription_db_id}-{int(time.time())}"
        payment_result = await db.execute(
            text(
                "INSERT INTO invoices "
                "(tenant_id, subscription_id, invoice_number, status, amount_due, currency, created_at) "
                "VALUES (:tid, :sub_db_id, :invoice_num, 'draft', :amount, :currency, NOW())"
            ),
            {
                "tid": current_user.tenant_id,
                "sub_db_id": subscription_db_id,
                "invoice_num": invoice_number,
                "amount": amount,
                "currency": currency,
            },
        )
        await db.commit()
        
        payment_record_id = payment_result.lastrowid
        
        # Build a local invoice payload and store it on the subscription (invoice_data)
        import json

        invoice_payload = {
            "id": invoice_number,
            "invoice_id": invoice_number,
            "invoice_number": invoice_number,
            "db_id": payment_record_id,
            "amount": amount,
            "currency": currency,
            "status": "draft",
            "created_at": now.isoformat() + "Z",
        }

        try:
            await db.execute(
                text("UPDATE subscriptions SET invoice_data = :inv_json WHERE id = :id"),
                {"inv_json": json.dumps(invoice_payload), "id": subscription_db_id},
            )
            await db.commit()
        except Exception:
            # best-effort: don't fail subscription creation if invoice_data update fails
            await db.rollback()
            logger.warning(f"Failed to set invoice_data on subscription {subscription_db_id}")

        # Return response in Razorpay subscription format and include local invoice info
        return {
            "success": True,
            "data": {
                "subscription": razorpay_response,
                "paymentRecordId": payment_record_id,
                "invoice": invoice_payload,
            },
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create subscription: {str(e)}")


@router.post("/verify-payment")
async def verify_payment(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify a Razorpay payment after checkout and activate subscription."""
    from sqlalchemy import text
    from datetime import datetime, timedelta, timezone
    
    body = await request.json()
    
    # Accept both Razorpay field names and alternate naming
    subscription_id = (
        body.get("razorpay_subscription_id") or 
        body.get("subscription_id") or 
        body.get("sub_id")
    )
    payment_id = (
        body.get("razorpay_payment_id") or 
        body.get("payment_id") or 
        body.get("pay_id")
    )
    razorpay_signature = body.get("razorpay_signature")
    
    if not subscription_id:
        raise HTTPException(status_code=400, detail="subscription_id (razorpay_subscription_id) is required")
    
    logger.info(f"User {current_user.id} verifying payment for subscription {subscription_id}")
    
    try:
        # Find the subscription in database
        result = await db.execute(
            text(
                "SELECT id, subscription_status FROM subscriptions "
                "WHERE subscription_id = :sub_id AND tenant_id = :tid"
            ),
            {"sub_id": subscription_id, "tid": current_user.tenant_id}
        )
        row = result.first()
        
        if not row:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        subscription_db_id = row[0]
        
        # Update subscription status to active
        await db.execute(
            text(
                "UPDATE subscriptions SET subscription_status = :status, updated_at = NOW() "
                "WHERE id = :id"
            ),
            {"status": "active", "id": subscription_db_id}
        )
        
        # Update associated invoice status to paid if exists
        if payment_id:
            await db.execute(
                text(
                    "UPDATE invoices SET status = :status "
                    "WHERE subscription_id = :sub_id"
                ),
                {"status": "paid", "sub_id": subscription_db_id}
            )
            
            # Also synchronize the invoice_data field on the subscription
            try:
                # Fetch current invoice_data
                res = await db.execute(
                    text("SELECT invoice_data FROM subscriptions WHERE id = :id"),
                    {"id": subscription_db_id}
                )
                row_inv = res.first()
                if row_inv and row_inv[0]:
                    inv_json = json.loads(row_inv[0])
                    if isinstance(inv_json, dict):
                        inv_json["status"] = "paid"
                        inv_json["payment_id"] = payment_id
                        await db.execute(
                            text("UPDATE subscriptions SET invoice_data = :data WHERE id = :id"),
                            {"data": json.dumps(inv_json), "id": subscription_db_id}
                        )
                    elif isinstance(inv_json, list) and len(inv_json) > 0:
                        # If list (Stripe style), update the first/matching one
                        inv_json[0]["status"] = "paid"
                        await db.execute(
                            text("UPDATE subscriptions SET invoice_data = :data WHERE id = :id"),
                            {"data": json.dumps(inv_json), "id": subscription_db_id}
                        )
            except Exception as e:
                logger.warning(f"Failed to sync invoice_data in verify_payment: {e}")
        
        await db.commit()
        
        logger.info(f"Subscription {subscription_id} activated successfully with payment {payment_id}")
        
        return {
            "success": True,
            "message": "Subscription payment verified successfully",
            "data": {
                "subscription_id": subscription_id,
                "payment_id": payment_id or None,
                "status": "active"
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to verify payment: {str(e)}")


@router.get("")
async def list_subscriptions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List subscriptions for the authenticated user (Razorpay collection format)."""
    from sqlalchemy import text
    query = (
        "SELECT * FROM subscriptions WHERE tenant_id = :tid"
    )
    params = {"tid": current_user.tenant_id}
    if status:
        query += " AND subscription_status = :status"
        params["status"] = status
    query += " ORDER BY created_at DESC"

    result = await db.execute(text(query), params)
    rows = result.mappings().all()

    items = []
    for row in rows:
        items.append({
            "id": row.get("subscription_id") or f"sub_{row['id']}",
            "entity": "subscription",
            "plan_id": row.get("plan_id"),
            "customer_id": row.get("stripe_customer_id"),
            "email": current_user.email,
            "status": row.get("subscription_status"),
            "current_end": int(row["current_period_end"].timestamp()) if row.get("current_period_end") else None,
            "quantity": 1,
            "notes": {},
        })

    return {
        "success": True,
        "data": {
            "entity": "collection",
            "count": len(items),
            "items": items,
        },
    }


@router.get("/active-plans")
async def get_active_plans(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import text

    user_role = getattr(current_user, 'role', '') or ''
    is_superadmin = user_role.lower().replace('_', '') == 'superadmin'

    logger.info(f"get_active_plans: user_role='{user_role}', is_superadmin={is_superadmin}")

    if is_superadmin:
        # ✅ Get only the LATEST active subscription per tenant
        # Subquery finds the max id per tenant where status is active,
        # then we join back to get full row details
        count_query = """
            SELECT COUNT(DISTINCT s.tenant_id)
            FROM subscriptions s
            INNER JOIN (
                SELECT tenant_id, MAX(id) AS max_id
                FROM subscriptions
                WHERE subscription_status = 'active'
                GROUP BY tenant_id
            ) latest ON s.id = latest.max_id
        """
        count_params = {}

        data_query = """
            SELECT s.*, t.name AS tenant_name
            FROM subscriptions s
            INNER JOIN (
                SELECT tenant_id, MAX(id) AS max_id
                FROM subscriptions
                WHERE subscription_status = 'active'
                GROUP BY tenant_id
            ) latest ON s.id = latest.max_id
            JOIN tenants t ON t.id = s.tenant_id
            ORDER BY s.created_at DESC
            LIMIT :lim OFFSET :off
        """
        data_params_base = {}

    else:
        # Tenant admin: latest active subscription for their tenant only
        count_query = """
            SELECT COUNT(*)
            FROM subscriptions s
            INNER JOIN (
                SELECT tenant_id, MAX(id) AS max_id
                FROM subscriptions
                WHERE subscription_status = 'active' AND tenant_id = :tid
                GROUP BY tenant_id
            ) latest ON s.id = latest.max_id
        """
        count_params = {"tid": current_user.tenant_id}

        data_query = """
            SELECT s.*, t.name AS tenant_name
            FROM subscriptions s
            INNER JOIN (
                SELECT tenant_id, MAX(id) AS max_id
                FROM subscriptions
                WHERE subscription_status = 'active' AND tenant_id = :tid
                GROUP BY tenant_id
            ) latest ON s.id = latest.max_id
            JOIN tenants t ON t.id = s.tenant_id
            ORDER BY s.created_at DESC
            LIMIT :lim OFFSET :off
        """
        data_params_base = {"tid": current_user.tenant_id}

    # Count total
    r = await db.execute(text(count_query), count_params)
    total = r.scalar() or 0

    # Paginated data
    offset = (page - 1) * limit
    data_params = {**data_params_base, "lim": limit, "off": offset}

    result = await db.execute(text(data_query), data_params)
    rows = result.mappings().all()

    # Get latest invoice per subscription
    invoice_map = {}
    if rows:
        sub_ids = [row["id"] for row in rows]
        placeholders = ",".join([str(sid) for sid in sub_ids])
        try:
            inv_result = await db.execute(
                text(
                    f"SELECT subscription_id, id AS invoice_id, amount_paid, status AS invoice_status, paid_at "
                    f"FROM invoices WHERE subscription_id IN ({placeholders}) "
                    f"ORDER BY created_at DESC"
                )
            )
            for inv in inv_result.mappings().all():
                sid = inv["subscription_id"]
                if sid not in invoice_map:
                    invoice_map[sid] = inv
        except Exception as e:
            logger.warning(f"Invoice fetch failed: {e}")

    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)

    data = []
    for row in rows:
        inv = invoice_map.get(row["id"], {})
        data.append({
            "id": row["id"],
            "tenant_id": row["tenant_id"],
            "name": row.get("tenant_name"),
            "plan_id": row.get("plan_id"),
            "plan_name": row.get("plan_name"),
            "subscription_status": row.get("subscription_status"),
            "billing_cycle": row.get("billing_cycle"),
            "amount": str(row.get("amount", "0.00")),
            "currency": row.get("currency", "INR"),
            "subscription_id": row.get("subscription_id"),
            "current_period_start": fmt_ts(row.get("current_period_start")),
            "current_period_end": fmt_ts(row.get("current_period_end")),
            "cancelled_at": fmt_ts(row.get("cancelled_at")),
            "created_at": fmt_ts(row.get("created_at")),
            "updated_at": fmt_ts(row.get("updated_at")),
            "payment_id": None,
            "invoice_id": inv.get("invoice_id"),
            "invoice_data": {
                "amount_paid": float(inv["amount_paid"]) if inv.get("amount_paid") else None,
                "status": inv.get("invoice_status"),
                "paid_at": fmt_ts(inv.get("paid_at")),
            } if inv else None,
            "total_count": 0,
            "quantity": 1,
            "notes": {},
        })

    total_pages = -(-total // limit) if total > 0 else 0
    return {
        "success": True,
        "data": data,
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": total_pages},
    }

@router.get("/details")
async def get_subscription_details(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed subscription info for the current user."""
    from sqlalchemy import text

    result = await db.execute(
        text(
            "SELECT s.*, t.name AS tenant_name "
            "FROM subscriptions s "
            "JOIN tenants t ON t.id = s.tenant_id "
            "WHERE s.tenant_id = :tid "
            "ORDER BY s.created_at DESC"
        ),
        {"tid": current_user.tenant_id},
    )
    rows = result.mappings().all()

    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)

    data = []
    for row in rows:
        data.append({
            "id": row["id"],
            "tenant_id": row["tenant_id"],
            "plan_id": row.get("plan_id"),
            "plan_name": row.get("plan_name"),
            "subscription_status": row.get("subscription_status"),
            "billing_cycle": row.get("billing_cycle"),
            "amount": str(row.get("amount", "0.00")),
            "currency": row.get("currency", "USD"),
            "subscription_id": row.get("subscription_id"),
            "payment_id": row.get("payment_id"),
            "payment_type": row.get("payment_type"),
            "current_period_start": fmt_ts(row.get("current_period_start")),
            "current_period_end": fmt_ts(row.get("current_period_end")),
            "cancelled_at": fmt_ts(row.get("cancelled_at")),
            "created_at": fmt_ts(row.get("created_at")),
            "updated_at": fmt_ts(row.get("updated_at")),
        })

    return {"success": True, "data": data, "message": "Subscription details retrieved"}


# ---------------------------------------------------------------------------
# Invoices (under subscriptions context)
# ---------------------------------------------------------------------------

@router.get("/invoices")
async def list_subscription_invoices(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List invoices for the authenticated user's subscriptions."""
    from sqlalchemy import text
    import json

    # 1. Fetch all subscriptions for this tenant to handle Stripe JSON data & statuses
    sub_result = await db.execute(
        text(
            "SELECT id, plan_name, billing_cycle, subscription_status, invoice_data, payment_type "
            "FROM subscriptions WHERE tenant_id = :tid"
        ),
        {"tid": current_user.tenant_id},
    )
    sub_rows = sub_result.mappings().all()
    
    # Map sub_id to status and other metadata for easy lookup
    sub_map = {row["id"]: row for row in sub_rows}
    
    # 2. Extract "virtual" invoices from subscriptions with invoice_data (typically Stripe)
    all_combined_invoices = []
    
    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)

    for sub in sub_rows:
        inv_data = sub.get("invoice_data")
        if inv_data:
            try:
                # Stripe stores it as a list of dicts stringified or a single dict
                data_list = []
                if isinstance(inv_data, str):
                    parsed = json.loads(inv_data)
                    data_list = parsed if isinstance(parsed, list) else [parsed]
                elif isinstance(inv_data, list):
                    data_list = inv_data
                elif isinstance(inv_data, dict):
                    data_list = [inv_data]
                
                for entry in data_list:
                    # Map JSON fields to our common response format
                    # Re-map amount/amount_due to be numeric/string appropriately
                    amt = entry.get("amount") or entry.get("amount_paid") or 0
                    all_combined_invoices.append({
                        "id": entry.get("invoice_id") or f"sub_{sub['id']}_inv",
                        "invoice_id": entry.get("invoice_id"),
                        "tenant_id": current_user.tenant_id,
                        "subscription_id": sub["id"],
                        "subscription_status": sub["subscription_status"],
                        "invoice_number": entry.get("invoice_number"),
                        "status": entry.get("status") or "paid",
                        "amount": str(amt),
                        "amount_due": float(amt),
                        "amount_paid": float(amt),
                        "currency": entry.get("currency") or "USD",
                        "method": entry.get("method") or sub["billing_cycle"] or "card",
                        "plan_name": sub["plan_name"] or "",
                        "short_url": entry.get("short_url") or "",
                        "stripe_invoice_id": entry.get("invoice_id") if sub["payment_type"] == "stripe" else None,
                        "due_date": entry.get("payment_date") or entry.get("paid_at"),
                        "paid_at": entry.get("paid_at") or entry.get("payment_date"),
                        "created_at": entry.get("paid_at") or entry.get("payment_date"),
                    })
            except Exception as e:
                logger.warning(f"Error parsing invoice_data for subscription {sub['id']}: {e}")

    # 3. Fetch from the dedicated invoices table (typically Razorpay)
    result = await db.execute(
        text(
            "SELECT i.*, s.plan_name, s.billing_cycle, s.subscription_status "
            "FROM invoices i "
            "LEFT JOIN subscriptions s ON i.subscription_id = s.id "
            "WHERE i.tenant_id = :tid "
            "ORDER BY i.created_at DESC"
        ),
        {"tid": current_user.tenant_id},
    )
    db_invoice_rows = result.mappings().all()
    
    for row in db_invoice_rows:
        # Avoid duplicates if the subscription already used invoice_data (Stripe)
        # But usually Razorpay doesn't use invoice_data, it uses the table.
        # We can check if the invoice number already exists in all_combined_invoices
        if any(inv["invoice_number"] == row.get("invoice_number") for inv in all_combined_invoices if inv.get("invoice_number")):
            continue
            
        amount_due_raw = row.get("amount_due") if row.get("amount_due") is not None else row.get("amount")
        amount_paid_raw = row.get("amount_paid") if row.get("amount_paid") is not None else 0
        
        all_combined_invoices.append({
            "id": row.get("id"),
            "invoice_id": row.get("id"),
            "tenant_id": row.get("tenant_id"),
            "subscription_id": row.get("subscription_id"),
            "subscription_status": row.get("subscription_status") or "active",
            "invoice_number": row.get("invoice_number"),
            "status": row.get("status"),
            "amount": str(amount_due_raw) if amount_due_raw is not None else "0.00",
            "amount_due": float(amount_due_raw) if amount_due_raw is not None else 0.0,
            "amount_paid": float(amount_paid_raw) if amount_paid_raw is not None else 0.0,
            "currency": row.get("currency") or "USD",
            "method": row.get("method") or row.get("billing_cycle") or "monthly",
            "plan_name": row.get("plan_name") or "",
            "short_url": "", # Razorpay doesn't typically store hosted URL in our table
            "stripe_invoice_id": row.get("stripe_invoice_id") or row.get("stripe_id") or None,
            "due_date": str(row.get("due_date")) if row.get("due_date") else None,
            "paid_at": fmt_ts(row.get("paid_at")),
            "created_at": fmt_ts(row.get("created_at")),
        })

    # 4. Sort combined list by created_at descending
    all_combined_invoices.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    
    # 5. Manual pagination
    total = len(all_combined_invoices)
    offset = (page - 1) * limit
    paginated_invoices = all_combined_invoices[offset : offset + limit]
    
    total_pages = -(-total // limit) if total > 0 else 0
    
    return {
        "success": True,
        "data": paginated_invoices,
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": total_pages},
        "message": "Invoices retrieved",
    }


@router.get("/invoices/{invoice_id}")
async def get_subscription_invoice(
    invoice_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single invoice by ID."""
    logger.info(f"User {current_user.id} fetching invoice {invoice_id}")
    # TODO: wire up InvoiceRepository.getById
    return {"success": True, "data": None, "message": "Invoice retrieved"}


@router.post("/invoices")
async def create_invoice(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create an invoice record in the gateway (optional) and store it in the local DB.

    Accepts a body with an `invoice` object (Razorpay response) or the same fields.
    """
    from sqlalchemy import text
    import json

    body = await request.json()

    invoice = body.get("invoice") or body

    invoice_id = invoice.get("id") or invoice.get("invoice_id")
    if not invoice_id:
        raise HTTPException(status_code=400, detail="invoice.id (gateway invoice id) is required")

    customer_id = None
    if isinstance(invoice.get("customer"), dict):
        customer_id = invoice.get("customer").get("customer_id")
    customer_id = customer_id or invoice.get("customer_id") or invoice.get("customerId")

    # Amount from gateway is usually in smallest currency unit (paise); convert to main unit
    raw_amount = invoice.get("amount") or invoice.get("amount_due") or invoice.get("total") or 0
    try:
        amount_due = float(raw_amount) / 100.0 if raw_amount and float(raw_amount) > 1000 else float(raw_amount) if raw_amount else 0.0
    except Exception:
        amount_due = 0.0

    currency = invoice.get("currency") or invoice.get("currency_code") or "INR"
    description = invoice.get("description") or invoice.get("notes", {}).get("description") or ""
    status = invoice.get("status") or "draft"
    invoice_type = invoice.get("type") or invoice.get("invoice_type") or None

    expire_by = None
    if invoice.get("expire_by"):
        try:
            expire_by = invoice.get("expire_by")
        except Exception:
            expire_by = None

    issued_at = None
    if invoice.get("issued_at"):
        try:
            issued_at = invoice.get("issued_at")
        except Exception:
            issued_at = None

    short_url = invoice.get("short_url") or invoice.get("shortUrl") or None
    notes_json = json.dumps(invoice.get("notes") or {})

    try:
        res = await db.execute(
            text(
                "INSERT INTO invoices (tenant_id, user_id, invoice_id, customer_id, amount_due, amount_paid, currency, description, status, invoice_type, expire_by, issued_at, short_url, notes, created_at, updated_at) "
                "VALUES (:tid, :uid, :invoice_id, :customer_id, :amount_due, 0, :currency, :description, :status, :invoice_type, :expire_by, :issued_at, :short_url, :notes, NOW(), NOW())"
            ),
            {
                "tid": current_user.tenant_id,
                "uid": current_user.id,
                "invoice_id": invoice_id,
                "customer_id": customer_id,
                "amount_due": amount_due,
                "currency": currency,
                "description": description,
                "status": status,
                "invoice_type": invoice_type,
                "expire_by": expire_by,
                "issued_at": issued_at,
                "short_url": short_url,
                "notes": notes_json,
            },
        )
        await db.commit()
        db_id = res.lastrowid

        # Attempt to link invoice to an existing subscription and store invoice JSON on subscription
        try:
            # Determine subscription db id from invoice payload if provided
            sub_db_id = None
            # Case 1: invoice contains subscription (db id)
            if invoice.get("subscription") and isinstance(invoice.get("subscription"), dict):
                # subscription object may contain id or subscription_id
                sub_obj = invoice.get("subscription")
                sub_db_id = sub_obj.get("id") or sub_obj.get("db_id")

            # Case 2: invoice contains subscription_id that matches subscriptions.subscription_id
            if not sub_db_id and invoice.get("subscription_id"):
                q = await db.execute(
                    text(
                        "SELECT id FROM subscriptions WHERE subscription_id = :sub_id AND tenant_id = :tid"
                    ),
                    {"sub_id": invoice.get("subscription_id"), "tid": current_user.tenant_id},
                )
                r = q.first()
                if r:
                    sub_db_id = r[0]

            # If we found a subscription id, update invoices.subscription_id and subscriptions.invoice_data
            if sub_db_id:
                await db.execute(
                    text("UPDATE invoices SET subscription_id = :sub_db_id WHERE id = :id"),
                    {"sub_db_id": sub_db_id, "id": db_id},
                )

                # Store the raw invoice payload as JSON into subscriptions.invoice_data
                try:
                    await db.execute(
                        text("UPDATE subscriptions SET invoice_data = :inv_json WHERE id = :id"),
                        {"inv_json": json.dumps(invoice), "id": sub_db_id},
                    )
                except Exception:
                    # best-effort: don't fail the whole request if subscription update fails
                    logger.warning(f"Failed to update subscription.invoice_data for subscription {sub_db_id}")

            await db.commit()

        except Exception:
            # swallow linking errors to avoid breaking invoice creation
            await db.rollback()

        return {"success": True, "data": {"invoice_id": invoice_id, "dbId": db_id}, "message": "Invoice created"}

    except Exception as e:
        logger.error(f"Error creating invoice record: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create invoice record: {str(e)}")


# ---------------------------------------------------------------------------
# Payment transactions (under subscriptions context)
# NOTE: These MUST be defined before /{subscription_id} to avoid the path
#       parameter from matching "payments" as a subscription_id.
# ---------------------------------------------------------------------------

@router.get("/payments/transactions")
async def list_payment_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List payment transactions for the authenticated user."""
    logger.info(f"User {current_user.id} listing payment transactions")
    # TODO: wire up PaymentTransactionRepository.getByUser
    return {
        "success": True,
        "data": [],
        "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 0},
        "message": "Payment transactions retrieved",
    }


@router.get("/payments/transactions/{transaction_id}")
async def get_payment_transaction(
    transaction_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single payment transaction by ID."""
    logger.info(f"User {current_user.id} fetching transaction {transaction_id}")
    # TODO: wire up PaymentTransactionRepository.getById
    return {"success": True, "data": None, "message": "Transaction retrieved"}


# ---------------------------------------------------------------------------
# Individual subscription operations
# NOTE: /{subscription_id} catch-all routes MUST be last in the router.
# ---------------------------------------------------------------------------

@router.get("/{subscription_id}")
async def get_subscription(
    subscription_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single subscription by Razorpay subscription ID."""
    logger.info(f"User {current_user.id} fetching subscription {subscription_id}")
    # TODO: wire up SubscriptionRepository.getById
    return {"success": True, "data": None, "message": "Subscription retrieved"}


@router.post("/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a Razorpay subscription and downgrade tenant to free plan."""
    from sqlalchemy import text
    from datetime import datetime, timezone

    body = await request.json()
    cancel_at_end = body.get("cancelAtEnd", True)
    logger.info(
        f"User {current_user.id} cancelling subscription {subscription_id} "
        f"(cancelAtEnd={cancel_at_end})"
    )

    if not (hasattr(current_user, "tenant_id") and current_user.tenant_id):
        raise HTTPException(status_code=400, detail="No tenant_id found for user.")

    tid = current_user.tenant_id

    try:
        # ----------------------------------------------------------------
        # Step 1: Verify tenant exists
        # ----------------------------------------------------------------
        before_result = await db.execute(
            text("SELECT id, subscription_plan FROM tenants WHERE id = :id"),
            {"id": tid},
        )
        before = before_result.mappings().first()
        if not before:
            raise HTTPException(status_code=404, detail=f"Tenant {tid} not found.")
        logger.info(f"Tenant BEFORE cancel: {dict(before)}")

        # ----------------------------------------------------------------
        # Step 2: Mark the SPECIFIC subscription as cancelled
        # ----------------------------------------------------------------
        sub_result = await db.execute(
            text(
                "UPDATE subscriptions "
                "SET subscription_status = 'cancelled', "
                "    cancelled_at = NOW(), "
                "    updated_at   = NOW() "
                "WHERE tenant_id = :tid AND subscription_id = :sub_id "
                "  AND subscription_status NOT IN ('cancelled', 'expired')"
            ),
            {"tid": tid, "sub_id": subscription_id},
        )
        logger.info(f"Subscription {subscription_id} marked cancelled: {sub_result.rowcount} row(s)")

        # ----------------------------------------------------------------
        # Step 3: Check if there are ANY other active subscriptions left
        # ----------------------------------------------------------------
        other_active_result = await db.execute(
            text(
                "SELECT id, plan_name FROM subscriptions "
                "WHERE tenant_id = :tid AND subscription_status = 'active' "
                "ORDER BY created_at DESC LIMIT 1"
            ),
            {"tid": tid},
        )
        other_active = other_active_result.mappings().first()
        
        next_plan_name = "free"
        
        if other_active:
            # Another active plan exists, use its name
            next_plan_name = other_active["plan_name"]
            logger.info(f"Another active plan found: {next_plan_name}. Skipping free plan insertion.")
        else:
            # No other active plans, insert/activate FREE plan
            now = datetime.now(timezone.utc)
            await db.execute(
                text(
                    "INSERT INTO subscriptions "
                    "(tenant_id, plan_id, plan_name, subscription_status, billing_cycle, "
                    " amount, currency, subscription_id, "
                    " current_period_start, current_period_end, created_at, updated_at) "
                    "VALUES "
                    "(:tid, 'free', 'Free', 'active', 'monthly', "
                    " 0, 'INR', :sub_id, "
                    " :now, NULL, :now, :now)"
                ),
                {
                    "tid": tid,
                    "sub_id": f"free_{tid}_{int(now.timestamp())}",
                    "now": now,
                },
            )
            next_plan_name = "free"
            logger.info(f"No other active plans found. Free plan subscription row inserted for tenant {tid}")

        # ----------------------------------------------------------------
        # Step 4: Update tenants.subscription_plan → next_plan_name
        # ----------------------------------------------------------------
        tenant_update = await db.execute(
            text(
                "UPDATE tenants SET subscription_plan = :plan WHERE id = :id"
            ),
            {"plan": next_plan_name, "id": tid},
        )
        logger.info(f"tenants UPDATE rowcount: {tenant_update.rowcount}")

        if tenant_update.rowcount == 0:
            await db.rollback()
            raise HTTPException(
                status_code=500,
                detail="Tenant plan update matched 0 rows — check column name 'subscription_plan' exists.",
            )

        # ----------------------------------------------------------------
        # Step 5: Single atomic commit for all changes above
        # ----------------------------------------------------------------
        await db.commit()

        # ----------------------------------------------------------------
        # Step 6: Re-fetch in a NEW query (post-commit) to verify
        # ----------------------------------------------------------------
        verify_result = await db.execute(
            text("SELECT id, subscription_plan FROM tenants WHERE id = :id"),
            {"id": tid},
        )
        after = verify_result.mappings().first()
        logger.info(f"Tenant AFTER cancel: {dict(after) if after else None}")

        after_plan = after.get("subscription_plan") if after else None
        # Case-insensitive check to avoid "Free" vs "free" issues or different plan names
        plan_ok = after and str(after_plan).lower() == str(next_plan_name).lower()

        if not plan_ok:
            logger.error(
                f"tenant.subscription_plan did NOT persist! "
                f"Got: {after_plan}"
            )
            raise HTTPException(
                status_code=500,
                detail=(
                    f"DB commit succeeded but re-read shows plan='{after_plan}'. "
                    "Possible column name mismatch or read-replica lag."
                ),
            )

        return {
            "success": True,
            "message": f"Subscription cancelled successfully. Current plan: {next_plan_name}.",
            "data": {
                "tenant_id": tid,
                "next_plan": next_plan_name,
                "subscriptions_cancelled": sub_result.rowcount,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error during cancel_subscription: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel subscription: {str(e)}",
        )
@router.patch("/{subscription_id}")
async def update_subscription(
    subscription_id: str,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update / change plan for an existing Razorpay subscription."""
    body = await request.json()
    logger.info(f"User {current_user.id} updating subscription {subscription_id}")
    # TODO: wire up RazorpayService.updateSubscription
    return {"success": True, "data": None, "message": "Subscription updated"}


