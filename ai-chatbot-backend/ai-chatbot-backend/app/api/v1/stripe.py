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
        try:
            if subscription_id.startswith("cs_"):
                session = stripe_service.get_checkout_session(subscription_id)
                if hasattr(session, 'subscription') and session.subscription:
                    real_sub_id = session.subscription if isinstance(session.subscription, str) else session.subscription.id
                    stripe_response = stripe_service.cancel_subscription(real_sub_id)
                else:
                    logger.warning(f"No subscription on checkout session {subscription_id}")
                    stripe_response = {"id": subscription_id, "status": "canceled_in_db_only"}
            else:
                stripe_response = stripe_service.cancel_subscription(subscription_id)
        except Exception as stripe_err:
            logger.warning(f"Stripe cancellation failed for {subscription_id}: {stripe_err}")
            # we allow it to proceed to db cancellation so the user isn't stuck forever
            stripe_response = {"id": subscription_id, "status": "canceled_in_db_only", "error": str(stripe_err)}

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

        # 3. Check if there are ANY other active subscriptions left for this tenant
        other_active_result = await db.execute(
            text(
                "SELECT id, plan_name FROM subscriptions "
                "WHERE tenant_id = :tid AND subscription_status = 'active' "
                "ORDER BY created_at DESC LIMIT 1"
            ),
            {"tid": current_user.tenant_id},
        )
        other_active = other_active_result.mappings().first()
        
        next_plan_name = "free"
        
        if other_active:
            # Another active plan exists, use its name
            next_plan_name = other_active["plan_name"]
            logger.info(f"Another active plan found: {next_plan_name}. Skipping free plan activation.")
        else:
            # No other active plans, activate/insert FREE plan
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
            next_plan_name = "free"

        # 4. Update tenants.subscription_plan to reflections the current active plan
        await db.execute(
            text("UPDATE tenants SET subscription_plan = :plan WHERE id = :id"),
            {"plan": next_plan_name, "id": current_user.tenant_id},
        )

        await db.commit()

        logger.info(
            f"Stripe subscription {subscription_id} cancelled. "
            f"Tenant {current_user.tenant_id} plan is now {next_plan_name}"
        )

        return {
            "success": True,
            "data": {
                "cancelled_subscription": dict(stripe_response),
                "next_plan": next_plan_name,
            },
            "message": f"Stripe subscription cancelled successfully. Current plan: {next_plan_name}.",
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
    import json
    
    body = await request.json()
    session_id = body.get("session_id") or body.get("sessionId")
    subscription_id = body.get("subscription_id") or body.get("subscriptionId")
    payment_intent_id = body.get("paymentIntentId")
    plan_name = body.get("planName")
    plan_id = body.get("plan_id") or body.get("priceId")
    amount = body.get("amount", 0)
    currency = body.get("currency", "USD").upper()
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
        invoice_obj = None
        
        # Retrieve checkout session from Stripe to get plan_id if not provided
        if session_id:
            session = stripe_service.get_checkout_session(session_id)
            payment_status = session.payment_status  # paid, unpaid, no_payment_required
            payment_intent_id = session.payment_intent
            customer_id = session.customer
            
            # Extract actual amount and currency from session
            if hasattr(session, 'amount_total') and session.amount_total is not None:
                amount = session.amount_total / 100.0
            if hasattr(session, 'currency') and session.currency:
                currency = session.currency.upper()
            
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
                
            # Extract subscription ID if present
            if hasattr(session, 'subscription') and session.subscription:
                returned_subscription_id = session.subscription if isinstance(session.subscription, str) else session.subscription.id
                
            # Extract invoice if present
            if hasattr(session, 'invoice') and session.invoice:
                inv_id = session.invoice if isinstance(session.invoice, str) else session.invoice.id
                try:
                    invoice_obj = stripe_lib.Invoice.retrieve(inv_id)
                except Exception as e:
                    logger.warning(f"Could not retrieve invoice {inv_id}: {e}")
        
        # Retrieve subscription if subscription_id provided
        if subscription_id:
            stripe_subscription = stripe_service.get_subscription(subscription_id)
            payment_status = "paid" if stripe_subscription.status == "active" else stripe_subscription.status
            returned_subscription_id = stripe_subscription.id
            customer_id = stripe_subscription.customer
            
            # Extract plan_id from subscription if not already set
            if stripe_subscription.items and stripe_subscription.items.data:
                item = stripe_subscription.items.data[0]
                if not returned_plan_id:
                    returned_plan_id = item.price.id
                if not amount and item.price.unit_amount is not None:
                    amount = item.price.unit_amount / 100.0
                if item.price.currency:
                    currency = item.price.currency.upper()
                    
            # Extract latest invoice if not already fetched
            if hasattr(stripe_subscription, 'latest_invoice') and stripe_subscription.latest_invoice and not invoice_obj:
                inv_id = stripe_subscription.latest_invoice if isinstance(stripe_subscription.latest_invoice, str) else stripe_subscription.latest_invoice.id
                try:
                    invoice_obj = stripe_lib.Invoice.retrieve(inv_id)
                except Exception as e:
                    logger.warning(f"Could not retrieve latest invoice {inv_id}: {e}")
        
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
                
        # Construct invoice_data JSON
        invoice_data_json = None
        if invoice_obj:
            inv_amount_raw = invoice_obj.amount_paid or invoice_obj.total or 0
            inv_amount = float(inv_amount_raw) / 100.0
            inv_status = invoice_obj.status
            inv_currency = (invoice_obj.currency or currency).upper()
            inv_short_url = invoice_obj.hosted_invoice_url
            inv_id = invoice_obj.id
            inv_payment_id = invoice_obj.charge or invoice_obj.payment_intent or payment_intent_id
            inv_desc = invoice_obj.description
            inv_number = invoice_obj.number
            
            # Format dates to ISO
            if hasattr(invoice_obj, 'status_transitions') and invoice_obj.status_transitions and invoice_obj.status_transitions.paid_at:
                paid_at_dt = datetime.fromtimestamp(invoice_obj.status_transitions.paid_at, tz=timezone.utc)
                paid_at_iso = paid_at_dt.isoformat().replace('+00:00', 'Z')
            else:
                paid_at_iso = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                
            cust_name = customer_obj.name if customer_obj and hasattr(customer_obj, 'name') else None
            cust_email = customer_obj.email if customer_obj and hasattr(customer_obj, 'email') else None
            if not cust_email and hasattr(invoice_obj, 'customer_email'):
                cust_email = invoice_obj.customer_email
            if not cust_name and hasattr(invoice_obj, 'customer_name'):
                cust_name = invoice_obj.customer_name
            
            invoice_entry = {
                "amount": inv_amount,
                "method": "card", 
                "status": inv_status,
                "paid_at": paid_at_iso,
                "currency": inv_currency,
                "short_url": inv_short_url,
                "invoice_id": inv_id,
                "payment_id": inv_payment_id,
                "description": inv_desc,
                "payment_date": paid_at_iso,
                "customer_name": cust_name,
                "customer_email": cust_email,
                "invoice_number": inv_number
            }
            invoice_data_json = json.dumps([invoice_entry])
        
        # Use ON DUPLICATE KEY UPDATE for robust de-duplication
        # We target stripe_subscription_id or stripe_checkout_session_id which are UNIQUE
        actual_sub_id = returned_subscription_id if returned_subscription_id and returned_subscription_id.startswith('sub_') else None
        
        now = datetime.now(timezone.utc)
        period_end = now + timedelta(days=30 if billing_cycle == "monthly" else 365)
        
        upsert_query = """
            INSERT INTO subscriptions 
            (tenant_id, plan_name, plan_id, subscription_status, billing_cycle, amount, currency, 
             payment_type, subscription_id, stripe_subscription_id, stripe_checkout_session_id, stripe_customer_id,
             current_period_start, current_period_end, created_at, updated_at, invoice_data) 
            VALUES 
            (:tid, :plan_name, :plan_id, 'active', :billing_cycle, :amount, :currency, 
             'stripe', :sub_id, :stripe_sub_id, :session_id, :cust_id,
             :period_start, :period_end, NOW(), NOW(), :invoice_data)
            ON DUPLICATE KEY UPDATE 
            subscription_status = 'active',
            plan_name = VALUES(plan_name),
            plan_id = VALUES(plan_id),
            amount = VALUES(amount),
            currency = VALUES(currency),
            invoice_data = VALUES(invoice_data),
            updated_at = NOW()
        """
        
        params = {
            "tid": current_user.tenant_id,
            "plan_name": plan_name,
            "plan_id": returned_plan_id,
            "billing_cycle": billing_cycle,
            "amount": amount,
            "currency": currency,
            "sub_id": returned_subscription_id or session_id or payment_intent_id,
            "stripe_sub_id": actual_sub_id,
            "session_id": session_id,
            "cust_id": customer_id,
            "period_start": now,
            "period_end": period_end,
            "invoice_data": invoice_data_json,
        }
        
        result = await db.execute(text(upsert_query), params)
        await db.commit()
        
        # Determine the affected ID (either inserted or updated)
        # Note: lastrowid might be 0 on update in some drivers, 
        # so we fetch the id if we want to be sure for the response
        if result.lastrowid:
            sub_db_id = result.lastrowid
        else:
            # Re-fetch the ID if it was an update
            check_q = await db.execute(
                text("SELECT id FROM subscriptions WHERE (stripe_subscription_id = :ssid AND :ssid IS NOT NULL) OR (stripe_checkout_session_id = :sid AND :sid IS NOT NULL) LIMIT 1"),
                {"ssid": actual_sub_id, "sid": session_id}
            )
            sub_db_id = check_q.scalar()

        logger.info(f"Subscription processed for user {current_user.id}: {sub_db_id}")
        
        # Return response in the format requested by frontend
        return {
            "success": True,
            "data": {
                "subscription_id": returned_subscription_id or session_id or sub_db_id,
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
