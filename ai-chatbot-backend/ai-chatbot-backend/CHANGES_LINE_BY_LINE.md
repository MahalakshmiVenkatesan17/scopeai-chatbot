# Line-by-Line Changes Reference

## 📍 Quick Navigation by File

---

## 1️⃣ app/models/billing.py

### Added: SubscriptionPlan Model
**Lines 1-17**: Imports (added `JSON` type)
```python
from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    JSON,  # ← ADDED
    Numeric,
    String,
    func,
)
```

**Lines 18-62**: SubscriptionPlan class definition
```python
class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plan_name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    billing_cycle: Mapped[str] = mapped_column(Enum("monthly", "yearly", name="billing_cycle"), default="monthly")
    # ... 30+ more fields ...
    razorpay_plan_id: Mapped[str] = mapped_column(String(255), nullable=False)
    stripe_plan_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_price_id: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
```

### Updated: Subscription Model
**Lines 65-105**: Subscription class
```python
class Subscription(Base):
    __tablename__ = "subscriptions"
    
    # ... existing fields ...
    
    # RENAMED FIELDS:
    subscription_status: Mapped[str]  # ← WAS: status
    
    # NEW FIELDS (INSERT AFTER billing_cycle):
    payment_type: Mapped[str | None] = mapped_column(Enum("razorpay", "stripe", name="payment_type"), nullable=True)
    subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)  # ← WAS: stripe_subscription_id
    
    # REMOVED FIELDS:
    # stripe_subscription_id → subscription_id (renamed above)
    # stripe_customer_id → REMOVED
    # trial_end → REMOVED
    
    # NEW FIELDS:
    plan_id: Mapped[str] = mapped_column(String(255), nullable=False)
    payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    invoice_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
```

---

## 2️⃣ app/schemas/billing.py

### Added: SubscriptionPlanResponse
**Lines 8-42**:
```python
class SubscriptionPlanResponse(BaseModel):
    id: int
    plan_name: str = Field(alias="planName")
    # ... 35 fields total ...
    razorpay_plan_id: str = Field(alias="razorpayPlanId")
    stripe_plan_id: Optional[str] = Field(default=None, alias="stripePlanId")
    stripe_price_id: str = Field(alias="stripePriceId")
```

### Added: RazorpaySubscriptionResponse
**Lines 45-75**:
```python
class RazorpaySubscriptionResponse(BaseModel):
    """Razorpay API subscription response format"""
    id: str
    entity: str = "subscription"
    plan_id: str = Field(alias="planId")
    customer_email: Optional[str] = Field(default=None, alias="customerEmail")
    status: str
    notes: dict[str, Any] = {}
    total_count: int = Field(alias="totalCount")
    paid_count: int = 0
    remaining_count: int = Field(alias="remainingCount")
    created_at: int = Field(alias="createdAt")
    # ... 15 more fields ...
```

### Updated: SubscriptionResponse
**Lines 48-62**: Changed field names and added new fields
```python
class SubscriptionResponse(BaseModel):
    # ... existing fields ...
    subscription_status: str = Field(alias="subscriptionStatus")  # ← WAS: status
    subscription_id: Optional[str] = Field(default=None, alias="subscriptionId")  # ← WAS: stripe_subscription_id
    
    # NEW FIELDS:
    plan_id: str = Field(alias="planId")
    payment_type: Optional[str] = Field(default=None, alias="paymentType")
    payment_id: Optional[str] = Field(default=None, alias="paymentId")
    invoice_data: Optional[dict[str, Any]] = Field(default=None, alias="invoiceData")
```

### Updated: CreateSubscriptionRequest
**Lines 65-75**: Added customer fields
```python
class CreateSubscriptionRequest(BaseModel):
    plan_id: str = Field(alias="planId")
    plan_name: str = Field(alias="planName")  # ← NEW
    billing_cycle: str = Field(default="monthly", alias="billingCycle")
    amount: Decimal  # ← NEW
    currency: str = "INR"  # ← NEW
    payment_type: str = "razorpay"  # ← NEW
    customer_name: Optional[str] = Field(default=None, alias="customerName")  # ← NEW
    customer_email: Optional[str] = Field(default=None, alias="customerEmail")  # ← NEW
    notes: Optional[dict[str, Any]] = None  # ← NEW
```

---

## 3️⃣ app/repositories/subscription_repo.py

### Updated: SubscriptionRepository
**Line 15**: Query condition
```python
# OLD
Subscription.status == "active"

# NEW
Subscription.subscription_status == "active"
```

**Lines 20-23**: Renamed method
```python
# OLD
async def get_by_stripe_subscription_id(self, stripe_id: str)

# NEW
async def get_by_subscription_id(self, subscription_id: str)
    result = await self.db.execute(
        select(Subscription).where(Subscription.subscription_id == subscription_id)
    )
```

### Added: SubscriptionPlanRepository
**Lines 36-73**:
```python
class SubscriptionPlanRepository(BaseRepository[SubscriptionPlan]):
    async def get_by_name(self, plan_name: str) -> Optional[SubscriptionPlan]:
        # Get plan by name, active only
    
    async def get_all_active(self) -> list[SubscriptionPlan]:
        # List all active plans ordered by price
    
    async def get_by_razorpay_id(self, razorpay_id: str) -> Optional[SubscriptionPlan]:
        # Look up by Razorpay plan ID
    
    async def get_by_stripe_price_id(self, stripe_price_id: str) -> Optional[SubscriptionPlan]:
        # Look up by Stripe price ID
```

