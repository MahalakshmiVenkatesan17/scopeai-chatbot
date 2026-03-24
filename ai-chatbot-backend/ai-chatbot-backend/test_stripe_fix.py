import httpx
import json
import sys

BASE = "http://localhost:8000"

# Test 1: Try login with known user
print("[1] Testing login...")
try:
    login_resp = httpx.post(
        f"{BASE}/api/v1/auth/login",
        json={"email": "admin@techcorp.com", "password": "Test123!"},
        timeout=10
    )
    login_data = login_resp.json()
    print(f"Login status: {login_resp.status_code}")
    print(f"Login response: {json.dumps(login_data, indent=2)}")
    
    if not login_data.get("success"):
        print(f"\nLogin FAILED. Trying to check if user even exists...")
        # Try without password to see if that's the issue
        sys.exit(1)
    
    token = login_data.get("data", {}).get("accessToken")
    if token:
        print(f"\n✓ Got token: {token[:40]}...")
        
        # Test 2: Call verify-payment with token
        print("\n[2] Testing verify-payment endpoint...")
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "session_id": "cs_test_001",
            "plan_id": "price_test_001",
            "planName": "Professional",
            "amount": 9900,
            "billingCycle": "monthly"
        }
        
        response = httpx.post(
            f"{BASE}/api/v1/stripe/verify-payment",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        result = response.json()
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(result, indent=2, default=str)}")
        
        # Check result
        if result.get("success"):
            print("\n✓ SUCCESS - Endpoint returned success")
            if "MISSING_PLAN_ID" not in str(result.get("error", {})):
                if "NULL" not in str(result.get("error", {}) or "NULL not in successful response"):
                    print("✓ No NULL plan_id error - FIX SUCCESSFUL!")
        else:
            print(f"\n✗ FAILED - Error: {result.get('error', {}).get('message')}")
    else:
        print("No token in response")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
