# Webhook Implementation Guide

## Overview

This implementation provides robust webhook handlers for **Razorpay** and **Stripe** payment gateways. The webhooks handle subscription lifecycle events, payment tracking, and invoice management with automatic database synchronization.

---

## Architecture

### Services

1. **RazorpayWebhookService** (`app/services/razorpay_webhook_service.py`)
   - Handles Razorpay events
   - Manages subscription state transitions
   - Creates and updates invoices
   - Stores event payloads for audit trails

2. **StripeWebhookService** (`app/services/stripe_webhook_service.py`)
   - Handles Stripe events
   - Links Stripe subscriptions to local DB records
   - Manages invoice lifecycle
   - Supports payment tracking

3. **Router Integration** (`app/app/api/v1/subscriptions.py`)
   - `POST /subscriptions/webhook` → Razorpay events
   - `POST /subscriptions/stripe-webhook` → Stripe events
   - Signature verification
   - Error handling

---

## Supported Events

### Razorpay Events

| Event                    | Handler                          | Actions                                 |
| ------------------------ | -------------------------------- | --------------------------------------- |
| `subscription.activated` | `_handle_subscription_activated` | Mark subscription as `active`           |
| `subscription.charged`   | `_handle_subscription_charged`   | Create invoice, update period_end       |
| `subscription.cancelled` | `_handle_subscription_cancelled` | Mark as `cancelled`, set `cancelled_at` |
| `subscription.paused`    | `_handle_subscription_paused`    | Mark as `paused`                        |
| `subscription.resumed`   | `_handle_subscription_resumed`   | Mark as `active`                        |
| `payment.authorized`     | `_handle_payment_authorized`     | Log authorization                       |
| `payment.failed`         | `_handle_payment_failed`         | Log failure                             |
| `invoice.issued`         | `_handle_invoice_issued`         | Log invoice issuance                    |
| `invoice.paid`           | `_handle_invoice_paid`           | Update invoice status to `paid`         |

### Stripe Events

| Event                           | Handler                          | Actions                              |
| ------------------------------- | -------------------------------- | ------------------------------------ |
| `customer.subscription.created` | `_handle_subscription_created`   | Link Stripe ID to local subscription |
| `customer.subscription.updated` | `_handle_subscription_updated`   | Update status                        |
| `customer.subscription.deleted` | `_handle_subscription_deleted`   | Mark as `cancelled`                  |
| `invoice.created`               | `_handle_invoice_created`        | Create invoice record                |
| `invoice.finalized`             | `_handle_invoice_finalized`      | Log finalization                     |
| `invoice.paid`                  | `_handle_invoice_paid`           | Mark as `paid`                       |
| `invoice.payment_failed`        | `_handle_invoice_payment_failed` | Mark as `failed`                     |
| `charge.succeeded`              | `_handle_charge_succeeded`       | Log charge                           |
| `charge.failed`                 | `_handle_charge_failed`          | Log failure                          |

---

## Database Schema

### Subscriptions Table

```sql
subscriptions:
  - id (PK)
  - tenant_id
  - subscription_id (Razorpay: sub_XXX)
  - subscription_status (active, cancelled, paused, created)
  - plan_id
  - plan_name
  - amount
  - currency
  - billing_cycle
  - payment_type (razorpay, stripe)
  - invoice_data (JSON - stores full webhook payload)
  - stripe_subscription_id (Stripe: sub_XXX)
  - stripe_customer_id
  - current_period_start
  - current_period_end
  - cancelled_at
  - created_at
  - updated_at
```

### Invoices Table

```sql
invoices:
  - id (PK)
  - tenant_id
  - subscription_id (FK → subscriptions.id)
  - invoice_id (Razorpay: inv_XXX or custom)
  - stripe_invoice_id (Stripe: in_XXX)
  - invoice_number
  - amount_due
  - amount_paid
  - currency
  - status (draft, issued, paid, failed)
  - description
  - invoice_type
  - short_url
  - notes (JSON)
  - created_at
  - updated_at
```

---

## Event Flow Examples

### Example 1: Razorpay Subscription Payment

```
User creates subscription via /subscriptions POST
  ↓
Razorpay creates subscription (status: created)
  ↓
Subscription.activated webhook fires
  ↓
Handler: mark subscription as 'active'
  ↓
User pays
  ↓
Subscription.charged webhook fires
  ↓
Handler: Create invoice, update current_period_end
  ↓
Invoice stored in DB with status 'paid'
```

### Example 2: Payment Failure Recovery

```
Subscription.charged fires
  ↓
Payment processing fails (network issue)
  ↓
Payment.failed webhook fires
  ↓
Handler: log failure (best-effort recovery)
  ↓
Admin dashboard shows failed payment
```

### Example 3: Stripe Subscription Sync

```
Stripe subscription created (via API)
  ↓
customer.subscription.created webhook fires
  ↓
Handler: Find local subscription by metadata
  ↓
Link Stripe IDs (stripe_subscription_id, stripe_customer_id)
  ↓
Invoice created event fires
  ↓
Handler: Create local invoice record
  ↓
Invoice.paid event fires
  ↓
Handler: Update invoice status to 'paid'
```

