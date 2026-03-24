# Stripe Verify-Payment Endpoint Fix - Summary

## Problem

The `/api/v1/stripe/verify-payment` endpoint was inserting subscriptions with `NULL` plan_id, causing this error:

```
(pymysql.err.IntegrityError) (1048, "Column 'plan_id' cannot be null")
```

## Root Cause

The endpoint was not extracting `plan_id` from the request parameters before inserting into the database.

## Solution Implemented

Updated [stripe.py](../app/api/v1/stripe.py) `/verify-payment` endpoint to:

### 1. **Extract plan_id from Request**

```python
plan_id = body.get("plan_id") or body.get("priceId")
```

### 2. **Fall Back to Stripe Session**

If plan_id not provided, extract from Stripe checkout session line items:

```python
if session_id:
    session = stripe_service.get_checkout_session(session_id)
    # Extract plan_id from line items if not provided
    if not returned_plan_id and session.line_items and len(session.line_items.data) > 0:
        returned_plan_id = session.line_items.data[0].price.id
```

### 3. **Validate Before Insert**

Ensure plan_id is not null:

```python
if not returned_plan_id:
    return {
        "success": False,
        "error": {"code": "MISSING_PLAN_ID", "message": "Could not determine plan_id from session or subscription"},
    }
```

### 4. **Pass to Database**

```python
result = await db.execute(
    text(...),
    {
        "tid": current_user.tenant_id,
        "plan_name": plan_name,
        "plan_id": returned_plan_id,  # ← Now properly passed
        ...
    },
)
```

### 5. **Enhanced Response**

Return complete subscription details including plan_id:

```python
{
    "success": True,
    "data": {
        "verified": True,
        "subscriptionId": sub_id,
        "sessionId": session_id,
        "subscriptionStripeId": subscription_id,
        "paymentIntentId": payment_intent_id,
        "planId": returned_plan_id,  # ← Returned for reference
        "status": "active",
        "plan_name": plan_name,
        ...
    }
}
```

## Verification

Database records now show proper plan_id values:

```
Subscription ID | Plan ID                      | Payment Type | Status
102             | plan_RZa7abq7vrdJdG         | razorpay     | created
101             | plan_RZcU9ce9vpDiZN         | razorpay     | created
88              | price_1SVB7YQkbbUAQFF1Q... | stripe       | cancelled
```

All subscriptions created with Stripe/Razorpay now have valid plan_id values - no more NULL errors!

## Files Changed

- [app/api/v1/stripe.py](../app/api/v1/stripe.py) - Updated `/verify-payment` endpoint

## Endpoint Behavior

The endpoint now accepts plan_id in these ways (in order of precedence):

1. **Direct parameter**: `"plan_id": "price_XXX"` in request body
2. **Alternative parameter**: `"priceId": "price_XXX"` in request body
3. **From Stripe Session**: Extracted from `session.line_items[0].price.id` if session_id provided
4. **From Stripe Subscription**: Extracted from `subscription.items[0].price.id` if subscription_id provided

## Request Format

```json
{
  "session_id": "cs_test_a1234567890",
  "plan_id": "price_pro_monthly",
  "planName": "Professional",
  "amount": 9900,
  "billingCycle": "monthly"
}
```

## Response Format

```json
{
  "success": true,
  "data": {
    "verified": true,
    "subscriptionId": 102,
    "sessionId": "cs_test_a1234567890",
    "subscriptionStripeId": null,
    "paymentIntentId": "pi_1234567890",
    "planId": "price_pro_monthly",
    "status": "active",
    "plan_name": "Professional",
    "current_period_start": "2026-02-19T10:28:30.000Z",
    "current_period_end": "2026-03-21T10:28:30.000Z"
  },
  "message": "Payment verified successfully"
}
```
