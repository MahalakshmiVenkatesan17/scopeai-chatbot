"""Comprehensive endpoint test script for AI Chatbot Backend."""
import httpx
import sys
import time

TS = str(int(time.time()))

BASE = "http://localhost:8000"
results = []

def test(method, path, expected_status=200, **kwargs):
    """Run a single endpoint test."""
    name = f"{method} {path}"
    try:
        r = getattr(httpx, method.lower())(f"{BASE}{path}", timeout=15, **kwargs)
        status = r.status_code
        body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
        success = body.get("success", False) if isinstance(body, dict) else False
        passed = status == expected_status and (success or status != 200)
        if status == 200 and not success:
            if isinstance(body, dict) and body.get("status") in ("ok", "healthy"):
                passed = True
            elif isinstance(body, dict) and len(body) > 0:
                passed = True
        results.append((name, "PASS" if passed else "FAIL", status,
                        body.get("error", {}).get("message", "") if isinstance(body, dict) else ""))
        print(f"  [{'PASS' if passed else 'FAIL'}] {status} {name}")
        return body if isinstance(body, dict) else {}
    except httpx.ReadTimeout:
        results.append((name, "TIMEOUT", 0, "Request timed out"))
        print(f"  [TIMEOUT] {name}")
        return {}
    except Exception as e:
        results.append((name, "ERROR", 0, str(e)))
        print(f"  [ERROR] {name}: {e}")
        return {}


# ====== HEALTH ======
print("\n=== HEALTH ENDPOINTS ===")
test("GET", "/health")
test("GET", "/api/health")
test("GET", "/api/health/detailed")

# ====== AUTH ======
print("\n=== AUTH ENDPOINTS ===")
test("POST", "/api/v1/auth/register", json={
    "email": f"eptest_{TS}@test.com", "password": "Test123!",
    "firstName": "EP", "lastName": "Test", "tenantSlug": "techcorp"
})

resp = test("POST", "/api/v1/auth/login", json={
    "email": "admin@techcorp.com", "password": "Test123!"
})
TOKEN = resp.get("data", {}).get("accessToken", "")
REFRESH = resp.get("data", {}).get("refreshToken", "")
AUTH = {"Authorization": f"Bearer {TOKEN}"}

test("POST", "/api/v1/auth/refresh-token", json={"refreshToken": REFRESH})
test("POST", "/api/v1/auth/forgot-password", json={"email": "admin@techcorp.com"})
test("GET", "/api/v1/auth/profile", headers=AUTH)

# Re-login since forgot-password may have affected token state
resp2 = test("POST", "/api/v1/auth/login", json={
    "email": "admin@techcorp.com", "password": "Test123!"
})
TOKEN = resp2.get("data", {}).get("accessToken", TOKEN)
AUTH = {"Authorization": f"Bearer {TOKEN}"}

# ====== CHAT ======
print("\n=== CHAT ENDPOINTS ===")
sess = test("POST", "/api/v1/chat/sessions", headers=AUTH, json={"title": "Test Session"})
sid = sess.get("data", {}).get("id", "none")

test("GET", "/api/v1/chat/sessions", headers=AUTH)
test("GET", f"/api/v1/chat/sessions/{sid}", headers=AUTH)
test("PUT", f"/api/v1/chat/sessions/{sid}", headers=AUTH, json={"title": "Updated"})
test("GET", f"/api/v1/chat/sessions/{sid}/messages", headers=AUTH)
test("GET", f"/api/v1/chat/sessions/{sid}/export", headers=AUTH)
test("DELETE", f"/api/v1/chat/sessions/{sid}", headers=AUTH)

# ====== DOCUMENTS ======
print("\n=== DOCUMENT ENDPOINTS ===")
test("GET", "/api/v1/documents", headers=AUTH)
test("GET", "/api/v1/documents/categories", headers=AUTH)

cat_resp = test("POST", "/api/v1/documents/categories", headers=AUTH, json={
    "name": "Test Category EP2", "description": "Endpoint test"
})
cat_id = cat_resp.get("data", {}).get("id", 0)

if cat_id:
    test("PUT", f"/api/v1/documents/categories/{cat_id}", headers=AUTH, json={"name": "Updated Cat EP"})
    test("DELETE", f"/api/v1/documents/categories/{cat_id}", headers=AUTH)

test("GET", "/api/v1/documents/1", headers=AUTH)
test("GET", "/api/v1/documents/1/chunks", headers=AUTH)
test("PUT", "/api/v1/documents/1", headers=AUTH, json={"title": "Updated Doc"})

# ====== TENANTS ======
print("\n=== TENANT ENDPOINTS ===")
test("GET", "/api/v1/tenants/info", headers=AUTH)
test("GET", "/api/v1/tenants/settings", headers=AUTH)
test("GET", "/api/v1/tenants/users", headers=AUTH)
test("POST", "/api/v1/tenants/users/invite", headers=AUTH, json={"email": f"invite_{TS}@test.com", "role": "customer"})
test("GET", "/api/v1/tenants/subscription", headers=AUTH)
test("GET", "/api/v1/tenants/usage/current", headers=AUTH)
test("GET", "/api/v1/tenants/usage/limits", headers=AUTH)
test("GET", "/api/v1/tenants/analytics", headers=AUTH)
test("GET", "/api/v1/tenants/billing/history", headers=AUTH)