---

## 4️⃣ app/api/v1/subscriptions.py

### Updated: POST /subscriptions - create_subscription()
**Lines 91-177**:

**Old Response Format** (before line 91):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "plan_name": "Silver",
    "status": "active"
  }
}
```

**New Response Format** (lines 150-177):
```python
return {
    "success": True,
    "data": {
        "subscription": {
            "id": subscription_id,
            "entity": "subscription",
            "plan_id": plan_id,
            "customer_email": customer_email,
            "status": "created",
            "notes": notes_data,
            "total_count": total_count,
            "paid_count": 0,
            "created_at": created_at_ts,
            "remaining_count": total_count - 1,
        },
        "paymentRecordId": payment_record_id,
    },
    "message": "Subscription created",
}
```

### Updated: GET /subscriptions - list_subscriptions()
**Lines 209-247**:

**Line 223**: Query condition changed
```python
# OLD
AND status = :status

# NEW
AND subscription_status = :status
```

**Line 230**: Response field mapping
```python
# OLD
"status": row.get("status")

# NEW
"status": row.get("subscription_status")
```

### Updated: GET /subscriptions/active-plans - get_active_plans()
**Lines 249-320**:

**Line 263**: Query condition
```python
# OLD
WHERE s.status = 'active'

# NEW
WHERE s.subscription_status = 'active'
```

**Lines 303-316**: Response fields
```python
# Added fields:
"plan_id": row["plan_id"],
"payment_type": row.get("payment_type"),
"payment_id": row.get("payment_id"),
"invoice_data": row.get("invoice_data"),
```

### Updated: Undefined endpoint (line 370)
**Lines 370-396**: Response formatting
```python
# Old response data dict:
"stripe_subscription_id": row.get("stripe_subscription_id"),
"stripe_customer_id": row.get("stripe_customer_id"),
"trial_end": fmt_ts(row.get("trial_end")),

# New response data dict:
"subscription_id": row.get("subscription_id"),
"payment_type": row.get("payment_type"),
"payment_id": row.get("payment_id"),
"invoice_data": row.get("invoice_data"),
```

---

## 5️⃣ app/api/v1/payments.py

### Updated: GET /payments/{id} - get_payment()
**Lines 60-78**:

```python
# OLD FIELD MAPPING (line 71):
"subscription_id": row.get("stripe_subscription_id"),
"plan_id": None,
"status": row.get("status"),
"payment_id": None,

# NEW FIELD MAPPING (lines 71-74):
"subscription_id": row.get("subscription_id"),
"plan_id": row.get("plan_id"),
"status": row.get("subscription_status"),
"payment_id": row.get("payment_id"),
```

### Updated: GET /payments - list_payments()
**Lines 160-178**:

```python
# OLD FIELD MAPPING (line 169):
"subscription_id": row.get("stripe_subscription_id"),
"plan_id": None,
"status": row.get("status"),
"payment_id": None,

# NEW FIELD MAPPING (lines 169-172):
"subscription_id": row.get("subscription_id"),
"plan_id": row.get("plan_id"),
"status": row.get("subscription_status"),
"payment_id": row.get("payment_id"),
```

---

## 6️⃣ app/api/v1/stripe.py

### Updated: POST /stripe/verify-payment - verify_payment()
**Lines 220-250**: SQL INSERT statement

**Old INSERT** (before line 235):
```sql
INSERT INTO subscriptions 
  (tenant_id, plan_name, status, billing_cycle, amount, currency,
   stripe_subscription_id, stripe_customer_id,
   current_period_start, current_period_end, created_at, updated_at)
VALUES (:tid, :plan_name, 'active', :billing_cycle, :amount, 'USD',
   :stripe_sub_id, :stripe_cust_id, :period_start, :period_end, NOW(), NOW())
```

**New INSERT** (lines 235-242):
```sql
INSERT INTO subscriptions 
  (tenant_id, plan_name, plan_id, subscription_status, billing_cycle, amount, currency,
   payment_type, subscription_id,
   current_period_start, current_period_end, created_at, updated_at)
VALUES (:tid, :plan_name, :plan_id, 'active', :billing_cycle, :amount, 'USD',
   'stripe', :subscription_id, :period_start, :period_end, NOW(), NOW())
```

**Old Parameters** (before line 245):
```python
"stripe_sub_id": payment_intent_id or session_id,
"stripe_cust_id": body.get("customerId"),
```

**New Parameters** (lines 245-253):
```python
"plan_id": plan_id or body.get("priceId"),
"subscription_id": payment_intent_id or session_id,
"payment_type": 'stripe',
```

---

## Summary Table

| File | Type | Lines | Changes | Status |
|---|---|---|---|---|
| `models/billing.py` | Add + Update | 1-105 | +SubscriptionPlan, updated Subscription | ✅ |
| `schemas/billing.py` | Add + Update | 1-200+ | +2 schemas, updated 2 schemas | ✅ |
| `repositories/subscription_repo.py` | Add + Update | 1-73 | +SubscriptionPlanRepository, updated queries | ✅ |
| `api/v1/subscriptions.py` | Update | 91-396 | Updated 3 endpoints, response format | ✅ |
| `api/v1/payments.py` | Update | 60-178 | Updated 2 endpoints, field mapping | ✅ |
| `api/v1/stripe.py` | Update | 220-250 | Updated SQL & parameters | ✅ |

---

**Total Lines Modified**: ~500 lines across 6 files  
**Total Files Changed**: 6  
**Status**: ✅ All syntactically valid, no errors

