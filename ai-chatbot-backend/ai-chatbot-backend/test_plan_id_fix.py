import httpx
import json
import sys
import time

BASE = "http://localhost:8000"
ts = str(int(time.time()))

# Register new user
print("[1] Registering test user...")
register_resp = httpx.post(
    f"{BASE}/api/v1/auth/register",
    json={
        "email": f"test2_user_{ts}@test.com",
        "password": "Test@1234",
        "firstName": "Test2",
        "lastName": "User",
        "tenantSlug": f"test_tenant2_{ts}"
    },
    timeout=10
)

register_data = register_resp.json()
if not register_data.get("success"):
    print("Registration failed")
    sys.exit(1)

# Login
print("[2] Logging in...")
login_resp = httpx.post(
    f"{BASE}/api/v1/auth/login",
    json={
        "email": f"test2_user_{ts}@test.com",
        "password": "Test@1234"
    },
    timeout=10
)

login_data = login_resp.json()
if not login_data.get("success"):
    print("Login failed")
    sys.exit(1)

token = login_data.get("data", {}).get("accessToken")
print(f"✓ Got token: {token[:40]}...")

# Test verify-payment WITHOUT session_id to skip Stripe API call
# This will test the parameter handling directly
print("\n[3] Testing verify-payment WITHOUT session_id (to bypass Stripe API)...")
headers = {"Authorization": f"Bearer {token}"}
payload = {
    "paymentIntentId": "pi_test_001",
    "plan_id": "price_pro_monthly",
    "planName": "Professional",
    "amount": 9900,
    "billingCycle": "monthly"
}

print(f"Request payload: {json.dumps(payload, indent=2)}")

response = httpx.post(
    f"{BASE}/api/v1/stripe/verify-payment",
    json=payload,
    headers=headers,
    timeout=10
)

result = response.json()
print(f"\nResponse Status: {response.status_code}")
print(f"Response:\n{json.dumps(result, indent=2, default=str)}")

# Analyze result
print("\n" + "="*60)
if result.get("success"):
    print("✅ SUCCESS - Endpoint handled plan_id correctly!")
    data = result.get("data", {})
    sub_id = data.get("subscriptionId")
    returned_plan_id = data.get("planId")
    print(f"   Subscription ID: {sub_id}")
    print(f"   Plan ID: {returned_plan_id}")
    if returned_plan_id == "price_pro_monthly":
        print("   ✓ plan_id correctly passed through to response!")
    else:
        print(f"   ⚠️  Unexpected plan_id: {returned_plan_id}")
else:
    error_msg = result.get("error", {}).get("message", "")
    
    # Check what type of error we got
    if "plan_id" in error_msg.lower() and "null" in error_msg.lower():
        print("❌ FAILED - NULL plan_id error (fix didn't work)")
    elif "could not determine plan_id" in error_msg.lower():
        print("⚠️  Could not extract plan_id from Stripe (expected for test)")
    elif "No such" in error_msg or "not found" in error_msg.lower():
        print("⚠️  Resource not found (expected - using test data)")
    else:
        print(f"❌ FAILED - Unexpected error: {error_msg}")

print("="*60)
