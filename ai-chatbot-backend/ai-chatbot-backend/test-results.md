# API Response Test Results

**Date:** 2026-02-16 20:58:54
**Server:** Python FastAPI (port 5000)
**Result:** 25/25 Passed, 0/25 Failed

---

## Summary

| # | Method | Endpoint | Status | Time | Result |
|---|--------|----------|--------|------|--------|
| 1 | `GET` | `/admin/tenants` | 200 | 2209ms | **PASS** |
| 2 | `GET` | `/admin/tenants/1/dashboard/summary` | 200 | 2123ms | **PASS** |
| 3 | `PUT` | `/admin/tenants/1` | 200 | 2084ms | **PASS** |
| 4 | `POST` | `/admin/tenants/1/suspend` | 200 | 2099ms | **PASS** |
| 5 | `POST` | `/auth/register` | 200 | 3402ms | **PASS** |
| 6 | `PUT` | `/admin/users/1` | 200 | 2065ms | **PASS** |
| 7 | `DELETE` | `/admin/users/6` | 200 | 2144ms | **PASS** |
| 8 | `PUT` | `/documents/1` | 200 | 2139ms | **PASS** |
| 9 | `PUT` | `/admin/tenants/1/config` | 200 | 2230ms | **PASS** |
| 10 | `GET` | `/admin/tenants/1/config` | 200 | 2099ms | **PASS** |
| 11 | `GET` | `/documents/categories` | 200 | 2067ms | **PASS** |
| 12 | `POST` | `/documents/categories` | 200 | 2196ms | **PASS** |
| 13 | `POST` | `/admin/subscription-plans` | 200 | 2265ms | **PASS** |
| 14 | `DELETE` | `/admin/subscription-plans/3` | 200 | 2098ms | **PASS** |
| 15 | `GET` | `/admin/sessions/1` | 200 | 2053ms | **PASS** |
| 16 | `GET` | `/admin/usage/metrics` | 200 | 2121ms | **PASS** |
| 17 | `GET` | `/admin/system/health` | 200 | 2212ms | **PASS** |
| 18 | `GET` | `/subscriptions/active-plans` | 200 | 2068ms | **PASS** |
| 19 | `GET` | `/admin/tenants/2/analytics?period=30d` | 200 | 2112ms | **PASS** |
| 20 | `POST` | `/documents/upload` | 200 | 3325ms | **PASS** |
| 21 | `GET` | `/subscriptions/details` | 200 | 2108ms | **PASS** |
| 22 | `POST` | `/subscriptions` | 200 | 2094ms | **PASS** |
| 23 | `POST` | `/stripe/verify-payment` | 200 | 2084ms | **PASS** |
| 24 | `GET` | `/subscriptions/invoices` | 200 | 2060ms | **PASS** |
| 25 | `POST` | `/public/chat/session/sess_d6ffa3c0992318b254fe6b81d46f6567adbe6a81d37d2179/end` | 200 | 2106ms | **PASS** |

---

## Detailed Results

### #1 — `GET /admin/tenants`

