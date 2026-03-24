export interface User {
  id: number;
  tenantSlug: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'tenant_admin' | 'customer' | 'support';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  tenant_id: number | null;
  plan_id?: number | string;
}
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  max_users: number;
  max_chat_sessions: number;
  max_storage_mb: number;
  billing_email?: string;
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  tenant_id: number;
  category_id: number;
  uploaded_by: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_hash: string | null;
  title: string;
  description: string;
  tags: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  processing_status: string;
  error_message: string | null;
  chunk_count: number;
  embedding_count: number;
  version: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  category_name: string;
}

export interface ChatbotConfig {
  id: number;
  tenantId: number;
  chatbotName: string;
  welcomeMessage?: string;
  placeholderText?: string;
  widgetPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  secondaryColor: string;
  textColor?: string;
  backgroundColor?: string;
  widgetSize: 'small' | 'medium' | 'large';
  autoOpen: boolean;
  showAgentAvatar: boolean;
  collectUserInfo: boolean;
  requireEmail: boolean;
  enableFileUpload: boolean;
  maxMessageLength: number;
  rateLimitMessages: number;
  rateLimitWindowMinutes: number;
  allowedOrigins?: string;
  customCss?: string;
  customJavascript?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ApiKey {
  id: number;
  tenant_id: number;
  key_name: string;
  api_key_prefix: string;
  permissions: string[];
  allowed_origins?: string;
  rate_limit_per_minute: number;
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
  created_at: string;
}

// export interface DashboardStats {
//   totalTenants: number;
//   activeTenants: number;
//   totalUsers: number;
//   activeUsers: number;
//   totalDocuments: number;
//   processedDocuments: number;
//   totalChatSessions: number;
//   systemUptime: number;
//   memoryUsage: {
//     rss: number;
//     heapTotal: number;
//     heapUsed: number;
//     external: number;
//   };
// }

// export interface TenantAnalytics {
//   chatSessions: number;
//   messagesExchanged: number;
//   documentsUploaded: number;
//   activeUsers: number;
//   averageResponseTime: number;
//   topCategories: Array<{ category: string; count: number }>;
//   usageTrend: Array<{ date: string; count: number }>;
// }

export interface UsageMetrics {
  totalRequests: number;
  totalTokensUsed: number;
  totalCost: number | string;
  averageResponseTime: number;
  successRate: number;
  documentsProcessed: number;
  chatSessions: number;
  activeUsers: number;
  period: string;
  daysTracked: number;
  apiRequestsOverTime: Array<{
    date: string;
    count: number;
  }>;
  tokenUsageOverTime: Array<{
    date: string;
    tokens: number;
  }>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    rss: number;
    unit: string;
  };
  version: string;
  services: {
    [key: string]: {
      status: string;
      responseTime: number;
      errorMessage: string | null;
      lastChecked: string;
      [key: string]: any;
    };
  };
  statistics?: {
    totalChecksLastHour: number;
    averageResponseTime: number;
    healthyServices: number | null;
    degradedServices: number | null;
    unhealthyServices: number | null;
  };
}

export interface ProcessingQueueItem {
  id: number;
  tenant_id: number;
  document_id: number;
  operation_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  title?: string;
  original_filename?: string;
  tenant_name?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface DocApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface DocPaginatedResponse<T> {
  // Primary payload
  documents: T[];

  // Pagination metadata is returned nested under `pagination` by the backend
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Backwards-compatible/top-level fields (optional)
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}


export interface PaginatedResponse<T> {
  items?: T[];
  users?: T[];
  tenants?: T[];
  categories?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  // Backwards compatibility
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface PaginatedResponses<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  maxUsers?: number;
  maxDocuments?: number;
  maxChatSessions: number,
  maxStorageMb: number,
  billingEmail?: string,
  domain?: string;
  customBranding?: {
    logoUrl?: string;
    primaryColor?: string;
    companyName?: string;
  };
}

export interface CreateApiKeyRequest {
  keyName: string;
  permissions?: string[];
  allowedOrigins?: string;
  rateLimitPerMinute?: number;
  expiresAt?: string;
}

export interface DashboardStats {
  totalTenants: number;
  activeTenants?: number;
  totalUsers?: number;
  activeUsers: number;
  totalDocuments?: number;
  processedDocuments: number;
  totalChatSessions: number;
  totalRequests: number; // 🔹 Total API requests from tenant_analytics
  avgProcessingTime: number; // 🔹 Average processing time (ms)
  totalCost: number; // 🔹 Total cost estimate
  totalChatCost: number; // 🔹 New field for total chat-specific cost
  todayChatCost: number; // 🔹 New field for chat-specific cost
  systemUptime?: number;
  // 🔹 New fields for token usage
  avgTokens?: number;              // average token_count per message
  totalTokens?: number;            // total tokens used in period
  assistantMessageCount?: number;  // total assistant messages (count)
  memoryUsage?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  current?: {
    activeUsers: number;
    chatSessions: number;
    requests: number;
    documents: number;
    tokenCount: number;
  };
  growth?: {
    tenants: number;
    users: number;
    documents: number;
    sessions: number;
  };
}

export interface TenantAnalytics {
  // Summary metrics
  chatSessions: number;
  messagesExchanged: number;
  documentsUploaded: number;
  activeUsers: number;
  averageResponseTime: number;
  topCategories: Array<{ category: string; count: number }>;
  usageTrend: Array<{ date: string; count: number }>;

