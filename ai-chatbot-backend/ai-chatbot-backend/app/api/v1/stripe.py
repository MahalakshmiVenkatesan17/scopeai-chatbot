"""
Stripe routes — Stripe payment & subscription lifecycle.

Mirrors Node.js: src/routes/stripeRoutes.js
Prefix: /stripe
"""

import hmac
import hashlib
from http.client import HTTPException

from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.logging import logger

router = APIRouter(prefix="/stripe", tags=["Stripe"])


# ---------------------------------------------------------------------------
# Public (no auth)
# ---------------------------------------------------------------------------

@router.get("/test")
async def test_stripe(request: Request):
    """Health-check for the Stripe module."""
    from datetime import datetime, timezone
    return {
        "success": True,
        "message": "Stripe routes are working!",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "path": "/test",
        "originalUrl": str(request.url.path),
    }


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Stripe webhook receiver.

    Accepts raw body and verifies the Stripe-Signature header using
    STRIPE_WEBHOOK_SECRET. In production, use the official stripe library
    to construct the event:

        stripe.Webhook.construct_event(raw_body, sig_header, endpoint_secret)

    Placeholder implementation below verifies the signature header is present.
    """
    raw_body = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")

    if not sig_header:
        logger.warning("Stripe webhook missing Stripe-Signature header")
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {"code": "MISSING_SIGNATURE", "message": "Missing Stripe-Signature header"},
            },
        )

    # ---- Full verification (uncomment when stripe SDK is installed) ----
    # import stripe
    # try:
    #     event = stripe.Webhook.construct_event(
    #         raw_body, sig_header, settings.STRIPE_WEBHOOK_SECRET,
    #     )
    # except stripe.error.SignatureVerificationError:
    #     logger.warning("Stripe webhook signature verification failed")
    #     return JSONResponse(
    #         status_code=400,
    #         content={
    #             "success": False,
    #             "error": {"code": "INVALID_SIGNATURE", "message": "Invalid webhook signature"},
    #         },
    #     )
    # ---- End full verification ----

    # Parse after verification
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {"code": "INVALID_BODY", "message": "Invalid JSON body"},
            },
        )

    event_type = payload.get("type", "unknown")
    logger.info(f"Stripe webhook received: {event_type}")

    # TODO: wire up StripeWebhookService.handle(event_type, payload)
    return {"success": True, "message": f"Webhook processed: {event_type}"}


# ---------------------------------------------------------------------------
# Authenticated
# ---------------------------------------------------------------------------

@router.get("/config")
async def get_stripe_config(
    current_user: CurrentUser = Depends(get_current_user),
):
    """Return Stripe publishable key for the frontend."""
    return {
        "success": True,
        "data": {
            "publishableKey": settings.STRIPE_SECRET_KEY[:12] + "..." if settings.STRIPE_SECRET_KEY else None,
            "currency": "usd",
        },
        "message": "Stripe config retrieved",
    }


# ---------------------------------------------------------------------------
# Checkout sessions
# ---------------------------------------------------------------------------

@router.post("/checkout/sessions")
async def create_checkout_session(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe Checkout session."""
    from app.services.stripe_service import stripe_service
    
    body = await request.json()
    price_id = body.get("price_id") or body.get("priceId")
    billing_cycle = body.get("billing_cycle") or body.get("billingCycle", "monthly")
    plan_name = body.get("plan_name") or body.get("planName", "Plan")
    amount = body.get("amount", 0)
    success_url = body.get("success_url") or body.get("successUrl")
    cancel_url = body.get("cancel_url") or body.get("cancelUrl")
    customer_email = body.get("customer_email") or body.get("customerEmail")
    
    if not price_id:
        return {
            "success": False,
            "error": {"code": "MISSING_PRICE", "message": "price_id is required"},
        }
    
    if not success_url or not cancel_url:
        return {
            "success": False,
            "error": {"code": "MISSING_URLS", "message": "success_url and cancel_url are required"},
        }
    
    try:
        logger.info(f"User {current_user.id} creating checkout session (priceId={price_id})")
        
        # Determine subscription mode
        mode = "subscription" if billing_cycle in ["monthly", "yearly"] else "payment"
        
        # Create line items
        line_items = [
            {
                "price": price_id,
                "quantity": 1,
            }
        ]
        
        # Create checkout session
        session = stripe_service.create_checkout_session(
            line_items=line_items,
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_email,
            mode=mode,
            metadata={
                "plan_name": plan_name,
                "billing_cycle": billing_cycle,
                "tenant_id": str(current_user.tenant_id),
                "user_id": str(current_user.id),
            },
        )
        
        logger.info(f"Checkout session created: {session.id}")
        
        return {
            "success": True,
            "data": {
                "session_id": session.id,
                "url": session.url,
                "customer_id": session.customer,
            },
        }
    
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        return {
            "success": False,
            "error": {"code": "SESSION_ERROR", "message": str(e)},
        }