**Description:** Returns 'items' key instead of 'tenants'
**Status Code:** `200` | **Time:** `2209ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 19,
        "name": "Spec Test 1771173551",
        "slug": "spec-1771173551",
        "domain": null,
        "logo_url": null,
        "primary_color": "#3B82F6",
        "secondary_color": "#10B981",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 1000,
        "billing_email": null,
        "created_at": "2026-02-15T16:39:13.000Z",
        "updated_at": "2026-02-15T16:39:13.000Z"
      },
      {
        "id": 18,
        "name": "Spec Test 1771172722",
        "slug": "spec-1771172722",
        "domain": null,
        "logo_url": null,
        "primary_color": "#3B82F6",
        "secondary_color": "#10B981",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 1000,
        "billing_email": null,
        "created_at": "2026-02-15T16:25:24.000Z",
        "updated_at": "2026-02-15T16:25:24.000Z"
      },
      {
        "id": 17,
        "name": "Compare Test 1771172188",
        "slug": "cmp-1771172188",
        "domain": null,
        "logo_url": null,
        "primary_color": "#3B82F6",
        "secondary_color": "#10B981",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "basic",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 1000,
        "billing_email": null,
        "created_at": "2026-02-15T16:16:30.000Z",
        "updated_at": "2026-02-15T16:16:30.000Z"
      },
      {
        "id": 16,
        "name": "Report Test Corp",
        "slug": "rpt-1771170787",
        "domain": null,
        "logo_url": null,
        "primary_color": "#3B82F6",
        "secondary_color": "#10B981",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 1000,
        "billing_email": "rpt@test.com",
        "created_at": "2026-02-15T15:53:09.000Z",
        "updated_at": "2026-02-15T15:53:09.000Z"
      },
      {
        "id": 15,
        "name": "Report Test Corp",
        "slug": "test-corp-1771170401",
        "domain": null,
        "logo_url": null,
        "primary_color": "#3B82F6",
        "secondary_color": "#10B981",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 1000,
        "billing_email": "report@test.com",
        "created_at": "2026-02-15T15:46:43.000Z",
        "updated_at": "2026-02-15T15:46:43.000Z"
      },
      {
        "id": 13,
        "name": "Report Test Corp",
        "slug": "report-test-corp",
        "domain": null,
        "logo_url": null,
        "primary_color": "#3B82F6",
        "secondary_color": "#10B981",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 1000,
        "billing_email": "report@test.com",
        "created_at": "2026-02-15T15:41:33.000Z",
        "updated_at": "2026-02-15T15:41:33.000Z"
      },
      {
        "id": 12,
        "name": "Test Corp",
        "slug": "test-corp-py3",
        "domain": "test3.com",
        "logo_url": null,
        "primary_color": "#3B82F6",
        "secondary_color": "#10B981",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 1000,
        "billing_email": "test@test.com",
        "created_at": "2026-02-15T15:33:52.000Z",
        "updated_at": "2026-02-15T15:33:52.000Z"
      },
      {
        "id": 11,
        "name": "TestAdminTenant",
        "slug": "testadmintenant",
        "domain": null,
        "logo_url": null,
        "primary_color": "#007bff",
        "secondary_color": "#6c757d",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 500,
        "billing_email": null,
        "created_at": "2026-02-11T15:42:46.000Z",
        "updated_at": "2026-02-11T15:42:46.000Z"
      },
      {
        "id": 10,
        "name": "Default",
        "slug": "default",
        "domain": null,
        "logo_url": null,
        "primary_color": "#007bff",
        "secondary_color": "#6c757d",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 500,
        "billing_email": null,
        "created_at": "2026-02-11T13:43:03.000Z",
        "updated_at": "2026-02-11T13:43:03.000Z"
      },
      {
        "id": 9,
        "name": "TestTenant",
        "slug": "testtenant",
        "domain": null,
        "logo_url": null,
        "primary_color": "#007bff",
        "secondary_color": "#6c757d",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 500,
        "billing_email": null,
        "created_at": "2026-02-11T13:28:53.000Z",
        "updated_at": "2026-02-11T13:28:53.000Z"
      },
      {
        "id": 1,
        "name": "TechCorp Solutions",
        "slug": "techcorp",
        "domain": "chat.techcorp.com",
        "logo_url": "https://cdn.example.com/logos/techcorp.png",
        "primary_color": "#1f2937",
        "secondary_color": "#3b82f6",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "enterprise",
        "max_users": 100,
        "max_chat_sessions": 10000,
        "max_storage_mb": 5000,
        "billing_email": "billing@techcorp.com",
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-16T15:23:15.000Z"
      },
      {
        "id": 8,
        "name": "NonProfit Org",
        "slug": "nonprofit",
        "domain": null,
        "logo_url": null,
        "primary_color": "#10b981",
        "secondary_color": "#34d399",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "basic",
        "max_users": 15,
        "max_chat_sessions": 750,
        "max_storage_mb": 1500,
        "billing_email": "admin@nonprofit.org",
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 7,
        "name": "MediumCorp",
        "slug": "mediumcorp",
        "domain": "support.mediumcorp.com",
        "logo_url": null,
        "primary_color": "#f59e0b",
        "secondary_color": "#fbbf24",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "pro",
        "max_users": 50,
        "max_chat_sessions": 5000,
        "max_storage_mb": 3000,
        "billing_email": "accounts@mediumcorp.com",
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 6,
        "name": "Global Enterprise",
        "slug": "globalent",
        "domain": "ai.globalenterprise.com",
        "logo_url": "https://cdn.example.com/logos/global.png",
        "primary_color": "#7c3aed",
        "secondary_color": "#a855f7",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "enterprise",
        "max_users": 500,
        "max_chat_sessions": 50000,
        "max_storage_mb": 10000,
        "billing_email": "billing@globalenterprise.com",
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 5,
        "name": "Suspended Corp",
        "slug": "suspended",
        "domain": "old.suspended.com",
        "logo_url": null,
        "primary_color": "#374151",
        "secondary_color": "#6b7280",
        "custom_css": null,
        "status": "suspended",
        "subscription_plan": "basic",
        "max_users": 10,
        "max_chat_sessions": 500,
        "max_storage_mb": 1000,
        "billing_email": "contact@suspended.com",
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 4,
        "name": "FreeTier Demo",
        "slug": "freetier",
        "domain": null,
        "logo_url": null,
        "primary_color": "#6366f1",
        "secondary_color": "#8b5cf6",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "free",
        "max_users": 5,
        "max_chat_sessions": 100,
        "max_storage_mb": 500,
        "billing_email": "demo@example.com",
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 3,
        "name": "LocalBiz Inc",
        "slug": "localbiz",
        "domain": "help.localbiz.com",
        "logo_url": "https://cdn.example.com/logos/localbiz.png",
        "primary_color": "#dc2626",
        "secondary_color": "#ef4444",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "basic",
        "max_users": 10,
        "max_chat_sessions": 500,
        "max_storage_mb": 1000,
        "billing_email": "admin@localbiz.com",
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 2,
        "name": "StartupHub",
        "slug": "startuphub",
        "domain": "support.startuphub.io",
        "logo_url": "https://cdn.example.com/logos/startuphub.png",
        "primary_color": "#059669",
        "secondary_color": "#10b981",
        "custom_css": null,
        "status": "active",
        "subscription_plan": "pro",
        "max_users": 25,
        "max_chat_sessions": 2500,
        "max_storage_mb": 2000,
        "billing_email": "finance@startuphub.io",
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      }
    ]
  }
}
```

