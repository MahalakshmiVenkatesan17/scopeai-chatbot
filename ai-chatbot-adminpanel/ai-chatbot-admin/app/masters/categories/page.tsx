"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  RotateCw,
  Trash2,
  Edit,
  Layers3,
  Building2,
  FolderKanban,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import apiClient from "@/lib/api-client";
import { Tenant, User } from "@/types";

type Category = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  tenant_id: number;
};

export default function MastersPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantFilter, setTenantFilter] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { showToast, ToastComponent } = useToast();

  const isSuperAdmin = currentUser?.role === "super_admin";

  useEffect(() => {
    fetchCurrentUser();
    fetchCategories();
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, tenantFilter]);

  const fetchCurrentUser = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (tenantFilter) {
        params.tenantId = Number(tenantFilter);
      }
      const data = await apiClient.getCategories(params);
      setCategories(data.categories || []);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const fetchTenants = async () => {
    try {
      const response = await apiClient.getTenants({ page: 1, limit: 100 });
      setTenants(
        response?.items?.filter((t: any) => t.status !== "suspended") || [],
      );
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    }
  };

  const filteredCategories =
    tenantFilter === ""
      ? categories
      : categories.filter((cat) => cat.tenant_id === Number(tenantFilter));

  const resetForm = () => {
    setCategoryName("");
    setDescription("");
    setTenantSlug("");
    setEditingCategory(null);
  };

  /* ---------------- DUPLICATE CHECK ---------------- */

  const isDuplicateName = (name: string, excludeId?: number): boolean => {
    const normalized = name.toLowerCase().trim();

    return categories.some((cat) => {
      if (excludeId !== undefined && cat.id === excludeId) return false;

      const nameMatches = cat.name.toLowerCase().trim() === normalized;

      if (isSuperAdmin) {
        const selectedTenant = tenants.find((t) => t.slug === tenantSlug);
        return nameMatches && cat.tenant_id === selectedTenant?.id;
      }

      return nameMatches;
    });
  };

  /* ---------------- ADD CATEGORY ---------------- */

  const handleAddCategory = async () => {
    const name = categoryName.trim();
    const desc = description.trim();

    if (!name) return showToast("Category name is required", "error");
    if (!desc) return showToast("Description is required", "error");
    if (isSuperAdmin && !tenantSlug)
      return showToast("Tenant is required", "error");

    if (isDuplicateName(name))
      return showToast(
        `A category named "${name}" already exists${isSuperAdmin ? " for this tenant" : ""
        }`,
        "error",
      );

    try {
      setSubmitting(true);

      await apiClient.createCategory({
        name,
        description: desc,
        tenantSlug: isSuperAdmin ? tenantSlug : "",
      });

      showToast("Category created successfully", "success");
      setShowAddModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast("Failed to create category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UPDATE CATEGORY ---------------- */

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    const name = categoryName.trim();
    const desc = description.trim();

    if (!name) return showToast("Category name is required", "error");
    if (!desc) return showToast("Description is required", "error");

    if (isDuplicateName(name, editingCategory.id))
      return showToast(
        `A category named "${name}" already exists${isSuperAdmin ? " for this tenant" : ""
        }`,
        "error",
      );

    try {
      setSubmitting(true);

      await apiClient.updateCategory(editingCategory.id, {
        name,
        description: desc,
        tenantSlug,
      });

      showToast("Category updated successfully", "success");
      setShowEditModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast("Failed to update category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- DELETE CATEGORY ---------------- */

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      setSubmitting(true);

      await apiClient.deleteCategory(deletingCategory.id);

      showToast("Category deleted successfully", "success");
      setShowDeleteModal(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- MODAL OPENERS ---------------- */

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setDescription(category.description || "");

    const tenant = tenants.find((t) => t.id === category.tenant_id);
    setTenantSlug(tenant?.slug || "");

    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleResetFilters = () => {
    setTenantFilter("");
    setPage(1);
  };

  /* ---------------- TENANT DISPLAY NAME ---------------- */

  const getTenantName = (tenantId: number) =>
    tenants.find((t) => t.id === tenantId)?.name || "—";

  const getSelectedTenantLabel = () => {
    if (!tenantSlug) return "";
    const tenant = tenants.find((t) => t.slug === tenantSlug);
    return tenant ? `${tenant.name} (${tenant.slug})` : tenantSlug;
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 dark:border-white/10 px-3 py-2.5 text-sm bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all";

  const selectClass =
    "w-full rounded-xl border border-gray-300 dark:border-white/10 px-3 py-2.5 text-sm bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] transition-colors p-4 relative overflow-hidden">
        {/* Purple Cyber Glow Background */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block">
          <div className="absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-violet-600/12 blur-3xl" />
          <div className="absolute top-24 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative rounded-2xl border border-gray-200 bg-white dark:bg-white/[0.04] dark:backdrop-blur-xl shadow-sm dark:shadow-2xl space-y-6 p-4 sm:p-6 dark:border-white/10 transition-colors">
          {/* HEADER */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                <Layers3 className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Masters
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage your master data categories here.
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Tenant filter — super admin only */}
              {isSuperAdmin && (
                <div className="relative min-w-[220px]">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <select
                    value={tenantFilter}
                    onChange={(e) => {
                      setTenantFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-200 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
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

              <Button
                variant="main"
                onClick={openAddModal}
                className="rounded-xl primary-bg-color shadow-lg shadow-violet-500/20"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>

              <Button
                variant="secondary"
                onClick={handleResetFilters}
                className="rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <RotateCw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          {/* TABLE */}
          <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-xl rounded-2xl">
            <CardContent className="px-0! py-0!">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500"></div>
                      <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-md" />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Loading categories...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-white/[0.03]">
                        <TableRow className="border-b border-gray-200 dark:border-white/10">
                          {isSuperAdmin && (
                            <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                              Tenant
                            </TableHead>
                          )}

                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Category Name
                          </TableHead>

                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Description
                          </TableHead>

                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Created
                          </TableHead>

                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody className="bg-white dark:bg-transparent">
                        {filteredCategories.length === 0 ? (
                          <TableRow className="border-b border-gray-100 dark:border-white/5">
                            <TableCell
                              colSpan={isSuperAdmin ? 5 : 4}
                              className="py-16 text-center"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
                                  <FolderKanban className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                  No categories found
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                                  Create a new category to get started
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCategories.map((cat) => (
                            <TableRow
                              key={cat.id}
                              className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all"
                            >
                              {isSuperAdmin && (
                                <TableCell className="px-6 py-4">
                                  <div className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-300/15">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {getTenantName(cat.tenant_id)}
                                  </div>
                                </TableCell>
                              )}

                              <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-300/15 border border-violet-500/10">
                                    <FolderKanban className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                                  </div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {cat.name}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-[360px]">
                                <div className="truncate" title={cat.description || "—"}>
                                  {cat.description || "—"}
                                </div>
                              </TableCell>

                              <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {cat.created_at
                                  ? new Date(cat.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                  })
                                  : "—"}
                              </TableCell>

                              <TableCell className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => openEditModal(cat)}
                                    className="rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 transition-all hover:scale-105 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() => openDeleteModal(cat)}
                                    className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition-all hover:scale-105 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {!loading && categories.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-white/10 p-4">
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
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ADD CATEGORY MODAL */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Category"
          size="sm"
        >
          <div className="space-y-5">
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tenant<span className="text-red-500">*</span>
                </label>
                <select
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  className={selectClass}
                >
                  <option value="" className="dark:bg-[#111827]">
                    Select Tenant
                  </option>
                  {tenants.map((tenant) => (
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Name<span className="text-red-500">*</span>
              </label>
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className={`${inputClass} min-h-[110px] resize-none`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>

              <Button
                variant="main"
                onClick={handleAddCategory}
                isLoading={submitting}
                className="rounded-xl primary-bg-color"
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>

        {/* EDIT CATEGORY MODAL */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Category"
          size="sm"
        >
          <div className="space-y-5">
            {isSuperAdmin && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="text-xs text-gray-400 dark:text-gray-500 block mb-1">
                  Tenant
                </span>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {getSelectedTenantLabel() || "—"}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Name<span className="text-red-500">*</span>
              </label>
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className={`${inputClass} min-h-[110px] resize-none`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>

              <Button
                variant="main"
                onClick={handleUpdateCategory}
                isLoading={submitting}
                className="rounded-xl primary-bg-color"
              >
                Update
              </Button>
            </div>
          </div>
        </Modal>

        {/* DELETE CATEGORY MODAL */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Category"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">
                {deletingCategory?.name}
              </strong>
              ?
            </p>

            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={handleDeleteCategory}
                isLoading={submitting}
                className="rounded-xl"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        {ToastComponent}
      </div>
    </DashboardLayout>
  );
}