# ====== USERS ======
print("\n=== USER ENDPOINTS ===")
test("GET", "/api/v1/users/profile", headers=AUTH)
test("PUT", "/api/v1/users/profile", headers=AUTH, json={"firstName": "Admin", "lastName": "User"})
test("PUT", "/api/v1/users/password", headers=AUTH, json={
    "currentPassword": "Test123!", "newPassword": "Test123!", "confirmPassword": "Test123!"
})
test("GET", "/api/v1/users/sessions", headers=AUTH)
test("GET", "/api/v1/users/notifications", headers=AUTH)
test("POST", "/api/v1/users/notifications/read-all", headers=AUTH)
test("GET", "/api/v1/users/export", headers=AUTH)
test("POST", "/api/v1/users/signup", json={
    "email": f"signup_{TS}@test.com", "password": "Test123!",
    "firstName": "Signup", "lastName": "Test", "companyName": f"Corp{TS}"
})

# ====== ANALYTICS ======
print("\n=== ANALYTICS ENDPOINTS ===")
test("GET", "/api/v1/analytics/dashboard", headers=AUTH)
test("GET", "/api/v1/analytics/chat", headers=AUTH)
test("GET", "/api/v1/analytics/documents", headers=AUTH)
test("GET", "/api/v1/analytics/performance", headers=AUTH)
test("GET", "/api/v1/analytics/costs", headers=AUTH)
test("GET", "/api/v1/analytics/users", headers=AUTH)
test("GET", "/api/v1/analytics/popular-documents", headers=AUTH)
test("GET", "/api/v1/analytics/top-users", headers=AUTH)
test("POST", "/api/v1/analytics/export", headers=AUTH, json={"format": "json"})

# ====== PUBLIC CHAT ======
print("\n=== PUBLIC CHAT ENDPOINTS ===")
test("GET", "/api/v1/public/chat/config/techcorp")

pub = test("POST", "/api/v1/public/chat/session", json={
    "tenantSlug": "techcorp", "visitorName": "Visitor EP", "visitorEmail": f"visitor_{TS}@test.com"
})
pub_sid = pub.get("data", {}).get("sessionId", "")
pub_token = pub.get("data", {}).get("sessionToken", "")

if pub_token:
    test("GET", f"/api/v1/public/chat/session/{pub_token}/messages")
    test("POST", f"/api/v1/public/chat/session/{pub_token}/end")
else:
    print("  [SKIP] Public chat sub-endpoints (no token)")

# ====== ADMIN ======
print("\n=== ADMIN ENDPOINTS ===")
test("GET", "/api/v1/admin/dashboard/stats", headers=AUTH)
test("GET", "/api/v1/admin/tenants", headers=AUTH)

tenant_resp = test("POST", "/api/v1/admin/tenants", headers=AUTH, json={
    "name": f"EP Tenant {TS}", "slug": f"ep-tenant-{TS}",
    "adminEmail": f"admin_{TS}@test.com", "adminPassword": "Test123!", "plan": "free"
})
new_tid = 0
if tenant_resp and tenant_resp.get("data"):
    new_tid = tenant_resp["data"].get("tenantId", 0)
if new_tid:
    test("GET", f"/api/v1/admin/tenants/{new_tid}", headers=AUTH)

test("GET", "/api/v1/admin/system/health", headers=AUTH)
test("GET", "/api/v1/admin/roles", headers=AUTH)
test("GET", "/api/v1/admin/users", headers=AUTH)
test("GET", "/api/v1/admin/documents", headers=AUTH)
test("GET", "/api/v1/admin/subscription-plans", headers=AUTH)
test("GET", "/api/v1/admin/usage/metrics", headers=AUTH)
test("GET", "/api/v1/admin/processing-queue", headers=AUTH)

# ====== SUBSCRIPTIONS & PAYMENTS ======
print("\n=== SUBSCRIPTION & PAYMENT ENDPOINTS ===")
test("GET", "/api/v1/subscriptions/plans", headers=AUTH)
test("GET", "/api/v1/subscriptions/current", headers=AUTH)
test("GET", "/api/v1/invoices", headers=AUTH)
test("GET", "/api/v1/orders", headers=AUTH)
test("GET", "/api/v1/payments", headers=AUTH)
test("GET", "/api/v1/payments/active", headers=AUTH)

# Stripe endpoints
test("GET", "/api/v1/stripe/config", headers=AUTH)
test("GET", "/api/v1/stripe/test", headers=AUTH)
test("POST", "/api/v1/stripe/checkout/sessions", headers=AUTH, json={
    "planId": "professional", "billingCycle": "monthly"
})

# ====== LOGOUT (last) ======
print("\n=== AUTH LOGOUT ===")
test("POST", "/api/v1/auth/logout", headers=AUTH)

# ====== SUMMARY ======
print("\n" + "=" * 60)
passed = sum(1 for _, s, _, _ in results if s == "PASS")
failed = sum(1 for _, s, _, _ in results if s == "FAIL")
timeout = sum(1 for _, s, _, _ in results if s == "TIMEOUT")
errors = sum(1 for _, s, _, _ in results if s == "ERROR")
total = len(results)

print(f"TOTAL: {total} | PASS: {passed} | FAIL: {failed} | TIMEOUT: {timeout} | ERROR: {errors}")
print(f"Pass Rate: {passed}/{total} ({passed/total*100:.1f}%)")

if failed + timeout + errors > 0:
    print("\nFailed/Problem Endpoints:")
    for name, status, code, msg in results:
        if status != "PASS":
            print(f"  [{status}] {code} {name} - {msg}")

print("\n" + "=" * 60)
sys.exit(0 if failed + timeout + errors == 0 else 1)