  // Detailed analytics (from backend)
  dailyUsers: { date: string; count: number }[];
  dailyMessages: { date: string; count: number }[];
  dailyDocuments: { date: string; count: number }[];
  totalCosts: { openai: number; storage: number; total: number };
  growth: {
    users: number;
    messages: number;
    documents: number;
  };
}

// types/visitor.ts

export interface ChatMessage {
  id: number;
  text: string;
  time: string;
  type: 'visitor' | 'agent';
}

export interface VisitorSession {
  id: number;
  name: string;
  visitorEmail: string | null;
  time: string;
  location: string;
  status: 'returning' | 'new' | 'opportunity' | 'ended' | 'active';
  score: string;
  ipAddress: string;
  startedAt: string;
  endedAt: string | null;
  pageUrl: string | null;
  referrerUrl: string | null;
  messageCount: number;
  visitorId: string;

  lastActivity: string | null
}

export interface ApiSessionResponse {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  ipAddress: string;
  country: string | null;
  city: string | null;
  status: 'active' | 'ended' | 'archived';
  startedAt: string;
  endedAt: string | null;
  lastActivity: string;
  pageUrl: string | null;
  referrerUrl: string | null;
  messageCount: number;
}

export interface VisitorInfoResponse {
  success: boolean;
  data: {
    sessions: ApiSessionResponse[];
  };
}

export interface TabType {
  name: 'profile' | 'conversations' | 'calls' | 'activities';
  label: string;
}

export interface VisitorTabType {
  name: 'all' | 'my';
  label: string;
}

// types/razorpay.ts

export interface RazorpayOrder {

  id: string;

  entity: string;

  amount: number;

  amount_paid: number;

  amount_due: number;

  currency: string;

  receipt: string;

  status: 'created' | 'attempted' | 'paid';

  attempts: number;

  notes: Record<string, string>;

  created_at: number;

}

export interface CreateOrderRequest {

  amount: number; // Amount in currency subunits (paise for INR)

  currency?: string; // Default: INR

  receipt?: string; // Unique receipt ID

  notes?: Record<string, string>;

  partial_payment?: boolean;

}

export interface RazorpayPayment {

  id: string;

  entity: string;

  amount: number;

  currency: string;

  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';

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

}

export interface CapturePaymentRequest {

  amount: number; // Amount in currency subunits

  currency: string;

}

export interface RazorpayPlan {

  id: string;

  entity: string;

  interval: number;

  period: 'daily' | 'weekly' | 'monthly' | 'yearly';

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

}

export interface CreatePlanRequest {

  name: string;

  amount: number; // Amount in currency subunits

  currency?: string; // Default: INR

  description?: string;

  period: 'daily' | 'weekly' | 'monthly' | 'yearly';

  interval?: number; // Default: 1

  notes?: Record<string, string>;

}

export interface RazorpaySubscription {

  id: string;

  entity: string;

  plan_id: string;

  customer_id: string | null;

  status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';

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

}

export interface CreateSubscriptionRequest {

  planId: string;

  customerId?: string;

  totalCount: number;

  quantity?: number;

  startAt?: number; // Unix timestamp

  expireBy?: number; // Unix timestamp

  customerNotify?: number; // 0 or 1

  addons?: Array<{

    item: {

      name: string;

      amount: number;

      currency: string;

    };

  }>;

  notes?: Record<string, string>;

  notifyInfo?: {

    notify_phone?: string;

    notify_email?: string;

  };

}

export interface CancelSubscriptionRequest {

  cancel_at_cycle_end: number; // 0 or 1

}

export interface RazorpayWebhookEvent {

  entity: string;

  account_id: string;

  event: string;

  contains: string[];

  payload: {

    payment?: {

      entity: RazorpayPayment;

    };

    subscription?: {

      entity: RazorpaySubscription;

    };

    order?: {

      entity: RazorpayOrder;

    };

  };

  created_at: number;

}

export interface RazorpayErrorResponse {

  error: {

    code: string;

    description: string;

    source: string;

    step: string;

    reason: string;

    metadata: Record<string, any>;

  };

}


// Add this interface to your types file (after RazorpayErrorResponse or wherever appropriate)

export interface SubscriptionPlan {
  id: number;
  tenant_id: number;
  name: string;
  plan_name: string;
  plan_id?: string | null;
  subscription_status: 'active' | 'cancelled' | 'paused' | 'halted' | 'completed' | 'expired' | 'pending';
  billing_cycle: 'monthly' | 'yearly' | 'daily' | 'weekly';
  amount: number;
  currency: string;
  payment_type?: 'razorpay' | 'stripe' | null;
  subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  payment_id: string | null;
  invoice_data: string | null;
}



 