"""
Webhook Test Utility — Test Razorpay and Stripe webhook handlers locally.

Run: python test_webhooks.py
"""

import asyncio
import json
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.services.razorpay_webhook_service import RazorpayWebhookService
from app.services.stripe_webhook_service import StripeWebhookService


# Initialize async DB session
async def get_async_session():
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
    )
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_delete=False)
    return async_session()


# Sample webhook payloads
RAZORPAY_SAMPLE_INVOICE = {
    "amount": 69900,  # in paise (699 INR)
    "method": "card",
    "status": "paid",
    "paid_at": "2025-11-26T12:40:07.617Z",
    "currency": "INR",
    "short_url": "https://rzp.io/rzp/JrdDu5nL",
    "invoice_id": "inv_RkN6rnuRjqtfcd",
    "payment_id": "pay_RkN7M2REwN9WxF",
    "description": None,
    "payment_date": "2025-11-26T12:40:07.617Z",
    "customer_name": None,
    "customer_email": "gayathri@gmail.com",
    "invoice_number": "INV-2025-001",
}

RAZORPAY_SUBSCRIPTION_CHARGED_PAYLOAD = {
    "event": "subscription.charged",
    "created_at": int(datetime.now(timezone.utc).timestamp()),
    "subscription": {
        "id": "sub_SI1bUGgO8o43cN",
        "entity": "subscription",
        "status": "active",
        "plan_id": "plan_SI1bUGgO8o43cA",
        "customer_id": "cust_SI1bUGgO8o43cB",
        "quantity": 1,
        "notes": {
            "tenant_id": "1",
            "user_id": "1",
            "plan_name": "Pro Plan",
            "billing_price": "699",
        },
        "created_at": int(datetime.now(timezone.utc).timestamp()),
    },
    "invoice": {
        "id": "inv_RkN6rnuRjqtfcd",
        "entity": "invoice",
        "receipt": "INV-2025-001",
        "amount": 69900,  # paise
        "currency": "INR",
        "status": "issued",
        "created_at": int(datetime.now(timezone.utc).timestamp()),
    },
}

RAZORPAY_SUBSCRIPTION_ACTIVATED_PAYLOAD = {
    "event": "subscription.activated",
    "created_at": int(datetime.now(timezone.utc).timestamp()),
    "subscription": {
        "id": "sub_SI1bUGgO8o43cN",
        "entity": "subscription",
        "status": "active",
        "plan_id": "plan_SI1bUGgO8o43cA",
        "customer_id": "cust_SI1bUGgO8o43cB",
        "quantity": 1,
        "notes": {
            "tenant_id": "1",
            "user_id": "1",
            "plan_name": "Pro Plan",
        },
        "created_at": int(datetime.now(timezone.utc).timestamp()),
    },
}

RAZORPAY_PAYMENT_FAILED_PAYLOAD = {
    "event": "payment.failed",
    "created_at": int(datetime.now(timezone.utc).timestamp()),
    "payment": {
        "id": "pay_RkN7M2REwN9WxF",
        "entity": "payment",
        "amount": 69900,
        "currency": "INR",
        "status": "failed",
        "description": "Payment for subscription",
        "error_code": "BAD_REQUEST_ERROR",
        "error_description": "Payment failed",
        "created_at": int(datetime.now(timezone.utc).timestamp()),
    },
}

STRIPE_SUBSCRIPTION_CREATED_PAYLOAD = {
    "type": "customer.subscription.created",
    "created": int(datetime.now(timezone.utc).timestamp()),
    "data": {
        "object": {
            "id": "sub_stripe_12345",
            "customer": "cus_stripe_12345",
            "status": "active",
            "plan": {
                "id": "price_stripe_12345",
                "amount": 69900,  # cents
                "currency": "inr",
            },
            "metadata": {
                "tenant_id": "1",
                "user_id": "1",
                "plan_name": "Pro Plan",
            },
            "created": int(datetime.now(timezone.utc).timestamp()),
        }
    },
}

STRIPE_INVOICE_PAID_PAYLOAD = {
    "type": "invoice.paid",
    "created": int(datetime.now(timezone.utc).timestamp()),
    "data": {
        "object": {
            "id": "in_stripe_12345",
            "customer": "cus_stripe_12345",
            "subscription": "sub_stripe_12345",
            "status": "paid",
            "amount_paid": 69900,  # cents
            "amount_due": 69900,
            "currency": "inr",
            "created": int(datetime.now(timezone.utc).timestamp()),
        }
    },
}


async def test_razorpay_webhooks():
    """Test Razorpay webhook handlers."""
    print("\n=== Testing Razorpay Webhooks ===\n")

    db = await get_async_session()
    service = RazorpayWebhookService(db)

    print("1. Testing subscription.activated event...")
    result = await service.handle("subscription.activated", RAZORPAY_SUBSCRIPTION_ACTIVATED_PAYLOAD)
    print(f"   Result: {result}\n")

    print("2. Testing subscription.charged event...")
    result = await service.handle("subscription.charged", RAZORPAY_SUBSCRIPTION_CHARGED_PAYLOAD)
    print(f"   Result: {result}\n")

    print("3. Testing payment.failed event...")
    result = await service.handle("payment.failed", RAZORPAY_PAYMENT_FAILED_PAYLOAD)
    print(f"   Result: {result}\n")

    await db.close()


async def test_stripe_webhooks():
    """Test Stripe webhook handlers."""
    print("\n=== Testing Stripe Webhooks ===\n")

    db = await get_async_session()
    service = StripeWebhookService(db)

    print("1. Testing customer.subscription.created event...")
    result = await service.handle("customer.subscription.created", STRIPE_SUBSCRIPTION_CREATED_PAYLOAD)
    print(f"   Result: {result}\n")

    print("2. Testing invoice.paid event...")
    result = await service.handle("invoice.paid", STRIPE_INVOICE_PAID_PAYLOAD)
    print(f"   Result: {result}\n")

    await db.close()


async def main():
    """Run all webhook tests."""
    print("Starting webhook handler tests...\n")

    try:
        await test_razorpay_webhooks()
        await test_stripe_webhooks()
        print("\n✓ All webhook tests completed!")
    except Exception as e:
        print(f"\n✗ Test failed: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())
