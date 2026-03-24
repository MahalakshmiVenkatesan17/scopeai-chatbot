#!/usr/bin/env python3
import httpx
import json
import time

BASE = "http://localhost:8000"
ts = str(int(time.time()))

print("=" * 80)
print("TESTING STRIPE VERIFY-PAYMENT WITH NEW RESPONSE FORMAT")
print("=" * 80)

# Register
print("\n[1] Registering user...")
reg = httpx.post(f"{BASE}/api/v1/auth/register", json={
    "email": f"test_{ts}@test.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User",
    "tenantSlug": f"tenant_{ts}"
}, timeout=10)

# Login
print("\n[2] Logging in...")
login = httpx.post(f"{BASE}/api/v1/auth/login", json={
    "email": f"test_{ts}@test.com",
    "password": "Test@1234"
}, timeout=10)

token = login.json().get("data", {}).get("accessToken")
print(f"✓ Got token")

# Test verify-payment
print("\n[3] Testing /stripe/verify-payment endpoint...")
headers = {"Authorization": f"Bearer {token}"}

# Using actual Stripe test session ID format
payload = {
    "session_id": "cs_test_a1b2c3d4e5f6g7h8",
    "plan_id": "price_1SVB9OQkbbUAQFF1uqNIrY6N",
    "priceId": "price_1SVB9OQkbbUAQFF1uqNIrY6N",
    "planName": "Professional",
    "amount": 9900,
    "billingCycle": "monthly"
}

print(f"\nRequest payload:")
print(json.dumps(payload, indent=2))

response = httpx.post(
    f"{BASE}/api/v1/stripe/verify-payment",
    json=payload,
    headers=headers,
    timeout=10
)

result = response.json()
print(f"\n[4] Response Status: {response.status_code}")
print(f"\nResponse:")
print(json.dumps(result, indent=2, default=str))

# Check response format
print("\n[5] Checking Response Format...")
if result.get("success"):
    data = result.get("data", {})
    print("✓ success: true")
    if "subscription_id" in data:
        print(f"✓ subscription_id: {data['subscription_id']}")
    else:
        print("✗ Missing subscription_id")
    
    if "customer_id" in data:
        print(f"✓ customer_id: {type(data['customer_id']).__name__}")
    else:
        print("✗ Missing customer_id")
    
    if "plan_id" in data:
        print(f"✓ plan_id: {data['plan_id']}")
    else:
        print("✗ Missing plan_id")
    
    if "status" in data:
        print(f"✓ status: {data['status']}")
    else:
        print("✗ Missing status")
else:
    error = result.get("error", {})
    if "line_items" in error.get("message", ""):
        print("✗ FAILED - line_items error still present")
    else:
        print(f"⚠️  Got expected error (Stripe resource not found): {error.get('message')}")

print("\n" + "=" * 80)
print("EXPECTED RESPONSE FORMAT:")
print("=" * 80)
print("""{
    "success": true,
    "data": {
        "subscription_id": "sub_xxx or session_id",
        "customer_id": { ...customer object... or null },
        "plan_id": "price_xxx",
        "status": "active"
    }
}""")
print("=" * 80)
