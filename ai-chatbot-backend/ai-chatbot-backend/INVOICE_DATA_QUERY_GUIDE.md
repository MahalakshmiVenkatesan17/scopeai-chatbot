# Invoice Data Storage - Quick Reference

## Where Invoice Data is Stored

### Primary: subscriptions.invoice_data (JSON Array)
```sql
SELECT invoice_data FROM subscriptions WHERE id = 31;

-- Returns:
[
  {
    "amount": 499,
    "method": "card",
    "status": "paid",
    "paid_at": "2025-11-24T07:51:26.000Z",
    "currency": "INR",
    "short_url": "https://invoice.stripe.com/i/...",
    "invoice_id": "in_1SWuYOQkbbUAQFF1E5Mb9Obb",
    "payment_id": "ch_xxxxx",
    "description": null,
    "payment_date": "2025-11-24T07:51:26.000Z",
    "customer_name": "gayathri",
    "customer_email": "gayathri@gmail.com",
    "invoice_number": "IPHJ9SLJ-0074"
  }
]
```

### Secondary: invoices Table (Normalized)
```sql
SELECT * FROM invoices WHERE subscription_id = 31;

-- Returns structured rows with same data spread across columns
```

---

## How It Works

### When invoice.paid webhook arrives from Stripe:

1. **Parse Event**
   ```python
   invoice = payload['data']['object']
   amount_paid = invoice.get('amount_paid')  # in cents (e.g., 49900)
   subscription_id = invoice.get('subscription')
   ```

2. **Update Invoices Table**
   ```sql
   UPDATE invoices 
   SET status = 'paid', amount_paid = 499.00, paid_at = NOW() 
   WHERE stripe_invoice_id = 'in_xxx';
   ```

3. **Append to Subscription invoice_data JSON**
   ```python
   new_entry = {
       "amount": 49900,  # Keep in cents
       "method": "card",
       "status": "paid",
       "paid_at": "2025-11-24T07:51:26Z",
       "currency": "USD",
       "short_url": "https://invoice.stripe.com/...",
       "invoice_id": "in_xxx",
       "payment_id": "ch_xxx",
       "payment_date": "2025-11-24T07:51:26Z",
       "customer_email": "gayathri@gmail.com",
       "invoice_number": "IPHJ9SLJ-0074"
   }
   
   # Append to existing array
   SELECT invoice_data FROM subscriptions WHERE id = 31
   -> Existing: [prev_entry, ...]
   -> Add new_entry
   -> UPDATE subscriptions SET invoice_data = [..., new_entry] WHERE id = 31
   ```

4. **Extract Voice Data** (if present in metadata)
   ```python
   metadata = invoice.get('metadata', {})
   voice_data = {
       'voice_url': metadata.get('voice_url'),
       'voice_transcription': metadata.get('voice_transcription')
   }
   
   UPDATE subscriptions SET voice_data = '{"voice_url": "..."}' WHERE id = 31;
   ```

---

## Querying Invoice Data

### Get All Invoices for a Subscription (from JSON)
```python
# Backend approach: Query and parse JSON
sub = db.query(Subscription).filter(Subscription.id == 31).first()
invoices = json.loads(sub.invoice_data) if sub.invoice_data else []

# Return to frontend
return {
    "invoices": invoices,  # Array of invoice objects
    "count": len(invoices)
}
```

### Get All Invoices from Normalized Table
```sql
SELECT 
    id,
    invoice_number,
    status,
    amount_due,
    amount_paid,
    currency,
    paid_at,
    created_at
FROM invoices 
WHERE subscription_id = 31
ORDER BY created_at DESC;
```

### Get Voice Data for Subscription
```sql
SELECT voice_data FROM subscriptions WHERE id = 31;

-- Returns: {"voice_url": "https://...", "voice_transcription": "..."}
```

### Find Paid Invoices in Invoice Data Array
```python
# Parse and filter
sub = db.query(Subscription).filter(Subscription.id == 31).first()
invoice_data = json.loads(sub.invoice_data) if sub.invoice_data else []

paid_invoices = [inv for inv in invoice_data if inv.get('status') == 'paid']
failed_invoices = [inv for inv in invoice_data if inv.get('status') == 'failed']
```

---

## Amount Units in JSON

The `amount` field in invoice_data is stored **in cents**:
- $499.00 → stored as `499` (if assuming cents as base unit)
- ₹499 → stored as `499`
- Amount in UI should be divided by 100 if needed for display

