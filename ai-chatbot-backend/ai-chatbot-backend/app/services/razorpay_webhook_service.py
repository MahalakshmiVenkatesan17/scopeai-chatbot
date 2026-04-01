"""
Razorpay Webhook Service — Handle subscription and payment events.
"""

import json
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import logger


class RazorpayWebhookService:
    """
    Handles Razorpay webhook events and updates subscription/invoice state.
    Supports: subscription lifecycle, payment tracking, invoices.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def handle(self, event: str, payload: dict) -> dict:
        """
        Route webhook event to appropriate handler.
        
        Events:
        - subscription.activated: subscription created/activated
        - subscription.charged: payment captured, create invoice
        - subscription.cancelled: subscription cancelled
        - subscription.paused: subscription paused
        - subscription.resumed: subscription resumed
        - payment.authorized: payment authorized
        - payment.failed: payment failed
        - invoice.*: invoice events
        """
        logger.info(f"Razorpay webhook event: {event}")

        if event == "subscription.activated":
            return await self._handle_subscription_activated(payload)
        elif event == "subscription.charged":
            return await self._handle_subscription_charged(payload)
        elif event == "subscription.cancelled":
            return await self._handle_subscription_cancelled(payload)
        elif event == "subscription.paused":
            return await self._handle_subscription_paused(payload)
        elif event == "subscription.resumed":
            return await self._handle_subscription_resumed(payload)
        elif event == "payment.authorized":
            return await self._handle_payment_authorized(payload)
        elif event == "payment.failed":
            return await self._handle_payment_failed(payload)
        elif event == "invoice.issued":
            return await self._handle_invoice_issued(payload)
        elif event == "invoice.paid":
            return await self._handle_invoice_paid(payload)
        else:
            logger.warning(f"Unhandled Razorpay event: {event}")
            return {"success": False, "message": f"Unhandled event: {event}"}

    async def _handle_subscription_activated(self, payload: dict) -> dict:
        """
        subscription.activated event:
        Subscription has been activated/created.
        Update local subscription status to 'active'.
        """
        subscription = payload.get("subscription", {})
        sub_id = subscription.get("id")
        tenant_id = subscription.get("notes", {}).get("tenant_id")

        if not sub_id:
            logger.error("subscription.activated: missing subscription id")
            return {"success": False, "error": "Missing subscription id"}

        try:
            # Find subscription by gateway subscription_id
            result = await self.db.execute(
                text(
                    "SELECT id FROM subscriptions WHERE subscription_id = :sub_id LIMIT 1"
                ),
                {"sub_id": sub_id},
            )
            row = result.first()

            if not row:
                logger.warning(f"subscription.activated: subscription {sub_id} not found in DB")
                return {"success": False, "error": "Subscription not found"}

            db_id = row[0]

            # Update subscription status
            await self.db.execute(
                text(
                    "UPDATE subscriptions SET subscription_status = :status, updated_at = NOW() WHERE id = :id"
                ),
                {"status": "active", "id": db_id},
            )

            # Store webhook payload as metadata (preserving existing invoice_data if possible)
            try:
                # Best effort: update existing JSON if it's there, else set new
                res_inv = await self.db.execute(text("SELECT invoice_data FROM subscriptions WHERE id = :id"), {"id": db_id})
                row_inv = res_inv.first()
                if row_inv and row_inv[0]:
                    inv_json = json.loads(row_inv[0])
                    if isinstance(inv_json, dict):
                        inv_json["subscription_webhook"] = "activated"
                        inv_json["status"] = "paid" # Activated usually means first payment successful
                        await self.db.execute(
                            text("UPDATE subscriptions SET invoice_data = :data WHERE id = :id"),
                            {"data": json.dumps(inv_json), "id": db_id},
                        )
                    else:
                         await self.db.execute(
                            text("UPDATE subscriptions SET invoice_data = :data WHERE id = :id"),
                            {"data": json.dumps({"webhook_event": "subscription.activated", "payload": subscription}), "id": db_id},
                        )
                else:
                    await self.db.execute(
                        text("UPDATE subscriptions SET invoice_data = :data WHERE id = :id"),
                        {"data": json.dumps({"webhook_event": "subscription.activated", "payload": subscription}), "id": db_id},
                    )
            except Exception as e:
                logger.warning(f"Failed to update metadata in subscription.activated: {e}")

            await self.db.commit()
            logger.info(f"subscription.activated: subscription {sub_id} marked active")
            return {"success": True, "message": "Subscription activated"}

        except Exception as e:
            logger.error(f"Error handling subscription.activated: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_subscription_charged(self, payload: dict) -> dict:
        """
        subscription.charged event:
        A payment has been charged for the subscription.
        Create invoice record, update subscription period end.
        """
        invoice = payload.get("invoice", {})
        subscription = payload.get("subscription", {})
        sub_id = subscription.get("id")
        tenant_id = subscription.get("notes", {}).get("tenant_id")

        if not sub_id:
            logger.error("subscription.charged: missing subscription id")
            return {"success": False, "error": "Missing subscription id"}

        try:
            # Find subscription by gateway subscription_id
            result = await self.db.execute(
                text(
                    "SELECT id, tenant_id FROM subscriptions WHERE subscription_id = :sub_id LIMIT 1"
                ),
                {"sub_id": sub_id},
            )
            row = result.first()

            if not row:
                logger.warning(f"subscription.charged: subscription {sub_id} not found")
                return {"success": False, "error": "Subscription not found"}

            db_id, found_tenant_id = row

            # Extract invoice details
            invoice_id = invoice.get("id")
            amount = invoice.get("amount", 0)  # in paise
            amount_due = float(amount) / 100.0 if amount > 100 else float(amount)
            currency = invoice.get("currency", "INR")
            invoice_number = invoice.get("receipt")
            status = "paid"  # Webhook fires when payment is captured

            # Create or update invoice record
            inv_result = await self.db.execute(
                text(
                    "INSERT INTO invoices "
                    "(tenant_id, subscription_id, invoice_id, invoice_number, amount_due, amount_paid, currency, status, created_at, updated_at) "
                    "VALUES (:tid, :sub_db_id, :inv_id, :inv_num, :amount, :amount, :currency, :status, NOW(), NOW()) "
                    "ON DUPLICATE KEY UPDATE "
                    "amount_due = :amount, amount_paid = :amount, status = :status, updated_at = NOW()"
                ),
                {
                    "tid": found_tenant_id,
                    "sub_db_id": db_id,
                    "inv_id": invoice_id,
                    "inv_num": invoice_number,
                    "amount": amount_due,
                    "currency": currency,
                    "status": status,
                },
            )

            # Update subscription's current_period_end
            now = datetime.now(timezone.utc)
            period_end = now + timedelta(days=30)  # assume monthly for now

            await self.db.execute(
                text(
                    "UPDATE subscriptions SET current_period_end = :period_end, updated_at = NOW() WHERE id = :id"
                ),
                {"period_end": period_end, "id": db_id},
            )

            # Store full invoice payload in a way that list_subscription_invoices understands
            inv_payload = {
                "invoice_id": invoice_id,
                "invoice_number": invoice_number,
                "amount": amount_due,
                "currency": currency,
                "status": status,
                "paid_at": now.isoformat() + "Z",
            }

            await self.db.execute(
                text(
                    "UPDATE subscriptions SET invoice_data = :data WHERE id = :id"
                ),
                {"data": json.dumps(inv_payload), "id": db_id},
            )

            await self.db.commit()
            logger.info(f"subscription.charged: invoice {invoice_id} created for subscription {sub_id}")
            return {"success": True, "message": "Invoice created", "invoice_id": invoice_id}

        except Exception as e:
            logger.error(f"Error handling subscription.charged: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_subscription_cancelled(self, payload: dict) -> dict:
        """
        subscription.cancelled event:
        Subscription has been cancelled.
        Update subscription status to 'cancelled', set cancelled_at.
        """
        subscription = payload.get("subscription", {})
        sub_id = subscription.get("id")

        if not sub_id:
            logger.error("subscription.cancelled: missing subscription id")
            return {"success": False, "error": "Missing subscription id"}

        try:
            result = await self.db.execute(
                text(
                    "SELECT id FROM subscriptions WHERE subscription_id = :sub_id LIMIT 1"
                ),
                {"sub_id": sub_id},
            )
            row = result.first()

            if not row:
                logger.warning(f"subscription.cancelled: subscription {sub_id} not found")
                return {"success": False, "error": "Subscription not found"}

            db_id = row[0]

            # Update subscription status
            await self.db.execute(
                text(
                    "UPDATE subscriptions SET subscription_status = :status, cancelled_at = NOW(), updated_at = NOW() WHERE id = :id"
                ),
                {"status": "cancelled", "id": db_id},
            )

            await self.db.commit()
            logger.info(f"subscription.cancelled: subscription {sub_id} marked cancelled")
            return {"success": True, "message": "Subscription cancelled"}

        except Exception as e:
            logger.error(f"Error handling subscription.cancelled: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_subscription_paused(self, payload: dict) -> dict:
        """subscription.paused event: subscription paused."""
        subscription = payload.get("subscription", {})
        sub_id = subscription.get("id")

        if not sub_id:
            return {"success": False, "error": "Missing subscription id"}

        try:
            result = await self.db.execute(
                text("SELECT id FROM subscriptions WHERE subscription_id = :sub_id LIMIT 1"),
                {"sub_id": sub_id},
            )
            row = result.first()

            if row:
                await self.db.execute(
                    text(
                        "UPDATE subscriptions SET subscription_status = :status, updated_at = NOW() WHERE id = :id"
                    ),
                    {"status": "paused", "id": row[0]},
                )
                await self.db.commit()
                logger.info(f"subscription.paused: {sub_id}")

            return {"success": True, "message": "Subscription paused"}

        except Exception as e:
            logger.error(f"Error handling subscription.paused: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_subscription_resumed(self, payload: dict) -> dict:
        """subscription.resumed event: subscription resumed."""
        subscription = payload.get("subscription", {})
        sub_id = subscription.get("id")

        if not sub_id:
            return {"success": False, "error": "Missing subscription id"}

        try:
            result = await self.db.execute(
                text("SELECT id FROM subscriptions WHERE subscription_id = :sub_id LIMIT 1"),
                {"sub_id": sub_id},
            )
            row = result.first()

            if row:
                await self.db.execute(
                    text(
                        "UPDATE subscriptions SET subscription_status = :status, updated_at = NOW() WHERE id = :id"
                    ),
                    {"status": "active", "id": row[0]},
                )
                await self.db.commit()
                logger.info(f"subscription.resumed: {sub_id}")

            return {"success": True, "message": "Subscription resumed"}

        except Exception as e:
            logger.error(f"Error handling subscription.resumed: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}

    async def _handle_payment_authorized(self, payload: dict) -> dict:
        """payment.authorized event: payment has been authorized."""
        payment = payload.get("payment", {})
        payment_id = payment.get("id")

        logger.info(f"payment.authorized: {payment_id}")
        return {"success": True, "message": "Payment authorized"}

    async def _handle_payment_failed(self, payload: dict) -> dict:
        """payment.failed event: payment has failed."""
        payment = payload.get("payment", {})
        payment_id = payment.get("id")

        logger.warning(f"payment.failed: {payment_id}")
        return {"success": True, "message": "Payment failure recorded"}

    async def _handle_invoice_issued(self, payload: dict) -> dict:
        """invoice.issued event: invoice has been issued."""
        invoice = payload.get("invoice", {})
        invoice_id = invoice.get("id")
        subscription = payload.get("subscription", {})
        sub_id = subscription.get("id")

        logger.info(f"invoice.issued: {invoice_id} for subscription {sub_id}")
        return {"success": True, "message": "Invoice issued"}

    async def _handle_invoice_paid(self, payload: dict) -> dict:
        """invoice.paid event: invoice has been paid."""
        invoice = payload.get("invoice", {})
        invoice_id = invoice.get("id")
        subscription = payload.get("subscription", {})
        sub_id = subscription.get("id")

        if not sub_id:
            return {"success": False, "error": "Missing subscription id"}

        try:
            result = await self.db.execute(
                text("SELECT id FROM subscriptions WHERE subscription_id = :sub_id LIMIT 1"),
                {"sub_id": sub_id},
            )
            row = result.first()

            if row:
                db_id = row[0]
                # Update associated invoice as paid
                await self.db.execute(
                    text(
                        "UPDATE invoices SET status = :status, updated_at = NOW() WHERE subscription_id = :sub_db_id"
                    ),
                    {"status": "paid", "sub_db_id": db_id},
                )
                await self.db.commit()
                logger.info(f"invoice.paid: {invoice_id}")

            return {"success": True, "message": "Invoice marked paid"}

        except Exception as e:
            logger.error(f"Error handling invoice.paid: {str(e)}")
            await self.db.rollback()
            return {"success": False, "error": str(e)}
