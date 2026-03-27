import { useState, useEffect, useCallback, useRef } from 'react';
import { chatbotAPI } from '@/lib/api';
import {
  ChatbotConfig,
  ChatSession,
  ChatMessage,
  VisitorInfo,
  SendMessageResponse
} from '@/types/chatbot';

interface UseChatbotOptions {
  tenantSlug: string;
  apiUrl?: string;
  autoInit?: boolean;
  onError?: (error: unknown) => void;
  onMessage?: (message: string, response: SendMessageResponse) => void;
}

interface UseChatbotReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  config: ChatbotConfig | null;
  session: ChatSession | null;
  messages: ChatMessage[];
  isMinimized: boolean;
  isTyping: boolean;

  // Actions
  initialize: (visitorInfo?: VisitorInfo) => Promise<void>;
  sendMessage: (message: string, visitorInfo?: VisitorInfo) => Promise<void>;
  endSession: () => Promise<void>;
  toggleMinimized: () => void;
  clearError: () => void;
  loadMessages: () => Promise<void>;
}

export function useChatbot({
  tenantSlug,
  apiUrl,
  autoInit = true,
  onError,
  onMessage,
}: UseChatbotOptions): UseChatbotReturn {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const sessionRef = useRef<ChatSession | null>(null);
  sessionRef.current = session;

  // Update API base URL if provided
  useEffect(() => {
    if (apiUrl) {
      chatbotAPI.updateBaseURL(apiUrl);
    }
  }, [apiUrl]);


  // Error handler
const handleError = useCallback((err: unknown) => {
  console.log(err, 'error check');

  let errorMessage = 'An error occurred';

  if (err && typeof err === 'object') {
    const axiosError = err as any;

    // ✅ Handle API response error (THIS IS YOUR CASE)
    if (axiosError.response?.data?.error?.message) {
      errorMessage = axiosError.response.data.error.message;
    }
    // fallback
    else if (axiosError.message) {
      errorMessage = axiosError.message;
    }
  }

  setError(errorMessage);
  onError?.(err);
}, [onError]);

  // Initialize chatbot
  const initialize = useCallback(async (visitorInfo?: VisitorInfo) => {
    if (isInitialized) return;

    const effectiveTenantSlug = (tenantSlug || "").trim() || "";

    setIsLoading(true);
    setError(null);
    try {
      // Get configuration
      const chatbotConfig = await chatbotAPI.getConfig(effectiveTenantSlug);
      setConfig(chatbotConfig);


      // Initialize session
      const chatSession = await chatbotAPI.initSession(
        effectiveTenantSlug,
        visitorInfo,
        window.location.href,
        document.referrer || "https://example.com",
      );
      setSession(chatSession);

      // Auto-open if configured
      if (chatbotConfig.autoOpen) {
        setIsMinimized(false);
      }

      setIsInitialized(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, isInitialized, handleError]);

  // Send message
  const sendMessage = useCallback(async (message: string, visitorInfo?: VisitorInfo) => {
    if (!sessionRef.current) {
      throw new Error('Chat session not initialized');
    }

    if (!message.trim()) return;

    setIsTyping(true);
    setError(null);

    try {
      const response = await chatbotAPI.sendMessage(
        sessionRef.current.sessionToken,
        message,
        visitorInfo
      );

      // Add messages to state
      setMessages(prev => [...prev, response.visitorMessage, response.assistantMessage]);

      // Call onMessage callback
      onMessage?.(message, response);
    } catch (err) {
      handleError(err);
    } finally {
      setIsTyping(false);
    }
  }, [handleError, onMessage]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      const sessionMessages = await chatbotAPI.getMessages(sessionRef.current.sessionToken);
      setMessages(sessionMessages);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      await chatbotAPI.endSession(sessionRef.current.sessionToken);
      setSession(null);
      setMessages([]);
      setIsInitialized(false);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Toggle minimized state
  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInit && !isInitialized && !isLoading) {
      initialize();
    }
  }, [autoInit, isInitialized, isLoading, initialize]);

  // Session cleanup on unmount and page unload
  useEffect(() => {
    const handleUnload = () => {
      if (sessionRef.current) {
        // Use keepalive for unload/refresh reliably
        chatbotAPI.endSession(sessionRef.current.sessionToken, { keepalive: true }).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (sessionRef.current) {
        chatbotAPI.endSession(sessionRef.current.sessionToken).catch(console.error);
      }
    };
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    config,
    session,
    messages,
    isMinimized,
    isTyping,

    // Actions
    initialize,
    sendMessage,
    endSession,
    toggleMinimized,
    clearError,
    loadMessages,
  };
}