---

## Configuration

### Environment Variables

```bash
# Razorpay
RAZORPAY_KEY_SECRET=your_webhook_secret

# Stripe
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_SECRET_KEY=sk_live_your_key
```

### Webhook Registration

#### Razorpay

1. Go to https://dashboard.razorpay.com/settings/webhooks
2. Add webhook URL: `https://your-domain.com/api/v1/subscriptions/webhook`
3. Select events: subscription._, payment._, invoice.\*
4. Copy webhook secret to `RAZORPAY_KEY_SECRET`

#### Stripe

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.com/api/v1/subscriptions/stripe-webhook`
3. Select events: customer.subscription._, invoice._, charge.\*
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Invoice created",
  "data": {
    "success": true,
    "message": "Subscription charged",
    "invoice_id": "inv_RkN6rnuRjqtfcd"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Invalid webhook signature"
  }
}
```

---

## Testing

### Run Webhook Tests

```bash
cd app
python test_webhooks.py
```

### Manual Testing with cURL

#### Razorpay

```bash
curl -X POST http://localhost:8000/api/v1/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -d @payload.json
```

#### Stripe

```bash
curl -X POST http://localhost:8000/api/v1/subscriptions/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1234567890,v1=signature_here" \
  -d @stripe_payload.json
```

### Test Payload Examples

See `test_webhooks.py` for sample payloads:

- `RAZORPAY_SUBSCRIPTION_CHARGED_PAYLOAD`
- `RAZORPAY_SUBSCRIPTION_ACTIVATED_PAYLOAD`
- `STRIPE_SUBSCRIPTION_CREATED_PAYLOAD`
- `STRIPE_INVOICE_PAID_PAYLOAD`

---

## Error Handling

### Graceful Degradation

All handlers use try-catch blocks with:

- Database rollback on error
- Detailed logging
- Safe error responses (no stack traces to clients)
- Best-effort updates (partial failures don't block entire webhook)

### Example: Best-Effort Invoice Data Storage

```python
try:
    await db.execute(
        text("UPDATE subscriptions SET invoice_data = :data WHERE id = :id"),
        {"data": json.dumps(invoice), "id": db_id},
    )
except Exception:
    # Don't fail webhook if invoice_data update fails
    logger.warning(f"Failed to store invoice_data for {db_id}")
```

### Retry Strategy

- Razorpay: Uses webhook signature for idempotency
- Stripe: Automatically retries failed webhooks (24 hours)
- Local: Implement idempotency keys for critical operations

---

## Database Consistency

### Foreign Key Integrity

```sql
-- Ensure invoices reference valid subscriptions
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_subscription_id
FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);
```

### Atomic Operations

All critical operations use transactions:

```python
await db.execute(...)
await db.execute(...)
await db.commit()  # All-or-nothing
```

### Audit Trail

All payloads stored in `subscriptions.invoice_data` for debugging:

```json
{
  "webhook_event": "subscription.charged",
  "payload": { ... }
}
```

---

## Troubleshooting

### Issue: "Invalid Webhook Signature"

**Solution:** Verify webhook secret matches gateway config

```bash
# Razorpay
echo $RAZORPAY_KEY_SECRET

# Stripe
echo $STRIPE_WEBHOOK_SECRET
```

### Issue: "Subscription not found"

**Solution:** Check that local subscription record matches gateway subscription_id

```sql
SELECT id, subscription_id FROM subscriptions
WHERE subscription_id = 'sub_SI1bUGgO8o43cN';
```

### Issue: Invoice not created

**Solution:** Check DB connection and tenant_id extraction

```python
# Ensure tenant_id is passed in notes
{
  "notes": {
    "tenant_id": "1",
    "user_id": "1"
  }
}
```

### Debug Logs

All webhook events logged to `app/logs/`:

```bash
tail -f app/logs/app.log | grep "webhook"
```

---

## Performance Considerations

1. **Async Operations**: All DB calls are async-first
2. **No Blocking**: Webhooks return immediately after validation
3. **Scheduled Sync**: Consider background job for missed webhooks
4. **Caching**: Cache subscription status in Redis if needed

---

## Security

1. **Signature Verification**: All webhooks validated before processing
2. **No Token Required**: Webhooks are signature-authenticated, not auth-token based
3. **Sensitive Data**: Avoid logging payment details
4. **HTTPS Only**: Enforce HTTPS for webhook URLs in production

---

## Next Steps

1. **Deploy webhooks** to production
2. **Configure gateway webhooks** (Razorpay & Stripe dashboards)
3. **Test end-to-end** with test transactions
4. **Monitor logs** for webhook failures
5. **Implement dashboard** to view sync status
6. **Set up alerts** for payment failures

---

## Related Endpoints

- `POST /subscriptions` - Create subscription
- `POST /subscriptions/verify-payment` - Verify payment
- `GET /subscriptions/invoices` - List invoices
- `GET /subscriptions/details` - Get subscription details
- `POST /subscriptions/invoices` - Create invoice manually

---

**Last Updated:** February 19, 2026
