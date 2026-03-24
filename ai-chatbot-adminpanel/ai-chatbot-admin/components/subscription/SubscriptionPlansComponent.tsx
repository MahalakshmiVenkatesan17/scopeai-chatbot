​"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Check,
  Zap,
  Rocket,
  Crown,
  TrendingUp,
  Award,
  Star,
  Sparkles,
  Gem,
  Shield,
  Users,
  Globe,
  Cpu,
  Database,
  Cloud,
  Edit2,
  Trash2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  concurrent_users: number | null;
  document_collections: number | null;
  max_file_upload_mb: number | null;
  storage_limit_gb: number | null;
  card_border_color: string;
  icon_color: string;
  icon_background: string;
  features: string[];
  is_active: boolean;
  razorPay_plan_id?: number | string;
  stripePay_price_id?: number | string;
}

interface ApiPlanResponse {
  id: number;
  plan_name: string;
  description: string;
  price: string | number;
  billing_cycle: "monthly" | "yearly";
  concurrent_users: number | null;
  document_collections?: number | null;
  document_collections_limit?: number | null;
  max_file_upload_mb: number | null;
  storage_limit_gb: number | null;
  card_color?: string;
  icon_color?: string;
  icon_bg_color?: string;
  features?: string | string[];
  is_active: number | boolean;
  razorPay_plan_id?: number | string;
  stripePay_price_id?: number | string;
}

interface SubscriptionDetail {
  id: number;
  tenant_id: number;
  plan_name: string;
  plan_id: string;
  subscription_status: string;
  billing_cycle: string;
  amount: string;
  currency: string;
  subscription_id: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  payment_id: string | null;
}

interface User {
  id: number;
  email: string;
  role: string;
  tenant_id?: number;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  billing_cycle: "monthly" | "yearly";
  concurrent_users: string;
  document_collections: string;
  max_file_upload_mb: string;
  storage_limit_gb: string;
  card_border_color: string;
  icon_color: string;
  icon_background: string;
  features: string[];
  is_active: boolean;
}

interface SubscriptionPlansComponentProps {
  userRole: "super_admin" | "tenant_admin";
  currentUser?: User | null;
  sessionId?: string | null;
}