---

### #2 — `GET /admin/tenants/1/dashboard/summary`

**Description:** Has totalRequests, totalChatCost, todayChatCost, current.activeUsers
**Status Code:** `200` | **Time:** `2123ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTenants": 18,
    "activeUsers": "10",
    "totalDocuments": "6",
    "chatSessions": 18,
    "avgProcessingTime": 0,
    "totalCost": 0.00716,
    "totalChatCount": 18,
    "todayChatCount": 2,
    "avgTokens": 0,
    "totalTokens": 159,
    "assistantMessageCount": 4,
    "totalRequests": 5,
    "totalChatCost": 0.00716,
    "todayChatCost": 0.0,
    "current": {
      "activeUsers": 0,
      "documents": 0,
      "requests": 5,
      "tokenCount": 159,
      "chatSessions": 18
    },
    "growth": {
      "tenants": 0,
      "users": 0,
      "documents": 0,
      "sessions": 0
    }
  }
}
```

---

### #3 — `PUT /admin/tenants/1`

**Description:** Empty body no longer causes 500
**Status Code:** `200` | **Time:** `2084ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": 1,
      "name": "TechCorp Solutions",
      "slug": "techcorp",
      "domain": "chat.techcorp.com",
      "logo_url": "https://cdn.example.com/logos/techcorp.png",
      "primary_color": "#1f2937",
      "secondary_color": "#3b82f6",
      "custom_css": null,
      "status": "active",
      "subscription_plan": "enterprise",
      "max_users": 100,
      "max_chat_sessions": 10000,
      "max_storage_mb": 5000,
      "billing_email": "billing@techcorp.com",
      "created_at": "2026-02-11T13:19:04.000Z",
      "updated_at": "2026-02-16T15:23:15.000Z"
    }
  }
}
```

---

### #4 — `POST /admin/tenants/1/suspend`

**Description:** No body no longer causes 500
**Status Code:** `200` | **Time:** `2099ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": 1,
      "name": "TechCorp Solutions",
      "slug": "techcorp",
      "domain": "chat.techcorp.com",
      "logo_url": "https://cdn.example.com/logos/techcorp.png",
      "primary_color": "#1f2937",
      "secondary_color": "#3b82f6",
      "custom_css": null,
      "status": "suspended",
      "subscription_plan": "enterprise",
      "max_users": 100,
      "max_chat_sessions": 10000,
      "max_storage_mb": 5000,
      "billing_email": "billing@techcorp.com",
      "created_at": "2026-02-11T13:19:04.000Z",
      "updated_at": "2026-02-16T15:28:00.000Z"
    }
  }
}
```

---

### #5 — `POST /auth/register`

**Description:** Returns {user: {..., status: 'pending'}}, no verificationToken/role/tenantId
**Status Code:** `200` | **Time:** `3402ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 46,
      "email": "test_1771255682@test.com",
      "firstName": "T",
      "lastName": "U",
      "status": "pending"
    }
  },
  "message": "Registration successful. Please verify your email."
}
```

---

### #6 — `PUT /admin/users/1`

**Description:** Empty body no longer causes 500
**Status Code:** `200` | **Time:** `2065ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "tenant_id": 1,
      "plan_id": 1,
      "subscription_id": "sub_1abc123enterprise",
      "subscription_status": "active",
      "plan_name": "Enterprise",
      "email": "admin@techcorp.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "super_admin",
      "status": "active",
      "email_verified": 1,
      "email_verification_token": null,
      "password_reset_token": "Ap-bLvZRrUQRiQWSCNuZJXpPXhnvXzFUNxvv-QtzErM",
      "password_reset_expires": "2026-02-11T17:24:40.000Z",
      "last_login": "2026-02-16T15:27:32.000Z",
      "login_attempts": 0,
      "locked_until": null,
      "created_at": "2026-02-11T13:19:04.000Z",
      "updated_at": "2026-02-16T15:27:32.000Z",
      "subscribed_date": "2026-02-11T13:19:04.000Z",
      "amount": "2999.00"
    }
  }
}
```

---

### #7 — `DELETE /admin/users/6`

