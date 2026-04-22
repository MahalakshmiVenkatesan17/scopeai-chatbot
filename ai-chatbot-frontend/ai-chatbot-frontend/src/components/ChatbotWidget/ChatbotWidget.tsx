"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatbot } from "@/hooks/useChatbot";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { UserInfoForm } from "./UserInfoForm";
import { VisitorInfo } from "@/types/chatbot";
import {
  XMarkIcon,
  ChatBubbleLeftIcon,
  MinusIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";

interface ChatbotWidgetProps {
  tenantSlug: string;
  apiUrl?: string;
  onError?: (error: unknown) => void;
  onMessage?: (message: string, response: unknown) => void;
  autoOpen?: boolean;
}

export function ChatbotWidget({
  tenantSlug,
  apiUrl,
  onError,
  onMessage,
  autoOpen = false,
}: ChatbotWidgetProps) {
  const {
    isInitialized,
    isLoading,
    error,
    config,
    session,
    messages,
    isMinimized,
    isTyping,
    initialize,
    sendMessage,
    sendVoiceMessage,
    endSession,
    toggleMinimized,
    clearError,
    isTranscribing,
    transcribeVoice,
  } = useChatbot({
    tenantSlug,
    apiUrl,
    autoInit: false,
    onError,
    onMessage,
  });

  const [draftMessage, setDraftMessage] = useState("");
  const [currentVoicePath, setCurrentVoicePath] = useState<string | null>(null);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false); // Add this line
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
  };

  // // Auto-open chat on page load
  // useEffect(() => {
  //   if (autoOpen && !hasAutoOpened && isMinimized) {
  //     const timer = setTimeout(() => {
  //       toggleMinimized();
  //       setHasAutoOpened(true);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [autoOpen, hasAutoOpened, isMinimized, toggleMinimized]);

  useEffect(() => {
    if (autoOpen && !hasAutoOpened) {
      const timer = setTimeout(async () => {
        if (isMinimized) toggleMinimized();

        // ✅ Automatically trigger initialization when auto-open runs
        if (!isInitialized && !isLoading && !hasInitialized) {
          if (config?.collectUserInfo) {
            setShowUserInfoForm(true);
          } else {
            await initialize();
            setHasInitialized(true);
          }
        }

        setHasAutoOpened(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    autoOpen,
    hasAutoOpened,
    isMinimized,
    toggleMinimized,
    isInitialized,
    isLoading,
    hasInitialized,
    config,
    initialize,
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Initialize chatbot when opened for the first time
  useEffect(() => {
    if (!isMinimized && !hasInitialized && !isLoading && !isInitialized) {
      if (config?.collectUserInfo) {
        setShowUserInfoForm(true);
      } else {
        initialize();
        setHasInitialized(true);
      }
    }
  }, [
    isMinimized,
    hasInitialized,
    isLoading,
    isInitialized,
    config,
    initialize,
  ]);

  // Handle user info form submission
  const handleUserInfoSubmit = async (visitorInfo: VisitorInfo) => {
    setShowUserInfoForm(false);
    await initialize(visitorInfo);
    setHasInitialized(true);
  };

  // Handle user info form skip
  const handleUserInfoSkip = async () => {
    setShowUserInfoForm(false);
    await initialize();
    setHasInitialized(true);
  };

  // Handle message send
  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(
        message, 
        formData.name ? { name: formData.name, email: formData.email } : undefined,
        currentVoicePath || undefined,
        !!currentVoicePath
      );
      setDraftMessage("");
      setCurrentVoicePath(null); // Clear after sending
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Handle voice message (transcribe -> populate draft)
  const handleVoiceMessage = async (audioBlob: Blob) => {
    try {
      const result = await transcribeVoice(audioBlob);
      if (result && result.text) {
        // Populate the input field with the transcribed text for editing
        setDraftMessage(result.text);
        setCurrentVoicePath(result.audioFilePath);
        
        // Auto-focus the input so the user can immediately edit
        setTimeout(() => {
          const textarea = document.querySelector('textarea');
          if (textarea) (textarea as HTMLTextAreaElement).focus();
        }, 100);
      }
    } catch (err) {
      console.error("Failed to transcribe voice message:", err);
    }
  };

  // Handle close
  const handleClose = async () => {
    if (session) {
      await endSession();
    }
    setHasInitialized(false);
    setShowUserInfoForm(false);
    setFormData({ name: "", email: "" });
    setDraftMessage("");
    // ✅ clear localStorage (THIS IS WHAT YOU MISSED)
    localStorage.removeItem("chat_name");
    localStorage.removeItem("chat_email");
    toggleMinimized();
  };

  // Get widget position classes
  const getPositionClasses = () => {
    const position = config?.widgetPosition || "bottom-right";
    switch (position) {
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
      default:
        return "bottom-4 right-4";
    }
  };

  // Get widget size classes
  const getWidgetSizeClasses = () => {
    const size = config?.widgetSize || "medium";
    switch (size) {
      case "small":
        return "w-[340px] h-96";
      case "large":
        return "w-[440px] h-[600px]";
      case "medium":
      default:
        return "w-[380px] h-[550px]";
    }
  };

  const primaryColor = config?.primaryColor || "#007bff";
  const textColor = config?.textColor || "#333333";
  const backgroundColor = config?.backgroundColor || "#ffffff";

  return (
    <>
      {/* Custom CSS */}
      {config?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: config.customCss }} />
      )}

      <div className={clsx("fixed z-50", getPositionClasses())}>
        {/* Minimized chat button */}
        {isMinimized && (
          <div className="relative">
            <button
              onClick={toggleMinimized}
              className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center text-white",
                "transform transition-all duration-300 ease-out",
                "hover:scale-110 hover:rotate-12 active:scale-95",
                "shadow-lg hover:shadow-2xl",
                "relative overflow-hidden group",
              )}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                boxShadow: `0 8px 32px ${primaryColor}30`,
              }}
            >
              {/* Animated background */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${primaryColor}40 0%, transparent 70%)`,
                }}
              />

              {/* Pulse ring */}
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}60, transparent)`,
                }}
              />

              <ChatBubbleLeftIcon className="w-8 h-8 relative z-10 transform group-hover:scale-110 transition-transform duration-200" />

              {/* {config?.chatbotAvatar ? (
                <img 
                  src={config.chatbotAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover relative z-10 transform group-hover:scale-110 transition-transform duration-200" 
                />
              ) : (
                <ChatBubbleLeftIcon className="w-8 h-8 relative z-10 transform group-hover:scale-110 transition-transform duration-200" />
              )} */}

              {/* Notification dot */}
              {messages.length === 0 && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-bounce"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  <div className="w-full h-full rounded-full animate-pulse bg-red-400" />
                </div>
              )}
            </button>

            {/* Tooltip */}
            <div
              className={clsx(
                "absolute bottom-full right-0 mb-2 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap",
                "transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                "transition-all duration-200 ease-out pointer-events-none",
                "glass-dark",
              )}
            >
              {config?.chatbotName || "AI Assistant"}
            </div>
          </div>
        )}

        {/* Expanded chat widget */}
        {!isMinimized && (
          <div
            className={clsx(
              "shadow-2xl rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm max-w-[calc(100vw-2rem)]",
              "transform transition-all duration-500 ease-out animate-slideIn",
              "border border-white/20",
              "max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100vh-2rem)]",
              getWidgetSizeClasses(),
            )}
            style={{
              backgroundColor: backgroundColor,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Header */}
            <div
              className="p-4 text-white flex items-center justify-between relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
              }}
            >
              {/* Animated background pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                  animation: "float 20s ease-in-out infinite",
                }}
              />

              <div className="flex items-center gap-3 relative z-10">
                {!!config?.showAgentAvatar && (
                  <div className="relative">
                    <div className="w-10 h-10 text-black rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-bold backdrop-blur-sm border border-white/30 overflow-hidden">
                      {config?.chatbotAvatar ? (
                        <img
                          src={config.chatbotAvatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "AI"
                      )}
                    </div>
                    {/* Online indicator */}
                    {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
                      <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                    </div> */}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm">
                    {config?.chatbotName || "AI Assistant"}
                  </h3>
                  <div className="flex items-center gap-1">
                    {isTranscribing ? (
                      <div className="flex items-center gap-1 text-xs opacity-90 animate-pulse">
                        <span>🎙️ Transcribing...</span>
                      </div>
                    ) : isTyping ? (
                      <div className="flex items-center gap-1 text-xs opacity-90">
                        <div className="flex gap-0.5">
                          <div
                            className="w-1 h-1 bg-white rounded-full animate-typing"
                            style={{ animationDelay: "0s" }}
                          />
                          <div
                            className="w-1 h-1 bg-white rounded-full animate-typing"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="w-1 h-1 bg-white rounded-full animate-typing"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                        <span>Typing...</span>
                      </div>
                    ) : (
                      <p className="text-xs opacity-90 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Online
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 relative z-10">
                <button
                  onClick={toggleMinimized}
                  className="w-8 h-8 rounded-full cursor-pointer hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full cursor-pointer hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-b border-red-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && !isInitialized && (
              <div className="flex-1 flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100/50">
                <div className="text-center p-8 animate-slideIn">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-gray-200">
                      <div
                        className="w-16 h-16 rounded-full border-4 border-transparent border-t-current animate-spin "
                        style={{ color: primaryColor }}
                      />
                    </div>
                    {/* Pulsing dots around spinner */}
                    <div className="absolute inset-0 animate-ping opacity-20">
                      <div
                        className="w-16 h-16 rounded-full border-4 border-current"
                        style={{ color: primaryColor }}
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🚀 Initializing AI Assistant
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Preparing personalized experience...
                  </p>
                  {/* Loading dots */}
                  <div className="flex justify-center space-x-1 mt-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: primaryColor,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: "1.5s",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User info form */}
            {showUserInfoForm && (
              <div className="flex-1 overflow-y-auto">
                <UserInfoForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleUserInfoSubmit}
                  onSkip={config?.requireEmail ? undefined : handleUserInfoSkip}
                  requireEmail={config?.requireEmail}
                  primaryColor={primaryColor}
                  chatbotName={config?.chatbotName}
                />
              </div>
            )}

            {/* Chat interface */}
            {isInitialized && !showUserInfoForm && (
              <>
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {/* Welcome message */}
                  {messages.length === 0 && config?.welcomeMessage && (
                    <div className="flex gap-3 mb-4">
                      {!!config.showAgentAvatar && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 overflow-hidden"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {config?.chatbotAvatar ? (
                            <img
                              src={config.chatbotAvatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "AI"
                          )}
                        </div>
                      )}
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                        <p className="text-sm leading-relaxed text-gray-900">
                          {config.welcomeMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message list */}
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      showAvatar={config?.showAgentAvatar}
                      primaryColor={primaryColor}
                      textColor={textColor}
                      chatbotAvatar={config?.chatbotAvatar}
                    />
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <TypingIndicator
                      showAvatar={config?.showAgentAvatar}
                      primaryColor={primaryColor}
                      chatbotAvatar={config?.chatbotAvatar}
                    />
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onVoiceMessage={handleVoiceMessage}
                  placeholder={config?.placeholderText}
                  maxLength={config?.maxMessageLength}
                  disabled={isTyping || isTranscribing}
                  primaryColor={primaryColor}
                  value={draftMessage}
                  onChange={setDraftMessage}
                  onVoiceError={showToast}
                />
              </>
            )}
          </div>
        )}

        {/* Toast Notification */}
        <div
          className={clsx(
            "absolute bottom-28 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-400 z-[9999] flex items-center gap-3 backdrop-blur-md",
            "bg-gray-900/95 text-white shadow-2xl border border-white/10",
            toast.visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95 pointer-events-none"
          )}
        >
          <span className="animate-pulse">🎙️</span>
          {toast.message}
        </div>
      </div>
    </>
  );
}