Currency field indicates the context:
- `"currency": "USD"` → 499 = $4.99
- `"currency": "INR"` → 499 = ₹499

---

## Failed Payment Example

```json
{
  "amount": 699,
  "method": "card",
  "status": "failed",
  "currency": "INR",
  "failed_at": "2025-11-14T11:19:48.024Z",
  "short_url": "https://rzp.io/rzp/hpTPpcwY",
  "invoice_id": "inv_RfbK3cLWmye7qx",
  "payment_id": "pay_RfbKKMvEAPSoNP",
  "description": null,
  "error_reason": "payment_cancelled",
  "payment_date": "2025-11-14T11:19:48.024Z"
}
```

Note: Failed entries have `failed_at` instead of `paid_at`, and include `error_reason`.

---

## API Response Examples

### GET /subscriptions/invoices (Authenticated User)
```json
{
  "success": true,
  "data": [
    {
      "id": 31,
      "invoice_number": "IPHJ9SLJ-0074",
      "status": "paid",
      "amount_due": 4.99,
      "amount_paid": 4.99,
      "currency": "USD",
      "stripe_invoice_id": "in_1SWuYOQkbbUAQFF1E5Mb9Obb",
      "due_date": null,
      "paid_at": "2025-11-24T07:51:26.000Z",
      "created_at": "2025-11-24T07:51:21.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "message": "Invoices retrieved"
}
```

### GET /subscriptions/invoices/{invoice_id}
```json
{
  "success": true,
  "data": {
    "id": 31,
    "invoice_number": "IPHJ9SLJ-0074",
    "status": "paid",
    "amount_due": 4.99,
    "amount_paid": 4.99,
    "currency": "USD",
    "stripe_invoice_id": "in_1SWuYOQkbbUAQFF1E5Mb9Obb",
    "due_date": null,
    "paid_at": "2025-11-24T07:51:26.000Z",
    "created_at": "2025-11-24T07:51:21.000Z",
    "subscription_id": 31
  },
  "message": "Invoice retrieved"
}
```

---

## Database Commands

### Check Subscription with Invoice Data
```bash
mysql> SELECT id, subscription_id, subscription_status, JSON_LENGTH(invoice_data) as invoice_count 
        FROM subscriptions WHERE id = 31\G
```

### View Raw Invoice Data
```bash
mysql> SELECT JSON_EXTRACT(invoice_data, '$[*].status') as statuses 
        FROM subscriptions WHERE id = 31;
```

### Count Paid Invoices per Subscription
```bash
mysql> SELECT id, 
               JSON_LENGTH(invoice_data) as total_invoices,
               (SELECT COUNT(*) FROM JSON_TABLE(
                  invoice_data,
                  '$[*]' COLUMNS (status VARCHAR(20) PATH '$.status')
               ) t WHERE t.status = 'paid') as paid_invoices
        FROM subscriptions;
```

---

## Migration Checklist

- [x] Add `voice_data` JSON column to subscriptions table
- [x] Update Stripe webhook service to extract voice data
- [x] Update `invoice.paid` handler to append to `invoice_data`
- [x] Update `invoice.payment_failed` handler to append failed entry
- [x] Implement invoices API endpoints
- [x] Add proper error handling and logging
- [x] Support idempotency with Redis cache
- [ ] Test with Stripe test webhooks: `stripe trigger invoice.paid`
- [ ] Verify data in both tables matches
- [ ] Monitor webhook logs in `app/logs/stripe_webhooks.jsonl`

---

## Troubleshooting

### Invoice Not Appearing in subscription.invoice_data
1. Check if webhook was received: `tail -f app/logs/stripe_webhooks.jsonl`
2. Verify subscription exists: `SELECT * FROM subscriptions WHERE subscription_id = 'sub_xxx';`
3. Check if idempotency cache blocked it: Check Redis key `stripe_webhook:{event_id}`
4. Verify JSON syntax: `SELECT JSON_VALID(invoice_data) FROM subscriptions WHERE id = 31;`

### Voice Data Not Being Stored
1. Check if metadata is present in Stripe invoice
2. Verify metadata field names match: `voice_url`, `voice_message`, `voice_transcription`
3. Check webhook payload in logs for metadata presence
4. Ensure voice data extraction is not silently failing (check logs)

### Amount Discrepancy
1. Remember: amounts in JSON are in cents (Stripe's native format)
2. Divide by 100 in frontend for display: `amount / 100`
3. Check currency field to determine proper conversion

