#!/usr/bin/env python3
"""Test Stripe verify-payment endpoint"""
import httpx
import json
from datetime import datetime

BASE = "http://localhost:8000"

def test_stripe_verify():
    """Test the Stripe verify-payment endpoint"""
    
    # Step 1: Login to get auth token
    print("\n[1] Logging in to get auth token...")
    login_resp = httpx.post(
        f"{BASE}/api/v1/auth/login",
        json={"email": "admin@techcorp.com", "password": "Test123!"},
        timeout=10
    )
    login_data = login_resp.json()
    
    if not login_data.get("success"):
        print(f"Login failed: {login_data}")
        return
    
    token = login_data.get("data", {}).get("accessToken")
    print(f"✓ Got token: {token[:20]}...")
    
    # Step 2: Test verify-payment endpoint with plan_id
    print("\n[2] Testing /stripe/verify-payment with plan_id...")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "session_id": "cs_test_a1234567890",
        "plan_id": "price_test_001",
        "priceId": "price_test_001",
        "planName": "Professional",
        "amount": 9900,  # In cents
        "billingCycle": "monthly"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = httpx.post(
        f"{BASE}/api/v1/stripe/verify-payment",
        json=payload,
        headers=headers,
        timeout=10
    )
    
    result = response.json()
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response: {json.dumps(result, indent=2, default=str)}")
    
    if result.get("success"):
        print("\n✓ Test PASSED - plan_id was properly handled")
    else:
        error = result.get("error", {})
        error_msg = error.get("message", "Unknown error")
        
        # Check if it's the NULL plan_id error
        if "plan_id" in error_msg.lower() and "null" in error_msg.lower():
            print(f"\n✗ Test FAILED - NULL plan_id error still present: {error_msg}")
        else:
            print(f"\n✗ Test FAILED - Error: {error_msg}")

if __name__ == "__main__":
    test_stripe_verify()
