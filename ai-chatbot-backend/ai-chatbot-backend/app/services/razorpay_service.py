"""
Razorpay Service - Handles all Razorpay API integrations
"""

import requests
import hmac
import hashlib
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.logging import logger


class RazorpayService:
    """Service for Razorpay API interactions."""
    
    BASE_URL = "https://api.razorpay.com/v1"
    
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        
        if not self.key_id or not self.key_secret:
            logger.warning("Razorpay credentials not configured. API calls will fail.")
    
    def _get_auth(self):
        """Return Basic Auth tuple for Razorpay API."""
        return (self.key_id, self.key_secret)
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make authenticated request to Razorpay API."""
        url = f"{self.BASE_URL}{endpoint}"
        headers = {
            "Content-Type": "application/json",
        }
        
        try:
            if method.upper() == "GET":
                response = requests.get(
                    url,
                    auth=self._get_auth(),
                    headers=headers,
                    params=params,
                    timeout=30,
                )
            elif method.upper() == "POST":
                response = requests.post(
                    url,
                    auth=self._get_auth(),
                    headers=headers,
                    json=data,
                    params=params,
                    timeout=30,
                )
            elif method.upper() == "PUT":
                response = requests.put(
                    url,
                    auth=self._get_auth(),
                    headers=headers,
                    json=data,
                    params=params,
                    timeout=30,
                )
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Razorpay API error: {str(e)}")
            raise
    
    # =========================================================================
    # PLANS API
    # =========================================================================
    
    def create_plan(
        self,
        period: str,
        interval: int,
        period_count: int,
        amount: int,  # in paisa (paise)
        currency: str = "INR",
        description: Optional[str] = None,
        notes: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Create a Razorpay plan.
        
        Args:
            period: 'daily', 'weekly', 'monthly', 'yearly'
            interval: interval between subscription cycles (1, 2, 3, etc.)
            period_count: number of billing cycles
            amount: amount in paise (e.g., 999 for ₹9.99)
            currency: currency code (default: INR)
            description: plan description
            notes: custom notes (dict)
        
        Returns:
            Razorpay plan object
        """
        payload = {
            "period": period,
            "interval": interval,
            "period_count": period_count,
            "item": {
                "active": True,
                "description": description or f"{period.capitalize()} Plan",
                "amount": amount,
                "currency": currency,
            },
        }
        
        if notes:
            payload["notes"] = notes
        
        return self._make_request("POST", "/plans", data=payload)
    
    def get_plan(self, plan_id: str) -> Dict[str, Any]:
        """Get a Razorpay plan by ID."""
        return self._make_request("GET", f"/plans/{plan_id}")
    
    def list_plans(
        self,
        count: int = 100,
        skip: int = 0,
    ) -> Dict[str, Any]:
        """List all Razorpay plans."""
        return self._make_request(
            "GET",
            "/plans",
            params={"count": count, "skip": skip},
        )
    
    # =========================================================================
    # SUBSCRIPTIONS API
    # =========================================================================
    
    def create_subscription(
        self,
        plan_id: str,
        customer_id: Optional[str] = None,
        quantity: int = 1,
        total_count: int = 12,
        start_at: Optional[int] = None,
        customer_notify: int = 1,
        notes: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Create a Razorpay subscription.
        
        Args:
            plan_id: Razorpay plan ID
            customer_id: Optional Razorpay customer ID
            quantity: quantity of subscription
            total_count: total number of billing cycles
            start_at: Unix timestamp for subscription start
            customer_notify: notification flag (0 or 1)
            notes: custom notes
        
        Returns:
            Razorpay subscription object
        """
        payload = {
            "plan_id": plan_id,
            "quantity": quantity,
            "total_count": total_count,
            "customer_notify": customer_notify,
        }
        
        if customer_id:
            payload["customer_id"] = customer_id
        
        if start_at:
            payload["start_at"] = start_at
        
        if notes:
            payload["notes"] = notes
        
        return self._make_request("POST", "/subscriptions", data=payload)
    
    def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Get a Razorpay subscription by ID."""
        return self._make_request("GET", f"/subscriptions/{subscription_id}")
    
    def cancel_subscription(
        self,
        subscription_id: str,
        cancel_at_cycle_end: bool = False,
    ) -> Dict[str, Any]:
        """Cancel a Razorpay subscription."""
        payload = {
            "cancel_at_cycle_end": 1 if cancel_at_cycle_end else 0,
        }
        return self._make_request(
            "POST",
            f"/subscriptions/{subscription_id}/cancel",
            data=payload,
        )
    
    # =========================================================================
    # PAYMENT LINKS API
    # =========================================================================
    
    def create_payment_link(
        self,
        amount: int,  # in paise
        reference_id: Optional[str] = None,
        description: Optional[str] = None,
        customer_email: Optional[str] = None,
        customer_contact: Optional[str] = None,
        notify_sms: bool = True,
        notify_email: bool = True,
        notes: Optional[Dict[str, str]] = None,
        callback_url: Optional[str] = None,
        callback_method: str = "get",
    ) -> Dict[str, Any]:
        """Create a Razorpay payment link.
        
        Args:
            amount: amount in paise
            reference_id: reference ID for the order
            description: payment description
            customer_email: customer email
            customer_contact: customer phone number with country code
            notify_sms: send SMS notification
            notify_email: send email notification
            notes: custom notes
            callback_url: callback URL
            callback_method: 'get' or 'post'
        
        Returns:
            Razorpay payment link object
        """
        payload = {
            "amount": amount,
            "currency": "INR",
            "notify": {
                "sms": notify_sms,
                "email": notify_email,
            },
        }
        
        if reference_id:
            payload["reference_id"] = reference_id
        
        if description:
            payload["description"] = description
        
        if customer_email:
            payload["customer"] = payload.get("customer", {})
            payload["customer"]["email"] = customer_email
        
        if customer_contact:
            payload["customer"] = payload.get("customer", {})
            payload["customer"]["contact"] = customer_contact
        
        if notes:
            payload["notes"] = notes
        
        if callback_url:
            payload["callback_url"] = callback_url
            payload["callback_method"] = callback_method
        
        return self._make_request("POST", "/payment_links", data=payload)
    
    # =========================================================================
    # PAYMENT VERIFICATION
    # =========================================================================
    
    def verify_payment_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:
        """Verify Razorpay payment signature."""
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            self.key_secret.encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, razorpay_signature)
    
    def verify_subscription_signature(
        self,
        razorpay_subscription_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:
        """Verify Razorpay subscription payment signature."""
        message = f"{razorpay_subscription_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            self.key_secret.encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, razorpay_signature)
    
    # =========================================================================
    # HELPERS
    # =========================================================================
    
    @staticmethod
    def convert_to_paise(amount: float) -> int:
        """Convert rupees to paise (multiply by 100)."""
        return int(Decimal(str(amount)) * 100)
    
    @staticmethod
    def convert_to_rupees(paise: int) -> float:
        """Convert paise to rupees (divide by 100)."""
        return float(Decimal(paise) / 100)


# Singleton instance
razorpay_service = RazorpayService()