**Description:** Returns {data: {message: 'User deleted successfully'}}
**Status Code:** `200` | **Time:** `2144ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

---

### #8 — `PUT /documents/1`

**Description:** Returns full document object after update
**Status Code:** `200` | **Time:** `2139ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 1,
      "title": "Updated Doc Title",
      "description": "test",
      "original_filename": "user-manual-v2.pdf",
      "file_path": "/uploads/tenant_1/doc_1a2b3c_user-manual-v2.pdf",
      "file_size": 2048576,
      "mime_type": "application/pdf",
      "storage_path": "/uploads/tenant_1/doc_1a2b3c_user-manual-v2.pdf",
      "processing_status": "failed",
      "chunk_count": 45,
      "embedding_count": 45,
      "is_public": false,
      "category_id": 2,
      "version": 1,
      "created_at": "2026-02-11T13:19:04.000Z",
      "updated_at": "2026-02-16T15:28:12.000Z"
    }
  }
}
```

---

### #9 — `PUT /admin/tenants/1/config`

**Description:** Uses tenant_chatbot_config table, returns success message
**Status Code:** `200` | **Time:** `2230ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Configuration updated successfully"
  }
}
```

---

### #10 — `GET /admin/tenants/1/config`

**Description:** Reads from tenant_chatbot_config, returns single config object
**Status Code:** `200` | **Time:** `2099ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "config": {
      "id": 1,
      "tenant_id": 1,
      "chatbot_name": "Test Bot",
      "welcome_message": "Hello!",
      "placeholder_text": "Type your message here...",
      "widget_position": "bottom-right",
      "primary_color": "#007bff",
      "secondary_color": "#6c757d",
      "text_color": "#333333",
      "background_color": "#ffffff",
      "widget_size": "medium",
      "auto_open": 0,
      "show_agent_avatar": 1,
      "collect_user_info": 0,
      "require_email": 0,
      "enable_file_upload": 0,
      "max_message_length": 2000,
      "custom_css": null,
      "is_active": 1,
      "created_at": "2026-02-16T15:20:10.000Z",
      "updated_at": "2026-02-16T15:28:14.000Z"
    }
  }
}
```

---

### #11 — `GET /documents/categories`

**Description:** Returns {data: {categories: [...]}} with document_count, snake_case
**Status Code:** `200` | **Time:** `2067ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 27,
        "tenant_id": 1,
        "name": "FinalCat",
        "description": null,
        "parent_id": null,
        "sort_order": 0,
        "status": "active",
        "document_count": 0,
        "created_at": "2026-02-16T15:23:22.000Z",
        "updated_at": "2026-02-16T15:23:22.000Z"
      },
      {
        "id": 19,
        "tenant_id": 1,
        "name": "Test Category",
        "description": "Testing category creation",
        "parent_id": null,
        "sort_order": 0,
        "status": "active",
        "document_count": 0,
        "created_at": "2026-02-11T13:35:18.000Z",
        "updated_at": "2026-02-11T13:35:18.000Z"
      },
      {
        "id": 26,
        "tenant_id": 1,
        "name": "Test Category",
        "description": "Test desc",
        "parent_id": null,
        "sort_order": 0,
        "status": "active",
        "document_count": 0,
        "created_at": "2026-02-16T15:18:30.000Z",
        "updated_at": "2026-02-16T15:18:30.000Z"
      },
      {
        "id": 1,
        "tenant_id": 1,
        "name": "Updated Category",
        "description": "Technical product manuals and guides",
        "parent_id": null,
        "sort_order": 1,
        "status": "active",
        "document_count": 0,
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-15T15:22:08.000Z"
      },
      {
        "id": 2,
        "tenant_id": 1,
        "name": "User Guides",
        "description": "End-user documentation",
        "parent_id": 1,
        "sort_order": 1,
        "status": "active",
        "document_count": 1,
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 3,
        "tenant_id": 1,
        "name": "API Documentation",
        "description": "Developer API references",
        "parent_id": 1,
        "sort_order": 2,
        "status": "active",
        "document_count": 1,
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 4,
        "tenant_id": 1,
        "name": "HR Policies",
        "description": "Human resources policies and procedures",
        "parent_id": null,
        "sort_order": 2,
        "status": "active",
        "document_count": 1,
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-11T13:19:04.000Z"
      },
      {
        "id": 5,
        "tenant_id": 1,
        "name": "Updated Category",
        "description": "Employee training resources",
        "parent_id": null,
        "sort_order": 3,
        "status": "active",
        "document_count": 1,
        "created_at": "2026-02-11T13:19:04.000Z",
        "updated_at": "2026-02-16T15:18:44.000Z"
      }
    ]
  }
}
```

---

### #12 — `POST /documents/categories`

**Description:** Returns full category in {data: {category: {...}}}
**Status Code:** `200` | **Time:** `2196ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": 28,
      "tenant_id": 1,
      "name": "TestCat_1771255698",
      "description": null,
      "parent_id": null,
      "sort_order": 0,
      "status": "active",
      "created_at": "2026-02-16T15:28:21.000Z",
      "updated_at": "2026-02-16T15:28:21.000Z"
    }
  },
  "message": "Category created"
}
```

---

### #13 — `POST /admin/subscription-plans`

**Description:** Inserts into subscription_plans DB table, returns plan object
**Status Code:** `200` | **Time:** `2265ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "plan_name": "TestPlan",
    "price": 19.99,
    "billing_cycle": "monthly",
    "concurrent_users": 1,
    "document_collections": 5,
    "max_file_upload_mb": 10,
    "storage_limit_gb": 1,
    "card_color": "#ffffff",
    "icon_color": "#000000",
    "icon_bg_color": "#f0f0f0",
    "description": "Test",
    "features": "[\"A\", \"B\"]",
    "is_active": 1,
    "razorpay_plan_id": null,
    "stripepay_price_id": "price_1771255703_3720eeb84",
    "created_at": "2026-02-16T15:28:23.000Z",
    "updated_at": "2026-02-16T15:28:23.000Z"
  },
  "message": "Subscription plan created successfully"
}
```

---

### #14 — `DELETE /admin/subscription-plans/3`

**Description:** Deletes from subscription_plans DB table
**Status Code:** `200` | **Time:** `2098ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "message": "Subscription plan deleted"
}
```

---

### #15 — `GET /admin/sessions/1`

**Description:** Sessions include visitorId, visitorName, visitorEmail, ipAddress, messageCount
**Status Code:** `200` | **Time:** `2053ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "e43bff15-d990-4547-a919-7d03b214636d",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-16 15:23",
        "visitorId": "visitor_ee6083d0161892c2a364d9ee",
        "visitorName": null,
        "visitorEmail": null,
        "status": "ended",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-16T15:23:31.000Z",
        "ended_at": "2026-02-16T15:23:32.000Z",
        "last_activity": "2026-02-16T15:23:31.000Z"
      },
      {
        "id": "76458329-c226-4c2f-bff5-e3846ef452f2",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-16 15:21",
        "visitorId": "visitor_e5f4b50cd1b32246360fe63b",
        "visitorName": null,
        "visitorEmail": null,
        "status": "ended",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-16T15:21:22.000Z",
        "ended_at": "2026-02-16T15:21:23.000Z",
        "last_activity": "2026-02-16T15:21:23.000Z"
      },
      {
        "id": "918832d0-9197-490d-9670-761debb20134",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-15 16:40",
        "visitorId": "test-visitor",
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-15T16:40:46.000Z",
        "ended_at": null,
        "last_activity": "2026-02-15T16:40:46.000Z"
      },
      {
        "id": "bbad8fd6-3fae-4405-8c8b-aea5d6f3c5f6",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-15 16:26",
        "visitorId": "test-visitor",
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-15T16:26:56.000Z",
        "ended_at": null,
        "last_activity": "2026-02-15T16:26:56.000Z"
      },
      {
        "id": "f03aa453-76aa-4cf7-a2a7-ac824c8c0b6c",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-15 16:16",
        "visitorId": "test-visitor",
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-15T16:16:23.000Z",
        "ended_at": null,
        "last_activity": "2026-02-15T16:16:23.000Z"
      },
      {
        "id": "ad106ef9-68fd-467b-a385-17cf97454026",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-15 15:52",
        "visitorId": "visitor_44bf2a7d5d1898ad31d0cd88",
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-15T15:52:33.000Z",
        "ended_at": null,
        "last_activity": "2026-02-15T15:52:33.000Z"
      },
      {
        "id": "50539cb4-4071-4257-bd58-5c5cfedbab3b",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-15 15:46",
        "visitorId": "visitor_acec4ece35d0f2f8b69acedb",
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-15T15:46:08.000Z",
        "ended_at": null,
        "last_activity": "2026-02-15T15:46:08.000Z"
      },
      {
        "id": "c0cf32ca-2903-40d4-aa89-2bf8d8d0c5f1",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-15 15:43",
        "visitorId": "visitor_55ff9996ed4d7bc16d6f32f4",
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-15T15:43:34.000Z",
        "ended_at": null,
        "last_activity": "2026-02-15T15:43:34.000Z"
      },
      {
        "id": "2c3a19b8-ffd2-4191-9174-abdb8c08d53c",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-15 15:40",
        "visitorId": "visitor_921b93c9c447ab0149168f0f",
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-15T15:40:57.000Z",
        "ended_at": null,
        "last_activity": "2026-02-15T15:40:57.000Z"
      },
      {
        "id": "11e7babc-316f-4233-a5b7-4e058839a6a3",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-15 15:11",
        "visitorId": "visitor_0e947e0e1f164b9f8f5cae0e",
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-15T15:11:23.000Z",
        "ended_at": null,
        "last_activity": "2026-02-15T15:11:23.000Z"
      },
      {
        "id": "d260c76f-be9e-4517-87aa-a2d1bd1d088a",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-11 16:27",
        "visitorId": null,
        "visitorName": "Visitor EP",
        "visitorEmail": "visitor_1770827055@test.com",
        "status": "ended",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-11T16:27:35.000Z",
        "ended_at": "2026-02-11T16:27:44.000Z",
        "last_activity": "2026-02-11T16:27:43.000Z"
      },
      {
        "id": "9f4c1892-c0ea-4d88-8f43-087ad2d91b2c",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-11 16:22",
        "visitorId": null,
        "visitorName": "Visitor EP",
        "visitorEmail": "visitor_ep2@test.com",
        "status": "ended",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-11T16:22:27.000Z",
        "ended_at": "2026-02-11T16:22:33.000Z",
        "last_activity": "2026-02-11T16:22:33.000Z"
      },
      {
        "id": "4eff136b-43ce-4cea-9159-49c30c3c4c2a",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-11 16:17",
        "visitorId": null,
        "visitorName": "Visitor EP",
        "visitorEmail": "visitor_ep2@test.com",
        "status": "active",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-11T16:17:38.000Z",
        "ended_at": null,
        "last_activity": "2026-02-11T16:17:38.000Z"
      },
      {
        "id": "3dd1af60-28f5-41ea-b21d-cc5d14095098",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-11 15:18",
        "visitorId": null,
        "visitorName": null,
        "visitorEmail": null,
        "status": "ended",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 1,
        "started_at": "2026-02-11T15:18:44.000Z",
        "ended_at": "2026-02-11T15:19:52.000Z",
        "last_activity": "2026-02-11T15:19:52.000Z"
      },
      {
        "id": "2fa80bf2-ca49-4628-b01d-410fb045d12b",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-11 14:56",
        "visitorId": null,
        "visitorName": "V",
        "visitorEmail": "v_1770821774@t.com",
        "status": "ended",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-11T14:56:39.000Z",
        "ended_at": "2026-02-11T14:56:44.000Z",
        "last_activity": "2026-02-11T14:56:43.000Z"
      },
      {
        "id": "e0321547-0822-49d0-99f5-bcfa65490b0c",
        "tenant_id": 1,
        "user_id": null,
        "session_name": "Public Chat 2026-02-11 13:36",
        "visitorId": null,
        "visitorName": "John Visitor",
        "visitorEmail": null,
        "status": "ended",
        "ipAddress": "127.0.0.1",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 0,
        "started_at": "2026-02-11T13:36:35.000Z",
        "ended_at": "2026-02-11T13:36:52.000Z",
        "last_activity": "2026-02-11T13:36:51.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "tenant_id": 1,
        "user_id": 3,
        "session_name": "Product Help Session",
        "visitorId": null,
        "visitorName": null,
        "visitorEmail": null,
        "status": "active",
        "ipAddress": "192.168.1.100",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 4,
        "started_at": "2026-02-11T11:19:04.000Z",
        "ended_at": null,
        "last_activity": "2026-02-11T13:14:04.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "tenant_id": 1,
        "user_id": 1,
        "session_name": "API Documentation Query",
        "visitorId": null,
        "visitorName": null,
        "visitorEmail": null,
        "status": "ended",
        "ipAddress": "192.168.1.101",
        "pageUrl": null,
        "referrerUrl": null,
        "messageCount": 2,
        "started_at": "2026-02-08T13:19:04.000Z",
        "ended_at": null,
        "last_activity": "2026-02-08T13:19:04.000Z"
      }
    ]
  }
}
```

---

### #16 — `GET /admin/usage/metrics`

**Description:** Returns real usage metrics with all expected fields
**Status Code:** `200` | **Time:** `2121ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": null,
    "totalRequests": 19,
    "totalTokensUsed": 484,
    "totalCost": 0.04792,
    "averageResponseTime": 3448.4211,
    "successRate": 100.0,
    "documentsProcessed": 13,
    "chatSessions": 25,
    "activeUsers": 4,
    "period": "30d",
    "daysTracked": 30,
    "apiRequestsOverTime": [
      {
        "date": "2026-02-06",
        "count": 1
      },
      {
        "date": "2026-02-08",
        "count": 2
      },
      {
        "date": "2026-02-09",
        "count": 2
      },
      {
        "date": "2026-02-10",
        "count": 4
      },
      {
        "date": "2026-02-11",
        "count": 10
      }
    ],
    "tokenUsageOverTime": [
      {
        "date": "2026-02-11",
        "tokens": 484
      }
    ]
  }
}
```

---

### #17 — `GET /admin/system/health`

**Description:** Returns metrics-style response (same format as #16)
**Status Code:** `200` | **Time:** `2212ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": null,
    "totalRequests": 19,
    "totalTokensUsed": 484,
    "totalCost": 0.04792,
    "averageResponseTime": 3448.4211,
    "successRate": 100.0,
    "documentsProcessed": 13,
    "chatSessions": 25,
    "activeUsers": 4,
    "period": "30d",
    "daysTracked": 30,
    "apiRequestsOverTime": [
      {
        "date": "2026-02-06",
        "count": 1
      },
      {
        "date": "2026-02-08",
        "count": 2
      },
      {
        "date": "2026-02-09",
        "count": 2
      },
      {
        "date": "2026-02-10",
        "count": 4
      },
      {
        "date": "2026-02-11",
        "count": 10
      }
    ],
    "tokenUsageOverTime": [
      {
        "date": "2026-02-11",
        "tokens": 484
      }
    ]
  }
}
```

---

### #18 — `GET /subscriptions/active-plans`

**Description:** Includes tenant_id, cancelled_at, amount as string, pagination
**Status Code:** `200` | **Time:** `2068ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 11,
      "tenant_id": 1,
      "name": "TechCorp Solutions",
      "plan_id": 11,
      "plan_name": "test",
      "subscription_status": "active",
      "billing_cycle": "monthly",
      "amount": "9.99",
      "currency": "INR",
      "subscription_id": null,
      "current_period_start": "2026-02-16T15:23:30.000Z",
      "current_period_end": "2026-03-18T15:23:30.000Z",
      "cancelled_at": null,
      "created_at": "2026-02-16T15:23:30.000Z",
      "updated_at": "2026-02-16T15:23:30.000Z",
      "payment_id": null,
      "invoice_id": null,
      "invoice_data": null,
      "total_count": 0,
      "quantity": 1,
      "notes": {}
    },
    {
      "id": 12,
      "tenant_id": 1,
      "name": "TechCorp Solutions",
      "plan_id": 12,
      "plan_name": "pro",
      "subscription_status": "active",
      "billing_cycle": "monthly",
      "amount": "0.00",
      "currency": "USD",
      "subscription_id": "pi_test",
      "current_period_start": "2026-02-16T15:23:31.000Z",
      "current_period_end": "2026-03-18T15:23:31.000Z",
      "cancelled_at": null,
      "created_at": "2026-02-16T15:23:30.000Z",
      "updated_at": "2026-02-16T15:23:30.000Z",
      "payment_id": null,
      "invoice_id": null,
      "invoice_data": null,
      "total_count": 0,
      "quantity": 1,
      "notes": {}
    },
    {
      "id": 10,
      "tenant_id": 1,
      "name": "TechCorp Solutions",
      "plan_id": 10,
      "plan_name": "pro",
      "subscription_status": "active",
      "billing_cycle": "monthly",
      "amount": "49.99",
      "currency": "USD",
      "subscription_id": "pi_test_123",
      "current_period_start": "2026-02-16T15:21:22.000Z",
      "current_period_end": "2026-03-18T15:21:22.000Z",
      "cancelled_at": null,
      "created_at": "2026-02-16T15:21:21.000Z",
      "updated_at": "2026-02-16T15:21:21.000Z",
      "payment_id": null,
      "invoice_id": null,
      "invoice_data": null,
      "total_count": 0,
      "quantity": 1,
      "notes": {}
    },
    {
      "id": 9,
      "tenant_id": 1,
      "name": "TechCorp Solutions",
      "plan_id": 9,
      "plan_name": "pro",
      "subscription_status": "active",
      "billing_cycle": "monthly",
      "amount": "29.99",
      "currency": "INR",
      "subscription_id": null,
      "current_period_start": "2026-02-16T15:21:05.000Z",
      "current_period_end": "2026-03-18T15:21:05.000Z",
      "cancelled_at": null,
      "created_at": "2026-02-16T15:21:04.000Z",
      "updated_at": "2026-02-16T15:21:04.000Z",
      "payment_id": null,
      "invoice_id": null,
      "invoice_data": null,
      "total_count": 0,
      "quantity": 1,
      "notes": {}
    },
    {
      "id": 1,
      "tenant_id": 1,
      "name": "TechCorp Solutions",
      "plan_id": 1,
      "plan_name": "Enterprise",
      "subscription_status": "active",
      "billing_cycle": "yearly",
      "amount": "2999.00",
      "currency": "USD",
      "subscription_id": "sub_1abc123enterprise",
      "current_period_start": "2026-01-12T13:19:04.000Z",
      "current_period_end": "2027-01-12T13:19:04.000Z",
      "cancelled_at": null,
      "created_at": "2026-02-11T13:19:04.000Z",
      "updated_at": "2026-02-11T13:19:04.000Z",
      "payment_id": null,
      "invoice_id": 1,
      "invoice_data": {
        "amount_paid": 2999.0,
        "status": "paid",
        "paid_at": "2026-01-13T13:19:04.000Z"
      },
      "total_count": 0,
      "quantity": 1,
      "notes": {}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### #19 — `GET /admin/tenants/2/analytics?period=30d`

**Description:** tenant_admin can access (was super_admin only), returns real analytics
**Status Code:** `200` | **Time:** `2112ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "dailyUsers": [
      {
        "date": "2026-02-04",
        "count": 12
      },
      {
        "date": "2026-02-05",
        "count": 15
      },
      {
        "date": "2026-02-06",
        "count": 14
      },
      {
        "date": "2026-02-07",
        "count": 16
      },
      {
        "date": "2026-02-08",
        "count": 18
      },
      {
        "date": "2026-02-09",
        "count": 17
      },
      {
        "date": "2026-02-10",
        "count": 19
      }
    ],
    "dailyMessages": [
      {
        "date": "2026-02-11",
        "count": 6
      }
    ],
    "dailyDocuments": [
      {
        "date": "2026-02-11",
        "count": 3
      }
    ],
    "totalCosts": {
      "openai": 0.0245,
      "storage": 0,
      "total": 0.0245
    },
    "growth": {
      "users": 3,
      "messages": 6,
      "documents": 3
    }
  }
}
```

---

### #20 — `POST /documents/upload`

**Description:** Returns {data: {results: [{documentId, filename, status, message}]}}
**Status Code:** `200` | **Time:** `3325ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "documentId": 17,
        "filename": "test.pdf",
        "status": "uploaded",
        "message": "Document uploaded successfully"
      }
    ]
  },
  "message": "Document uploaded successfully"
}
```

---

### #21 — `GET /subscriptions/details`

**Description:** Returns array of subscription objects (not null)
**Status Code:** `200` | **Time:** `2108ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 11,
      "tenant_id": 1,
      "plan_name": "test",
      "status": "active",
      "billing_cycle": "monthly",
      "amount": "9.99",
      "currency": "INR",
      "stripe_subscription_id": null,
      "stripe_customer_id": null,
      "current_period_start": "2026-02-16T15:23:30.000Z",
      "current_period_end": "2026-03-18T15:23:30.000Z",
      "trial_end": null,
      "cancelled_at": null,
      "created_at": "2026-02-16T15:23:30.000Z",
      "updated_at": "2026-02-16T15:23:30.000Z"
    },
    {
      "id": 12,
      "tenant_id": 1,
      "plan_name": "pro",
      "status": "active",
      "billing_cycle": "monthly",
      "amount": "0.00",
      "currency": "USD",
      "stripe_subscription_id": "pi_test",
      "stripe_customer_id": null,
      "current_period_start": "2026-02-16T15:23:31.000Z",
      "current_period_end": "2026-03-18T15:23:31.000Z",
      "trial_end": null,
      "cancelled_at": null,
      "created_at": "2026-02-16T15:23:30.000Z",
      "updated_at": "2026-02-16T15:23:30.000Z"
    },
    {
      "id": 10,
      "tenant_id": 1,
      "plan_name": "pro",
      "status": "active",
      "billing_cycle": "monthly",
      "amount": "49.99",
      "currency": "USD",
      "stripe_subscription_id": "pi_test_123",
      "stripe_customer_id": null,
      "current_period_start": "2026-02-16T15:21:22.000Z",
      "current_period_end": "2026-03-18T15:21:22.000Z",
      "trial_end": null,
      "cancelled_at": null,
      "created_at": "2026-02-16T15:21:21.000Z",
      "updated_at": "2026-02-16T15:21:21.000Z"
    },
    {
      "id": 9,
      "tenant_id": 1,
      "plan_name": "pro",
      "status": "active",
      "billing_cycle": "monthly",
      "amount": "29.99",
      "currency": "INR",
      "stripe_subscription_id": null,
      "stripe_customer_id": null,
      "current_period_start": "2026-02-16T15:21:05.000Z",
      "current_period_end": "2026-03-18T15:21:05.000Z",
      "trial_end": null,
      "cancelled_at": null,
      "created_at": "2026-02-16T15:21:04.000Z",
      "updated_at": "2026-02-16T15:21:04.000Z"
    },
    {
      "id": 1,
      "tenant_id": 1,
      "plan_name": "Enterprise",
      "status": "active",
      "billing_cycle": "yearly",
      "amount": "2999.00",
      "currency": "USD",
      "stripe_subscription_id": "sub_1abc123enterprise",
      "stripe_customer_id": "cus_techcorp123",
      "current_period_start": "2026-01-12T13:19:04.000Z",
      "current_period_end": "2027-01-12T13:19:04.000Z",
      "trial_end": null,
      "cancelled_at": null,
      "created_at": "2026-02-11T13:19:04.000Z",
      "updated_at": "2026-02-11T13:19:04.000Z"
    }
  ],
  "message": "Subscription details retrieved"
}
```

---

### #22 — `POST /subscriptions`

**Description:** Creates subscription record in DB, returns subscription object
**Status Code:** `200` | **Time:** `2094ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 13,
    "tenant_id": 1,
    "plan_name": "pro",
    "status": "active",
    "billing_cycle": "monthly",
    "amount": "29.99",
    "currency": "INR",
    "current_period_start": "2026-02-16T15:28:45.643238+00:00.000Z",
    "current_period_end": "2026-03-18T15:28:45.643238+00:00.000Z",
    "payment_type": "razorpay"
  },
  "message": "Subscription created"
}
```

---

### #23 — `POST /stripe/verify-payment`

**Description:** Creates subscription from payment, returns verified data
**Status Code:** `200` | **Time:** `2084ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "subscriptionId": 14,
    "paymentIntentId": "pi_test_final",
    "status": "active",
    "plan_name": "enterprise",
    "current_period_start": "2026-02-16T15:28:47.747576+00:00.000Z",
    "current_period_end": "2027-02-16T15:28:47.747576+00:00.000Z"
  },
  "message": "Payment verified"
}
```

---

### #24 — `GET /subscriptions/invoices`

**Description:** Returns invoice array from DB with pagination
**Status Code:** `200` | **Time:** `2060ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "subscription_id": 1,
      "invoice_number": "INV-2024-001",
      "status": "paid",
      "amount": "2999.00",
      "amount_due": 2999.0,
      "amount_paid": 2999.0,
      "currency": "USD",
      "method": "yearly",
      "plan_name": "Enterprise",
      "stripe_invoice_id": "in_1abc123invoice",
      "due_date": "2026-01-12",
      "paid_at": "2026-01-13T13:19:04.000Z",
      "created_at": "2026-02-11T13:19:04.000Z"
    },
    {
      "id": 2,
      "tenant_id": 1,
      "subscription_id": 1,
      "invoice_number": "INV-2024-015",
      "status": "paid",
      "amount": "2999.00",
      "amount_due": 2999.0,
      "amount_paid": 2999.0,
      "currency": "USD",
      "method": "yearly",
      "plan_name": "Enterprise",
      "stripe_invoice_id": "in_15abc456invoice",
      "due_date": "2027-01-12",
      "paid_at": null,
      "created_at": "2026-02-11T13:19:04.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  },
  "message": "Invoices retrieved"
}
```

---

### #25 — `POST /public/chat/session/sess_d6ffa3c0992318b254fe6b81d46f6567adbe6a81d37d2179/end`

**Description:** Returns {data: {message: 'Session ended successfully'}}
**Status Code:** `200` | **Time:** `2106ms` | **Result:** **PASS**

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Session ended successfully"
  }
}
```

---
