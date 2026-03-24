# Database Schema & Code Changes Documentation

## Overview
Subscription and billing system has been refactored to support flexible payment processors (Razorpay, Stripe) and enhanced subscription management with plans as first-class entities.

---

## Database Changes

### New Table: `subscription_plans`

**Purpose**: Store subscription plan definitions with features and pricing.

**New Fields**:
- `id` (PK, Integer)
- `plan_name` (String, UNIQUE) - e.g., "Free", "Silver", "Gold", "Platinum"
- `description` (String)
- `price` (Decimal 10,2) - Base price
- `billing_cycle` (Enum: 'monthly', 'yearly')
- `concurrent_users` (Integer, nullable)
- `document_collections_limit` (Integer, nullable)
- `max_file_upload_mb` (Integer, nullable)
- `storage_limit_gb` (Integer, nullable)
- `card_color` (String) - UI color for plan card
- `icon_color` (String) - Icon color
- `icon_bg_color` (String) - Icon background color
- `has_advanced_analytics` (Boolean)
- `has_priority_support` (Boolean)
- `has_chat_interface` (Boolean, default=true)
- `has_semantic_search` (Boolean)
- `has_custom_integrations` (Boolean)
- `has_unlimited_storage` (Boolean)
- `has_unlimited_uploads` (Boolean)
- `has_community_support` (Boolean)
- `has_dedicated_support` (Boolean)
- `is_active` (Boolean, default=true)
- `features` (JSON) - Dynamic feature list
- `document_collections` (Integer, nullable)
- `razorpay_plan_id` (String) - Razorpay plan ID
- `stripe_plan_id` (String, nullable) - Stripe product ID
- `stripe_price_id` (String) - Stripe price ID
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

---

### Updated Table: `subscriptions`

**Renamed Fields**:
| Old Name | New Name | Type | Notes |
|----------|----------|------|-------|
| `status` | `subscription_status` | Enum | 'active', 'cancelled', 'expired', 'past_due' |
| `stripe_subscription_id` | `subscription_id` | String | Generic field for any provider |
| (Removed) | `stripe_customer_id` | - | Customer tracking handled separately |
| (Removed) | `trial_end` | - | Not in new schema |

**New Fields**:
| Field | Type | Notes |
|-------|------|-------|
| `plan_id` | String(255) | Reference to subscription plan (RazorpayID or StripeID) |
| `payment_type` | Enum('razorpay', 'stripe') | Payment processor |
| `payment_id` | String(255) | Payment transaction ID |
| `invoice_data` | JSON | Stores invoice history as array |

---

## Code Changes by File

### 1. **app/models/billing.py**

**Added**:
- New `SubscriptionPlan` model with all plan-related fields
- Updated imports to include `JSON` sqlalchemy type

**Updated** `Subscription` model:
```python
# Old → New
status → subscription_status  
stripe_subscription_id → subscription_id
stripe_customer_id → (removed)
trial_end → (removed)

# New fields added:
plan_id: Mapped[str]
payment_type: Mapped[str | None] = Enum('razorpay', 'stripe')
payment_id: Mapped[str | None]
invoice_data: Mapped[dict | None] = mapped_column(JSON)
```

---

### 2. **app/schemas/billing.py**

**Added**:
- `SubscriptionPlanResponse` - Full response schema for subscription plans
- `RazorpaySubscriptionResponse` - Razorpay API response format with:
  - `id`, `entity`, `plan_id`, `customer_email`
  - `notes` (dict with customer details)
  - `total_count`, `paid_count`, `remaining_count`
  - `short_url`, `source`, `created_at` (unix timestamp)

**Updated**:
- `SubscriptionResponse` - Migrated to new field names:
  - `status` → `subscription_status`
  - Added `plan_id`, `payment_type`, `payment_id`, `invoice_data`
  
- `CreateSubscriptionRequest` - Enhanced with:
  - `plan_name`, `customer_name`, `customer_email`
  - `notes` dict for flexible metadata

---

### 3. **app/repositories/subscription_repo.py**

**Added**:
- New `SubscriptionPlanRepository` class with methods:
  - `get_by_name()` - Find active plan by name
  - `get_all_active()` - List all active plans
  - `get_by_razorpay_id()` - Look up by Razorpay ID
  - `get_by_stripe_price_id()` - Look up by Stripe price ID

**Updated** `SubscriptionRepository`:
```python
# Old → New
status == "active" → subscription_status == "active"
get_by_stripe_subscription_id() → get_by_subscription_id()
```

---

### 4. **app/api/v1/subscriptions.py**

#### POST `/subscriptions` - Create Subscription

**Request Body**:
```json
{
  "planId": "plan_RZcU9ce9vpDiZN",
  "planName": "Silver",
  "billingCycle": "monthly",
  "amount": 499,
  "currency": "INR",
  "paymentType": "razorpay",
  "customerName": "Rambabu",
  "customerEmail": "user@example.com",
  "notes": { "billing_address": "main street", "billing_zip": "6281714" }
}
```

**Response Format** (Razorpay format):
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_1771308072327_ovr3aflou",
      "entity": "subscription",
      "plan_id": "plan_RZcU9ce9vpDiZN",
      "customer_email": "user@example.com",
      "status": "created",
      "quantity": 1,
      "notes": {
        "plan_name": "Silver",
        "billing_cycle": "monthly",
        "original_plan_id": "plan_RZcU9ce9vpDiZN",
        "customer_name": "Rambabu",
        "billing_price": "499"
      },
      "total_count": 12,
      "paid_count": 0,
      "created_at": 1771409795,
      "short_url": "https://rzp.io/rzp/1e6AofO",
      "source": "api"
    },
    "paymentRecordId": 108
  },
  "message": "Subscription created"
}
```

#### GET `/subscriptions` - List Subscriptions

**Updated Field Names**:
- `status` → `subscription_status`
- `subscription_id` now contains the payment processor ID (Razorpay/Stripe)
- Added `payment_type`, `payment_id`, `invoice_data`

#### GET `/subscriptions/active-plans` - Active Plans

**Updated Query**:
```sql
-- Old
WHERE s.status = 'active'

