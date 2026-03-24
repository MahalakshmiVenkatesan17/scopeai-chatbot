# Stripe Invoice Data Storage Architecture

## Overview
Invoice data from Stripe webhooks is now stored in two complementary ways:

### 1. **Subscriptions Table - `invoice_data` JSON Column** (Primary History)
- **Purpose**: Maintains complete invoice history as a JSON array
- **Location**: `subscriptions.invoice_data`
- **Format**: Array of invoice objects matching the dump format
- **Use Case**: Frontend display of invoice history, audit trail

### 2. **Invoices Table** (Normalized View)
- **Purpose**: Normalized table for relational queries
- **Location**: `invoices` table with foreign key to subscriptions
- **Use Case**: API queries, reporting, invoice lookups

---

## Invoice Data JSON Format

Each invoice entry in `subscriptions.invoice_data` follows this structure:

```json
{
  "amount": 499,                                    // Amount in cents
  "method": "card",                                 // Payment method
  "status": "paid",                                 // Status: paid, failed, etc.
  "paid_at": "2025-11-24T07:51:26.000Z",           // ISO 8601 timestamp
  "currency": "INR",                                // Currency code (uppercase)
  "short_url": "https://invoice.stripe.com/i/...", // Hosted invoice URL
  "invoice_id": "in_1SWuYOQkbbUAQFF1E5Mb9Obb",    // Stripe invoice ID
  "payment_id": "ch_1SWu... or pi_1SWu...",       // Charge or payment intent ID
  "description": null,                              // Optional description
  "payment_date": "2025-11-24T07:51:26.000Z",     // Same as paid_at
  "customer_name": "gayathri",                      // From customer_details
  "customer_email": "gayathri@gmail.com",          // From invoice
  "invoice_number": "IPHJ9SLJ-0074"                // Stripe invoice number
}
```

### Failed Payment Format
```json
{
  "amount": 499,
  "method": "card",
  "status": "failed",
  "currency": "INR",
  "failed_at": "2025-11-14T11:19:48.024Z",
  "short_url": "https://invoice.stripe.com/i/...",
  "invoice_id": "inv_RfbK3cLWmye7qx",
  "payment_id": "pay_RfbKKMvEAPSoNP",
  "description": null,
  "error_reason": "payment_cancelled",
  "payment_date": "2025-11-14T11:19:48.024Z",
  "customer_email": "gayathri@gmail.com"
}
```

---

## Webhook Event Handling

### `invoice.created`
- Creates normalized record in `invoices` table
- Stores: amount, currency, status, invoice number
- Links to subscription via `subscription_id`

### `invoice.paid`
- Updates `invoices` table status to `paid`
- Appends invoice entry to `subscriptions.invoice_data` JSON array
- Updates subscription period dates from invoice line items
- Extracts and stores voice data if present in metadata
- Sets subscription status to `active`

### `invoice.payment_failed`
- Updates `invoices` table status to `failed`
- Appends failed payment entry to `subscriptions.invoice_data`
- Sets subscription status to `past_due`
- Logs error reason for audit trail

---

## Voice Data Extraction

Voice data is extracted from Stripe invoice metadata and stored in `subscriptions.voice_data`:

```json
{
  "voice_url": "https://...",
  "voice_message": "...",
  "voice_transcription": "...",
  "audio_recording": "..."
}
```

**Metadata Keys Checked**:
- `voice_url`
- `voice_message`
- `voice_transcription`
- Any metadata key containing "voice" or "audio"

---

## API Endpoints

### Get User Invoices
```
GET /subscriptions/invoices
Query: ?page=1&limit=20&status=paid
Response: Paginated invoice list from `invoices` table
```

### Get Subscription Invoices
```
GET /subscriptions/invoices/subscription/{subscription_id}
Response: All invoices for subscription
```

### Get Single Invoice
```
GET /subscriptions/invoices/{invoice_id}
Response: Detailed invoice with all fields
```

### Admin: Get User Invoices
```
GET /subscriptions/invoices/admin/user/{user_id}
Response: All invoices across user's tenants
```

### Admin: Get User Subscription Invoices
```
GET /subscriptions/invoices/admin/user/{user_id}/subscription/{subscription_id}
Response: Invoices for specific user subscription
```

---

## Database Migration

Run the migration to add `voice_data` column:

```bash
mysql -u chatbot_admin_db -p ai_chatbot_saas < sql/add_voice_data_column.sql
```

---

## Example Webhook Payload Processing

### Process Flow
1. **Webhook Received**: POST `/subscriptions/stripe-webhook`
2. **Signature Verification**: Stripe-Signature header validated
3. **Event Routing**: Routed to appropriate handler based on `type`
4. **Invoice Paid** Example:
   - Find subscription by `stripe_subscription_id`
   - Extract invoice details (amount, customer, dates)
   - Append to `subscriptions.invoice_data` array
   - Update period dates
   - Extract voice metadata
   - Store in `voice_data` column
5. **Response**: `{"success": true, "message": "..."}`

### Example cURL Test
```bash
curl -X POST http://localhost:8000/subscriptions/stripe-webhook \
  -H "Stripe-Signature: t=...,v1=..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invoice.paid",
    "data": {
      "object": {
        "id": "in_1234567890",
        "subscription": "sub_1234567890",
        "amount_paid": 49900,
        "currency": "usd",
        "customer_email": "user@example.com",
        "hosted_invoice_url": "https://invoice.stripe.com/...",
        "metadata": {
          "voice_url": "https://example.com/voice.mp3"
        }
      }
    }
  }'
```

---

## Data Consistency

- **Dual Storage**: Both `invoices` table and `subscriptions.invoice_data` updated
- **Idempotency**: Redis cache prevents duplicate processing (7-day TTL)
- **Rollback**: Transaction rollback on any error; no partial updates
- **Logging**: All events logged to `stripe_webhooks.jsonl` for audit trail

---

## Schema Changes

### Subscriptions Table
```sql
ALTER TABLE subscriptions 
ADD COLUMN voice_data JSON NULL,
ADD INDEX idx_voice_data (voice_data(50));
```

### Invoices Table (Already Exists)
```sql
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  subscription_id INT NULL,
  invoice_number VARCHAR(50) UNIQUE,
  status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
  amount_due DECIMAL(10,2),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3),
  stripe_invoice_id VARCHAR(255),
  due_date DATE NULL,
  paid_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
```

---

## Testing

### Trigger Test Events
```bash
# Test invoice.paid
stripe trigger invoice.paid

# Test invoice.payment_failed  
stripe trigger invoice.payment_failed

# Check webhook logs
tail -f app/logs/stripe_webhooks.jsonl
```

### Verify Data Storage
```sql
-- Check invoice_data in subscription
SELECT id, subscription_id, invoice_data FROM subscriptions 
WHERE subscription_id = 'sub_xxxx';

-- Check normalized invoices
SELECT * FROM invoices 
WHERE subscription_id = (SELECT id FROM subscriptions WHERE subscription_id = 'sub_xxxx');

-- Check voice data
SELECT id, voice_data FROM subscriptions 
WHERE voice_data IS NOT NULL;
```

---

## Backward Compatibility

- Existing API endpoints continue to work with `invoices` table
- Frontend can access historical data from `subscriptions.invoice_data`
- Both Razorpay and Stripe invoke data use same JSON format
- Voice metadata automatically extracted and stored
