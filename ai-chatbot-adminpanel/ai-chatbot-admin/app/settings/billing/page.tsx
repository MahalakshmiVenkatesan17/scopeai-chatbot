"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ChevronRight,
  Shield,
  Receipt,
  DollarSign,
  TrendingUp,
  Package,
  Zap,
  Crown,
  Rocket,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { set } from "date-fns";
import { useToast } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/Card";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoice_url?: string;
}

interface BillingInfo {
  plan_name: string;
  billing_cycle: "monthly" | "yearly";
  renewal_date: string;
  amount: number;
  status: "active" | "cancelled" | "pending";
  plan_id: string;
  subscription_id: string;
  payment_type: string;
}

export default function BillingSettings() {
  const [loading, setLoading] = useState(true);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const { showToast, ToastComponent } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    setUserDetails(user || {});
  }, [user]);

  const getPlanIcon = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case "free":
        return Zap;
      case "pro":
      case "silver":
        return Rocket;
      case "enterprise":
      case "gold":
        return Crown;
      default:
        return Package;
    }
  };

  const fetchInvoices = async () => {
    try {
      const resp = await apiClient.getAllInvoices({ page: 1, limit: 20 });

      if (resp?.success && Array.isArray(resp.data)) {
        // 🔥 Step 1 — Filter only ACTIVE subscription invoices
        const activeInvoices = resp.data.filter(
          (it: any) =>
            String(it.subscription_status).toLowerCase() === "active",
        );

        // 🔥 Step 2 — Map filtered invoices to UI model
        const mapped: Invoice[] = activeInvoices.map((it: any, idx: number) => {
          const amount = Number(it.amount) || 0;

          const timestamp = it.payment_date
            ? new Date(it.payment_date)
            : it.paid_at
              ? new Date(it.paid_at)
              : new Date();

          const date = timestamp.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return {
            id: it.invoice_id || `inv_${idx}`,
            date,
            amount,
            status:
              it.status === "paid"
                ? "paid"
                : it.status === "pending"
                  ? "pending"
                  : "failed",
            invoice_url: it.short_url || "",
          };
        });

        setInvoices(mapped);
        return;
      }

      setInvoices([]);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      showToast("Failed to load invoices", "error");
      setInvoices([]);
    }
  };

  // ✅ Refresh user data from getUserProfile API
  const refreshUserData = async () => {
    try {

      const response = await apiClient.getSubscriptionsDetails();

      if (!Array.isArray(response?.data)) {
        setBillingInfo(null);
        setInvoices([]);
        return;
      }

      const activeSub = response.data.find(
        (s: any) => s.subscription_status === "active",
      );

      if (!activeSub) {
        setBillingInfo(null);
        setInvoices([]);
        return;
      }


      // Calculate renewal date using the following priority:
      // 1. current_period_end from API (most accurate)
      // 2. created_at + 30 days (fallback)
      // 3. Current date + 30 days (last resort)
      let renewalDate: Date;

      if (activeSub.current_period_end) {
        // Use the actual period end from the subscription
        renewalDate = new Date(activeSub.current_period_end);
      } else if (activeSub.created_at) {
        // Calculate from creation date + 30 days
        renewalDate = new Date(activeSub.created_at);
        renewalDate.setDate(renewalDate.getDate() + 30);
      } else {
        // Fallback: current date + 30 days
        renewalDate = new Date();
        renewalDate.setDate(renewalDate.getDate() + 30);
      }

      const formattedRenewalDate = renewalDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });


      const mapStatus = (s: string) => {
        if (!s) return "pending";
        const normalized = String(s).toLowerCase();
        if (
          ["active", "authenticated", "created", "enabled"].includes(normalized)
        )
          return "active";
        if (["cancelled", "completed", "canceled"].includes(normalized))
          return "cancelled";
        if (normalized === "pending") return "pending";
        return "pending";
      };

      // If user has a paid plan, populate billing info and fetch invoices
      if (activeSub.plan_name && activeSub.plan_name !== "Free") {
        const subscriptionId =
          activeSub.subscription_id ||
          localStorage.getItem("current_subscription_id") ||
          "";

        setBillingInfo({
          plan_name: activeSub.plan_name || "Paid plan",
          billing_cycle: activeSub.billing_cycle || "monthly",
          renewal_date: formattedRenewalDate,
          amount: Number(activeSub.amount) || 0,
          status: mapStatus(activeSub.subscription_status),
          plan_id: activeSub.plan_id || "",
          subscription_id: subscriptionId || "",
          payment_type: activeSub.payment_type || "razorpay",
        });

        // persist IDs for later use
        if (activeSub.plan_id)
          localStorage.setItem("current_plan_id", String(activeSub.plan_id));
        if (subscriptionId)
          localStorage.setItem(
            "current_subscription_id",
            String(subscriptionId),
          );

        // If we have a subscription id, fetch invoices from backend (Razorpay proxy)
        if (subscriptionId) {
          await fetchInvoices();
        } else if (activeSub.created_at) {
          // fallback: create a single invoice record from subscription date & amount
          const fallbackInvoice: Invoice[] = [
            {
              id: "sub_fallback_1",
              date: new Date(activeSub.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              amount: Number(activeSub.amount) || 0,
              status:
                activeSub.subscription_status === "active" ? "paid" : "pending",
              invoice_url: "#",
            },
          ];
          setInvoices(fallbackInvoice);
        } else {
          setInvoices([]);
        }
      } else {
        // Free or no plan
        setBillingInfo(null);
        setInvoices([]);
      }
    } catch (error: any) {
      console.error("Failed to refresh user data:", error);
      setBillingInfo(null);
      setInvoices([]);
    }
  };


  // ✅ Simplified initialization - only run once on mount
  useEffect(() => {
    const initializeBillingData = async () => {
      setLoading(true);

      // Small delay to ensure auth state is loaded
      await new Promise((resolve) => setTimeout(resolve, 100));

      await refreshUserData();

      setLoading(false);
    };

    initializeBillingData();

    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCancelModal = () => {
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleCancelPlan = async () => {
    try {
      setCancelling(true);

      const subscriptionId = localStorage.getItem("current_subscription_id");

      if (!subscriptionId) {
        showToast("No subscription found to cancel.", "error");
        setCancelling(false);
        closeCancelModal();
        return;
      }


      if (billingInfo?.payment_type === "razorpay") {
        const response = await apiClient.cancelSubscription(
          subscriptionId,
          true,
        );

        if (response.success) {
          // Clear everything immediately - don't refresh from backend
          setBillingInfo(null);
          setInvoices([]);

          localStorage.removeItem("current_plan_id");
          localStorage.removeItem("current_subscription_id");

          setCancelling(false);
          closeCancelModal();

          showToast(
            "Subscription cancelled. You will retain access until the end of your billing period.",
            "success",
          );
        } else {
          throw new Error("Failed to cancel subscription");
        }
      } else if (billingInfo?.payment_type === "stripe") {
        const response = await apiClient.cancelStripeSubscription(
          subscriptionId,
          true,
        );

        if (response.success) {
          // Clear everything immediately - don't refresh from backend
          setBillingInfo(null);
          setInvoices([]);

          localStorage.removeItem("current_plan_id");
          localStorage.removeItem("current_subscription_id");

          setCancelling(false);
          closeCancelModal();

          showToast(
            "Subscription cancelled. You will retain access until the end of your billing period.",
            "success",
          );
        } else {
          throw new Error("Failed to cancel subscription");
        }
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      const backendMsg =
        (error as any)?.response?.data?.error?.message ||
        (error as any)?.response?.data?.message;

      showToast(
        backendMsg || "Failed to cancel subscription. Please try again.",
        "error",
      );
      setCancelling(false);
      closeCancelModal();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 transition-colors">
            <CheckCircle className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 transition-colors">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20 transition-colors">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 transition-colors">
            <CheckCircle className="w-3.5 h-3.5" />
            Active
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/[0.04] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/[0.06] transition-colors">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center transition-colors p-6">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#5856d6] border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Loading billing information...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const PlanIcon = billingInfo ? getPlanIcon(billingInfo.plan_name) : Package;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-white/[0.06] dark:bg-[#0F172A] dark:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5856d6] shadow-lg dark:bg-[#635BDF] dark:shadow-[0_0_24px_rgba(99,91,223,0.25)]">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Billing
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    Manage your subscription, invoices, and billing information
                  </p>
                </div>
              </div>

              {billingInfo && (
                <div className="w-fit">
                  {getStatusBadge(billingInfo.status)}
                </div>
              )}
            </div>
          </div>

          {/* Current Plan Section */}
          <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20">
                      <PlanIcon className="w-7 h-7" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                          {billingInfo?.plan_name || "Free Plan"}
                        </h3>

                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/[0.04] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/[0.06] capitalize transition-colors">
                          {billingInfo?.billing_cycle || "No active subscription"}
                        </span>
                      </div>

                      {!billingInfo && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-slate-400 transition-colors max-w-2xl">
                          You&apos;re currently on the free plan with limited features.
                          Upgrade to unlock premium capabilities.
                        </div>
                      )}
                    </div>
                  </div>

                  {billingInfo && (
                    <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10 transition-colors">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-slate-300">
                        Your subscription will auto renew on{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {billingInfo.renewal_date}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => (window.location.href = "/subscription")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5856d6] hover:bg-[#4f46e5] text-white font-semibold px-5 py-3 shadow-lg transition-all duration-200 cursor-pointer w-full sm:w-auto"
                >
                  Adjust Plan
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Summary */}
          {billingInfo && (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                        Current Plan
                      </p>
                      <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{billingInfo.amount.toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        /{billingInfo.billing_cycle === "monthly" ? "mo" : "yr"}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                        Next Billing Date
                      </p>
                      <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                        {billingInfo.renewal_date}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                        Subscription Status
                      </p>
                      <div className="mt-3">{getStatusBadge(billingInfo.status)}</div>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Invoices Section */}
          <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
            <CardContent className="p-0">
              <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-white/[0.06]">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
                  Invoices
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/[0.06] transition-colors">
                    <tr>
                      <th className="px-6 md:px-8 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 md:px-8 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 md:px-8 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 md:px-8 py-4 text-right text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {invoices.length > 0 ? (
                      invoices.map((invoice, index) => (
                        <tr
                          key={`${invoice.id}-${index}`}
                          className="hover:bg-gray-50 dark:hover:bg-white/[0.025] transition-colors"
                        >
                          <td className="px-6 md:px-8 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                            {invoice.date}
                          </td>

                          <td className="px-6 md:px-8 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{invoice.amount.toFixed(2)}
                          </td>

                          <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                            {getStatusBadge(invoice.status)}
                          </td>

                          <td className="px-6 md:px-8 py-4 whitespace-nowrap text-right">
                            <a
                              href={invoice.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#5856d6] dark:text-[#A5B4FC] hover:text-[#4f46e5] dark:hover:text-white font-medium text-sm transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              View
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 md:px-8 py-14 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 mb-4">
                              <Receipt className="w-8 h-8" />
                            </div>

                            <p className="text-gray-700 dark:text-slate-300 font-semibold">
                              No invoices yet
                            </p>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                              Your invoice history will appear here once available.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Section */}
          {billingInfo && billingInfo.status === "active" && (
            <Card className="border-red-200 bg-white dark:border-red-500/20 dark:bg-[#0F172A] transition-colors overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10">
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                  Cancellation
                </h3>
              </div>

              <CardContent className="p-6 md:p-8">
                <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium mb-1 transition-colors">
                        Cancel plan
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400 transition-colors">
                        You&apos;ll lose access to premium features at the end of
                        your billing cycle
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={openCancelModal}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Card */}
          <Card className="primary-bg-color text-white p-7 mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Upgrade your plan</h3>
              <p className="text-gray-100 text-sm">
                Your Subscription plan will expire soon please upgrade!
              </p>
              <button
                onClick={() => (window.location.href = "/subscription")}
                className="mt-3 text-sm px-4 py-2 primary-color bg-white hover:bg-gray-100 border-2 font-medium rounded-xl transition-all duration-200 cursor-pointer"
              >
                Upgrade
              </button>
            </div>
          </Card>

          {/* Help Section */}
          {/* <div className=" mb-6">
            <div className="bg-blue-50 border border-blue-100 p-7 rounded-lg">
              <div className="flex gap-2 items-center mb-3">
                <div className="w-6 h-6 rounded-full primary-bg-color flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 ">
                  Need help with billing?
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Our support team is here to help with any billing questions or
                issues.
              </p>
              <a
                href="mailto:support@example.com"
                className="inline-flex items-center gap-2 text-sm font-semibold primary-color hover:underline transition-colors"
              >
                Contact Support
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div> */}
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-white/[0.06] dark:bg-[#0F172A] overflow-hidden transition-colors">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                    Cancel Subscription
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 transition-colors">
                    Are you sure you want to cancel?
                  </p>
                </div>
              </div>

              <button
                onClick={closeCancelModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/[0.04] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-semibold">Important Notice</p>
                    <p className="mt-1">
                      You will lose access to premium features at the end of
                      your current billing cycle.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03] p-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500 dark:text-slate-400">Current Plan:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right">
                      {billingInfo?.plan_name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500 dark:text-slate-400">Billing Cycle:</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize text-right">
                      {billingInfo?.billing_cycle}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500 dark:text-slate-400">Access Until:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right">
                      {billingInfo?.renewal_date}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-gray-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                onClick={closeCancelModal}
                disabled={cancelling}
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.05] transition-colors disabled:opacity-50"
              >
                Keep Subscription
              </button>

              <button
                onClick={handleCancelPlan}
                disabled={cancelling}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {ToastComponent}
    </DashboardLayout>
  );
}