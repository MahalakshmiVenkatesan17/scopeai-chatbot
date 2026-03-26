"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Users2, Filter } from "lucide-react";
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
import { useToast } from "@/components/ui/Toast";
import { Pagination } from "@/components/ui/Pagination";
import apiClient from "@/lib/api-client";
import type { User, Tenant } from "@/types";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth-store";

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  tenantSlug: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const loggedInUser = useAuthStore().user;

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    tenantSlug: "",
    role: "",
  });

  const [tenantFilter, setTenantFilter] = useState<string>("");

  const fetchUsers = async () => {
    if (!loggedInUser) return;

    try {
      setLoading(true);

      const response = await apiClient.getUsers({
        page,
        limit,
        tenantId: tenantFilter ? Number(tenantFilter) : undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        search: searchTerm || undefined,
      });

      const items: User[] =
        (response as any).data ??
        (response as any).items ??
        (response as any).users ??
        [];

      setUsers(items);

      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.pages || 0);
      } else {
        const total = (response as any).total ?? items.length;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / limit));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await apiClient.getTenants({ page: 1, limit: 100 });
      setTenants(response?.items?.filter((t: any) => t.status !== "suspended") || []);
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    }
  };

  useEffect(() => {
    if (loggedInUser) {
      fetchUsers();
      fetchTenants();
    }
  }, [loggedInUser, page, roleFilter, tenantFilter, limit, searchTerm]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      tenantSlug: "",
      role: "",
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setSearchTerm("");
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      password: "",
      tenantSlug: user.tenantSlug,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingUser(null);
    setDeletingUser(null);
    setSearchTerm("");
  };

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value as string }));
  };

  const validateForm = (isCreate: boolean, type?: string): boolean => {
    if (!formData.email.trim()) {
      showToast("Email is required", "error");
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)) {
      showToast("Invalid email format", "error");
      return false;
    }
    if (!formData.firstName?.trim()) {
      showToast("First name is required", "error");
      return false;
    }
    if (!formData.lastName.trim()) {
      showToast("Last name is required", "error");
      return false;
    }
    if (
      isCreate &&
      (!formData.password || formData.password.length < 8) &&
      type !== "edit"
    ) {
      showToast("Password must be at least 8 characters", "error");
      return false;
    }
    if (
      formData.role !== "super_admin" &&
      !formData.tenantSlug &&
      type !== "edit"
    ) {
      showToast("Tenant is required", "error");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm(true)) return;

    try {
      setSubmitting(true);
      await apiClient.createUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password!,
        tenantSlug: formData.role === "super_admin" ? null : formData.tenantSlug,
        role: formData.role,
      });
      showToast("User created successfully", "success");
      handleCloseModal();
      setSearchTerm("");
      setPage(1);
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to create user:", error);
      const backendMsg = error?.response?.data?.error?.message;
      if (backendMsg) {
        showToast(backendMsg, "error");
      } else {
        showToast("Failed to create user", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser || !validateForm(true, "edit")) return;

    try {
      setSubmitting(true);
      const updateData: Record<string, unknown> = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };

      if (formData.password && formData.password.length >= 8) {
        updateData.password = formData.password;
      }

      if (formData.role !== "super_admin") {
        updateData.tenantSlug = formData.tenantSlug;
      } else {
        updateData.tenantSlug = null;
      }

      await apiClient.updateUser(editingUser.id, updateData);
      showToast("User updated successfully", "success");
      handleCloseModal();
      setSearchTerm("");
      setPage(1);
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to update user:", error);

      const backendMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message;

      if (backendMsg) {
        showToast(backendMsg, "error");
      } else {
        showToast("Failed to update user", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      setSubmitting(true);
      await apiClient.deleteUser(deletingUser.id);
      showToast("User deleted successfully", "success");
      handleCloseModal();
      setSearchTerm("");
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      showToast("Failed to delete user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<
      string,
      "success" | "info" | "warning" | "default" | "danger"
    > = {
      super_admin: "danger",
      tenant_admin: "warning",
      customer: "info",
      support: "default",
    };

    return (
      <Badge variant={variants[role] || "default"}>
        <span className="capitalize">{role.replace("_", " ")}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "danger"> = {
      active: "success",
      inactive: "warning",
      suspended: "danger",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 dark:border-white/10 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all";

  const selectClass =
    "w-full rounded-xl border border-gray-300 dark:border-white/10 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 transition-all";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1020] transition-colors">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block">
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute top-32 right-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:shadow-2xl sm:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <Users2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  Users Management
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage all users across tenants
                </p>
              </div>
            </div>

            <Button
              variant="main"
              onClick={handleOpenCreate}
              className="primary-bg-color rounded-xl px-5 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          {/* Filters */}
          <Card className="border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-xl">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Filter className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Search & Filters
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="relative xl:col-span-5">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users by email"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-100 dark:placeholder:text-gray-500"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                {loggedInUser?.role !== "tenant_admin" && (
                  <div className="xl:col-span-4">
                    <select
                      value={tenantFilter}
                      onChange={(e) => {
                        setTenantFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-100"
                    >
                      <option value="" className="dark:bg-[#111827]">
                        All Tenants
                      </option>
                      {tenants.map((tenant) => (
                        <option
                          key={tenant.id}
                          value={tenant.id}
                          className="dark:bg-[#111827]"
                        >
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="xl:col-span-3">
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-100"
                  >
                    <option value="all" className="dark:bg-[#111827]">
                      All Roles
                    </option>
                    {loggedInUser?.role === "super_admin" && (
                      <option value="super_admin" className="dark:bg-[#111827]">
                        Super Admin
                      </option>
                    )}
                    <option value="tenant_admin" className="dark:bg-[#111827]">
                      Tenant Admin
                    </option>
                    {/* <option value="customer" className="dark:bg-[#111827]">
                      Customer
                    </option>
                    <option value="support" className="dark:bg-[#111827]">
                      Support
                    </option> */}
                  </select>
                </div>
{/* 
                <div className="xl:col-span-2">
                  <Button
                    variant="main"
                    onClick={handleSearch}
                    className="primary-bg-color h-full w-full rounded-xl shadow-lg shadow-indigo-500/20"
                    disabled={loading}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-xl">
            <CardContent className="p-0!">
              {loading ? (
                <div className="flex min-h-[420px] items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
                      <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-md" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Loading users...
                    </p>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
                    <Users2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    No users found
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-white/[0.03] backdrop-blur-sm">
                        <TableRow className="border-b border-gray-200 dark:border-white/10">
                          <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                            User
                          </TableHead>
                          <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                            Role
                          </TableHead>
                          <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                            Status
                          </TableHead>
                          <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                            Last Login
                          </TableHead>
                          <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                            Created
                          </TableHead>
                          <TableHead className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {users.map((user) => (
                          <TableRow
                            key={user.id}
                            className="group border-b border-gray-100 transition-all hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                          >
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                  {user.first_name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="px-6 py-4">
                              {getRoleBadge(user.role)}
                            </TableCell>

                            <TableCell className="px-6 py-4">
                              {getStatusBadge(user.status)}
                            </TableCell>

                            <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {user.last_login
                                ? format(new Date(user.last_login), "MMM d, yyyy HH:mm")
                                : "Never"}
                            </TableCell>

                            <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {format(new Date(user.created_at), "MMM d, yyyy")}
                            </TableCell>

                            <TableCell className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEdit(user)}
                                  className="rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 transition-all hover:scale-105 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(user)}
                                  className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition-all hover:scale-105 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pagination aligned with other pages */}
          <div className="mt-6">
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
          </div>
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title="Create New User"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={inputClass}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={inputClass}
                placeholder="John"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={inputClass}
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password * (min 8 characters)
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={formData.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  handleInputChange("role", e.target.value as UserFormData["role"])
                }
                className={selectClass}
              >
                <option value="" className="dark:bg-[#111827]">
                  Select Role
                </option>
                <option value="tenant_admin" className="dark:bg-[#111827]">
                  Tenant Admin
                </option>
                {loggedInUser?.role === "super_admin" && (
                  <option value="super_admin" className="dark:bg-[#111827]">
                    Super Admin
                  </option>
                )}
              </select>
            </div>

            {formData.role !== "super_admin" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tenant *
                </label>
                <select
                  value={formData.tenantSlug || ""}
                  onChange={(e) =>
                    handleInputChange("tenantSlug", e.target.value || null)
                  }
                  className={selectClass}
                >
                  <option value="" className="dark:bg-[#111827]">
                    Select Tenant
                  </option>
                  {tenants
                    ?.filter((tenant) =>
                      loggedInUser?.role === "tenant_admin"
                        ? tenant.id === loggedInUser.tenant_id
                        : true,
                    )
                    .map((tenant) => (
                      <option
                        key={tenant.id}
                        value={tenant.slug}
                        className="dark:bg-[#111827]"
                      >
                        {tenant.name} ({tenant.slug})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="main"
                onClick={handleCreate}
                isLoading={submitting}
                className="primary-bg-color rounded-xl"
              >
                Create User
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          title="Edit User"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password (optional, leave blank to keep current)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  handleInputChange("role", e.target.value as UserFormData["role"])
                }
                className={selectClass}
              >
                <option value="tenant_admin" className="dark:bg-[#111827]">
                  Tenant Admin
                </option>
                {loggedInUser?.role === "super_admin" && (
                  <option value="super_admin" className="dark:bg-[#111827]">
                    Super Admin
                  </option>
                )}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="main"
                onClick={handleUpdate}
                isLoading={submitting}
                className="primary-bg-color rounded-xl"
              >
                Update User
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete User Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={handleCloseModal}
          title="Delete User"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {deletingUser?.first_name}
              </strong>
              ?
            </p>
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              This action cannot be undone. All user data and associated sessions
              will be permanently deleted.
            </p>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={submitting}
                className="rounded-xl"
              >
                Delete User
              </Button>
            </div>
          </div>
        </Modal>

        {ToastComponent}
      </div>
    </DashboardLayout>
  );
}