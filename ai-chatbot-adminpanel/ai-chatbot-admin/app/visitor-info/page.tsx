"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Building2,
  MapPin,
  Mail,
  Globe,
  Clock3,
  Activity,
  MessageSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
  Shield,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api-client";
import type {
  ChatMessage,
  VisitorSession,
  VisitorInfoResponse,
  Tenant,
} from "@/types";
import { useAuthStore } from "@/store/auth-store";

// New interface for session messages
interface SessionMessage {
  id: number;
  sessionId: string;
  tenantId: number;
  messageType: "user" | "assistant" | "system";
  content: string;
  tokenCount?: number;
  modelUsed?: string;
  processingTimeMs?: number;
  costEstimate?: number;
  feedbackRating?: number;
  feedbackComment?: string;
  createdAt: string;
}

interface SessionMessagesResponse {
  success: boolean;
  data: {
    messages: SessionMessage[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

const VisitorInfo = () => {
  const [activeTab] = useState<"all" | "my">("all");
  const [activeProfileTab, setActiveProfileTab] = useState<
    "profile" | "conversations" | "calls" | "activities"
  >("profile");
  const [selectedVisitor, setSelectedVisitor] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // New state for session messages
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [messagesPage, setMessagesPage] = useState<number>(1);
  const [totalMessagesPages, setTotalMessagesPages] = useState<number>(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [visitors, setVisitors] = useState<VisitorSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuthStore();

  // Tenant dropdown states
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [tenantName, setTenantName] = useState<string>("");

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch tenants on mount
  useEffect(() => {
    fetchTenants();
  }, [user]);

  useEffect((): void => {
    scrollToBottom();
  }, [sessionMessages]);

  // Fetch visitor info when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      fetchVisitorInfo(selectedTenant);
    }
  }, [selectedTenant]);

  // Fetch session messages when visitor or session changes
  useEffect(() => {
    if (currentVisitor && activeProfileTab === "conversations") {
      fetchVisitorSessions(currentVisitor.visitorId);
    }
  }, [selectedVisitor, activeProfileTab]);

  const fetchTenants = async (): Promise<void> => {
    try {
      setLoading(true);

      const response = await apiClient.getTenants({ page: 1, limit: 100 });

      const items: Tenant[] = response.items ?? [];
      const activeTenants = items.filter((t: Tenant) => t.status !== "suspended");

      setTenants(activeTenants);

      // Auto select logged-in user's tenant
      if (user?.tenant_id) {
        const tenantExists = activeTenants.find(
          (t: Tenant) => t.id === user.tenant_id,
        );

        if (tenantExists) {
          setSelectedTenant(String(tenantExists.id));
          setTenantName(tenantExists.name);
        }
      } else if (activeTenants.length > 0 && user?.role !== "tenant_admin") {
        setSelectedTenant(String(activeTenants[0].id));
        setTenantName(activeTenants[0].name);
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorInfo = async (tenantId: string): Promise<void> => {
    try {
      setLoading(true);
      const response = (await apiClient.getVisitorInfo(
        tenantId,
      )) as VisitorInfoResponse;

      if (response.data && response.data.sessions) {
        const transformedVisitors: VisitorSession[] = response.data.sessions.map(
          (session, index) => ({
            id: index,
            name: session.visitorName || `Visitor ${index + 1}`,
            visitorEmail: session.visitorEmail,
            time: new Date(session.lastActivity).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            location:
              session.city && session.country
                ? `${session.city}, ${session.country}`
                : "Unknown location",
            status: session.status === "active" ? "returning" : "new",
            score: `${session.messageCount} messages`,
            ipAddress: session.ipAddress,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            pageUrl: session.pageUrl,
            referrerUrl: session.referrerUrl,
            messageCount: session.messageCount,
            visitorId: session.visitorId,
            lastActivity: session.lastActivity,
            sessionId: session.id,
          }),
        );

        setVisitors(transformedVisitors);

        if (transformedVisitors.length > 0) {
          setSelectedVisitor(0);
        } else {
          setSelectedVisitor(0);
          setSessionMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch visitor info:", error);
      setVisitors([]);
      setSessionMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorSessions = async (visitorId: string): Promise<void> => {
    try {
      const response = await apiClient.getVisitorSessions(visitorId);
      if (response.success && response.data.sessions.length > 0) {
        const firstSession = response.data.sessions[0];
        setSelectedSessionId(firstSession.id);
        fetchSessionMessages(firstSession.id, 1);
      } else {
        setSelectedSessionId(null);
        setSessionMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch visitor sessions:", error);
      setSelectedSessionId(null);
      setSessionMessages([]);
    }
  };

  const fetchSessionMessages = async (
    sessionId: string,
    page: number = 1,
  ): Promise<void> => {
    try {
      setLoadingMessages(true);
      const response: SessionMessagesResponse =
        await apiClient.getSessionMessages(sessionId, {
          page,
          limit: 50,
        });

      if (response.success) {
        setSessionMessages(response.data.messages);
        setMessagesPage(page);
        setTotalMessagesPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch session messages:", error);
      setSessionMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = (): void => {
    if (message.trim() === "") return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "agent",
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case "returning":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/20";
      case "new":
        return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border dark:border-orange-500/20";
      case "opportunity":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border dark:border-blue-500/20";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300 dark:border dark:border-white/10";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "returning":
        return "Active";
      case "new":
        return "Ended";
      case "opportunity":
        return "Opportunity";
      default:
        return "Chats";
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMessageTypeClass = (type: string): string => {
    switch (type) {
      case "user":
        return "bg-white border border-gray-200 text-gray-800 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-100";
      case "assistant":
        return "bg-gradient-to-br from-indigo-500 to-violet-600 text-white";
      case "system":
        return "bg-gray-100 text-gray-600 text-sm italic dark:bg-white/[0.04] dark:text-gray-400 dark:border dark:border-white/10";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-white/[0.04] dark:text-gray-100";
    }
  };

  const currentVisitor: VisitorSession | undefined = visitors[selectedVisitor];

  const panelClass =
    "rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:shadow-2xl";

  const infoCardClass =
    "rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/[0.03]";

  const renderInfoRow = (label: string, value?: string | number | null) => (
    <div className="flex justify-between gap-4 py-2.5 border-b border-gray-100 dark:border-white/10">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 text-right break-all">
        {value || "--"}
      </span>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="h-screen bg-gray-50 dark:bg-[#070b14] transition-colors relative overflow-hidden">
        {/* Purple Cyber Glow */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block">
          <div className="absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-violet-600/12 blur-3xl" />
          <div className="absolute top-24 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col h-full">
          {/* Header */}
          <header className="mx-4 mt-4 mb-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:shadow-2xl transition-colors">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                  <Bot className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Visitor Intelligence
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Track visitors, sessions, and conversation history
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {user?.role !== "tenant_admin" ? (
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="tenant"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Tenant
                    </label>

                    <select
                      id="tenant"
                      value={selectedTenant}
                      onChange={(e) => {
                        const tenantId = e.target.value;
                        setSelectedTenant(tenantId);
                        const selected = tenants.find(
                          (t) => String(t.id) === tenantId,
                        );
                        setTenantName(selected ? selected.name : "");
                      }}
                      className="rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 transition-colors outline-none min-w-[220px]"
                    >
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
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                    <Sparkles className="h-4 w-4" />
                    Tenant: {tenantName}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (selectedTenant) fetchVisitorInfo(selectedTenant);
                  }}
                  className="inline-flex items-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden px-4 pb-4 gap-4">
            {/* Sidebar */}
            <div className={`w-[340px] flex flex-col ${panelClass} overflow-hidden`}>
              <div className="p-5 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                    All Visitors
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Live visitor sessions & history
                  </p>
                </div>
                <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 text-sm font-semibold">
                  {visitors.length}
                </span>
              </div>

              <div className="flex border-b border-gray-100 dark:border-white/10">
                <button
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "all"
                    ? "text-violet-600 dark:text-violet-300 border-b-2 border-violet-500"
                    : "text-gray-600 dark:text-gray-400"
                    }`}
                >
                  All visitors
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {loading ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
                    Loading visitors...
                  </div>
                ) : visitors.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <UserCircle2 className="mx-auto mb-3 h-10 w-10 opacity-40" />
                    No visitors found
                  </div>
                ) : (
                  visitors.map((visitor: VisitorSession, index: number) => (
                    <div
                      key={`${visitor.visitorId || "unknown"}_${index}`}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedVisitor === index
                        ? "bg-violet-50 border-violet-200 shadow-sm dark:bg-violet-500/10 dark:border-violet-500/20"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                        }`}
                      onClick={() => setSelectedVisitor(index)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {visitor?.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {visitor?.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{visitor?.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-medium ${getStatusClass(
                            visitor?.status,
                          )}`}
                        >
                          {getStatusText(visitor?.status)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {visitor?.score}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Area */}
            <div className={`flex-1 flex flex-col ${panelClass} overflow-hidden`}>
              {currentVisitor ? (
                <>
                  {/* Top visitor header */}
                  <div className="border-b border-gray-100 dark:border-white/10 p-5 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-semibold shadow-lg shadow-violet-500/20">
                        {currentVisitor?.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                          {currentVisitor?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {currentVisitor?.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${getStatusClass(
                          currentVisitor?.status,
                        )}`}
                      >
                        {getStatusText(currentVisitor?.status)}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300">
                        {currentVisitor?.messageCount} messages
                      </span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-100 dark:border-white/10 px-2">
                    {["Profile", "Conversations"].map((tab) => (
                      <button
                        key={tab}
                        className={`px-5 py-3 text-sm font-medium transition-colors ${activeProfileTab === tab.toLowerCase()
                          ? "text-violet-600 dark:text-violet-300 border-b-2 border-violet-500"
                          : "text-gray-600 dark:text-gray-400"
                          }`}
                        onClick={() =>
                          setActiveProfileTab(
                            tab.toLowerCase() as
                            | "profile"
                            | "conversations"
                            | "calls"
                            | "activities",
                          )
                        }
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 overflow-y-auto">
                    {activeProfileTab === "profile" && (
                      <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-6">
                        <div className={infoCardClass}>
                          <div className="flex items-center gap-2 mb-4">
                            <UserCircle2 className="h-5 w-5 text-violet-500" />
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                              Visitor Information
                            </h4>
                          </div>

                          <div className="space-y-0">
                            {renderInfoRow("Visitor ID", currentVisitor?.visitorId)}
                            {renderInfoRow("Email", currentVisitor?.visitorEmail || "N/A")}
                            {renderInfoRow(
                              "Started at",
                              currentVisitor?.startedAt
                                ? new Date(currentVisitor.startedAt).toLocaleString()
                                : "--",
                            )}
                            {renderInfoRow(
                              "Ended at",
                              currentVisitor?.endedAt
                                ? new Date(currentVisitor.endedAt).toLocaleString()
                                : "--",
                            )}
                            {renderInfoRow(
                              "Last visit",
                              currentVisitor?.lastActivity
                                ? new Date(currentVisitor.lastActivity).toLocaleString()
                                : "--",
                            )}
                            {renderInfoRow(
                              "Status",
                              getStatusText(currentVisitor?.status),
                            )}
                          </div>
                        </div>

                        <div className={infoCardClass}>
                          <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-violet-500" />
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                              Technical Information
                            </h4>
                          </div>

                          <div className="space-y-0">
                            {renderInfoRow("Messages", currentVisitor?.messageCount)}
                            {renderInfoRow("IP Address", currentVisitor?.ipAddress)}
                            {renderInfoRow("Page URL", currentVisitor?.pageUrl)}
                            {renderInfoRow(
                              "Referrer",
                              currentVisitor?.referrerUrl || "Direct",
                            )}
                          </div>

                          {/* {currentVisitor?.pageUrl && (
                            <div className="mt-4">
                              <a
                                href={currentVisitor.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Page URL
                              </a>
                            </div>
                          )} */}
                        </div>
                      </div>
                    )}

                    {activeProfileTab === "conversations" && (
                      <div className="h-full flex flex-col">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                              Chat History
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Session messages for this visitor
                            </p>
                          </div>

                          {sessionMessages.length > 0 && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {sessionMessages.length} messages
                            </span>
                          )}
                        </div>

                        {loadingMessages ? (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500/20 border-t-violet-500 mx-auto mb-4"></div>
                              <p className="text-gray-500 dark:text-gray-400">
                                Loading messages...
                              </p>
                            </div>
                          </div>
                        ) : sessionMessages.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                              <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-40" />
                              <p>No conversation history available</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                              {sessionMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.messageType === "user"
                                    ? "justify-start"
                                    : msg.messageType === "system"
                                      ? "justify-center"
                                      : "justify-end"
                                    }`}
                                >
                                  <div
                                    className={`${msg.messageType === "system"
                                      ? "max-w-[85%]"
                                      : "max-w-[75%]"
                                      } px-5 py-4 rounded-2xl shadow-sm transition-colors ${getMessageTypeClass(
                                        msg.messageType,
                                      )}`}
                                  >
                                    <div className="text-sm break-words whitespace-pre-wrap leading-6">
                                      {msg.content}
                                    </div>

                                    <div className="flex items-center justify-between mt-2 text-xs opacity-75 gap-3 flex-wrap">
                                      <span>{formatMessageTime(msg.createdAt)}</span>
                                      {msg.tokenCount ? (
                                        <span>{msg.tokenCount} tokens</span>
                                      ) : null}
                                    </div>

                                    {msg.processingTimeMs ? (
                                      <div className="text-xs opacity-70 mt-1">
                                        Response time: {msg.processingTimeMs}ms
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>

                            {/* Pagination */}
                            {totalMessagesPages > 1 && (
                              <div className="mt-4 flex items-center justify-center gap-3">
                                <button
                                  onClick={() => {
                                    if (messagesPage > 1 && selectedSessionId) {
                                      fetchSessionMessages(
                                        selectedSessionId,
                                        messagesPage - 1,
                                      );
                                    }
                                  }}
                                  disabled={messagesPage === 1}
                                  className="inline-flex items-center px-4 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.03] text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                  <ChevronLeft className="h-4 w-4 mr-1" />
                                  Previous
                                </button>

                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Page {messagesPage} of {totalMessagesPages}
                                </span>

                                <button
                                  onClick={() => {
                                    if (
                                      messagesPage < totalMessagesPages &&
                                      selectedSessionId
                                    ) {
                                      fetchSessionMessages(
                                        selectedSessionId,
                                        messagesPage + 1,
                                      );
                                    }
                                  }}
                                  disabled={messagesPage === totalMessagesPages}
                                  className="inline-flex items-center px-4 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.03] text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                  Next
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <UserCircle2 className="mx-auto mb-3 h-10 w-10 opacity-40" />
                    Select a visitor to view details
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VisitorInfo;