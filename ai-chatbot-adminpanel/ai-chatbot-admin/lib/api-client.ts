import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Tenant,
  Document,
  ChatbotConfig,
  ApiKey,
  DashboardStats,
  TenantAnalytics,
  UsageMetrics,
  SystemHealth,
  ProcessingQueueItem,
  LoginCredentials,
  AuthResponse,
  CreateTenantRequest,
  CreateApiKeyRequest,
  DocPaginatedResponse,
  DocApiResponse,
  SubscriptionPlan,
} from "@/types";

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  private getApiUrl(): string {
    // For Next.js, environment variables are injected at build time
    // Use globalThis to avoid process reference issues
    const envApiUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_URL;

    // If environment variable is set, use it with API version path
    if (envApiUrl) {
      return envApiUrl + "/api/v1";
    }

    // Check if we're in development mode or running on localhost
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.includes("localhost")
      ) {
        return "http://localhost:8000/api/v1"; // Local development backend
      }
    }

    // Default to production API URL with version path
    return process?.env?.NEXT_PUBLIC_BACKEND_API_URL || "https://ai-api.scopethinkers.ai/api/v1";
  }

  constructor() {
    const apiTimeout = (globalThis as any).process?.env
      ?.NEXT_PUBLIC_API_TIMEOUT;
    this.client = axios.create({
      baseURL: this.getApiUrl(),
      // timeout: Number(apiTimeout) || 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Load tokens from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("admin_token");
      if (this.token) {
        // keep axios default headers in sync so initial requests include the token
        this.client.defaults.headers = this.client.defaults.headers || {};
        (this.client.defaults.headers as any).Authorization = `Bearer ${this.token}`;
      }
    }

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error),
    );

    // Response interceptor for error handling and token refresh
    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // 🚨 Do NOT intercept login errors
        if (originalRequest?.url?.includes("/auth/login")) {
          return Promise.reject(error);
        }

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken =
            typeof window !== "undefined"
              ? localStorage.getItem("admin_refresh_token")
              : null;

          if (refreshToken) {
            try {
              // Call refresh token endpoint
              const response = await axios.post(
                `${this.getApiUrl()}/auth/refresh-token`,
                { refresh_token: refreshToken },
              );

              const { accessToken, refreshToken: newRefreshToken } =
                response.data.data;

              // Save new tokens
              this.setToken(accessToken, newRefreshToken);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout and redirect to login
              this.clearToken();
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, logout and redirect to login
            this.clearToken();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string, refreshToken?: string) {
    if (!token) return; // ignore falsy tokens
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_token", token);
      if (refreshToken) {
        localStorage.setItem("admin_refresh_token", refreshToken);
      }
      this.client.defaults.headers = this.client.defaults.headers || {};
      (this.client.defaults.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
      // remove Authorization header from axios defaults
      try {
        if (
          this.client &&
          this.client.defaults &&
          this.client.defaults.headers
        ) {
          delete this.client.defaults.headers.Authorization;
        }
      } catch {
        // ignore
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // backend returns { data: { user, accessToken, refreshToken } }
    const response = await this.client.post<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    >("/auth/login", credentials);
    const data = response.data.data!;
    const token: string | undefined = data?.accessToken;
    const refreshToken: string | undefined = data?.refreshToken;
    const user: User = data?.user;
    if (!token) {
      throw new Error(
        "Login succeeded but server did not return an access token",
      );
    }
    this.setToken(token, refreshToken);
    return { token, user };
  }

  async getDocumentContent(documentId: number): Promise<Blob> {
    const response = await this.client.get(`/documents/${documentId}/view`, {
      responseType: "blob",
    });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post("/auth/logout");
    } finally {
      this.clearToken();
    }
  }

  async forgotPassword(data: {
    email: string;
  }): Promise<{ resetToken?: string; message: string }> {
    const response = await this.client.post("/auth/forgot-password", data);
    // Backend returns { success: true, data: { message: "...", resetToken: "..." } }
    return response.data.data;
  }

  async resetPassword(data: {
    token: string;
    new_password: string;
  }): Promise<void> {
    await this.client.post("/auth/reset-password", data);
  }

  async verifyEmail(token: string): Promise<void> {
    await this.client.get(`/auth/verify-email/${token}`);
  }

  async getCurrentUser(): Promise<User> {
    try {
      // Try the profile endpoint first
      const response = await this.client.get<any>("/users/profile");

      // Handle different response formats
      if (response.data?.data?.user) {
        return response.data.data.user as User;
      } else if (response.data?.data) {
        return response.data.data as User;
      } else if (response.data?.user) {
        return response.data.user as User;
      }

      return response.data as User;
    } catch (error) {
      console.error("getCurrentUser error:", error);
      throw error;
    }
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<ApiResponse<DashboardStats>>(
      "/admin/dashboard/stats",
    );
    return response.data.data!;
  }

  // Tenant Management APIs
  async getTenants(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Tenant>> {
    const response = await this.client.get<
      ApiResponse<PaginatedResponse<Tenant>>
    >("/admin/tenants", { params });
    return response.data.data!;
  }

  async getTenantById(tenantId: number): Promise<Tenant> {
    const response = await this.client.get<ApiResponse<{ tenant: Tenant }>>(
      `/admin/tenants/${tenantId}`,
    );
    return response.data.data!.tenant;
  }

  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const response = await this.client.post<ApiResponse<{ tenant: Tenant }>>(
      "/admin/tenants",
      data,
    );
    return response.data.data!.tenant;
  }

  async updateTenant(tenantId: number, data: Partial<Tenant>): Promise<Tenant> {
    const response = await this.client.put<ApiResponse<{ tenant: Tenant }>>(
      `/admin/tenants/${tenantId}`,
      data,
    );
    return response.data.data!.tenant;
  }

  async suspendTenant(tenantId: number, reason: string): Promise<Tenant> {
    const response = await this.client.post<ApiResponse<{ tenant: Tenant }>>(
      `/admin/tenants/${tenantId}/suspend`,
      { reason },
    );
    return response.data.data!.tenant;
  }

  async getTenantAnalytics(
    tenantId: number,
    period: string = "30d",
  ): Promise<TenantAnalytics> {
    const response = await this.client.get<ApiResponse<TenantAnalytics>>(
      `/admin/tenants/${tenantId}/analytics`,
      { params: { period } },
    );
    return response.data.data!;
  }

  // User Management APIs
  async getUsers(params?: {
    page?: number;
    limit?: number;
    tenantId?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<
      ApiResponse<PaginatedResponse<User>>
    >("/admin/users", { params });


    return response.data.data!;
  }

  async getUserById(userId: number): Promise<User> {
    const response = await this.client.get<ApiResponse<{ user: User }>>(
      `/admin/users/${userId}`,
    );
    return response.data.data!.user;
  }

  // async createUser(data: {
  //   email: string;
  //   full_name: string;
  //   password: string;
  //   tenant_id: number;
  //   role: string;
  // }): Promise<User> {
  //   const response = await this.client.post<ApiResponse<{ user: User }>>(
  //     '/admin/users',
  //     data
  //   );
  //   return response.data.data!.user;
  // }

  //Created and add register API to  user create API
  async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    tenantSlug?: string | null;
    role: string;
  }): Promise<User> {
    const response = await this.client.post<ApiResponse<{ user: User }>>(
      "/auth/register",
      data,
    );
    return response.data.data!.user;
  }

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const response = await this.client.put<ApiResponse<{ user: User }>>(
      `/admin/users/${userId}`,
      data,
    );
    return response.data.data!.user;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.client.delete(`/admin/users/${userId}`);
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    const response = await this.client.put<ApiResponse<{ user: User }>>(
      `/admin/users/${userId}/role`,
      { role },
    );
    return response.data.data!.user;
  }

  // Document Management APIs
  async getDocuments(params?: {
    page?: number;
    limit?: number;
    tenantId?: number | null;
    status?: string;
    search?: string;
  }): Promise<
    DocPaginatedResponse<Document> & {
      pagination: { page: number; limit: number; total: number; pages: number };
    }
  > {
    const response = await this.client.get<
      DocApiResponse<
        DocPaginatedResponse<Document> & {
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }
      >
    >("/documents", { params });
    return response.data.data! as any;
  }

  async deleteDocument(documentId: number): Promise<void> {
    await this.client.delete(`/documents/${documentId}`);
  }

  async reprocessDocument(documentId: number): Promise<void> {
    await this.client.post(`/documents/${documentId}/reprocess`);
  }

  // Fetch document categories for current tenant
  async getCategories(params?: {
    page?: number;
    limit?: number;
    tenantId?: number;
  }): Promise<{
    categories: Array<{
      id: number; name: string; tenant_id: number;
      description?: string;
      created_at?: string;
    }>;
    pagination?: { page: number; limit: number; total: number; pages: number };
  }> {
    const response = await this.client.get<
      ApiResponse<{
        categories: Array<{
          id: number; name: string; tenant_id: number;
          description?: string;
          created_at?: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>
    >("/documents/categories", { params });
    // Some endpoints return { data: { categories: [...] } }
    return (
      response.data.data || {
        categories: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      }
    );
  }

  // Create a new document category
  async createCategory(payload: {
    name: string;
    description: string;
    tenantSlug: string;
  }): Promise<{
    id: number;
    tenant_id: number;
    name: string;
    description: string;
    parent_id: number | null;
    sort_order: number;
    status: string;
    created_at: string;
    updated_at: string;
    tenantSlug: string;
  }> {
    const response = await this.client.post<
      ApiResponse<{
        category: {
          id: number;
          tenant_id: number;
          name: string;
          description: string;
          parent_id: number | null;
          sort_order: number;
          status: string;
          created_at: string;
          updated_at: string;
          tenantSlug: string;
        };
      }>
    >("/documents/categories", payload);

    return response.data.data!.category;
  }

  async updateCategory(
    categoryId: number,
    data: { name: string; description?: string; tenantSlug?: string },
  ) {
    const response = await this.client.put<ApiResponse<{ category: any }>>(
      `/documents/categories/${categoryId}`,
      data,
    );
    return response.data.data!.category;
  }

  async deleteCategory(categoryId: number) {
    await this.client.delete(`/documents/categories/${categoryId}`);
  }

  // Semantic document search (POST /documents/search)
  async searchDocuments(payload: {
    query: string;
    limit?: number;
    threshold?: number;
    categoryIds?: number[];
    documentIds?: number[];
  }): Promise<{ query: string; results: Document[]; totalResults: number }> {
    const response = await this.client.post<
      ApiResponse<{ query: string; results: Document[]; totalResults: number }>
    >("/documents/search", payload);
    return response.data.data!;
  }

  // Update document metadata
  async updateDocumentMetadata(
    documentId: number,
    data: Partial<Document>,
  ): Promise<Document> {
    const response = await this.client.put<ApiResponse<{ document: Document }>>(
      `/documents/${documentId}`,
      data,
    );
    return response.data.data!.document;
  }

  /**
   * Upload documents (multipart/form-data). Expects files under field name `files`.
   * metadata can include categoryId, isPublic, tags (array) and description.
   */
  async uploadDocuments(
    file: File[],
    metadata?: {
      categoryId?: number;
      isPublic?: boolean;
      tags?: string[];
      description?: string;
    },
  ): Promise<{
    results: Array<{
      documentId?: number;
      filename: string;
      status: string;
      message?: string;
    }>;
  }> {
    const form = new FormData();
    (file || []).slice(0, 5).forEach((file) => {
      form.append("file", file);
    });

    if (metadata) {
      if (metadata.categoryId !== undefined)
        form.append("categoryId", String(metadata.categoryId));
      if (metadata.isPublic !== undefined)
        form.append("isPublic", String(Boolean(metadata.isPublic)));
      if (metadata.tags) form.append("tags", metadata.tags.join(","));
      if (metadata.description)
        form.append("description", metadata.description);
    }

    // Ensure we don't send the global JSON Content-Type header — remove it for this request
    // so the browser/axios can set the proper multipart/form-data boundary.
    const perRequestHeaders: Record<string, string | undefined> = {};
    // copy default headers except Content-Type
    try {
      const defaults =
        (this.client.defaults && this.client.defaults.headers) || {};
      // axios stores common headers under defaults.headers.common or defaults.headers
      const potential =
        (defaults as Record<string, unknown>).common || defaults;
      for (const key of Object.keys(potential)) {
        if (key.toLowerCase() === "content-type") continue;
        perRequestHeaders[key] = String(
          (potential as Record<string, unknown>)[key],
        );
      }
    } catch {
      // ignore and send empty headers
    }

    if (
      typeof window !== "undefined" &&
      (globalThis as any).process?.env?.NODE_ENV === "development"
    ) {
      try {
        const keys: string[] = [];
        form.forEach((v, k) => keys.push(k));
        console.debug("uploadDocuments FormData keys:", keys);
      } catch {
        // ignore
      }
    }

    // Explicitly unset Content-Type so axios/browser set the proper multipart boundary
    perRequestHeaders["Content-Type"] = undefined;

    const response = await this.client.post<
      DocApiResponse<{
        results: Array<{
          documentId?: number;
          filename: string;
          status: string;
          message?: string;
        }>;
      }>
    >("/documents/upload", form, { headers: perRequestHeaders });

    return response.data.data!;
  }

  // Chatbot Configuration APIs
  async getTenantConfig(tenantId: number): Promise<ChatbotConfig | null> {
    const response = await this.client.get<
      ApiResponse<{ config: ChatbotConfig | null }>
    >(`/admin/tenants/${tenantId}`);
    return response.data.data!.config;
  }

  // Chatbot Configuration APIs
  async getTenantConfigbyId(tenantId: number): Promise<ChatbotConfig | null> {
    const response = await this.client.get<
      ApiResponse<{ config: ChatbotConfig | null }>
    >(`/admin/tenants/${tenantId}/config`);

    const responseData = response.data;


    return responseData.data!.config;
  }

  async updateTenantConfig(
    tenantId: number,
    data: Partial<ChatbotConfig>,
  ): Promise<void> {
    await this.client.put(`/admin/tenants/${tenantId}/config`, data);
  }

  // API Key Management APIs
  async getTenantApiKeys(tenantId: number): Promise<ApiKey[]> {
    const response = await this.client.get<ApiResponse<{ apiKeys: ApiKey[] }>>(
      `/admin/tenants/${tenantId}/api-keys`,
    );
    return response.data.data!.apiKeys;
  }

  async createTenantApiKey(
    tenantId: number,
    data: CreateApiKeyRequest,
  ): Promise<{ apiKey: string; message: string }> {
    const response = await this.client.post<
      ApiResponse<{ apiKey: string; message: string }>
    >(`/admin/tenants/${tenantId}/api-keys`, data);
    return response.data.data!;
  }

  async revokeApiKey(keyId: number): Promise<void> {
    await this.client.delete(`/admin/api-keys/${keyId}`);
  }

  // Analytics APIs
  async getUsageMetrics(params?: {
    period?: string;
    tenantId?: number;
  }): Promise<UsageMetrics> {
    const response = await this.client.get<ApiResponse<UsageMetrics>>(
      "/admin/usage/metrics",
      { params },
    );
    return response.data.data!;
  }

  // System Monitoring APIs
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await this.client.get<ApiResponse<SystemHealth>>(
      "/admin/system/health",
    );
    return response.data.data!;
  }

  async getProcessingQueue(params?: {
    page?: number;
    limit?: number;
    tenantId?: number;
    status?: string;
  }): Promise<{ queue: ProcessingQueueItem[] }> {
    const response = await this.client.get<
      ApiResponse<{ queue: ProcessingQueueItem[] }>
    >("/admin/processing-queue", { params });
    return response.data.data!;
  }

  // Roles APIs
  async getRoles(): Promise<
    Array<{
      id: number;
      name: string;
      description: string;
      permissions: string[];
    }>
  > {
    const response = await this.client.get<
      ApiResponse<{
        roles: Array<{
          id: number;
          name: string;
          description: string;
          permissions: string[];
        }>;
      }>
    >("/admin/roles");
    return response.data.data!.roles;
  }

  async getWeeklyActivityStats(params: { tenantId?: number; period?: string }) {
    const { tenantId, period = "7d" } = params;
    const response = await this.client.get<
      ApiResponse<{
        dailyUsers: { date: string; count: number }[];
        dailySessions: { date: string; count: number }[];
        dailyMessages: { date: string; count: number }[];
        dailyDocuments: { date: string; count: number }[];
      }>
    >(`/admin/tenants/${tenantId}/analytics`, {
      params: { period },
    });

    return response.data.data!;
  }

  // Inside your ApiClient class
  async getDashboardSummary(tenantId: number) {
    const response = await this.client.get(
      `/admin/tenants/${tenantId}/dashboard/summary`,
    );
    return response.data; // ensure you return the actual data object
  }

  async getUserProfile() {
    const response = await this.client.get(`/users/profile`);
    return response.data;
  }

  async getSubscriptionsDetails() {
    const response = await this.client.get(`/subscriptions/details`);

    return response.data;
  }

  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) {
    const response = await this.client.put(`/users/profile`, profileData);
    return response.data;
  }
  async updatePassword(passwordData: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }) {
    const response = await this.client.put(`/users/password`, passwordData);
    return response.data;
  }

  // Get visitor information (public chat sessions)
  async getVisitorInfo(tenantId?: string | number): Promise<{
    success: boolean;
    data: {
      sessions: Array<{
        id: string;
        visitorId: string;
        visitorName: string | null;
        visitorEmail: string | null;
        ipAddress: string;
        country: string | null;
        city: string | null;
        status: string;
        startedAt: string;
        endedAt: string | null;
        lastActivity: string;
        pageUrl: string | null;
        referrerUrl: string | null;
        messageCount: number;
      }>;
    };
  }> {
    if (!tenantId) {
      throw new Error("Tenant slug is required to fetch visitor information");
    }

    const response = await this.client.get(`/admin/sessions/${tenantId}`);
    return response.data;
  }

  async createPlan(planData: {
    name: string;
    price: number;
    billing_cycle: string;
    concurrent_users: number;
    document_collections: number;
    max_file_upload_mb: number;
    storage_limit_gb: number;
    card_border_color: string;
    icon_color: string;
    icon_background: string;
    description: string;
    features: string[];
    is_active: boolean;
  }) {
    const response = await this.client.post(
      `/admin/subscription-plans`,
      planData,
    );
    return response.data;
  }

  async updatePlan(
    id: number,
    planData: {
      name?: string;
      price?: number;
      billing_cycle?: string;
      concurrent_users?: number;
      document_collections?: number;
      max_file_upload_mb?: number;
      storage_limit_gb?: number;
      card_border_color?: string;
      icon_color?: string;
      icon_background?: string;
      description?: string;
      features?: string[];
      is_active?: boolean;
    },
  ) {
    const response = await this.client.put(
      `/admin/subscription-plans/${id}`,
      planData,
    );
    return response.data;
  }

  async deletePlan(id: number) {
    const response = await this.client.delete(
      `/admin/subscription-plans/${id}`,
    );
    return response.data;
  }

  async getAllPlans(params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }) {
    const response = await this.client.get(`/admin/subscription-plans`, {
      params,
    });
    return response.data;
  }

  async createRazorpayPlan(planData: {
    name: string;
    amount: number;
    currency?: string;
    description?: string;
    period: "daily" | "weekly" | "monthly" | "yearly";
    interval?: number;
    notes?: Record<string, string>;
  }): Promise<{
    id: string;
    entity: string;
    interval: number;
    period: string;
    item: {
      id: string;
      active: boolean;
      name: string;
      description: string;
      amount: number;
      currency: string;
    };
    notes: Record<string, string>;
    created_at: number;
  }> {
    const response = await this.client.post(`/plans`, planData);
    return response.data.data;
  }

  // Add these methods to your existing ApiClient class

  // Razorpay Order APIs

  async createRazorpayOrder(orderData: {
    amount: number;

    currency?: string;

    receipt?: string;

    notes?: Record<string, string>;
  }): Promise<{
    success: boolean;

    data: {
      id: string;

      entity: string;

      amount: number;

      amount_paid: number;

      amount_due: number;

      currency: string;

      receipt: string;

      status: string;

      attempts: number;

      notes: Record<string, string>;

      created_at: number;
    };
  }> {
    const response = await this.client.post("/orders", orderData);

    return response.data;
  }

  // Razorpay Payment Capture API

  async capturePayment(
    paymentId: string,
    captureData: {
      amount: number;

      currency: string;
    },
  ): Promise<{
    success: boolean;

    data: {
      id: string;

      entity: string;

      amount: number;

      currency: string;

      status: string;

      order_id: string;

      invoice_id: string | null;

      international: boolean;

      method: string;

      amount_refunded: number;

      refund_status: string | null;

      captured: boolean;

      description: string;

      card_id: string | null;

      bank: string | null;

      wallet: string | null;

      vpa: string | null;

      email: string;

      contact: string;

      customer_id: string | null;

      notes: Record<string, any>;

      fee: number;

      tax: number;

      error_code: string | null;

      error_description: string | null;

      error_source: string | null;

      error_step: string | null;

      error_reason: string | null;

      acquirer_data: Record<string, any>;

      created_at: number;
    };
  }> {
    const response = await this.client.post(
      `/payments/${paymentId}/capture`,
      captureData,
    );

    return response.data;
  }

  // Razorpay Subscription APIs

  async createSubscription(subscriptionData: {
    plan_id: string;

    customerId?: string;

    total_count: number;

    quantity?: number;

    start_at?: number;

    expire_by?: number;

    customer_notify?: number;

    addons?: Array<{
      item: {
        name: string;

        amount: number;

        currency: string;
      };
    }>;

    notes?: Record<string, string | null | number>;

    notifyInfo?: {
      notify_phone?: string;

      notify_email?: string;
    };
  }): Promise<{
    success: boolean;

    data: {
      subscription: {
        id: string;

        entity: string;

        plan_id: string;

        customer_id: string | null;

        status: string;

        current_start: number | null;

        current_end: number | null;

        ended_at: number | null;

        quantity: number;

        notes: Record<string, string>;

        charge_at: number;

        start_at: number;

        end_at: number;

        auth_attempts: number;

        total_count: number;

        paid_count: number;

        customer_notify: number;

        created_at: number;

        expire_by: number | null;

        short_url: string;

        has_scheduled_changes: boolean;

        change_scheduled_at: number | null;

        source: string;

        payment_method: string | null;

        offer_id: string | null;

        remaining_count: number;
      };
    };
  }> {
    const response = await this.client.post("/subscriptions", subscriptionData);

    return response.data;
  }

  // Get subscription details

  async getSubscription(subscriptionId: string): Promise<{
    success: boolean;

    data: {
      id: string;

      entity: string;

      plan_id: string;

      customer_id: string | null;

      status: string;

      current_start: number | null;

      current_end: number | null;

      ended_at: number | null;

      quantity: number;

      notes: Record<string, string>;

      charge_at: number;

      start_at: number;

      end_at: number;

      auth_attempts: number;

      total_count: number;

      paid_count: number;

      customer_notify: number;

      created_at: number;

      expire_by: number | null;

      short_url: string;

      has_scheduled_changes: boolean;

      change_scheduled_at: number | null;

      source: string;

      payment_method: string | null;

      offer_id: string | null;

      remaining_count: number;
    };
  }> {
    const response = await this.client.get(`/subscriptions/${subscriptionId}`);

    return response.data;
  }

  // Cancel subscription

  async cancelSubscription(
    subscriptionId: string,
    cancelAtCycleEnd: boolean = false,
  ): Promise<{
    success: boolean;

    data: {
      id: string;

      entity: string;

      plan_id: string;

      status: string;

      ended_at: number;
    };
  }> {
    const response = await this.client.post(
      `/subscriptions/${subscriptionId}/cancel`,
      {
        cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
      },
    );

    return response.data;
  }

  // Get all subscriptions

  async getSubscriptions(params?: {
    planId?: string;

    count?: number;

    skip?: number;
  }): Promise<{
    success: boolean;

    data: {
      entity: string;

      count: number;

      items: Array<{
        id: string;

        entity: string;

        plan_id: string;

        customer_id: string | null;

        status: string;

        current_start: number | null;

        current_end: number | null;

        ended_at: number | null;

        quantity: number;

        notes: Record<string, string>;

        charge_at: number;

        start_at: number;

        end_at: number;

        auth_attempts: number;

        total_count: number;

        paid_count: number;

        customer_notify: number;

        created_at: number;
      }>;
    };
  }> {
    const response = await this.client.get("/subscriptions", { params });

    return response.data;
  }

  // ✅ NEW: Verify subscription payment signature
  async verifySubscriptionPayment(data: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.post(
      "/subscriptions/verify-payment",
      data,
    );
    return response.data;
  }

  async getSubscriptionPayments(userId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.get(`/payments/user/${userId}`);
    return response.data;
  }

  /**
   * Get invoices for a specific subscription (calls backend route: GET /invoices?subscription_id=...)
   */
  async getSubscriptionInvoices(
    subscriptionId: string,
    params?: {
      count?: number;
      skip?: number;
    },
  ): Promise<{
    success: boolean;
    data: {
      entity: string;
      count: number;
      items: Array<any>;
    };
  }> {
    // ensure we have an id to avoid 404
    // if (!subscriptionId) {
    //   return { success: false, data: { entity: 'invoices', count: 0, items: [] } };
    // }

    try {
      const response = await this.client.get("/invoices", {
        params: { subscription_id: subscriptionId, ...(params || {}) },
      });

      const resp = response.data;

      // Normalize various possible shapes:
      // - { success: true, data: [ ... ], count }
      // - { success: true, data: { items: [...], count, entity } }
      // - { entity, count, items } (Razorpay)
      // - [ ... ] (array)
      let items: any[] = [];
      let entity = "invoices";
      let count = 0;

      if (!resp) {
        return { success: false, data: { entity, count, items } };
      }

      if (Array.isArray(resp)) {
        items = resp;
        count = items.length;
        return { success: true, data: { entity, count, items } };
      }

      if (resp.success && Array.isArray(resp.data)) {
        items = resp.data;
        count = typeof resp.count === "number" ? resp.count : items.length;
        return { success: true, data: { entity, count, items } };
      }

      if (resp.data && Array.isArray(resp.data.items)) {
        items = resp.data.items;
        count =
          typeof resp.data.count === "number" ? resp.data.count : items.length;
        entity = resp.data.entity || entity;
        return { success: true, data: { entity, count, items } };
      }

      if (Array.isArray(resp.items)) {
        items = resp.items;
        count = typeof resp.count === "number" ? resp.count : items.length;
        entity = resp.entity || entity;
        return { success: true, data: { entity, count, items } };
      }

      // Backend might return { success: true, data: {...} } where data is an object of invoices
      if (
        resp.success &&
        resp.data &&
        !Array.isArray(resp.data) &&
        Array.isArray(resp.data.items)
      ) {
        items = resp.data.items;
        count =
          typeof resp.data.count === "number" ? resp.data.count : items.length;
        entity = resp.data.entity || entity;
        return { success: true, data: { entity, count, items } };
      }

      // fallback empty
      return { success: false, data: { entity, count: 0, items: [] } };
    } catch (err) {
      console.error("getSubscriptionInvoices error:", err);
      return {
        success: false,
        data: { entity: "invoices", count: 0, items: [] },
      };
    }
  }

  // Add this method to your ApiClient class

  /**
   * Get payment transactions for the current user
   */
  async getPaymentTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    subscription_status?: string;
  }): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      user_id: number;
      tenant_id?: number;
      subscription_id: string;
      plan_id: string;
      plan_name?: string;
      payment_id?: string;
      amount: number;
      currency: string;
      status: "pending" | "paid" | "failed" | "refunded";
      subscription_status:
      | "created"
      | "authenticated"
      | "active"
      | "paused"
      | "halted"
      | "cancelled"
      | "completed"
      | "expired";
      subscribed_date?: string;
      payment_date?: string;
      start_date?: string;
      end_date?: string;
      total_count: number;
      quantity: number;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>;
  }> {
    const response = await this.client.get(
      "/subscriptions/payments/transactions",
      { params },
    );
    return response.data;
  }

  /**
   * Get a specific payment transaction by ID
   */
  async getPaymentTransactionById(transactionId: number): Promise<{
    success: boolean;
    data: {
      id: number;
      user_id: number;
      tenant_id?: number;
      subscription_id: string;
      plan_id: string;
      plan_name?: string;
      payment_id?: string;
      amount: number;
      currency: string;
      status: "pending" | "paid" | "failed" | "refunded";
      subscription_status:
      | "created"
      | "authenticated"
      | "active"
      | "paused"
      | "halted"
      | "cancelled"
      | "completed"
      | "expired";
      subscribed_date?: string;
      payment_date?: string;
      start_date?: string;
      end_date?: string;
      total_count: number;
      quantity: number;
      notes?: string;
      created_at: string;
      updated_at: string;
    };
  }> {
    const response = await this.client.get(
      `/subscriptions/payments/transactions/${transactionId}`,
    );
    return response.data;
  }

  // Inside your ApiClient class

  /**
   * Get all invoices for the current tenant or user
   */
  async getAllInvoices(params?: {
    page?: number;
    limit?: number;
    tenantId?: number;
    sort?: string;
  }): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      tenant_id: number;
      user_id: number;
      user_name?: string;
      amount: number;
      currency: string;
      status: string;
      description?: string;
      created_at: string;
      updated_at: string;
    }>;
    count: number;
  }> {
    try {
      const response = await this.client.get(`/subscriptions/invoices`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  }

  // Add this method to your ApiClient class

  async getAllActivePlans(params?: { page?: number; limit?: number }): Promise<{
    success: boolean;
    data: SubscriptionPlan[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await this.client.get(`/subscriptions/active-plans`, {
      params,
    });
    return response.data;
  }

  /**
   * Create Stripe Checkout Session for subscription
   */
  async createStripeCheckoutSession(checkoutData: {
    price_id: string;
    // planId: string;
    billing_cycle: "monthly" | "yearly";
    success_url: string; // required
    cancel_url: string; // required
    customer_email: string; // optional
    plan_name: string; // required
    amount: string | number; // required numeric
    // trial_period_days: 7
  }): Promise<{
    success: boolean;
    data: {
      sessionId: string;
      url: string;
    };
  }> {
    const response = await this.client.post(
      "/stripe/checkout/sessions",
      checkoutData,
    );
    return response.data;
  }

  /**
   * Get Stripe billing portal URL for customer management
   */
  async getStripeBillingPortal(): Promise<{
    success: boolean;
    data: {
      url: string;
    };
  }> {
    const response = await this.client.get("/stripe/billing-portal");
    return response.data;
  }

  /**
   * Get available Stripe subscription plans
   */
  async getStripePlans(): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      description: string | null;
      features: string[];
      prices: {
        id: string;
        unitAmount: number;
        currency: string;
        interval: "day" | "week" | "month" | "year";
        intervalCount: number;
      } | null;
    }>;
  }> {
    const response = await this.client.get("/stripe/plans");
    return response.data;
  }

  /**
   * Get Stripe customer subscription details
   */
  async getStripeSubscription(subscriptionId: string): Promise<{
    success: boolean;
    data: {
      id: string;
      status: string;
      currentPeriodStart: string;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: boolean;
      plan: {
        id: string;
        name: string;
        amount: number;
        currency: string;
        interval: string;
      };
    };
  }> {
    const response = await this.client.get(
      `/subscriptions/stripe/${subscriptionId}`,
    );
    return response.data;
  }

  /**
   * Cancel Stripe subscription
   */
  async cancelStripeSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = false,
  ): Promise<{
    success: boolean;
    data: {
      id: string;
      status: string;
      cancelAtPeriodEnd: boolean;
    };
  }> {
    const response = await this.client.delete(
      `/stripe/subscriptions/${subscriptionId}`,
      {
        data: { immediate: cancelAtPeriodEnd },
      },
    );
    return response.data;
  }

  /**
   * Update Stripe subscription (change plan)
   */
  async updateStripeSubscription(
    subscriptionId: string,
    newPriceId: string,
  ): Promise<{
    success: boolean;
    data: {
      id: string;
      status: string;
      plan: {
        id: string;
        name: string;
        amount: number;
      };
    };
  }> {
    const response = await this.client.put(
      `/subscriptions/stripe/${subscriptionId}`,
      {
        newPriceId,
      },
    );
    return response.data;
  }

  /**
   * Verify Stripe payment success
   */
  async verifyStripePayment(session_id: string): Promise<{
    success: boolean;
    data: {
      subscriptionId: string;
      customerId: string;
      planId: string;
      status: string;
    };
  }> {
    const response = await this.client.post("/stripe/verify-payment", {
      session_id,
    });
    return response.data;
  }

  /**
   * Get Stripe payment methods for customer
   */
  async getStripePaymentMethods(): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      type: string;
      card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
      };
    }>;
  }> {
    const response = await this.client.get("/stripe/payment-methods");
    return response.data;
  }

  /**
   * Set default Stripe payment method
   */
  async setDefaultStripePaymentMethod(paymentMethodId: string): Promise<{
    success: boolean;
    data: {
      message: string;
    };
  }> {
    const response = await this.client.post("/stripe/default-payment-method", {
      paymentMethodId,
    });
    return response.data;
  }

  // Add these methods to your existing api-client.ts file

  // Chat Sessions and Messages
  async getSessionMessages(
    sessionId: string,
    params?: { page?: number; limit?: number },
  ) {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 50,
    };

    const response = await this.client.get(
      `/admin/sessions/${sessionId}/messages`,
      { params: queryParams },
    );

    return response.data;
  }

  async getSessionAnalytics(sessionId: string) {
    const response = await this.client.get(
      `/admin/sessions/${sessionId}/analytics`,
    );
    return response.data;
  }

  async getVisitorSessions(visitorId: string) {
    const response = await this.client.get(
      `/admin/visitor/${visitorId}/sessions`,
    );
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
