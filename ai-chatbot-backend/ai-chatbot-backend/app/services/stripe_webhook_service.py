"""
Stripe Webhook Service — Handle subscription and payment events.
"""

import json
from datetime import datetime, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import logger


class StripeWebhookService:
    """
    Handles Stripe webhook events and updates subscription/invoice state.
    Supports: subscription lifecycle, payment tracking, invoices.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def handle(self, event_type: str, payload: dict) -> dict:
        """
        Route Stripe event to appropriate handler.
        
        Events:
        - customer.subscription.created: subscription created
        - customer.subscription.updated: subscription updated
        - customer.subscription.deleted: subscription cancelled
        - invoice.created: invoice created
        - invoice.finalized: invoice finalized
        - invoice.payment_action_required: payment required
        - invoice.paid: invoice paid
        - invoice.payment_failed: payment failed
        - charge.succeeded: charge succeeded
        - charge.failed: charge failed
        """
        logger.info(f"Stripe webhook event: {event_type}")

        if event_type == "customer.subscription.created":
            return await self._handle_subscription_created(payload)
        elif event_type == "customer.subscription.updated":
            return await self._handle_subscription_updated(payload)
        elif event_type == "customer.subscription.deleted":
            return await self._handle_subscription_deleted(payload)
        elif event_type == "invoice.created":
            return await self._handle_invoice_created(payload)
        elif event_type == "invoice.finalized":
            return await self._handle_invoice_finalized(payload)
        elif event_type == "invoice.paid":
            return await self._handle_invoice_paid(payload)
        elif event_type == "invoice.payment_failed":
            return await self._handle_invoice_payment_failed(payload)
        elif event_type == "charge.succeeded":
            return await self._handle_charge_succeeded(payload)
        elif event_type == "charge.failed":
            return await self._handle_charge_failed(payload)
        else:
            logger.warning(f"Unhandled Stripe event: {event_type}")
            return {"success": False, "message": f"Unhandled event: {event_type}"}

    async def _handle_subscription_created(self, payload: dict) -> dict:
        """
        customer.subscription.created event:
        Subscription has been created in Stripe.
        Update local subscription with Stripe subscription_id.
        """
        subscription = payload.get("data", {}).get("object", {})
        stripe_sub_id = subscription.get("id")
        customer_id = subscription.get("customer")
        status = subscription.get("status")  # e.g., 'active', 'past_due'

        if not stripe_sub_id:
            logger.error("subscription.created: missing stripe subscription id")
            return {"success": False, "error": "Missing subscription id"}

        try:
            # Find subscription by customer_id or metadata
            metadata = subscription.get("metadata", {})
            tenant_id = metadata.get("tenant_id")
            user_id = metadata.get("user_id")

            # Try to find and update subscription
            query = "SELECT id FROM subscriptions WHERE "
            params = {}

            if tenant_id and user_id:
                query += "tenant_id = :tid AND (stripe_customer_id = :cid OR stripe_subscription_id = :sub_id) LIMIT 1"
                params = {"tid": int(tenant_id), "cid": customer_id, "sub_id": stripe_sub_id}
            elif customer_id:
                query += "stripe_customer_id = :cid AND subscription_status IN ('created', 'pending') LIMIT 1"
                params = {"cid": customer_id}
            else:
                logger.warning("subscription.created: insufficient metadata to find subscription")
                return {"success": False, "error": "Insufficient data"}

            result = await self.db.execute(text(query), params)
            row = result.first()

            if row:
                db_id = row[0]
                # Update subscription with Stripe IDs
                await self.db.execute(
                    text(
                        "UPDATE subscriptions SET stripe_subscription_id = :stripe_sub_id, "
                        "stripe_customer_id = :stripe_cust_id, subscription_status = :status, "
                        "updated_at = NOW() WHERE id = :id"
                    ),
                    {
                        "stripe_sub_id": stripe_sub_id,
                        "stripe_cust_id": customer_id,
                        "status": status,
                        "id": db_id,
                    },
                )

                # Store subscription payload
                await self.db.execute(
                    text("UPDATE subscriptions SET invoice_data = :data WHERE id = :id"),
                    {"data": json.dumps(subscription), "id": db_id},
                )

                await self.db.commit()
                logger.info(f"subscription.created: {stripe_sub_id} linked")
                return {"success": True, "message": "Subscription created"}
            else:
                logger.warning(f"subscription.created: no matching subscription found")
                return {"success": False, "error": "Subscription not found"}

        except Exception as e:
            logger.error(f"Error handling subscription.created: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_subscription_updated(self, payload: dict) -> dict:
        """
        customer.subscription.updated event:
        Subscription has been updated (status change, plan change, etc.)
        """
        subscription = payload.get("data", {}).get("object", {})
        stripe_sub_id = subscription.get("id")
        status = subscription.get("status")

        if not stripe_sub_id:
            return {"success": False, "error": "Missing subscription id"}

        try:
            result = await self.db.execute(
                text(
                    "SELECT id FROM subscriptions WHERE stripe_subscription_id = :sub_id LIMIT 1"
                ),
                {"sub_id": stripe_sub_id},
            )
            row = result.first()

            if row:
                db_id = row[0]
                await self.db.execute(
                    text(
                        "UPDATE subscriptions SET subscription_status = :status, updated_at = NOW() WHERE id = :id"
                    ),
                    {"status": status, "id": db_id},
                )

                # Store updated subscription
                await self.db.execute(
                    text("UPDATE subscriptions SET invoice_data = :data WHERE id = :id"),
                    {"data": json.dumps(subscription), "id": db_id},
                )

                await self.db.commit()
                logger.info(f"subscription.updated: {stripe_sub_id} -> {status}")

            return {"success": True, "message": "Subscription updated"}

        except Exception as e:
            logger.error(f"Error handling subscription.updated: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_subscription_deleted(self, payload: dict) -> dict:
        """
        customer.subscription.deleted event:
        Subscription has been deleted/cancelled.
        """
        subscription = payload.get("data", {}).get("object", {})
        stripe_sub_id = subscription.get("id")

        if not stripe_sub_id:
            return {"success": False, "error": "Missing subscription id"}

        try:
            result = await self.db.execute(
                text(
                    "SELECT id FROM subscriptions WHERE stripe_subscription_id = :sub_id LIMIT 1"
                ),
                {"sub_id": stripe_sub_id},
            )
            row = result.first()

            if row:
                db_id = row[0]
                await self.db.execute(
                    text(
                        "UPDATE subscriptions SET subscription_status = :status, cancelled_at = NOW(), updated_at = NOW() WHERE id = :id"
                    ),
                    {"status": "cancelled", "id": db_id},
                )
                await self.db.commit()
                logger.info(f"subscription.deleted: {stripe_sub_id}")

            return {"success": True, "message": "Subscription deleted"}

        except Exception as e:
            logger.error(f"Error handling subscription.deleted: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_invoice_created(self, payload: dict) -> dict:
        """
        invoice.created event:
        An invoice has been created in Stripe.
        Create/update local invoice record.
        """
        invoice = payload.get("data", {}).get("object", {})
        stripe_invoice_id = invoice.get("id")
        stripe_sub_id = invoice.get("subscription")
        amount = invoice.get("amount_due", 0)  # in cents
        currency = invoice.get("currency", "usd")
        status = invoice.get("status")  # draft, open, paid, etc.
        customer_id = invoice.get("customer")

        if not stripe_invoice_id:
            return {"success": False, "error": "Missing invoice id"}

        try:
            # Find subscription if linked
            sub_db_id = None
            if stripe_sub_id:
                result = await self.db.execute(
                    text(
                        "SELECT id, tenant_id FROM subscriptions WHERE stripe_subscription_id = :sub_id LIMIT 1"
                    ),
                    {"sub_id": stripe_sub_id},
                )
                row = result.first()
                if row:
                    sub_db_id, tenant_id = row
            else:
                # Try to find tenant by customer
                result = await self.db.execute(
                    text(
                        "SELECT tenant_id FROM subscriptions WHERE stripe_customer_id = :cust_id LIMIT 1"
                    ),
                    {"cust_id": customer_id},
                )
                row = result.first()
                tenant_id = row[0] if row else None

            if not tenant_id:
                logger.warning(f"invoice.created: cannot determine tenant for {stripe_invoice_id}")
                return {"success": False, "error": "Cannot determine tenant"}

            # Convert cents to dollars
            amount_due = float(amount) / 100.0 if amount else 0.0

            # Create or update invoice
            await self.db.execute(
                text(
                    "INSERT INTO invoices "
                    "(tenant_id, subscription_id, stripe_invoice_id, invoice_id, amount_due, currency, status, created_at, updated_at) "
                    "VALUES (:tid, :sub_db_id, :stripe_id, :inv_id, :amount, :currency, :status, NOW(), NOW()) "
                    "ON DUPLICATE KEY UPDATE updated_at = NOW()"
                ),
                {
                    "tid": tenant_id,
                    "sub_db_id": sub_db_id,
                    "stripe_id": stripe_invoice_id,
                    "inv_id": stripe_invoice_id,
                    "amount": amount_due,
                    "currency": currency,
                    "status": status,
                },
            )

            await self.db.commit()
            logger.info(f"invoice.created: {stripe_invoice_id}")
            return {"success": True, "message": "Invoice created"}

        except Exception as e:
            logger.error(f"Error handling invoice.created: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_invoice_finalized(self, payload: dict) -> dict:
        """
        invoice.finalized event:
        Invoice has been finalized (immutable).
        """
        invoice = payload.get("data", {}).get("object", {})
        stripe_invoice_id = invoice.get("id")

        logger.info(f"invoice.finalized: {stripe_invoice_id}")
        return {"success": True, "message": "Invoice finalized"}

    async def _handle_invoice_paid(self, payload: dict) -> dict:
        """
        invoice.paid event:
        Invoice has been paid.
        Update invoice status, update subscription.
        """
        invoice = payload.get("data", {}).get("object", {})
        stripe_invoice_id = invoice.get("id")
        amount_paid = invoice.get("amount_paid", 0)

        if not stripe_invoice_id:
            return {"success": False, "error": "Missing invoice id"}

        try:
            # Update invoice status
            await self.db.execute(
                text(
                    "UPDATE invoices SET status = :status, amount_paid = :amount, updated_at = NOW() WHERE stripe_invoice_id = :stripe_id"
                ),
                {
                    "status": "paid",
                    "amount": float(amount_paid) / 100.0 if amount_paid else 0.0,
                    "stripe_id": stripe_invoice_id,
                },
            )

            await self.db.commit()
            logger.info(f"invoice.paid: {stripe_invoice_id}")
            return {"success": True, "message": "Invoice marked paid"}

        except Exception as e:
            logger.error(f"Error handling invoice.paid: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_invoice_payment_failed(self, payload: dict) -> dict:
        """
        invoice.payment_failed event:
        Invoice payment has failed.
        Update invoice status to 'failed'.
        """
        invoice = payload.get("data", {}).get("object", {})
        stripe_invoice_id = invoice.get("id")

        if not stripe_invoice_id:
            return {"success": False, "error": "Missing invoice id"}

        try:
            await self.db.execute(
                text(
                    "UPDATE invoices SET status = :status, updated_at = NOW() WHERE stripe_invoice_id = :stripe_id"
                ),
                {"status": "failed", "stripe_id": stripe_invoice_id},
            )

            await self.db.commit()
            logger.warning(f"invoice.payment_failed: {stripe_invoice_id}")
            return {"success": True, "message": "Invoice payment failed recorded"}

        except Exception as e:
            logger.error(f"Error handling invoice.payment_failed: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_charge_succeeded(self, payload: dict) -> dict:
        """
        charge.succeeded event:
        A charge has succeeded.
        """
        charge = payload.get("data", {}).get("object", {})
        charge_id = charge.get("id")

        logger.info(f"charge.succeeded: {charge_id}")
        return {"success": True, "message": "Charge succeeded"}

    async def _handle_charge_failed(self, payload: dict) -> dict:
        """
        charge.failed event:
        A charge has failed.
        """
        charge = payload.get("data", {}).get("object", {})
        charge_id = charge.get("id")

        logger.warning(f"charge.failed: {charge_id}")
        return {"success": True, "message": "Charge failed recorded"}
