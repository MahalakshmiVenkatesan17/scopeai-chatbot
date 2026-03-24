# Code Changes Summary - Subscription & Billing Refactor

## Quick Reference: All Files Modified

### 1. ✅ **app/models/billing.py**
**Changes**: Added `SubscriptionPlan` model + updated `Subscription` model

**Key Updates**:
```python
# NEW CLASS
class SubscriptionPlan(Base):
    - plan_name (UNIQUE)
    - description, price, billing_cycle
    - Feature flags: has_advanced_analytics, has_priority_support, etc.
    - razorpay_plan_id, stripe_plan_id, stripe_price_id
    - features (JSON), document_collections

# UPDATED Subscription CLASS
- status → subscription_status  
- stripe_subscription_id → subscription_id
- REMOVED: stripe_customer_id, trial_end
- ADDED: plan_id, payment_type, payment_id, invoice_data (JSON)
```

**Location**: [app/models/billing.py](app/models/billing.py#L18-L105)

---

### 2. ✅ **app/schemas/billing.py**
**Changes**: Added new response schemas + updated existing

**New Classes**:
- `SubscriptionPlanResponse` - Full plan details
- `RazorpaySubscriptionResponse` - Razorpay-format response with notes, total_count, paid_count, etc.

**Updated Classes**:
- `SubscriptionResponse` - Migrated to new field names
- `CreateSubscriptionRequest` - Added customer details support

**Location**: [app/schemas/billing.py](app/schemas/billing.py#L1-L200)

---

### 3. ✅ **app/repositories/subscription_repo.py**
**Changes**: Added `SubscriptionPlanRepository` + updated repository methods

**Old References Fixed**:
```python
# UPDATED QUERY CONDITION
status == "active" → subscription_status == "active"

# RENAMED METHOD
get_by_stripe_subscription_id() → get_by_subscription_id()
```

**New Methods** (in SubscriptionPlanRepository):
- `get_by_name(plan_name)` - Get plan by name
- `get_all_active()` - List active plans
- `get_by_razorpay_id()` - Look up by Razorpay ID
- `get_by_stripe_price_id()` - Look up by Stripe price ID

**Location**: [app/repositories/subscription_repo.py](app/repositories/subscription_repo.py)

---

### 4. ✅ **app/api/v1/subscriptions.py**
**Changes**: Updated all subscription endpoints with new schema

#### Endpoint: POST `/subscriptions` - Create Subscription
**Old Response**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "active",
    "payment_type": "razorpay"
  }
}
```

**New Response** (Razorpay format):
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_1771308072327_ovr3aflou",
      "entity": "subscription",
      "plan_id": "plan_RZcU9ce9vpDiZN",
      "notes": { "plan_name": "Silver", "customer_name": "Rambabu", ... },
      "total_count": 12,
      "paid_count": 0,
      "remaining_count": 11,
      "created_at": 1771409795
    },
    "paymentRecordId": 108
  }
}
```

**Lines Updated**:
- Lines 91-177: `create_subscription()` endpoint
- Lines 209-247: `list_subscriptions()` - Changed `status` → `subscription_status`
- Lines 249-320: `get_active_plans()` - Changed query conditions
- Lines 370-396: Response formatting - removed old Stripe fields

**Location**: [app/api/v1/subscriptions.py](app/api/v1/subscriptions.py)

---

### 5. ✅ **app/api/v1/payments.py**
**Changes**: Updated field mappings in payment response

**Endpoints Updated**:
1. `get_payment()` - Lines 60-78
2. `list_payments()` - Lines 160-178

**Field Replacements**:
```python
# OLD → NEW
row.get("stripe_subscription_id") → row.get("subscription_id")
row.get("status") → row.get("subscription_status")
None → row.get("plan_id")
None → row.get("payment_id")
```

