import httpx
import json
import sys
import time

BASE = "http://localhost:8000"
ts = str(int(time.time()))

# Test 1: Register a new user
print("[1] Registering a new test user...")
register_resp = httpx.post(
    f"{BASE}/api/v1/auth/register",
    json={
        "email": f"test_user_{ts}@test.com",
        "password": "Test@1234",
        "firstName": "Test",
        "lastName": "User",
        "tenantSlug": f"test_tenant_{ts}"
    },
    timeout=10
)

register_data = register_resp.json()
print(f"Register status: {register_resp.status_code}")
print(f"Register response:\n{json.dumps(register_data, indent=2)}")

if not register_data.get("success"):
    print("\nRegistration failed")
    sys.exit(1)

# Test 2: Login with the new user
print(f"\n[2] Logging in with new user...")
login_resp = httpx.post(
    f"{BASE}/api/v1/auth/login",
    json={
        "email": f"test_user_{ts}@test.com",
        "password": "Test@1234"
    },
    timeout=10
)

login_data = login_resp.json()
print(f"Login status: {login_resp.status_code}")
print(f"Login response:\n{json.dumps(login_data, indent=2)}")

if not login_data.get("success"):
    print("\nLogin failed")
    sys.exit(1)

token = login_data.get("data", {}).get("accessToken")
print(f"\n✓ Got token: {token[:40]}...")

# Test 3: Call verify-payment with token
print("\n[3] Testing verify-payment with plan_id...")
headers = {"Authorization": f"Bearer {token}"}
payload = {
    "session_id": "cs_test_001",
    "plan_id": "price_test_001",
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
if result.get("success"):
    print("\n✅ SUCCESS - verify-payment returned success!")
    data = result.get("data", {})
    sub_id = data.get("subscriptionId")
    plan_id = data.get("planId")
    print(f"   Subscription ID: {sub_id}")
    print(f"   Plan ID: {plan_id}")
    if plan_id == "price_test_001":
        print("   ✓ Plan ID correctly passed through!")
else:
    error_msg = result.get("error", {}).get("message", "")
    if "plan_id" in error_msg.lower() and "null" in error_msg.lower():
        print("\n❌ FAILED - NULL plan_id error still present!")
    elif "MISSING_PLAN_ID" in error_msg:
        print("\n⚠️  Could not extract plan_id from Stripe session")
    else:
        print(f"\n❌ FAILED - Error: {error_msg}")
