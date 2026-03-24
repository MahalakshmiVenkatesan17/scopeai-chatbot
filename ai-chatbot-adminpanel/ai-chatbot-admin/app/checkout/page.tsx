"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Check, Lock, AlertCircle, CreditCard } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { loadStripe } from "@stripe/stripe-js";

// Stripe publishable key
const stripePromise = loadStripe(
  "pk_test_51SV72UQkbbUAQFF1eKutLNmgpVlwahAXK9yu9J86Q5fHyHKzKBeUxqsYmaAL19EpJA0ePW3q0Ih9x9zp4pNo6LnW00GZBsP7Ww",
);

// Define Razorpay types
interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type PaymentProvider = "razorpay" | "stripe";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const plan = searchParams.get("plan") || "pro";
  const billing = searchParams.get("billing") || "monthly";
  const planId = searchParams.get("planId");
  const planPrice = searchParams.get("price");
  const planDescription = searchParams.get("description");
  const planFeaturesParam = searchParams.get("features");
  const stripePriceId = searchParams.get("stripePriceId");

  const cancelled = searchParams.get("cancelled");

  const [formData, setFormData] = useState({
    cardName: "",
    email: "",
    contact: "",
    billingAddress: "",
    billingCity: "",
    billingZip: "",
    billingCountry: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentProvider, setPaymentProvider] =
    useState<PaymentProvider>("razorpay");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const planFeatures = planFeaturesParam
    ? JSON.parse(decodeURIComponent(planFeaturesParam))
    : [];

  const finalPrice = planPrice ? parseFloat(planPrice) : 99;
  const billingPeriod = billing === "yearly" ? "/year" : "/month";

  const monthlyEquivalent = billing === "yearly" ? finalPrice / 10 : finalPrice;
  const discount =
    billing === "yearly"
      ? Math.round(
          ((monthlyEquivalent * 12 - finalPrice) / (monthlyEquivalent * 12)) *
            100,
        )
      : 0;

  const selectedPlan = {
    id: planId,
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    description: planDescription || "Premium plan subscription",
    features: planFeatures,
    razorpayPlanId: planId,
    stripePriceId: stripePriceId,
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardName.trim()) newErrors.cardName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (paymentProvider === "razorpay" && !formData.contact.trim()) {
      newErrors.contact = "Contact number is required for Razorpay";
    }
    if (!formData.billingAddress.trim())
      newErrors.billingAddress = "Billing address is required";
    if (!formData.billingCity.trim())
      newErrors.billingCity = "City is required";
    if (!formData.billingZip.trim())
      newErrors.billingZip = "ZIP code is required";
    if (!formData.billingCountry)
      newErrors.billingCountry = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Razorpay subscription handler
  const handleRazorpaySubscription = async (subscriptionId: string) => {
    if (!razorpayLoaded || !window.Razorpay) {
      setErrors({
        submit: "Razorpay SDK not loaded. Please refresh the page.",
      });
      return;
    }

    const options: RazorpayOptions = {
      key: "rzp_test_ly5hTaA8O2qMMO",
      subscription_id: subscriptionId,
      name: "Your Company Name",
      description: `${selectedPlan.name} Plan - ${billing} billing`,
      handler: async function (response: RazorpayResponse) {
        try {
          const verifyResponse = await apiClient.verifySubscriptionPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyResponse.success) {
            setSubmitted(true);
          } else {
            setErrors({
              submit: "Payment verification failed. Please contact support.",
            });
            setLoading(false);
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Payment verification failed";
          setErrors({ submit: errorMessage });
          setLoading(false);
        }
      },
      prefill: {
        name: formData.cardName,
        email: formData.email,
        contact: formData.contact,
      },
      notes: {
        address: formData.billingAddress,
        city: formData.billingCity,
        zip: formData.billingZip,
        plan_name: selectedPlan.name,
        billing_cycle: billing,
      },
      theme: {
        color: "#3B82F6",
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          setErrors({ submit: "Payment cancelled" });
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      // Call backend using ApiClient
      if (!selectedPlan.stripePriceId) {
        throw new Error("No price ID available for the selected plan");
      }
      const response = await apiClient.createStripeCheckoutSession({
        price_id: selectedPlan.stripePriceId, // Stripe Price ID

        billing_cycle: billing as "monthly" | "yearly",

        success_url: `${window.location.origin}/subscription?sessionId={CHECKOUT_SESSION_ID}`, // required

        cancel_url: `${window.location.origin}/cancel-page`,
        customer_email: formData.email, // optional

        plan_name: selectedPlan.name, // required

        amount: finalPrice, // required numeric

        // trial_period_days: 7
      });

      if (!response.success) {
        throw new Error("Failed to create Stripe Checkout session");
      }

      // Modern approach: Your backend should return the checkout URL

      // Make sure your backend returns response.data.url from the Stripe session

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error) {
      console.error(error);

      setErrors({
        submit:
          error instanceof Error ? error.message : "Stripe Checkout failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (paymentProvider === "razorpay") {
        // Razorpay flow
        if (!selectedPlan.razorpayPlanId) {
          setErrors({
            submit: "Invalid plan configuration. Please try again.",
          });
          setLoading(false);
          return;
        }

        const subscriptionResult = await apiClient.createSubscription({
          plan_id: selectedPlan.razorpayPlanId,
          total_count: billing === "yearly" ? 1 : 12,
          quantity: 1,
          customer_notify: 1,
          notes: {
            plan_name: selectedPlan.name,
            billing_cycle: billing,
            original_plan_id: selectedPlan.id,
            customer_name: formData.cardName,
            billing_address: formData.billingAddress,
            billing_city: formData.billingCity,
            billing_zip: formData.billingZip,
            billing_country: formData.billingCountry,
            billing_price: finalPrice.toString(),
          },
        });

        if (
          subscriptionResult.success &&
          subscriptionResult.data?.subscription.id
        ) {
          await handleRazorpaySubscription(
            subscriptionResult.data.subscription.id,
          );
        } else {
          setErrors({
            submit: "Failed to create subscription. Please try again.",
          });
          setLoading(false);
        }
      } else {
        // Stripe flow
        // await handleStripeSubscription();
        await handleUpgrade();
      }
    } catch (error) {
      console.error("Subscription creation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      setErrors({ submit: errorMessage });
      setLoading(false);
    }
  };

  const handleRedirectToDashboard = () => {
    router.push("/subscription");
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 transition-colors">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 inline-flex w-16 h-16 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-green-600 text-white shadow-lg">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
              Subscription Activated!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2 transition-colors">
              Your {selectedPlan.name} plan is now active with automatic{" "}
              {billing} billing.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">
              You'll be charged automatically every{" "}
              {billing === "monthly" ? "month" : "year"} via{" "}
              {paymentProvider === "razorpay" ? "Razorpay" : "Stripe"}.
            </p>
            <button
              className="bg-upgrade-gradient cursor-pointer text-white font-semibold py-2 px-4 rounded-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group mx-auto"
              onClick={handleRedirectToDashboard}
            >
              View active plan
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-background transition-colors">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-50 dark:border-slate-800 p-6 sticky top-4 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">
                Subscription Summary
              </h3>

              <div className="bg-linear-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-blue-100 dark:border-slate-700 p-4 mb-6 transition-colors">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors">Selected Plan</div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                  {selectedPlan.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 transition-colors">
                  {selectedPlan.description}
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-gray-900 dark:text-gray-100 transition-colors">
                    ${finalPrice}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 font-semibold transition-colors">
                    {billingPeriod}
                  </span>
                </div>
                {discount > 0 && (
                  <p className="text-sm font-bold text-green-600">
                    Save {discount}% with annual billing
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-slate-700 transition-colors">
                  <p className="text-xs primary-color dark:text-blue-400 font-semibold transition-colors">
                    🔄 Auto-renews{" "}
                    {billing === "monthly" ? "monthly" : "annually"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    Cancel anytime from your dashboard
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Includes
                </p>
                <div className="space-y-2">
                  {selectedPlan.features
                    .slice(0, 6)
                    .map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{feature}</span>
                      </div>
                    ))}
                  {selectedPlan.features.length > 6 && (
                    <p className="text-xs text-gray-500 italic">
                      + {selectedPlan.features.length - 6} more features
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-800 pt-4 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900 dark:text-gray-100 transition-colors">First payment</span>
                  <span className="text-2xl font-black primary-color dark:text-blue-400 transition-colors">
                    ${finalPrice}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                  Then ${finalPrice} every{" "}
                  {billing === "monthly" ? "month" : "year"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-100 dark:border-slate-800 p-8 shadow-lg transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                Billing Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
                Enter your billing information to start your subscription
              </p>

              {cancelled === "true" && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2 transition-colors">
                  <span>⚠️</span> Payment was cancelled. You can try again
                  below.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {/* Payment Provider Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentProvider("razorpay")}
                      className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentProvider === "razorpay"
                          ? "border-primary bg-blue-50 dark:bg-blue-900/10 primary-color dark:text-blue-400"
                          : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.5 2L9 14.7L9.4 15.2H16.2L8.4 22L10.2 23L22 11L21.3 10.2H13.7L21.5 2H20.5Z"
                          fill="#0A72FF"
                        />
                      </svg>
                      <span className="font-semibold">Razorpay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentProvider("stripe")}
                      className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentProvider === "stripe"
                          ? "border-primary bg-blue-50 dark:bg-blue-900/10 primary-color dark:text-blue-400"
                          : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 28 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 1L1 7V21L14 27L27 21V7L14 1Z"
                          fill="#635BFF"
                        />
                        <path
                          d="M19.5 12.2C19.5 9.8 17.8 9 15.4 9C13.1 9 11.8 9.6 11 10.2V12.8C12 12.1 13.4 11.7 15.1 11.7C16.5 11.7 17.1 12.1 17.1 12.8V13.1C17.1 13.6 16.6 13.8 15.2 14C12.5 14.3 11 15.3 11 17.5C11 19.6 12.6 21 15.3 21C16.9 21 18.3 20.6 19.3 19.9V17.3C18.4 18 16.9 18.5 15.5 18.5C14.2 18.5 13.8 18 13.8 17.4C13.8 16.9 14.2 16.6 15.3 16.5C17.8 16.3 19.5 15.4 19.5 13.2V12.2Z"
                          fill="white"
                        />
                      </svg>
                      <span className="font-semibold">Stripe</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg border-base text-gray-900 dark:text-gray-100 transition-colors"
                    placeholder="John Doe"
                  />
                  {errors.cardName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cardName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg border-base text-gray-900 dark:text-gray-100 transition-colors"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Contact (Razorpay only) */}
                {paymentProvider === "razorpay" && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                      Contact Number
                    </label>
                    <input
                      type="number"
                      name="contact"
                      value={formData.contact}
                        onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // allow only digits
    if (value.length <= 10) {
      setFormData((prev) => ({
        ...prev,
        contact: value,
      }));
    }
  }}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg border-base text-gray-900 dark:text-gray-100 transition-colors"
                      placeholder="9876543210"
                      
                    />
                    {errors.contact && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.contact}
                      </p>
                    )}
                  </div>
                )}

                {/* Billing Address */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg border-base text-gray-900 dark:text-gray-100 transition-colors"
                    placeholder="123 Main St"
                  />
                  {errors.billingAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.billingAddress}
                    </p>
                  )}
                </div>

                {/* City and ZIP */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                      City
                    </label>
                    <input
                      type="text"
                      name="billingCity"
                      value={formData.billingCity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg border-base text-gray-900 dark:text-gray-100 transition-colors"
                      placeholder="New York"
                    />
                    {errors.billingCity && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.billingCity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="billingZip"
                      value={formData.billingZip}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg border-base text-gray-900 dark:text-gray-100 transition-colors"
                      placeholder="10001"
                    />
                    {errors.billingZip && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.billingZip}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                    Country
                  </label>
                  <select
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg border-base text-gray-900 dark:text-gray-100 transition-colors"
                  >
                    <option value="">Select Country</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                  {errors.billingCountry && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.billingCountry}
                    </p>
                  )}
                </div>

                {/* Security Notice */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30 flex items-start gap-3 transition-colors">
                  <Lock className="w-5 h-5 primary-color dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-blue-900 dark:text-blue-200">
                      Secure Recurring Payment via{" "}
                      {paymentProvider === "razorpay" ? "Razorpay" : "Stripe"}
                    </p>
                    <p className="primary-color dark:text-blue-300">
                      Your payment is processed securely. Auto-renewal can be
                      cancelled anytime from your dashboard.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30 flex items-start gap-3 transition-colors">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-200">{errors.submit}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    (paymentProvider === "razorpay" && !razorpayLoaded)
                  }
                  className="w-full cursor-pointer primary-bg-color from-blue-600 to-blue-500 text-white font-bold py-4 px-4 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Processing..."
                    : paymentProvider === "razorpay" && !razorpayLoaded
                      ? "Loading Payment Gateway..."
                      : `Start Subscription - $${finalPrice}`}
                </button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 transition-colors">
                  By continuing, you agree to automatic {billing} billing via{" "}
                  {paymentProvider === "razorpay" ? "Razorpay" : "Stripe"}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 transition-colors">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
