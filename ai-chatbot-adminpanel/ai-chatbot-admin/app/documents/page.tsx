"use client";

import { useEffect, useState } from "react";
import {
  Edit,
  FileText,
  Plus,
  RotateCw,
  Search,
  Trash2,
  Eye,
  Files,
  Filter,
  UploadCloud,
  X,
} from "lucide-react";
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
import type { Document, Tenant } from "@/types";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth-store";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCategoryId, setUploadCategoryId] = useState<number | undefined>(
    undefined,
  );
  const [uploadIsPublic, setUploadIsPublic] = useState(false);
  const [uploadTags, setUploadTags] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | undefined>(
    undefined,
  );
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [editTags, setEditTags] = useState("");
  const [categoriesList, setCategoriesList] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const [searchText, setSearchText] = useState("");

  const { showToast, ToastComponent } = useToast();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loggedInUser = useAuthStore().user;
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("");

  useEffect(() => {
    if (loggedInUser) {
      fetchDocuments();
      fetchTenants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, loggedInUser?.id, selectedTenant, searchText]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      let response: any;
      const params: {
        page: number;
        limit: number;
        tenantId?: number;
        search?: string;
      } = {
        page,
        limit,
      };

      if (searchText) {
        params.search = searchText;
      }

      // If user is tenant_admin, only fetch their tenant's docs
      if (loggedInUser?.role === "tenant_admin") {
        params.tenantId = loggedInUser.tenant_id ?? undefined;
      } else if (selectedTenant !== "") {
        params.tenantId = Number(selectedTenant);
      }

      response = await apiClient.getDocuments(params);

      let docs: Document[] = response?.documents ?? [];
      const pagination = response?.pagination ?? {};

      // Search filter
      if (searchText) {
        const value = searchText.toLowerCase();

        docs = docs.filter(
          (doc: Document) =>
            doc.title?.toLowerCase().includes(value) ||
            doc.original_filename?.toLowerCase().includes(value),
        );
      }

      // Tenant admin filter
      if (loggedInUser?.role === "tenant_admin") {
        docs = docs.filter(
          (doc: Document) => doc.tenant_id === loggedInUser.tenant_id,
        );
      }

      // Super admin tenant filter
      if (selectedTenant && loggedInUser?.role !== "tenant_admin") {
        docs = docs.filter(
          (doc: Document) => doc.tenant_id === Number(selectedTenant),
        );
      }

      setDocuments(docs);
      setTotalItems(pagination.total ?? docs.length);
      setTotalPages(
        pagination.pages ??
        Math.ceil((pagination.total ?? docs.length) / limit),
      );
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await apiClient.getTenants({});

      let items: Tenant[] = [];

      if (Array.isArray(response)) {
        items = response as Tenant[];
      } else if (Array.isArray((response as any).items)) {
        items = (response as any).items;
      } else if (Array.isArray((response as any).data)) {
        items = (response as any).data;
      } else if (Array.isArray((response as any).data?.data?.items)) {
        items = (response as any).data.data.items;
      }

      setTenants(items.filter((t: any) => t.status !== "suspended"));
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
      setTenants([]);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleReprocess = async (docId: number) => {
    try {
      await apiClient.reprocessDocument(docId);
      showToast("Document reprocessing queued successfully", "success");
    } catch (error) {
      console.error("Failed to reprocess document:", error);
      showToast("Failed to reprocess document", "error");
    }
  };

  const handleOpenDelete = (doc: Document) => {
    setDeletingDocument(doc);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeletingDocument(null);
  };

  const handleDelete = async () => {
    if (!deletingDocument) return;

    try {
      setSubmitting(true);
      await apiClient.deleteDocument(deletingDocument.id);
      showToast("Document deleted successfully", "success");
      handleCloseModal();
      fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      showToast("Failed to delete document", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "info" | "danger"> =
    {
      processed: "success",
      processing: "info",
      pending: "warning",
      failed: "danger",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const handleSearch = async () => {
    setPage(1);
    fetchDocuments();
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFiles([]);
    setUploadCategoryId(undefined);
    setUploadIsPublic(false);
    setUploadTags("");
    setUploadDescription("");
  };

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-300 dark:border-white/10 px-3 py-2.5 text-sm focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all";

  const selectClass =
    "mt-1 w-full rounded-xl border border-gray-300 dark:border-white/10 px-3 py-2.5 text-sm focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 transition-all";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] transition-colors relative overflow-hidden">
        {/* Purple Cyber Glow Background */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block">
          <div className="absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-violet-600/12 blur-3xl" />
          <div className="absolute top-24 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative rounded-2xl border border-gray-200 bg-white dark:bg-white/[0.04] dark:backdrop-blur-xl shadow-sm dark:shadow-2xl space-y-6 p-4 sm:p-6 dark:border-white/10 transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                <Files className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">
                  Documents
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                  Manage all uploaded documents
                </p>
              </div>
            </div>

            {loggedInUser?.role !== "super_admin" && (
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="main"
                  onClick={async () => {
                    setShowUploadModal(true);
                    try {
                      const result = await apiClient.getCategories();
                      setCategoriesList(result.categories);
                    } catch {
                      setCategoriesList([]);
                    }
                  }}
                  className="rounded-xl primary-bg-color shadow-lg shadow-violet-500/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => fetchDocuments()}
                  className="rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <RotateCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <Card className="border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-xl rounded-2xl">
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
                {/* Search */}
                <div className="relative xl:col-span-6">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by title or filename..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 py-2.5 pl-10 pr-4 text-sm focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                {/* Tenant Dropdown */}
                {loggedInUser?.role !== "tenant_admin" && (
                  <div className="xl:col-span-4">
                    <select
                      value={selectedTenant}
                      onChange={(e) => {
                        setSelectedTenant(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 transition-all"
                    >
                      <option value="" className="dark:bg-[#111827]">
                        All Tenants
                      </option>
                      {tenants.map((t) => (
                        <option
                          key={t.id}
                          value={t.id}
                          className="dark:bg-[#111827]"
                        >
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* <div className="xl:col-span-2">
                  <Button
                    variant="main"
                    onClick={handleSearch}
                    className="w-full h-full rounded-xl primary-bg-color shadow-lg shadow-violet-500/20"
                  >
                    Search
                  </Button>
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
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
                      Loading documents...
                    </p>
                  </div>
                </div>
              ) : documents?.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
                    <FileText className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    No documents found
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    Try adjusting your filters or upload a new document
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-white/[0.03] transition-colors">
                        <TableRow className="border-b border-gray-200 dark:border-white/10">
                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Document
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Status
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Type
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Size
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Chunks
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-xs uppercase tracking-wider">
                            Uploaded
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-400 font-semibold px-6 py-4 text-right text-xs uppercase tracking-wider">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody className="bg-white dark:bg-transparent transition-colors">
                        {documents.map((doc) => (
                          <TableRow
                            key={doc.id}
                            className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all"
                          >
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                                  <FileText className="h-5 w-5 dark:text-indigo-300 text-indigo-600" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {doc.title}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {doc.original_filename}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="px-6 py-4">
                              {getStatusBadge(doc.status)}
                            </TableCell>

                            <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {doc.mime_type?.split("/")[1]?.toUpperCase() || "--"}
                            </TableCell>

                            <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {(doc.file_size / 1024).toFixed(2)} KB
                            </TableCell>

                            <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {doc.chunk_count || 0}
                            </TableCell>

                            <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {format(new Date(doc.created_at), "MMM d, yyyy")}
                            </TableCell>

                            <TableCell className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      const blob = await apiClient.getDocumentContent(doc.id);
                                      const url = URL.createObjectURL(blob);
                                      window.open(url, "_blank");
                                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                                    } catch (err) {
                                      console.error("Failed to view document:", err);
                                      showToast("Failed to load document content", "error");
                                    }
                                  }}
                                  className="rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 transition-all hover:scale-105 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => handleReprocess(doc.id)}
                                  className="rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 transition-all hover:scale-105 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                  title="Reprocess"
                                >
                                  <RotateCw className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingDocument(doc);
                                    setEditTitle(doc.title);
                                    setEditDescription(doc.description || "");
                                    setEditCategoryId(doc.category_id ?? undefined);
                                    setEditIsPublic(Boolean(doc.is_public));
                                    setEditTags(
                                      doc.tags && Array.isArray(doc.tags)
                                        ? doc.tags.join(",")
                                        : doc.tags || "",
                                    );
                                    setShowEditModal(true);
                                    apiClient
                                      .getCategories()
                                      .then((res) => setCategoriesList(res.categories))
                                      .catch(() => setCategoriesList([]));
                                  }}
                                  className="rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 transition-all hover:scale-105 hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => handleOpenDelete(doc)}
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
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Document Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={handleCloseModal}
          title="Delete Document"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {deletingDocument?.title}
              </strong>
              ?
            </p>
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              This will remove the document and all its embeddings. This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={submitting}
                className="rounded-xl"
              >
                Delete Document
              </Button>
            </div>
          </div>
        </Modal>

        {/* Upload Document Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={handleCloseUploadModal}
          title="Upload Documents"
          size="md"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Files (max 5)
              </label>

              <div className="mt-2 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] p-4 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-xl px-4 py-2.5 primary-bg-color text-white text-sm font-medium shadow-lg shadow-violet-500/20 hover:opacity-95 transition"
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Choose Files
                  </label>

                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={(e) => {
                      const newFiles = e.target.files ? Array.from(e.target.files) : [];
                      
                      setUploadFiles((prev) => {
                        const existingInSelection = new Set(prev.map(f => `${f.name}-${f.size}`));
                        const existingInDb = new Set(documents.map(d => `${d.original_filename}-${d.file_size}`));
                        
                        const uniqueNew = newFiles.filter(f => {
                          const key = `${f.name}-${f.size}`;
                          if (existingInSelection.has(key)) {
                            showToast(`File "${f.name}" is already in your selection`, "error");
                            return false;
                          }
                          if (existingInDb.has(key)) {
                            showToast(`File "${f.name}" has already been uploaded`, "error");
                            return false;
                          }
                          return true;
                        });
                        
                        const combined = [...prev, ...uniqueNew];
                        
                        if (combined.length > 5) {
                          showToast("Maximum 5 files allowed", "error");
                          return combined.slice(0, 5);
                        }
                        
                        return combined;
                      });

                      // Reset input value to allow re-selection of the same files if needed
                      e.target.value = "";
                    }}
                    className="hidden"
                  />

                  {uploadFiles.length > 0 ? (
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                      {uploadFiles.length} file(s) selected
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      No files chosen
                    </span>
                  )}
                </div>

                {/* Selected Files List */}
                {uploadFiles.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {uploadFiles.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Accepted: PDF, DOC, DOCX, TXT, MD
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category (optional)
              </label>
              <select
                value={uploadCategoryId ?? ""}
                onChange={(e) =>
                  setUploadCategoryId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className={selectClass}
              >
                <option value="" className="dark:bg-[#111827]">
                  -- None --
                </option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id} className="dark:bg-[#111827]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                className={inputClass}
                placeholder="invoice, finance, 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className={`${inputClass} min-h-[110px] resize-none`}
                placeholder="Enter document description..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleCloseUploadModal}>
                Cancel
              </Button>
              <Button
                variant="main"
                isLoading={submitting}
                className="rounded-xl primary-bg-color"
                onClick={async () => {
                  if (uploadFiles.length === 0) {
                    showToast(
                      "Please select at least one file to upload",
                      "error",
                    );
                    return;
                  }

                  if (uploadFiles.length > 5) {
                    showToast("You can upload a maximum of 5 files", "error");
                    return;
                  }

                  setSubmitting(true);
                  try {
                    const tagsArr = uploadTags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);

                    const result = await apiClient.uploadDocuments(uploadFiles, {
                      categoryId: uploadCategoryId,
                      isPublic: uploadIsPublic,
                      tags: tagsArr,
                      description: uploadDescription,
                    });

                    const failures = result.results.filter(
                      (r: any) => r.status === "failed",
                    );

                    if (failures.length > 0) {
                      const uniqueMsgs = Array.from(
                        new Set(failures.map((f: any) => f.message)),
                      );
                      const combinedMsg = uniqueMsgs.join(", ");

                      if (failures.length === result.results.length) {
                        showToast(`Upload failed: ${combinedMsg}`, "error");
                      } else {
                        showToast(
                          `Uploaded ${
                            result.results.length - failures.length
                          } files. ${failures.length} failed: ${combinedMsg}`,
                          "warning",
                        );
                        // Some succeeded, update the list behind the modal
                        fetchDocuments();
                      }
                      
                      // Keep modal open so user can see failures and adjust selection
                      // We should remove the ones that succeeded from uploadFiles
                      const succeededFnames = new Set(
                        result.results
                          .filter((r: any) => r.status === "uploaded")
                          .map((r: any) => r.filename)
                      );
                      setUploadFiles(prev => prev.filter(f => !succeededFnames.has(f.name)));

                    } else {
                      showToast("All files uploaded successfully", "success");
                      setShowUploadModal(false);
                      fetchDocuments();
                      setUploadFiles([]);
                      setUploadCategoryId(undefined);
                      setUploadIsPublic(false);
                      setUploadTags("");
                      setUploadDescription("");
                    }
                  } catch (err: any) {
                    console.error("Upload failed", err);
                    const backendMsg = err?.response?.data?.error?.message;
                    if (backendMsg) {
                      showToast(backendMsg, "error");
                    } else {
                      showToast("Upload failed", "error");
                    }
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Document Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Document"
          size="md"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={inputClass}
                placeholder="Document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category (Optional)
              </label>
              <select
                value={editCategoryId ?? ""}
                onChange={(e) =>
                  setEditCategoryId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className={selectClass}
              >
                <option value="" className="dark:bg-[#111827]">
                  -- None --
                </option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id} className="dark:bg-[#111827]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className={inputClass}
                placeholder="report, hr, confidential"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={`${inputClass} min-h-[110px] resize-none`}
                placeholder="Enter document description..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                variant="main"
                isLoading={submitting}
                className="rounded-xl primary-bg-color"
                onClick={async () => {
                  if (!editingDocument) return;
                  if (!editTitle.trim()) {
                    showToast("Title is required", "error");
                    return;
                  }
                  try {
                    setSubmitting(true);
                    const tagsArr = editTags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    await apiClient.updateDocumentMetadata(editingDocument.id, {
                      title: editTitle,
                      description: editDescription,
                      category_id: editCategoryId,
                      is_public: editIsPublic,
                      tags: tagsArr.join(","),
                    });
                    showToast("Document updated", "success");
                    setShowEditModal(false);
                    setEditingDocument(null);
                    await fetchDocuments();
                  } catch (err) {
                    console.error("Update failed", err);
                    showToast("Update failed", "error");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        {ToastComponent}
      </div>
    </DashboardLayout>
  );
}