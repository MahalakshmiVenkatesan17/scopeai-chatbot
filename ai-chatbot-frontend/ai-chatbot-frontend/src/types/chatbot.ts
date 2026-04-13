export interface ChatbotConfig {
  chatbotName: string;
  welcomeMessage: string;
  placeholderText: string;
  widgetPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  widgetSize: 'small' | 'medium' | 'large';
  autoOpen: boolean;
  showAgentAvatar: boolean;
  collectUserInfo: boolean;
  requireEmail: boolean;
  enableFileUpload: boolean;
  maxMessageLength: number;
  customCss?: string;
  chatbotAvatar?: string | null;
}

export interface ChatSession {
  sessionId: string;
  sessionToken: string;
  tenantSlug: string;
  visitorId: string;
  config: ChatbotConfig;
}

export interface ChatMessage {
  id: number;
  role: 'visitor' | 'assistant';
  content: string;
  createdAt: string;
  tokenCount?: number;
  cost?: number;
  audioFilePath?: string;
  isVoiceMessage?: boolean;
}

export interface VisitorInfo {
  name?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageRequest {
  message: string;
  visitorInfo?: VisitorInfo;
  audioFilePath?: string;
  isVoiceMessage?: boolean;
}

export interface SendMessageResponse {
  visitorMessage: ChatMessage;
  assistantMessage: ChatMessage;
  usage?: Record<string, unknown>;
  cost?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ChatbotWidgetConfig {
  tenant: string;
  apiUrl: string;
  customCSS?: string;
  onLoad?: () => void;
  onMessage?: (message: string, response: SendMessageResponse) => void;
  onError?: (error: unknown) => void;
}

declare global {
  interface Window {
    AIChatbotConfig: ChatbotWidgetConfig;
  }
}