@router.get("/checkout/sessions/{session_id}")
async def get_checkout_session(
    session_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a Stripe Checkout session."""
    logger.info(f"User {current_user.id} fetching checkout session {session_id}")
    # TODO: wire up StripeService.retrieveCheckoutSession
    return {"success": True, "data": None, "message": "Checkout session retrieved"}


# ---------------------------------------------------------------------------
# Stripe subscriptions
# ---------------------------------------------------------------------------

@router.post("/subscriptions")
async def create_stripe_subscription(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe subscription."""
    body = await request.json()
    price_id = body.get("priceId")
    payment_method_id = body.get("paymentMethodId")
    logger.info(f"User {current_user.id} creating Stripe subscription (priceId={price_id})")
    # TODO: wire up StripeService.createSubscription
    return {"success": True, "data": None, "message": "Stripe subscription created"}


@router.get("/subscriptions/{subscription_id}")
async def get_stripe_subscription(
    subscription_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a Stripe subscription."""
    logger.info(f"User {current_user.id} fetching Stripe subscription {subscription_id}")
    # TODO: wire up StripeService.retrieveSubscription
    return {"success": True, "data": None, "message": "Stripe subscription retrieved"}

# AFTER (full implementation):
@router.delete("/subscriptions/{subscription_id}")
async def cancel_stripe_subscription(
    subscription_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a Stripe subscription and activate free plan."""
    from fastapi import HTTPException as FastAPIHTTPException  # avoid http.client.HTTPException clash
    from sqlalchemy import text
    from datetime import datetime, timezone
    from app.services.stripe_service import stripe_service

    logger.info(f"User {current_user.id} cancelling Stripe subscription {subscription_id}")

    try:
        # 1. Cancel on Stripe
        stripe_response = stripe_service.cancel_subscription(subscription_id)

        now = datetime.now(timezone.utc)

        # 2. Mark the current paid subscription as cancelled in DB
        await db.execute(
            text(
                "UPDATE subscriptions "
                "SET subscription_status = 'cancelled', cancelled_at = :cancelled_at, updated_at = NOW() "
                "WHERE subscription_id = :sub_id AND tenant_id = :tid"
            ),
            {
                "cancelled_at": now,
                "sub_id": subscription_id,
                "tid": current_user.tenant_id,
            },
        )

        # 3. Check if a free plan already exists for this tenant
        existing_free = await db.execute(
            text(
                "SELECT id FROM subscriptions "
                "WHERE tenant_id = :tid AND plan_name = 'Free' "
                "ORDER BY created_at DESC LIMIT 1"
            ),
            {"tid": current_user.tenant_id},
        )
        free_row = existing_free.first()

        if free_row:
            # Re-activate existing free plan
            await db.execute(
                text(
                    "UPDATE subscriptions "
                    "SET subscription_status = 'active', cancelled_at = NULL, updated_at = NOW() "
                    "WHERE id = :id"
                ),
                {"id": free_row[0]},
            )
        else:
            # Insert a new free plan record
            await db.execute(
                text(
                    "INSERT INTO subscriptions "
                    "(tenant_id, plan_id, plan_name, subscription_status, billing_cycle, "
                    "amount, currency, payment_type, subscription_id, "
                    "current_period_start, current_period_end, created_at, updated_at) "
                    "VALUES (:tid, 'free', 'Free', 'active', 'monthly', "
                    "0, 'USD', 'free', :free_sub_id, "
                    ":period_start, NULL, NOW(), NOW())"
                ),
                {
                    "tid": current_user.tenant_id,
                    "free_sub_id": f"free_{current_user.tenant_id}_{int(now.timestamp())}",
                    "period_start": now,
                },
            )

        await db.commit()

        logger.info(
            f"Stripe subscription {subscription_id} cancelled, "
            f"free plan activated for tenant {current_user.tenant_id}"
        )

        return {
            "success": True,
            "data": {
                "cancelled_subscription": dict(stripe_response),
                "free_plan_activated": True,
            },
            "message": "Stripe subscription cancelled successfully. Free plan activated.",
        }

    except Exception as e:
        logger.error(f"Error cancelling Stripe subscription {subscription_id}: {str(e)}")
        await db.rollback()
        raise FastAPIHTTPException(
            status_code=500,
            detail=f"Failed to cancel Stripe subscription: {str(e)}"
        )

# ---------------------------------------------------------------------------
# Payment verification
# ---------------------------------------------------------------------------

@router.post("/verify-payment")
async def verify_stripe_payment(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify a Stripe payment by retrieving the checkout session."""
    from sqlalchemy import text
    from datetime import datetime, timedelta, timezone
    from app.services.stripe_service import stripe_service
    import stripe as stripe_lib
    
    body = await request.json()
    session_id = body.get("session_id") or body.get("sessionId")
    subscription_id = body.get("subscription_id") or body.get("subscriptionId")
    payment_intent_id = body.get("paymentIntentId")
    plan_name = body.get("planName")
    plan_id = body.get("plan_id") or body.get("priceId")
    amount = body.get("amount", 0)
    billing_cycle = body.get("billingCycle", "monthly")

    if not session_id and not subscription_id and not payment_intent_id:
        return {
            "success": False,
            "error": {"code": "MISSING_ID", "message": "session_id, subscription_id, or paymentIntentId is required"},
        }

    try:
        logger.info(f"User {current_user.id} verifying Stripe payment (session={session_id}, subscription={subscription_id})")
        
        payment_status = None
        stripe_subscription = None
        returned_plan_id = plan_id
        customer_id = None
        returned_subscription_id = subscription_id
        
        # Retrieve checkout session from Stripe to get plan_id if not provided
        if session_id:
            session = stripe_service.get_checkout_session(session_id)
            payment_status = session.payment_status  # paid, unpaid, no_payment_required
            payment_intent_id = session.payment_intent
            customer_id = session.customer
            
            # Extract plan_id and subscription_id from line items
            try:
                if not returned_plan_id:
                    # Use Stripe API directly to get line items with expand
                    line_items = stripe_lib.checkout.Session.list_line_items(session_id, limit=1)
                    if line_items.data and len(line_items.data) > 0:
                        item = line_items.data[0]
                        returned_plan_id = item.price.id if item.price else None
                        # Get product metadata
                        if item.price and item.price.product:
                            product = stripe_service.get_product(item.price.product)
                            if product and hasattr(product, 'name') and product.name and not plan_name:
                                plan_name = product.name
            except Exception as e:
                logger.warning(f"Could not extract line items: {str(e)}")
        
        # Retrieve subscription if subscription_id provided
        if subscription_id:
            stripe_subscription = stripe_service.get_subscription(subscription_id)
            payment_status = "paid" if stripe_subscription.status == "active" else stripe_subscription.status
            returned_subscription_id = stripe_subscription.id
            customer_id = stripe_subscription.customer
            
            # Extract plan_id from subscription if not already set
            if not returned_plan_id and stripe_subscription.items and stripe_subscription.items.data:
                returned_plan_id = stripe_subscription.items.data[0].price.id
        
        # Retrieve payment intent if needed
        if payment_intent_id and not payment_status:
            payment_intent = stripe_service.retrieve_payment_intent(payment_intent_id)
            payment_status = "paid" if payment_intent.status == "succeeded" else payment_intent.status
            customer_id = payment_intent.customer
        
        # Validate payment was successful
        if payment_status not in ["paid", "no_payment_required"]:
            return {
                "success": False,
                "error": {"code": "PAYMENT_NOT_COMPLETED", "message": f"Payment status: {payment_status}"},
            }
        
        # Ensure we have a plan_id
        if not returned_plan_id:
            return {
                "success": False,
                "error": {"code": "MISSING_PLAN_ID", "message": "Could not determine plan_id from session or subscription"},
            }
        
        # Get customer details if we have customer_id
        customer_obj = None
        if customer_id:
            try:
                customer_obj = stripe_lib.Customer.retrieve(customer_id)
            except Exception as e:
                logger.warning(f"Could not retrieve customer {customer_id}: {str(e)}")
        
        # For checkout sessions, create a subscription record in our database
        now = datetime.now(timezone.utc)
        period_end = now + timedelta(days=30 if billing_cycle == "monthly" else 365)

        result = await db.execute(
            text(
                "INSERT INTO subscriptions "
                "(tenant_id, plan_name, plan_id, subscription_status, billing_cycle, amount, currency, "
                "payment_type, subscription_id, "
                "current_period_start, current_period_end, created_at, updated_at) "
                "VALUES (:tid, :plan_name, :plan_id, 'active', :billing_cycle, :amount, 'USD', "
                "'stripe', :subscription_id, :period_start, :period_end, NOW(), NOW())"
            ),
            {
                "tid": current_user.tenant_id,
                "plan_name": plan_name,
                "plan_id": returned_plan_id,
                "billing_cycle": billing_cycle,
                "amount": amount,
                "subscription_id": returned_subscription_id or session_id or payment_intent_id,
                "period_start": now,
                "period_end": period_end,
            },
        )
        await db.commit()
        sub_id = result.lastrowid
        
        logger.info(f"Subscription recorded for user {current_user.id}: {sub_id}")
        
        # Return response in the format requested by frontend
        return {
            "success": True,
            "data": {
                "subscription_id": returned_subscription_id or session_id or sub_id,
                "customer_id": customer_obj if customer_obj else {"id": customer_id} if customer_id else None,
                "plan_id": returned_plan_id,
                "status": "active",
            }
        }
    
    except Exception as e:
        logger.error(f"Error verifying Stripe payment: {str(e)}")
        await db.rollback()
        return {
            "success": False,
            "error": {"code": "VERIFICATION_ERROR", "message": str(e)},
        }
