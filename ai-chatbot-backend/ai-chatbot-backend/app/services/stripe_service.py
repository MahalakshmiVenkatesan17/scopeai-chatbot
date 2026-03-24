"""
Stripe Service - Handles all Stripe API integrations
"""

import stripe
from typing import Optional, Dict, Any
from decimal import Decimal

from app.core.config import settings
from app.core.logging import logger


class StripeService:
    """Service for Stripe API interactions."""
    
    def __init__(self):
        self.api_key = settings.STRIPE_SECRET_KEY
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        
        if self.api_key:
            stripe.api_key = self.api_key
        else:
            logger.warning("Stripe API key not configured. API calls will fail.")
    
    # =========================================================================
    # CUSTOMERS API
    # =========================================================================
    
    def create_customer(
        self,
        email: str,
        name: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Create a Stripe customer."""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata=metadata or {},
            )
            return customer
        except stripe.error.StripeError as e:
            logger.error(f"Stripe customer creation error: {str(e)}")
            raise
    
    def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """Get a Stripe customer by ID."""
        try:
            customer = stripe.Customer.retrieve(customer_id)
            return customer
        except stripe.error.StripeError as e:
            logger.error(f"Stripe customer retrieval error: {str(e)}")
            raise
    
    # =========================================================================
    # CHECKOUT SESSIONS API
    # =========================================================================
    
    def create_checkout_session(
        self,
        line_items: list,
        success_url: str,
        cancel_url: str,
        customer_email: Optional[str] = None,
        customer_id: Optional[str] = None,
        payment_method_types: Optional[list] = None,
        mode: str = "subscription",  # "subscription", "payment", "setup"
        metadata: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Create a Stripe Checkout session.
        
        Args:
            line_items: List of line items (products/prices)
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel
            customer_email: Customer email
            customer_id: Customer ID
            payment_method_types: List of payment method types (e.g., ['card'])
            mode: Session mode - "subscription", "payment", or "setup"
            metadata: Custom metadata
        
        Returns:
            Stripe session object
        """
        try:
            session_params = {
                "line_items": line_items,
                "mode": mode,
                "success_url": success_url,
                "cancel_url": cancel_url,
            }
            
            if customer_email:
                session_params["customer_email"] = customer_email
            
            if customer_id:
                session_params["customer"] = customer_id
            
            if payment_method_types:
                session_params["payment_method_types"] = payment_method_types
            else:
                session_params["payment_method_types"] = ["card"]
            
            if metadata:
                session_params["metadata"] = metadata
            
            session = stripe.checkout.Session.create(**session_params)
            return session
        except stripe.error.StripeError as e:
            logger.error(f"Stripe checkout session creation error: {str(e)}")
            raise
    
    def get_checkout_session(self, session_id: str) -> Dict[str, Any]:
        """Get a Stripe Checkout session by ID."""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return session
        except stripe.error.StripeError as e:
            logger.error(f"Stripe checkout session retrieval error: {str(e)}")
            raise
    
    # =========================================================================
    # SUBSCRIPTIONS API
    # =========================================================================
    
    def create_subscription(
        self,
        customer_id: str,
        items: list,
        payment_behavior: str = "default_incomplete",
        payment_settings: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Create a Stripe subscription.
        
        Args:
            customer_id: Stripe customer ID
            items: List of subscription items (with price_id)
            payment_behavior: "default_incomplete" or "default_incomplete_and_requires_action"
            payment_settings: Payment settings
            metadata: Custom metadata
        
        Returns:
            Stripe subscription object
        """
        try:
            params = {
                "customer": customer_id,
                "items": items,
                "payment_behavior": payment_behavior,
            }
            
            if payment_settings:
                params["payment_settings"] = payment_settings
            
            if metadata:
                params["metadata"] = metadata
            
            subscription = stripe.Subscription.create(**params)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Stripe subscription creation error: {str(e)}")
            raise
    
    def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Get a Stripe subscription by ID."""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Stripe subscription retrieval error: {str(e)}")
            raise
    
    def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel a Stripe subscription."""
        try:
            subscription = stripe.Subscription.delete(subscription_id)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Stripe subscription cancellation error: {str(e)}")
            raise
    
    # =========================================================================
    # PAYMENT INTENTS API
    # =========================================================================
    
    def create_payment_intent(
        self,
        amount: int,  # in cents
        currency: str = "usd",
        customer_id: Optional[str] = None,
        payment_method_id: Optional[str] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Create a Stripe Payment Intent.
        
        Args:
            amount: Amount in cents
            currency: Currency code (default: usd)
            customer_id: Customer ID
            payment_method_id: Payment method ID
            description: Payment description
            metadata: Custom metadata
        
        Returns:
            Stripe payment intent object
        """
        try:
            params = {
                "amount": amount,
                "currency": currency,
            }
            
            if customer_id:
                params["customer"] = customer_id
            
            if payment_method_id:
                params["payment_method"] = payment_method_id
            
            if description:
                params["description"] = description
            
            if metadata:
                params["metadata"] = metadata
            
            intent = stripe.PaymentIntent.create(**params)
            return intent
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent creation error: {str(e)}")
            raise
    
    def retrieve_payment_intent(self, intent_id: str) -> Dict[str, Any]:
        """Retrieve a Stripe Payment Intent by ID."""
        try:
            intent = stripe.PaymentIntent.retrieve(intent_id)
            return intent
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent retrieval error: {str(e)}")
            raise
    
    # =========================================================================
    # PRICES & PRODUCTS API
    # =========================================================================
    
    def get_price(self, price_id: str) -> Dict[str, Any]:
        """Get a Stripe Price by ID."""
        try:
            price = stripe.Price.retrieve(price_id)
            return price
        except stripe.error.StripeError as e:
            logger.error(f"Stripe price retrieval error: {str(e)}")
            raise
    
    def get_product(self, product_id: str) -> Dict[str, Any]:
        """Get a Stripe Product by ID."""
        try:
            product = stripe.Product.retrieve(product_id)
            return product
        except stripe.error.StripeError as e:
            logger.error(f"Stripe product retrieval error: {str(e)}")
            raise
    
    # =========================================================================
    # WEBHOOK VERIFICATION
    # =========================================================================
    
    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str,
    ) -> Dict[str, Any]:
        """Verify Stripe webhook signature."""
        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                self.webhook_secret,
            )
            return event
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Stripe webhook signature verification failed: {str(e)}")
            raise
    
    # =========================================================================
    # HELPERS
    # =========================================================================
    
    @staticmethod
    def convert_to_cents(amount: float) -> int:
        """Convert dollars to cents (multiply by 100)."""
        return int(Decimal(str(amount)) * 100)
    
    @staticmethod
    def convert_to_dollars(cents: int) -> float:
        """Convert cents to dollars (divide by 100)."""
        return float(Decimal(cents) / 100)


# Singleton instance
stripe_service = StripeService()
