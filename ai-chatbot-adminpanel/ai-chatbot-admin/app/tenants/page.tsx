"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, XCircle, Building2, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import apiClient from "@/lib/api-client";
import type { Tenant } from "@/types";
import { format } from "date-fns";

interface TenantFormData {
  name: string;
  slug: string;
  domain?: string;
  subscription_plan: "free" | "pro" | "enterprise";
  max_users: number;
  max_chat_sessions: number;
  max_storage_mb: number;
  billing_email?: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { showToast, ToastComponent } = useToast();

  const [formData, setFormData] = useState<TenantFormData>({
    name: "",
    slug: "",
    domain: "",
    subscription_plan: "free",
    max_users: 5,
    max_chat_sessions: 100,
    max_storage_mb: 100,
    billing_email: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    slug: "",
    billing_email: "",
  });

  useEffect(() => {
    fetchTenants();
  }, [page, limit, statusFilter, search]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTenants({
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      });

      console.debug("Tenants API response:", response);

      let items: Tenant[] = [];
      const maybeItems =
        (response as any)?.data?.data?.items ??
        (response as any)?.data?.items ??
        (response as any)?.items ??
        (Array.isArray(response) ? response : undefined);

      if (Array.isArray(maybeItems)) {
        items = maybeItems;
      }

      setTenants(items);

      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.pages || 0);
      } else {
        setTotalItems(items.length);
        setTotalPages(Math.ceil(items.length / limit));
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
      setTenants([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSuspend = async (tenantId: number) => {
    if (confirm("Are you sure you want to suspend this tenant?")) {
      try {
        await apiClient.suspendTenant(tenantId, "Suspended by admin");
        showToast("Tenant suspended successfully", "success");
        fetchTenants();
      } catch (error) {
        console.error("Failed to suspend tenant:", error);
        showToast("Failed to suspend tenant", "error");
      }
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      slug: "",
      domain: "",
      subscription_plan: "free",
      max_users: 5,
      max_chat_sessions: 100,
      max_storage_mb: 100,
      billing_email: "",
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain || "",
      subscription_plan: tenant.subscription_plan,
      max_users: tenant.max_users,
      max_chat_sessions: tenant.max_chat_sessions || 100,
      max_storage_mb: tenant.max_storage_mb || 100,
      billing_email: tenant.billing_email || "",
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingTenant(null);
    setErrors({
      name: "",
      slug: "",
      billing_email: "",
    });
  };

  const handleInputChange = (
    field: keyof TenantFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    setErrors((prev: any) => ({
      ...prev,
      [field]: "",
    }));

    if (field === "name" && !showEditModal) {
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      setFormData((prev) => ({ ...prev, slug }));

      setErrors((prev: any) => ({
        ...prev,
        slug: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (formData.slug && /[^a-z0-9-]/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.max_users < 1) {
      newErrors.max_users = "Max users must be at least 1";
    }

    if (!formData.billing_email?.trim()) {
      newErrors.billing_email = "Billing email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.billing_email)) {
      newErrors.billing_email = "Invalid email format";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast(Object.values(newErrors)[0] as string, "error");
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await apiClient.createTenant({
        name: formData.name,
        slug: formData.slug,
        subscriptionPlan: formData.subscription_plan || "free",
        maxUsers: formData.max_users || 5,
        maxChatSessions: formData.max_chat_sessions || 100,
        maxStorageMb: formData.max_storage_mb || 100,
        billingEmail: formData.billing_email,
        domain: formData.domain || undefined,
      });
      showToast("Tenant created successfully", "success");
      handleCloseModal();
      fetchTenants();
    } catch (error: any) {
      console.error("Failed to create tenant:", error);
      const backendMsg = error?.response?.data?.message;
      if (backendMsg) {
        showToast(backendMsg, "error");
      } else {
        showToast("Failed to create tenant", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingTenant || !validateForm()) return;

    try {
      setSubmitting(true);
      await apiClient.updateTenant(editingTenant.id, {
        ...formData,
        domain: formData.domain || undefined,
      });
      showToast("Tenant updated successfully", "success");
      handleCloseModal();
      fetchTenants();
    } catch (error) {
      console.error("Failed to update tenant:", error);
      showToast("Failed to update tenant", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClass =
      status === "active"
        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
        : status === "suspended"
          ? "bg-red-500/15 text-red-400 border border-red-500/20"
          : "bg-amber-500/15 text-amber-400 border border-amber-500/20";

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
      >
        {status}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planClass =
      plan === "enterprise"
        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
        : plan === "pro"
          ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
          : "bg-slate-500/15 text-gray-700 dark:text-slate-300 border border-slate-500/20";

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${planClass}`}
      >
        {plan.toUpperCase()}
      </span>
    );
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#171F33] px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#635BDF] focus:outline-none focus:ring-2 focus:ring-[#635BDF]/20 transition-colors";

  const modalInputClass =
    "w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#171F33] px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#635BDF] focus:outline-none focus:ring-2 focus:ring-[#635BDF]/20 transition-colors";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#070B14] transition-colors p-4">
        {/* Glow Background */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block">
          <div className="absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute top-24 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1220] shadow-sm dark:shadow-2xl space-y-5 p-5 transition-colors">
          {/* Page Header */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-r from-gray-50 to-white dark:from-[#0F172A] dark:via-[#0B1220] dark:to-[#111827] px-5 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635BDF] text-white shadow-[0_0_24px_rgba(99,91,223,0.25)]">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Tenants Management
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                  Manage all tenants and their subscriptions
                </p>
              </div>
            </div>

            <Button
              variant="main"
              onClick={handleOpenCreate}
              className="bg-[#635BDF] hover:bg-[#726AF0] text-white shadow-[0_0_24px_rgba(99,91,223,0.25)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-none">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Filter className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  Search & Filters
                </h3>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search tenants by name, slug or domain..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#171F33] px-4 py-2.5 text-sm text-gray-900 dark:text-slate-200 focus:border-[#635BDF] focus:outline-none focus:ring-2 focus:ring-[#635BDF]/20 transition-colors min-w-[180px]"
                >
                  <option value="all" className="dark:bg-[#171F33]">
                    All Status
                  </option>
                  <option value="active" className="dark:bg-[#171F33]">
                    Active
                  </option>
                  <option value="suspended" className="dark:bg-[#171F33]">
                    Suspended
                  </option>
                </select>

                {/* <Button
                  variant="main"
                  onClick={handleSearch}
                  className="bg-[#635BDF] hover:bg-[#726AF0] text-white min-w-[140px] shadow-[0_0_24px_rgba(99,91,223,0.18)]"
                >
                  Search
                </Button> */}
              </div>
            </CardContent>
          </Card>

          {/* Tenants Table */}
          <Card className="border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1220] shadow-none overflow-hidden">
            <CardContent className="px-0! py-0!">
              {loading ? (
                <div className="flex items-center justify-center py-14">
                  <div className="text-center">
                    <div className="inline-block h-9 w-9 animate-spin rounded-full border-4 border-solid border-[#635BDF] border-r-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-slate-400">
                      Loading tenants...
                    </p>
                  </div>
                </div>
              ) : tenants?.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="text-gray-600 dark:text-slate-400">
                    No tenants found
                  </p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-100 dark:bg-[#2C3142] transition-colors">
                      <TableRow className="border-b border-gray-200 dark:border-white/10">
                        <TableHead className="text-gray-900 dark:text-slate-300 font-semibold px-6 py-4 uppercase tracking-wide text-xs">
                          Name
                        </TableHead>
                        <TableHead className="text-gray-900 dark:text-slate-300 font-semibold px-6 py-4 uppercase tracking-wide text-xs">
                          Slug
                        </TableHead>
                        <TableHead className="text-gray-900 dark:text-slate-300 font-semibold px-6 py-4 uppercase tracking-wide text-xs">
                          Plan
                        </TableHead>
                        <TableHead className="text-gray-900 dark:text-slate-300 font-semibold px-6 py-4 uppercase tracking-wide text-xs">
                          Status
                        </TableHead>
                        <TableHead className="text-gray-900 dark:text-slate-300 font-semibold px-6 py-4 uppercase tracking-wide text-xs">
                          Users
                        </TableHead>
                        <TableHead className="text-gray-900 dark:text-slate-300 font-semibold px-6 py-4 uppercase tracking-wide text-xs">
                          Created
                        </TableHead>
                        <TableHead className="text-gray-900 dark:text-slate-300 font-semibold px-6 py-4 text-right uppercase tracking-wide text-xs">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white dark:bg-[#0B1220] transition-colors">
                      {tenants?.map((tenant) => (
                        <TableRow
                          key={tenant.id}
                          className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <TableCell className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-slate-100">
                              {tenant.name}
                            </div>
                            {tenant.domain && (
                              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                {tenant.domain}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            <code className="rounded-lg bg-gray-100 dark:bg-[#171F33] text-gray-700 dark:text-slate-300 px-2.5 py-1.5 text-xs border border-gray-200 dark:border-white/10">
                              {tenant.slug}
                            </code>
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            {getPlanBadge(tenant.subscription_plan)}
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            {getStatusBadge(tenant.status)}
                          </TableCell>

                          <TableCell className="px-6 py-4 text-gray-700 dark:text-slate-300">
                            {tenant.max_users}
                          </TableCell>

                          <TableCell className="px-6 py-4 text-gray-700 dark:text-slate-300">
                            {format(new Date(tenant.created_at), "MMM d, yyyy")}
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(tenant)}
                                className="rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 transition-all hover:scale-105 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              {tenant.status === "active" && (
                                <button
                                  onClick={() => handleSuspend(tenant.id)}
                                  className="rounded-xl p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                                  title="Suspend"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {!loading && tenants?.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
              itemsPerPageOptions={[10, 25, 50, 100]}
            />
          )}
        </div>

        {/* Create Tenant Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title="Create New Tenant"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Tenant Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`${modalInputClass} ${errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                    }`}
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Slug * (auto-generated)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className={`${modalInputClass} ${errors.slug
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                    }`}
                  placeholder="acme-corporation"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Domain (optional)
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => handleInputChange("domain", e.target.value)}
                className={modalInputClass}
                placeholder="acme.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Billing Email *
                </label>
                <input
                  type="email"
                  value={formData.billing_email}
                  onChange={(e) =>
                    handleInputChange("billing_email", e.target.value)
                  }
                  className={`${modalInputClass} ${errors.billing_email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                    }`}
                  placeholder="billing@acme.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="main"
                onClick={handleCreate}
                isLoading={submitting}
                className="bg-[#635BDF] hover:bg-[#726AF0] text-white"
              >
                Create Tenant
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Tenant Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          title="Edit Tenant"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Tenant Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`${modalInputClass} ${errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  disabled
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2.5 text-sm bg-gray-50 dark:bg-[#171F33]/70 text-gray-500 dark:text-slate-500 cursor-not-allowed transition-colors"
                  title="Slug cannot be changed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Domain (optional)
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => handleInputChange("domain", e.target.value)}
                className={modalInputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Billing Email *
                </label>
                <input
                  type="email"
                  value={formData.billing_email}
                  onChange={(e) =>
                    handleInputChange("billing_email", e.target.value)
                  }
                  className={`${modalInputClass} ${errors.billing_email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                    }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="main"
                onClick={handleUpdate}
                isLoading={submitting}
                className="bg-[#635BDF] hover:bg-[#726AF0] text-white"
              >
                Update Tenant
              </Button>
            </div>
          </div>
        </Modal>

        {ToastComponent}
      </div>
    </DashboardLayout>
  );
}