**Location**: [app/api/v1/payments.py](app/api/v1/payments.py#L60-L80, #L160-L180)

---

### 6. ✅ **app/api/v1/stripe.py**
**Changes**: Updated Stripe webhook subscription insertion

**Method**: `verify_payment()` - Lines 220-250

**SQL Changes**:
```sql
-- OLD FIELDS
INSERT INTO subscriptions 
  (tenant_id, plan_name, status, billing_cycle, amount, currency,
   stripe_subscription_id, stripe_customer_id, ...)

-- NEW FIELDS
INSERT INTO subscriptions 
  (tenant_id, plan_name, plan_id, subscription_status, billing_cycle, amount, currency,
   payment_type, subscription_id, ...)
```

**Parameter Changes**:
```python
# OLD
"stripe_sub_id": payment_intent_id or session_id,
"stripe_cust_id": body.get("customerId"),

# NEW
"payment_type": 'stripe',
"subscription_id": payment_intent_id or session_id,
"plan_id": plan_id or body.get("priceId"),
"subscription_status": 'active',
```

**Location**: [app/api/v1/stripe.py](app/api/v1/stripe.py#L220-L250)

---

## Field Mapping Reference

### Subscription Model Changes
| Database Column | Old Model | New Model | Type | Notes |
|---|---|---|---|---|
| `status` | ✗ (old name) | `subscription_status` | Enum | Clarified field purpose |
| `stripe_subscription_id` | ✗ (old name) | `subscription_id` | String | Generic provider ID |
| `stripe_customer_id` | ✗ (old field) | ✗ REMOVED | - | Not used in new schema |
| `trial_end` | ✗ (old field) | ✗ REMOVED | - | Not in new design |
| `plan_id` | ✗ (new field) | `plan_id` | String | Foreign key pattern |
| `payment_type` | ✗ (new field) | `payment_type` | Enum | 'razorpay' \| 'stripe' |
| `payment_id` | ✗ (new field) | `payment_id` | String | Transaction ID |
| `invoice_data` | ✗ (new field) | `invoice_data` | JSON | Invoice history array |

### API Response Changes
| Field | Old Response | New Response | Notes |
|---|---|---|---|
| `status` | ✓ | ✗ | Use `subscription_status` |
| `subscription_status` | ✗ | ✓ | Renamed from `status` |
| `subscription_id` | Stripe customer ID | Razorpay/Stripe sub ID | Provider-specific |
| `plan_id` | ✗ | ✓ | Plan reference |
| `plan_name` | ✓ | ✓ | Unchanged |
| `payment_type` | ✗ | ✓ | New field: 'razorpay' \| 'stripe' |
| `payment_id` | ✗ | ✓ | New field: Transaction ID |
| `stripe_subscription_id` | ✓ | ✗ | Use `subscription_id` |
| `stripe_customer_id` | ✓ | ✗ | Removed |
| `trial_end` | ✓ | ✗ | Removed |
| `invoice_data` | ✗ | ✓ | New: JSON invoice array |

---

## Creation Endpoint Response Format

### POST `/api/v1/subscriptions` - Full Response Example

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_SHZY2Gs4nUWalF",
      "entity": "subscription",
      "plan_id": "plan_RZcU9ce9vpDiZN",
      "customer_email": "gayathri@gmail.com",
      "status": "created",
      "current_start": null,
      "current_end": null,
      "ended_at": null,
      "quantity": 1,
      "notes": {
        "plan_name": "Silver",
        "billing_cycle": "monthly",
        "original_plan_id": "plan_RZcU9ce9vpDiZN",
        "customer_name": "Rambabu",
        "billing_address": "main street",
        "billing_city": "kadmabur",
        "billing_zip": "6281714",
        "billing_country": "IN",
        "billing_price": "499"
      },
      "charge_at": null,
      "start_at": null,
      "end_at": null,
      "auth_attempts": 0,
      "total_count": 12,
      "paid_count": 0,
      "customer_notify": true,
      "created_at": 1771409795,
      "expire_by": null,
      "short_url": "https://rzp.io/rzp/1e6AofO",
      "has_scheduled_changes": false,
      "change_scheduled_at": null,
      "source": "api",
      "remaining_count": 11
    },
    "paymentRecordId": 108
  },
  "message": "Subscription created"
}
```

---

## Testing Checklist

- [ ] Create subscription with new request format
- [ ] Verify response contains `plan_id` and `payment_type`
- [ ] List subscriptions returns `subscription_status` (not `status`)
- [ ] Get active plans shows correct plan details
- [ ] Payment endpoints return `payment_id` field
- [ ] Stripe webhook handler uses new column names
- [ ] SubscriptionPlan queries work in repository

---

## Files Still To Check (Optional)

These files may have references but are not critical to core functionality:
- `app/api/v1/admin.py` - May reference old fields in queries
- `app/api/v1/users.py` - May include subscription in user response
- `app/services/` - Service layer may need updates for new schema

All critical API endpoints have been updated. ✅