const SubscriptionPlansComponent: React.FC<SubscriptionPlansComponentProps> = ({
  userRole,
  currentUser,
  sessionId,
}) => {
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] =
    useState<SubscriptionDetail | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Modal and form state for super_admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<FormData>(getEmptyForm());
  const [newFeature, setNewFeature] = useState("");

  const isSuperAdmin = useMemo(() => userRole === "super_admin", [userRole]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Empty form helper
  function getEmptyForm(): FormData {
    return {
      name: "",
      description: "",
      price: "",
      billing_cycle: "monthly",
      concurrent_users: "",
      document_collections: "",
      max_file_upload_mb: "",
      storage_limit_gb: "",
      card_border_color: "#3B82F6",
      icon_color: "#2563EB",
      icon_background: "#DBEAFE",
      features: [],
      is_active: true,
    };
  }

  // Modal handlers for super_admin
  const openAddModal = () => {
    setEditingPlan(null);
    setFormData(getEmptyForm());
    setNewFeature("");
    setIsModalOpen(true);
    setErrors({});
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setErrors({});
    setNewFeature("");
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      billing_cycle: plan.billing_cycle,
      concurrent_users: plan.concurrent_users?.toString() || "",
      document_collections: plan.document_collections?.toString() || "",
      max_file_upload_mb: plan.max_file_upload_mb?.toString() || "",
      storage_limit_gb: plan.storage_limit_gb?.toString() || "",
      card_border_color: plan.card_border_color,
      icon_color: plan.icon_color,
      icon_background: plan.icon_background,
      features: plan.features || [],
      is_active: plan.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData(getEmptyForm());
    setNewFeature("");
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleAddFeature = () => {
    const trimmedFeature = newFeature.trim();

    if (!trimmedFeature) {
      setErrors((prev) => ({
        ...prev,
        features: "Feature cannot be empty",
      }));
      return;
    }

    if (
      formData.features.some(
        (feature) => feature.toLowerCase() === trimmedFeature.toLowerCase(),
      )
    ) {
      setErrors((prev) => ({
        ...prev,
        features: "This feature is already added",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, trimmedFeature],
    }));

    setNewFeature("");
    setErrors((prev) => ({
      ...prev,
      features: "",
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => {
      const updatedFeatures = prev.features.filter((_, i) => i !== index);

      setErrors((prevErrors) => ({
        ...prevErrors,
        features:
          updatedFeatures.length === 0 ? "At least 1 feature is required" : "",
      }));

      return {
        ...prev,
        features: updatedFeatures,
      };
    });
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    const priceValue = formData.price === "" ? NaN : parseFloat(formData.price);
    const concurrentValue =
      formData.concurrent_users === ""
        ? NaN
        : parseInt(formData.concurrent_users, 10);
    const documentCollectionValue =
      formData.document_collections === ""
        ? NaN
        : parseInt(formData.document_collections, 10);
    const fileUploadValue =
      formData.max_file_upload_mb === ""
        ? NaN
        : parseInt(formData.max_file_upload_mb, 10);
    const storageLimitValue =
      formData.storage_limit_gb === ""
        ? NaN
        : parseInt(formData.storage_limit_gb, 10);

    // Plan Name
    if (!trimmedName) {
      newErrors.name = "Plan name is required";
    } else if (
      plans.some(
        (p) =>
          p.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
          (!editingPlan || p.id !== editingPlan.id),
      )
    ) {
      newErrors.name = "Plan name already exists";
    }

    // Price (required, allow 0 for free plan)
    if (formData.price === "") {
      newErrors.price = "Price is required";
    } else if (isNaN(priceValue)) {
      newErrors.price = "Enter a valid price";
    } else if (priceValue < 0) {
      newErrors.price = "Price cannot be negative";
    } else if (trimmedName.toLowerCase() !== "free" && priceValue === 0) {
      newErrors.price = "Price must be greater than 0 for paid plans";
    }

    // Optional numeric fields -> validate only if entered
    if (formData.concurrent_users !== "") {
      if (isNaN(concurrentValue) || concurrentValue < 0) {
        newErrors.concurrent_users = "Concurrent users must be 0 or greater";
      }
    }

    if (formData.document_collections !== "") {
      if (isNaN(documentCollectionValue) || documentCollectionValue < 0) {
        newErrors.document_collections =
          "Document collections must be 0 or greater";
      }
    }

    if (formData.max_file_upload_mb !== "") {
      if (isNaN(fileUploadValue) || fileUploadValue < 0) {
        newErrors.max_file_upload_mb =
          "Max file upload size must be 0 or greater";
      }
    }

    if (formData.storage_limit_gb !== "") {
      if (isNaN(storageLimitValue) || storageLimitValue < 0) {
        newErrors.storage_limit_gb = "Storage limit must be 0 or greater";
      }
    }

    // Features (MANDATORY)
    if (!formData.features || formData.features.length === 0) {
      newErrors.features = "At least 1 feature is required";
    }

    // Optional description validation
    if (trimmedDescription.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Show only first error as toast
      const firstError = Object.values(newErrors)[0];
      if (firstError) {
        showToast(firstError, "error");
      }
      return;
    }

    setErrors({});

    const planData = {
      name: trimmedName,
      description: trimmedDescription,
      price: parseFloat(formData.price) || 0,
      billing_cycle: formData.billing_cycle,
      concurrent_users:
        formData.concurrent_users === ""
          ? undefined
          : parseInt(formData.concurrent_users, 10),
      document_collections:
        formData.document_collections === ""
          ? undefined
          : parseInt(formData.document_collections, 10),
      max_file_upload_mb:
        formData.max_file_upload_mb === ""
          ? undefined
          : parseInt(formData.max_file_upload_mb, 10),
      storage_limit_gb:
        formData.storage_limit_gb === ""
          ? undefined
          : parseInt(formData.storage_limit_gb, 10),
      card_border_color: formData.card_border_color,
      icon_color: formData.icon_color,
      icon_background: formData.icon_background,
      features: formData.features,
      is_active: formData.is_active,
    };

    try {
      if (editingPlan) {
        // Update existing plan
        await apiClient.updatePlan(editingPlan.id, planData);
        showToast("Plan updated successfully", "success");
      } else {
        // Create new plan
        const createData = {
          ...planData,
          concurrent_users: planData.concurrent_users ?? null,
          document_collections: planData.document_collections ?? null,
          max_file_upload_mb: planData.max_file_upload_mb ?? null,
          storage_limit_gb: planData.storage_limit_gb ?? null,
        };

        const createdPlan = await apiClient.createPlan(createData as any);

        // Create plan in Razorpay
        try {
          const period: "daily" | "weekly" | "monthly" | "yearly" =
            formData.billing_cycle === "yearly" ? "yearly" : "monthly";

          const razorpayPlanData = {
            name: trimmedName,
            amount: Math.round(parseFloat(formData.price) * 100),
            currency: "INR",
            description: trimmedDescription,
            period: period,
            interval: 1,
            notes: {
              plan_id: createdPlan.data.id?.toString() || "",
              concurrent_users: formData.concurrent_users || "unlimited",
              document_collections:
                formData.document_collections || "unlimited",
            },
          };

          await apiClient.createRazorpayPlan(razorpayPlanData);
        } catch (razorpayError) {
          console.error("Razorpay plan creation failed:", razorpayError);
        }

        showToast("Plan created successfully", "success");
      }

      closeModal();
      fetchPlans();
    } catch (error) {
      console.error("Failed to save plan:", error);
      showToast(
        getErrorMessage(error) ||
          `Failed to ${editingPlan ? "update" : "create"} plan`,
        "error",
      );
    }
  };

  // Helper functions
  const getRandomIcon = () => {
    const iconSet = [
      Rocket,
      Crown,
      TrendingUp,
      Award,
      Star,
      Sparkles,
      Gem,
      Shield,
      Users,
      Globe,
      Cpu,
      Database,
      Cloud,
    ];
    return iconSet[Math.floor(Math.random() * iconSet.length)];
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return Zap;
      case "pro":
        return Rocket;
      case "enterprise":
        return Crown;
      case "elite":
        return TrendingUp;
      case "premium":
        return Gem;
      default:
        return getRandomIcon();
    }
  };

  const getPlanStyling = (planName: string) => {
    const baseStyles = {
      free: { popular: false },
      pro: { popular: true },
      enterprise: { popular: false },
      elite: { popular: false },
    };
    return (
      baseStyles[planName.toLowerCase() as keyof typeof baseStyles] ||
      baseStyles.pro
    );
  };

  const generateFeatures = (plan: SubscriptionPlan): string[] => {
    const features: string[] = [];
    const concurrent =
      !plan.concurrent_users || plan.concurrent_users === 1
        ? "Unlimited concurrent users"
        : `Up to ${plan.concurrent_users} concurrent users`;

    const collections =
      !plan.document_collections || plan.document_collections === 5
        ? "Unlimited document collections"
        : `Up to ${plan.document_collections} document collections`;

    const uploads =
      !plan.max_file_upload_mb || plan.max_file_upload_mb === 10
        ? "Unlimited file uploads"
        : `${plan.max_file_upload_mb}MB max file upload`;

    const storage =
      !plan.storage_limit_gb || plan.storage_limit_gb === 1
        ? "Unlimited storage"
        : `${plan.storage_limit_gb}GB storage`;

    features.push(concurrent, collections, uploads, storage);

    if (plan.features && plan.features.length > 0) {
      features.push(...plan.features);
    }
    return features;
  };

  const getPrice = (plan: SubscriptionPlan): number => {
    return billingCycle === "monthly" ? plan.price : plan.price * 10;
  };

  const getDiscount = (plan: SubscriptionPlan): number => {
    const monthlyTotal = plan.price * 12;
    const yearlyPrice = plan.price * 10;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  };

  const fetchActiveSubscription = async () => {
    if (isSuperAdmin) return;
    try {
      const response = await apiClient.getSubscriptionsDetails();
      if (response.data && Array.isArray(response.data)) {
        const active = response.data.find(
          (sub: SubscriptionDetail) => sub.subscription_status === "active",
        );
        setActiveSubscription(active || null);
      }
    } catch (error) {
      console.error("Failed to fetch subscription details:", error);
      setActiveSubscription(null);
    }
  };

  useEffect(() => {
    if (!sessionId || isSuperAdmin) return;
    apiClient
      .verifyStripePayment(sessionId)
      .then((res) => {
        if (res.success) {
          setShowSuccessPopup(true);
          fetchActiveSubscription();
        }
      })
      .finally(() => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      });
  }, [sessionId, isSuperAdmin]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllPlans();
      const fetchedPlans: SubscriptionPlan[] = Array.isArray(response.data)
        ? response.data.map((plan: ApiPlanResponse) => ({
            id: plan.id,
            name: plan.plan_name,
            description: plan.description,
            price: parseFloat(plan.price.toString()),
            billing_cycle: plan.billing_cycle,
            concurrent_users: plan.concurrent_users,
            document_collections:
              plan.document_collections ||
              plan.document_collections_limit ||
              null,
            max_file_upload_mb: plan.max_file_upload_mb,
            storage_limit_gb: plan.storage_limit_gb,
            card_border_color: plan.card_color || "#3B82F6",
            icon_color: plan.icon_color || "#2563EB",
            icon_background: plan.icon_bg_color || "#DBEAFE",
            features:
              typeof plan.features === "string"
                ? plan.features
                  ? JSON.parse(plan.features)
                  : []
                : Array.isArray(plan.features)
                  ? plan.features
                  : [],
            is_active: !!plan.is_active,
            razorPay_plan_id: plan.razorPay_plan_id || null,
            stripePay_price_id: plan.stripePay_price_id || null,
          }))
        : [];
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      showToast(getErrorMessage(error), "error");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchPlans();
      if (!isSuperAdmin) {
        await fetchActiveSubscription();
      }
    };
    initializeData();
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) return;
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionUpdated = urlParams.get("subscription_updated");
    if (subscriptionUpdated === "true") {
      fetchActiveSubscription();
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [isSuperAdmin]);

  const isActivePlan = (plan: SubscriptionPlan): boolean => {
    if (isSuperAdmin || !activeSubscription) return false;
    return (
      (plan.razorPay_plan_id &&
        activeSubscription.plan_id === plan.razorPay_plan_id) ||
      activeSubscription.plan_name.toLowerCase() === plan.name.toLowerCase()
    );
  };

  const openDeleteModal = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      setDeleting(true);
      await apiClient.deletePlan(planToDelete.id);

      showToast("Plan deleted successfully", "success");

      closeDeleteModal();
      fetchPlans();
    } catch (error: any) {
      console.error("Failed to delete plan:", error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setDeleting(false);
    }
  };

  const discountValue = useMemo(() => {
    const paidPlan = plans.find((p) => p.price > 0);
    return paidPlan ? getDiscount(paidPlan) : 0;
  }, [plans]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading plans...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  function getErrorMessage(error: any): string {
    return (
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again."
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Success Popup */}
        {showSuccessPopup && !isSuperAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 text-center max-w-md w-full border border-transparent dark:border-gray-800 transition-colors">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-full">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-500 mb-2">
                Subscription Activated!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your payment was successful, and your plan is now active.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="primary-bg-color text-white px-6 py-3 rounded-lg font-semibold transition w-full cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="pt-12 md:pt-20 pb-8 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 lg:mb-4 mb-2 leading-tight">
              Subscription Plans
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 lg:mb-8 mb-4 max-w-2xl mx-auto">
              Manage your pricing tiers and features
            </p>

            {/* Super Admin: Add New Plan Button */}
            {isSuperAdmin && (
              <div className="flex justify-center lg:absolute lg:top-25 lg:right-8">
                <button
                  onClick={openAddModal}
                  className="primary-bg-color text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors mx-auto cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Add New Plan
                </button>
              </div>
            )}

            {/* Tenant Admin: Billing Toggle */}
            {!isSuperAdmin && (
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <span
                  className={`text-sm font-semibold transition-colors ${
                    billingCycle === "monthly"
                      ? "primary-color"
                      : "text-gray-500"
                  }`}
                >
                  Pay Monthly
                </span>
                <button
                  onClick={() =>
                    setBillingCycle(
                      billingCycle === "monthly" ? "yearly" : "monthly",
                    )
                  }
                  className="relative inline-flex h-6 w-15 items-center rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      billingCycle === "yearly"
                        ? "translate-x-9"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-semibold transition-colors ${
                    billingCycle === "yearly"
                      ? "primary-color"
                      : "text-gray-500"
                  }`}
                >
                  Pay Yearly
                </span>
                {billingCycle === "yearly" && (
                  <div className="relative flex items-center ml-2">
                    <svg
                      className="absolute top-4 right-5 w-16 h-10 primary-color rotate-45"
                      viewBox="0 0 120 80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M110 10 C 70 -5, 60 50, 25 45" />
                      <path d="M25 45 L 35 38 M25 45 L 33 55" />
                    </svg>

                    <span className="absolute top-8 -right-5 text-sm font-semibold primary-color dark:text-blue-400 ml-16">
                      Save {discountValue}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-360 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
              {plans
                .filter((p) => isSuperAdmin || p.is_active)
                .map((plan) => {
                  const styling = getPlanStyling(plan.name);
                  const Icon = getPlanIcon(plan.name);
                  const features = generateFeatures(plan);
                  const isFree = plan.price === 0;
                  const isPlanActive = isActivePlan(plan);
                  const isSilver = plan.name.toLowerCase() === "silver";

                  return (
                    <div key={plan.id} className="h-full">
                        <div
                          className={`relative h-full rounded-2xl border shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300 ${
                            isPlanActive
                              ? "primary-bg-color primary-color border-transparent"
                              : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800"
                          }`}
                        >
                        {/* Super Admin: Edit/Delete Actions */}
                        {isSuperAdmin && (
                          <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button
                              onClick={() => openEditModal(plan)}
                              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors cursor-pointer border border-transparent dark:border-gray-700"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(plan)}
                              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors cursor-pointer border border-transparent dark:border-gray-700"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        )}

                        <div className="p-8 md:p-10 flex flex-col h-full">
                          <h3
                            className={`text-xl font-bold mb-2 ${
                              isPlanActive ? "text-white" : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {plan.name}
                          </h3>
                          <p
                            className={`text-sm mb-4 ${
                              isPlanActive ? "text-white/80" : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {plan.description ||
                              "Perfect for your AI chatbot needs"}
                          </p>

                          <div
                            className="my-4"
                            style={{
                              borderColor: `${plan.card_border_color}30`,
                            }}
                          >
                            {isFree ? (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`text-3xl md:text-5xl font-semibold ${
                                      !isSuperAdmin && isPlanActive
                                        ? "text-white"
                                        : "text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    $0
                                  </span>
                                  <span
                                    className={`text-lg font-light ${
                                      !isSuperAdmin && isPlanActive
                                        ? "text-white/80"
                                        : "text-gray-600 dark:text-gray-400"
                                    }`}
                                  >
                                    /month
                                  </span>
                                </div>
                                <p className="text-sm text-green-500 dark:text-green-400 font-semibold pt-3 border-t border-gray-300 dark:border-gray-800">
                                  Forever free • No credit card required
                                </p>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`text-3xl md:text-5xl font-semibold text-gray-900 dark:text-gray-100 ${
                                      isPlanActive
                                        ? "text-white"
                                        : "text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    $
                                    {isSuperAdmin ? plan.price : getPrice(plan)}
                                  </span>
                                  <span
                                    className={`text-lg text-gray-600 dark:text-gray-400 font-light ${
                                      isPlanActive
                                        ? "text-white/80"
                                        : "text-gray-600 dark:text-gray-400"
                                    }`}
                                  >
                                    /
                                    {isSuperAdmin
                                      ? plan.billing_cycle
                                      : billingCycle === "yearly"
                                        ? "year"
                                        : "month"}
                                  </span>
                                </div>
                                {!isSuperAdmin && billingCycle === "yearly" && (
                                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <p className="text-sm font-semibold text-green-600">
                                      Save {getDiscount(plan)}% annually
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* CTA Buttons */}
                          {!isSuperAdmin && (
                            <>
                              {isPlanActive ? (
                                <div className="mb-8">
                                  <div className="w-full font-bold py-4 px-6 rounded-xl text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x"></div>
                                    <div className="relative flex items-center justify-center gap-2 text-white">
                                      <Check className="w-5 h-5" />
                                      <span>Active Plan</span>
                                    </div>
                                  </div>
                                  <style jsx>{`
                                    @keyframes gradient-x {
                                      0%,
                                      100% {
                                        background-position: 0% 50%;
                                      }
                                      50% {
                                        background-position: 100% 50%;
                                      }
                                    }
                                    .animate-gradient-x {
                                      background-size: 200% 200%;
                                      animation: gradient-x 3s ease infinite;
                                    }
                                  `}</style>
                                </div>
                              ) : isFree && activeSubscription ? (
                                <button
                                  disabled
                                  className="w-full font-bold py-4 px-6 rounded-xl mb-8 cursor-not-allowed opacity-60 bg-gray-300 text-gray-600"
                                >
                                  Not Available
                                </button>
                              ) : (
                                  <Link
                                    href={{
                                      pathname: "/checkout",
                                      query: {
                                        plan: plan.name.toLowerCase(),
                                        billing: billingCycle,
                                        planId: plan.razorPay_plan_id,
                                        stripePriceId: plan.stripePay_price_id,
                                        price: plan.price,
                                        description: plan.description,
                                        features: JSON.stringify(features),
                                      },
                                    }}
                                    className="block w-full font-bold py-4 px-6 rounded-lg mb-8 shadow-md hover:scale-100 text-center transition-all bg-white dark:bg-slate-900 border border-primary primary-color dark:text-blue-400 dark:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-slate-800"
                                  >
                                    Get Started Now
                                  </Link>
                              )}
                            </>
                          )}

                          {/* Features */}
                          <div className="space-y-4 mb-6">
                            <div className="space-y-3">
                              {features.map((feature, fIndex) => (
                                <div
                                  key={fIndex}
                                  className="flex items-start gap-3"
                                >
                                  <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center shadow-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <Check className="w-4 h-4" />
                                  </div>
                                  <span
                                    className={`text-sm md:text-base leading-relaxed ${
                                      isPlanActive
                                        ? "text-white"
                                        : "text-gray-900 dark:text-gray-200"
                                    }`}
                                  >
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Comparison Table & FAQ (Only for Tenant Admin) */}
        {!isSuperAdmin && (
          <>
            {/* Comparison Table */}
            <div className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  Feature Comparison
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                  Detailed breakdown of features across all plans
                </p>
                <div className="overflow-x-auto rounded-2xl border-2 border-indigo-50 dark:border-gray-800">
                  <table className="w-full">
                    <thead>
                      <tr className="primary-bg-color text-white dark:bg-blue-600 transition-colors">
                        <th className="px-6 py-4 text-left font-bold">
                          Feature
                        </th>
                        {plans.map((plan) => (
                          <th
                            key={plan.id}
                            className="px-6 py-4 text-center font-bold"
                          >
                            {plan.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          feature: "Concurrent Users",
                          values: plans.map((p) =>
                            p.concurrent_users === 0
                              ? "∞"
                              : p.concurrent_users?.toString() || "N/A",
                          ),
                        },
                        {
                          feature: "Document Collections",
                          values: plans.map((p) =>
                            p.document_collections === 0
                              ? "∞"
                              : p.document_collections?.toString() || "N/A",
                          ),
                        },
                        {
                          feature: "Max File Upload",
                          values: plans.map((p) =>
                            p.max_file_upload_mb === 0
                              ? "∞"
                              : p.max_file_upload_mb !== null
                                ? `${p.max_file_upload_mb}MB`
                                : "N/A",
                          ),
                        },
                        {
                          feature: "Storage Limit",
                          values: plans.map((p) =>
                            p.storage_limit_gb === 0 ||
                            p.storage_limit_gb === null
                              ? "∞"
                              : `${p.storage_limit_gb}GB`,
                          ),
                        },
                        {
                          feature: "Price",
                          values: plans.map((p) =>
                            p.price === 0 ? "Free" : `$${p.price}/month`,
                          ),
                        },
                      ].map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-blue-50 dark:bg-gray-800/50"}
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                            {row.feature}
                          </td>
                          {row.values.map((value, valueIdx) => (
                            <td
                              key={valueIdx}
                              className="px-6 py-4 text-center text-gray-700 dark:text-gray-300"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                  Everything you need to know about our pricing and plans
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      q: "Can I start with Free plan?",
                      a: "Yes! Free plan is perfect for exploring features with no credit card required. Upgrade anytime as you grow.",
                    },
                    {
                      q: "Can I upgrade from Free to Pro?",
                      a: "Absolutely! Upgrade anytime and only pay for what you use. We'll handle any pro-rata adjustments.",
                    },
                    {
                      q: "Is Free plan limited forever?",
                      a: "Free plan has usage limits but no time limit. You can use it forever or upgrade whenever you need more.",
                    },
                    {
                      q: "Do I need a credit card for Free plan?",
                      a: "No credit card required for Free plan. Start building immediately with zero commitment.",
                    },
                    {
                      q: "What about data limits?",
                      a: "All plans have secure storage. Check the comparison table for specific limits.",
                    },
                    {
                      q: "How do I upgrade to Enterprise?",
                      a: "Contact our sales team for Enterprise pricing, custom requirements, and volume discounts.",
                    },
                  ].map((faq, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-900 border-2 border-indigo-100 dark:border-gray-800 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-gray-700 hover:shadow-lg transition-all duration-300"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-base md:text-lg">
                        <span className="shrink-0 w-6 h-6 rounded-full primary-bg-color text-white text-xs font-bold flex items-center justify-center">
                          ?
                        </span>
                        {faq.q}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Super Admin: Add/Edit Modal */}
        {isSuperAdmin && isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-transparent dark:border-gray-800">
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 flex justify-between items-center z-10 primary-bg-color transition-colors">
                <h2 className="text-2xl font-bold text-white">
                  {editingPlan ? "Edit Plan" : "Add New Plan"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white cursor-pointer hover:rotate-90 transition-transform"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Plan Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                        errors.name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:border-indigo-500"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors ${
                        errors.price
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:border-indigo-500"
                      }`}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  {/* Billing Cycle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Billing Cycle
                    </label>
                    <select
                      name="billing_cycle"
                      value={formData.billing_cycle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      <option value="monthly" className="dark:bg-gray-800">Monthly</option>
                      <option value="yearly" className="dark:bg-gray-800">Yearly</option>
                    </select>
                  </div>

                  {/* Concurrent Users */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Concurrent Users
                    </label>
                    <input
                      type="number"
                      name="concurrent_users"
                      value={formData.concurrent_users}
                      onChange={handleInputChange}
                      placeholder="Leave empty for unlimited"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.concurrent_users
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:border-indigo-500"
                      }`}
                    />
                    {errors.concurrent_users && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.concurrent_users}
                      </p>
                    )}
                  </div>

                  {/* Document Collections */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Collections
                    </label>
                    <input
                      type="number"
                      name="document_collections"
                      value={formData.document_collections}
                      onChange={handleInputChange}
                      placeholder="Leave empty for unlimited"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.document_collections
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:border-indigo-500"
                      }`}
                    />
                    {errors.document_collections && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.document_collections}
                      </p>
                    )}
                  </div>

                  {/* Max File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max File Upload (MB)
                    </label>
                    <input
                      type="number"
                      name="max_file_upload_mb"
                      value={formData.max_file_upload_mb}
                      onChange={handleInputChange}
                      placeholder="Leave empty for unlimited"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.max_file_upload_mb
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:border-indigo-500"
                      }`}
                    />
                    {errors.max_file_upload_mb && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.max_file_upload_mb}
                      </p>
                    )}
                  </div>

                  {/* Storage Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Storage Limit (GB)
                    </label>
                    <input
                      type="number"
                      name="storage_limit_gb"
                      value={formData.storage_limit_gb}
                      onChange={handleInputChange}
                      placeholder="Leave empty for unlimited"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.storage_limit_gb
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:border-indigo-500"
                      }`}
                    />
                    {errors.storage_limit_gb && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.storage_limit_gb}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                      errors.description
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600"
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="border-t dark:border-gray-800 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Features <span className="text-red-500">*</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => {
                          setNewFeature(e.target.value);
                          if (errors.features) {
                            setErrors((prev) => ({ ...prev, features: "" }));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                        placeholder="Add a feature"
                        className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors.features
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-4 py-2 primary-bg-color text-white rounded-lg cursor-pointer"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {errors.features && (
                      <p className="text-sm text-red-600">{errors.features}</p>
                    )}

                    {formData.features.length > 0 && (
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-transparent dark:border-gray-700 transition-colors"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 focus:ring-indigo-500 focus:border-indigo-600 focus:outline-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Plan (visible to users)
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 primary-bg-color text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full border border-transparent dark:border-gray-800">
            <div className="px-6 py-4 flex justify-between items-center border-b dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Delete Plan
              </h3>
              <button onClick={closeDeleteModal}>
                <X className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete
                <span className="font-semibold text-gray-900 dark:text-white">
                  {" "}
                  {planToDelete?.name}
                </span>{" "}
                plan?
              </p>
 
              <p className="text-sm text-red-600 dark:text-red-400">
                This action cannot be undone. All plan configurations will be
                permanently removed.
              </p>
            </div>

            <div className="px-6 py-4 flex justify-end gap-3 border-t dark:border-gray-800">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeletePlan}
                disabled={deleting}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                {deleting ? "Deleting..." : "Delete Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {ToastComponent}
    </DashboardLayout>
  );
};

export default SubscriptionPlansComponent;