-- New
WHERE s.subscription_status = 'active'
```

**Response Updates**:
- Added `plan_id` field
- Added `payment_type` field
- Renamed `status` to `subscription_status`

---

### 5. **app/api/v1/payments.py**

**Updated Response Fields**:
```python
# Old → New
"subscription_id": row.get("stripe_subscription_id")
→ "subscription_id": row.get("subscription_id")

"plan_id": None
→ "plan_id": row.get("plan_id")

"status": row.get("status")
→ "status": row.get("subscription_status")

"payment_id": None
→ "payment_id": row.get("payment_id")
```

Both `get_payment()` and `list_payments()` endpoints updated.

---

### 6. **app/api/v1/stripe.py**

**Updated INSERT Statement** (verify_payment endpoint):
```python
# Old field names:
"status, stripe_subscription_id, stripe_customer_id"

# New field names:
"subscription_status, payment_type, subscription_id, plan_id"

# New values:
{
  "plan_id": plan_id or body.get("priceId"),
  "subscription_status": 'active',
  "payment_type": 'stripe',
  "subscription_id": payment_intent_id or session_id,
}
```

---

## Migration Path

### Step 1: Apply Database Schema
```bash
# Drop old columns and add new ones to subscriptions table
ALTER TABLE subscriptions
  DROP COLUMN stripe_customer_id,
  DROP COLUMN trial_end,
  RENAME COLUMN status TO subscription_status,
  RENAME COLUMN stripe_subscription_id TO subscription_id,
  ADD COLUMN plan_id VARCHAR(255) NOT NULL,
  ADD COLUMN payment_type ENUM('razorpay', 'stripe'),
  ADD COLUMN payment_id VARCHAR(255),
  ADD COLUMN invoice_data JSON;

# Create subscription_plans table (see SQL/init.sql update)
```

### Step 2: Deploy Code Changes
1. Update `app/models/billing.py`
2. Update `app/schemas/billing.py`
3. Update `app/repositories/subscription_repo.py`
4. Update all API endpoint files

### Step 3: Data Migration
```sql
-- Populate plan_id from existing plan_name
UPDATE subscriptions 
SET plan_id = CONCAT('legacy_', plan_name)
WHERE plan_id IS NULL;

-- Set payment_type based on subscription_id format
UPDATE subscriptions 
SET payment_type = CASE 
  WHEN subscription_id LIKE 'sub_%' THEN 'razorpay'
  WHEN subscription_id LIKE 'pi_%' THEN 'stripe'
  ELSE 'razorpay'
END;
```

---

## API Response Format Changes

### Before
```json
{
  "subscription_id": "cus_123abc",
  "status": "active",
  "billing_cycle": "monthly"
}
```

### After
```json
{
  "subscription_id": "sub_1771308072327_ovr3aflou",
  "subscription_status": "active",
  "payment_type": "razorpay",
  "payment_id": "pay_RjvSBmtatjxhWJ",
  "plan_id": "plan_RZcU9ce9vpDiZN",
  "plan_name": "Silver",
  "billing_cycle": "monthly",
  "invoice_data": [
    {
      "amount": 499,
      "method": "card",
      "status": "paid",
      "paid_at": "2025-11-25T09:38:05.071Z",
      "currency": "INR",
      "payment_id": "pay_RjvSBmtatjxhWJ",
      "customer_email": "user@example.com"
    }
  ]
}
```

---

## Files Modified Summary

| File | Changes | Impact |
|------|---------|--------|
| `app/models/billing.py` | +SubscriptionPlan class, updated Subscription | Models |
| `app/schemas/billing.py` | +SubscriptionPlanResponse, +RazorpaySubscriptionResponse, updated SubscriptionResponse | Schema validation |
| `app/repositories/subscription_repo.py` | +SubscriptionPlanRepository, updated queries | Data access |
| `app/api/v1/subscriptions.py` | Updated all endpoints with new response format | Razorpay API |
| `app/api/v1/payments.py` | Updated field mappings in 2 endpoints | Payment handlers |
| `app/api/v1/stripe.py` | Updated INSERT with new fields | Stripe webhook handling |

---

## Testing

### Test Endpoints After Deployment

```bash
# Create subscription
curl -X POST http://localhost:8000/api/v1/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_RZcU9ce9vpDiZN",
    "planName": "Silver",
    "billingCycle": "monthly",
    "amount": 499,
    "currency": "INR",
    "paymentType": "razorpay"
  }'

# List subscriptions
curl http://localhost:8000/api/v1/subscriptions \
  -H "Authorization: Bearer $TOKEN"

# Get active plans
curl http://localhost:8000/api/v1/subscriptions/active-plans \
  -H "Authorization: Bearer $TOKEN"
```

---

## Breaking Changes

⚠️ **API clients must update to use**:
- `subscription_status` instead of `status`
- `plan_id` field (now required)
- `payment_type` field for payment processor identification
- `invoice_data` JSON array instead of flat fields

---

## Backward Compatibility

❌ **Not maintained** - This is a breaking schema change. Frontend and external integrations must be updated.

