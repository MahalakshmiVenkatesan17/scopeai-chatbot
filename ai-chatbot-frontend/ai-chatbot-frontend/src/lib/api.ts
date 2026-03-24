import axios, { AxiosInstance } from 'axios';
import {
  ChatbotConfig,
  ChatSession,
  ChatMessage,
  SendMessageResponse,
  ApiResponse,
  VisitorInfo
} from '@/types/chatbot';

const getApiUrl = () => {
  // Try to get from environment first
  const envApiUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl + '/api/v1';
  }

  // Check if we're running on localhost for development
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
      return 'http://localhost:3001/api/v1'; // Local development backend
    }
  }
  
  // Default to production URL
  return process.env.NEXT_PUBLIC_API_URL || 'https://python-api-production-bab7.up.railway.app/api/v1';
};

class ChatbotAPI {
  private client: AxiosInstance;
  private baseURL: string;

  private getDefaultApiUrl(): string {
    // Try to get from environment first
    const envApiUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_URL;
    if (envApiUrl) {
      return envApiUrl + '/api/v1';
    }

    // Check if we're running on localhost for development
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
        return 'http://localhost:3001/api/v1'; // Local development backend
      }
    }
    
    // Default to production URL
    return process.env.NEXT_PUBLIC_API_URL || 'https://python-api-production-bab7.up.railway.app/api/v1';
  }

  constructor(baseURL?: string) {
    this.baseURL = baseURL || this.getDefaultApiUrl();
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        console.error('API Error:', error);
        throw error;
      }
    );
  }

  /**
   * Get chatbot configuration for a tenant
   */
  async getConfig(tenantSlug: string): Promise<ChatbotConfig> {
    const response = await this.client.get<ApiResponse<{ config: ChatbotConfig }>>(
      `api/v1/public/chat/config/${tenantSlug}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get chatbot config');
    }

    return response.data.data.config;
  }

  /**
   * Initialize a new chat session
   */
  async initSession(
    tenantSlug: string,
    visitorInfo?: VisitorInfo,
    pageUrl?: string,
    referrerUrl?: string
  ): Promise<ChatSession> {
    const response = await this.client.post<ApiResponse<ChatSession>>(
      'api/v1/public/chat/session',
      {
        tenantSlug,
        visitorInfo,
        pageUrl,
        referrerUrl,
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to initialize session');
    }

    return response.data.data;
  }

  /**
   * Send a message to the chatbot
   */
  async sendMessage(
    sessionToken: string,
    message: string,
    visitorInfo?: VisitorInfo
  ): Promise<SendMessageResponse> {
    const response = await this.client.post<ApiResponse<SendMessageResponse>>(
      `api/v1/public/chat/session/${sessionToken}/message`,
      {
        message,
        visitorInfo,
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to send message');
    }

    return response.data.data;
  }

  /**
   * Get chat messages for a session
   */
  async getMessages(sessionToken: string, limit: number = 50): Promise<ChatMessage[]> {
    const response = await this.client.get<ApiResponse<{ messages: ChatMessage[] }>>(
      `api/v1/public/chat/session/${sessionToken}/messages`,
      {
        params: { limit },
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get messages');
    }

    return response.data.data.messages;
  }

  /**
   * End a chat session
   */
  async endSession(sessionToken: string): Promise<void> {
    const response = await this.client.post<ApiResponse<{ message: string }>>(
      `api/v1/public/chat/session/${sessionToken}/end`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to end session');
    }
  }

  /**
   * Update base URL (useful for dynamic API endpoints)
   */
  updateBaseURL(newBaseURL: string) {
    this.baseURL = newBaseURL;
    this.client.defaults.baseURL = newBaseURL;
  }
}

// Export a singleton instance
export const chatbotAPI = new ChatbotAPI();

// Export the class for custom instances
export default ChatbotAPI;
