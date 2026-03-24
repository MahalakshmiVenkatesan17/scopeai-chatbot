import httpx
import json

BASE = "http://localhost:8000"

# Login
print("[1] Logging in...")
login_resp = httpx.post(f"{BASE}/api/v1/auth/login", json={"email": "admin@techcorp.com", "password": "Test123!"}, timeout=10)
login_data = login_resp.json()
token = login_data.get("data", {}).get("accessToken")
print(f"Token: {token[:30] if token else 'FAILED'}")

# Test verify-payment
print("\n[2] Testing verify-payment with plan_id...")
headers = {"Authorization": f"Bearer {token}"}
payload = {
    "session_id": "cs_test_001",
    "plan_id": "price_test_001",
    "planName": "Professional",
    "amount": 9900,
    "billingCycle": "monthly"
}

print(f"Request payload: {json.dumps(payload, indent=2)}")
response = httpx.post(f"{BASE}/api/v1/stripe/verify-payment", json=payload, headers=headers, timeout=10)
result = response.json()
print(f"\nResponse Status: {response.status_code}")
print(f"Response:\n{json.dumps(result, indent=2, default=str)}")

# Check for success
if result.get("success"):
    print("\n✓ PASSED - Payment verified successfully with plan_id")
    print(f"Subscription ID: {result.get('data', {}).get('subscriptionId')}")
else:
    error = result.get("error", {})
    print(f"\n✗ FAILED - Error: {error.get('message')}")
