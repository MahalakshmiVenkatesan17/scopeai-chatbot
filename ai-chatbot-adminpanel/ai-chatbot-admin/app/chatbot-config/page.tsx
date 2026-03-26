"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import apiClient from "@/lib/api-client";
import type { Tenant, ChatbotConfig } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { Loader } from "@/components/ui/Loader";
import {
  Building,
  ClipboardCheck,
  Palette,
  SlidersHorizontal,
  Bot,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

function mapBackendConfigToFrontend(data: any): Partial<ChatbotConfig> {
  return {
    chatbotName: data.chatbotName ?? data.chatbot_name,
    welcomeMessage: data.welcomeMessage ?? data.welcome_message,
    placeholderText: data.placeholderText ?? data.placeholder_text,
    widgetPosition: data.widgetPosition ?? data.widget_position,
    primaryColor: data.primaryColor ?? data.primary_color,
    secondaryColor: data.secondaryColor ?? data.secondary_color,
    widgetSize: data.widgetSize ?? data.widget_size,
    autoOpen: !!(data.autoOpen ?? data.auto_open),
    showAgentAvatar: !!(data.showAgentAvatar ?? data.show_agent_avatar),
    collectUserInfo: !!(data.collectUserInfo ?? data.collect_user_info),
    requireEmail: !!(data.requireEmail ?? data.require_email),
    enableFileUpload: !!(data.enableFileUpload ?? data.enable_file_upload),
    maxMessageLength: data.maxMessageLength ?? data.max_message_length,
    rateLimitMessages: data.rateLimitMessages ?? data.rate_limit_messages,
    rateLimitWindowMinutes:
      data.rateLimitWindowMinutes ?? data.rate_limit_window_minutes,
    isActive: !!(data.isActive ?? data.is_active),
  };
}

function mapFrontendConfigToBackend(config: Partial<ChatbotConfig>) {
  return {
    chatbotName: config.chatbotName,
    welcomeMessage: config.welcomeMessage,
    placeholderText: config.placeholderText,
    widgetPosition: config.widgetPosition,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    widgetSize: config.widgetSize,
    autoOpen: !!config.autoOpen,
    showAgentAvatar: !!config.showAgentAvatar,
    collectUserInfo: !!config.collectUserInfo,
    requireEmail: !!config.requireEmail,
    enableFileUpload: !!config.enableFileUpload,
    maxMessageLength: config.maxMessageLength,
    rateLimitMessages: config.rateLimitMessages,
    rateLimitWindowMinutes: config.rateLimitWindowMinutes,
    isActive: !!config.isActive,
  };
}

function Toggle({
  checked,
  onChange,
}: {
  checked?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className="w-12 h-7 rounded-full bg-gray-300 dark:bg-white/10 transition-colors
                   peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-violet-600
                   after:content-[''] after:absolute after:top-1 after:left-1
                   after:h-5 after:w-5 after:rounded-full after:bg-white
                   after:shadow-md after:transition-all peer-checked:after:translate-x-5"
      />
    </label>
  );
}

export default function ChatbotConfigPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);

  const defaultConfig: Partial<ChatbotConfig> = {
    chatbotName: "AI Assistant",
    welcomeMessage: "Hello! How can I help you today?",
    placeholderText: "Type your message here...",
    widgetPosition: "bottom-right",
    primaryColor: "#8B5CF6",
    secondaryColor: "#10B981",
    widgetSize: "medium",
    autoOpen: false,
    showAgentAvatar: true,
    collectUserInfo: false,
    requireEmail: false,
    enableFileUpload: false,
    maxMessageLength: 2000,
    rateLimitMessages: 10,
    rateLimitWindowMinutes: 1,
    isActive: true,
  };

  const [config, setConfig] = useState<Partial<ChatbotConfig>>(defaultConfig);
  const loggedInUser = useAuthStore().user;
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // Load tenants/current tenant
  useEffect(() => {
    if (!loggedInUser) return;

    if (loggedInUser.role === "tenant_admin") {
      setSelectedTenant(loggedInUser.tenant_id);
    } else {
      fetchTenants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  // Fetch config when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      fetchConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenant]);

  const fetchTenants = async () => {
    try {
      const response = await apiClient.getTenants({ page: 1, limit: 100 });
      setTenants(
        response.items?.filter((t: any) => t.status !== "suspended") || [],
      );
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    }
  };

  const fetchConfig = async () => {
    if (!selectedTenant) return;
    try {
      setLoading(true);

      const data = await apiClient.getTenantConfigbyId(selectedTenant);
      if (data) {
        setConfig({ ...defaultConfig, ...mapBackendConfigToFrontend(data) });
      } else {
        setConfig(defaultConfig);
      }
    } catch (error: any) {
      console.error("Failed to fetch config:", error);

      const backendMsg =
        error?.response?.data?.error?.message || error?.response?.data?.message;

      showToast(backendMsg || "Failed to load configuration", "error");
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTenant) {
      showToast("Please select a tenant", "error");
      return;
    }

    if (!config.chatbotName?.trim()) {
      showToast("Chatbot Name is required", "error");
      return;
    }

    if (!config.welcomeMessage?.trim()) {
      showToast("Welcome Message is required", "error");
      return;
    }

    if (
      config.maxMessageLength == null ||
      isNaN(Number(config.maxMessageLength)) ||
      Number(config.maxMessageLength) < 10 ||
      Number(config.maxMessageLength) > 100000
    ) {
      showToast("Maximum Input Length must be 10 to 100000", "error");
      return;
    }

    try {
      setLoading(true);

      await apiClient.updateTenantConfig(
        selectedTenant,
        mapFrontendConfigToBackend(config),
      );

      showToast("Configuration saved successfully", "success");
    } catch (error: any) {
      console.error("Failed to save config:", error);

      const backendMsg =
        error?.response?.data?.error?.message || error?.response?.data?.message;

      showToast(backendMsg || "Failed to save configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedTenantDetails = tenants.find((t) => t.id === selectedTenant);

  const inputClass =
    "w-full rounded-xl border border-gray-300 dark:border-white/10 px-3 py-2.5 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20";

  const cardClass =
    "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:shadow-2xl";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] transition-colors p-4 sm:p-6 relative overflow-hidden">
        {/* Purple Cyber Glow Background */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block">
          <div className="absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-violet-600/12 blur-3xl" />
          <div className="absolute top-24 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          {/* Header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                  <Bot className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Chatbot Configuration
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Configure your chatbot settings and appearance
                  </p>
                </div>
              </div>

              {/* {selectedTenant && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                  <Sparkles className="h-4 w-4" />
                  Active Tenant:{" "}
                  {selectedTenantDetails
                    ? `${selectedTenantDetails.name} (${selectedTenantDetails.slug})`
                    : selectedTenant}
                </div>
              )} */}
            </div>
          </div>

          {/* Tenant Selection */}
          {loggedInUser?.role !== "tenant_admin" && (
            <Card className={cardClass}>
              <CardTitle className="flex items-center px-5 pt-5 text-gray-900 dark:text-gray-100">
                <span className="p-3 me-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Building className="h-5 w-5" />
                </span>
                Tenant Selection
              </CardTitle>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-5 pb-2 pt-1">
                Select the tenant for which you want to configure the chatbot
              </p>

              <CardContent className="space-y-3">
                <label className="ms-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Tenant
                </label>

                <select
                  value={selectedTenant || ""}
                  onChange={(e) =>
                    setSelectedTenant(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className={inputClass}
                >
                  <option value="" className="dark:bg-[#111827]">
                    Select a tenant...
                  </option>
                  {tenants?.map((tenant) => (
                    <option
                      key={tenant.id}
                      value={tenant.id}
                      className="dark:bg-[#111827]"
                    >
                      {tenant.name} ({tenant.slug})
                    </option>
                  ))}
                </select>

                <p className="ms-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose a tenant to load and manage chatbot settings
                </p>
              </CardContent>
            </Card>
          )}

          {selectedTenant && (
            <div className="grid gap-6">
              {/* Widget Appearance */}
              <Card className={cardClass}>
                <CardTitle className="flex items-center px-5 py-5 text-gray-900 dark:text-gray-100">
                  <span className="p-3 me-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <Palette className="h-5 w-5" />
                  </span>
                  Widget Appearance
                </CardTitle>

                <CardContent className="space-y-5">
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chatbot Name<span className="text-red-500">*</span>
                        <span className="text-xs ms-2 font-normal text-gray-500 dark:text-gray-400">
                          (max 30 characters)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={config.chatbotName}
                        onChange={(e) =>
                          setConfig({ ...config, chatbotName: e.target.value })
                        }
                        maxLength={30}
                        className={`${inputClass} pr-16`}
                      />
                      <span className="pointer-events-none absolute right-3 top-[43px] text-xs text-gray-400 dark:text-gray-500">
                        {config.chatbotName?.length ?? 0}/30
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Widget Position
                      </label>
                      <select
                        value={config.widgetPosition}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            widgetPosition: e.target.value as
                              | "bottom-right"
                              | "bottom-left"
                              | "top-right"
                              | "top-left",
                          })
                        }
                        className={inputClass}
                      >
                        <option value="bottom-right" className="dark:bg-[#111827]">
                          Bottom Right
                        </option>
                        <option value="bottom-left" className="dark:bg-[#111827]">
                          Bottom Left
                        </option>
                        <option value="top-right" className="dark:bg-[#111827]">
                          Top Right
                        </option>
                        <option value="top-left" className="dark:bg-[#111827]">
                          Top Left
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Color
                      </label>

                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <input
                          id="primary-color"
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) =>
                            setConfig({ ...config, primaryColor: e.target.value })
                          }
                          className="sr-only"
                        />

                        <div
                          className="h-11 w-11 rounded-xl border border-white/10 shadow-inner"
                          style={{ backgroundColor: config.primaryColor }}
                        />

                        <label
                          htmlFor="primary-color"
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] cursor-pointer transition-colors"
                        >
                          <Palette className="h-4 w-4" />
                          Color Picker
                        </label>

                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-auto">
                          {config.primaryColor}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Placeholder Text
                      </label>
                      <input
                        type="text"
                        value={config.placeholderText || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            placeholderText: e.target.value,
                          })
                        }
                        className={inputClass}
                        placeholder="Type your message here..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Welcome Message<span className="text-red-500">*</span>
                      <span className="text-xs ms-2 font-normal text-gray-500 dark:text-gray-400">
                        (displayed when chatbot opens)
                      </span>
                    </label>
                    <textarea
                      value={config.welcomeMessage}
                      onChange={(e) =>
                        setConfig({ ...config, welcomeMessage: e.target.value })
                      }
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Widget Behavior */}
              <Card className={cardClass}>
                <CardTitle className="flex items-center px-5 py-5 text-gray-900 dark:text-gray-100">
                  <span className="p-3 me-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <SlidersHorizontal className="h-5 w-5" />
                  </span>
                  Widget Behavior
                </CardTitle>

                <CardContent className="space-y-4">
                  <Card className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show Avatar in Toggle
                          </label>
                          <p className="text-xs font-normal text-gray-600 dark:text-gray-400 mt-1">
                            Display chatbot avatar in the toggle button
                          </p>
                        </div>

                        <Toggle
                          checked={config.showAgentAvatar}
                          onChange={(checked) =>
                            setConfig({
                              ...config,
                              showAgentAvatar: checked,
                            })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Collect Contact & User Info
                          </label>
                          <p className="text-xs font-normal text-gray-600 dark:text-gray-400 mt-1">
                            Ask for user contact information before starting conversation
                          </p>
                        </div>

                        <Toggle
                          checked={config.collectUserInfo}
                          onChange={(checked) =>
                            setConfig({
                              ...config,
                              collectUserInfo: checked,
                            })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]">
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Maximum Input Length
                          </label>
                          <p className="text-xs font-normal text-gray-600 dark:text-gray-400 mt-1">
                            Set maximum character limit for user messages
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={1}
                            value={config.maxMessageLength}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                maxMessageLength: Number(e.target.value),
                              })
                            }
                            className="w-28 rounded-xl border border-gray-300 dark:border-white/10 px-3 py-2 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 transition-all focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            characters
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Configuration Summary */}
              <Card className={cardClass}>
                <CardTitle className="flex items-center px-5 py-5 text-gray-900 dark:text-gray-100">
                  <span className="p-3 me-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <ClipboardCheck className="h-5 w-5" />
                  </span>
                  Configuration Summary
                </CardTitle>

                <CardContent className="grid md:grid-cols-2 grid-cols-1 gap-6 mb-2">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="h-4 w-4 text-violet-500" />
                      <h2 className="font-medium text-gray-700 dark:text-gray-300">
                        Tenant & Appearance
                      </h2>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Tenant:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium text-right">
                          {selectedTenantDetails
                            ? `${selectedTenantDetails.name} (${selectedTenantDetails.slug})`
                            : "—"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Chatbot Name:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium text-right">
                          {config.chatbotName || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Primary Color:</span>
                        <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
                          <span
                            className="h-3 w-3 rounded-full border border-gray-200 dark:border-white/10"
                            style={{ backgroundColor: config.primaryColor }}
                          />
                          {config.primaryColor || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Widget Position:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium capitalize text-right">
                          {config.widgetPosition?.replace("-", " ") || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <SlidersHorizontal className="h-4 w-4 text-violet-500" />
                      <h2 className="font-medium text-gray-700 dark:text-gray-300">
                        Behavior Settings
                      </h2>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Show Avatar:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {config.showAgentAvatar ? "Yes" : "No"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Collect User Info:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {config.collectUserInfo ? "Yes" : "No"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Max Input Length:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {config.maxMessageLength} characters
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          {selectedTenant && (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:shadow-2xl sm:flex items-center justify-between gap-4">
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-3 sm:mb-0">
                Changes are applied when you click <span className="font-medium text-gray-700 dark:text-gray-300">Save Configuration</span>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={fetchConfig}
                  className="cursor-pointer rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  Reset
                </Button>

                <Button
                  variant="main"
                  onClick={handleSave}
                  isLoading={loading}
                  className="cursor-pointer rounded-xl primary-bg-color shadow-lg shadow-violet-500/20"
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <Loader />}
      {ToastComponent}
    </DashboardLayout>
  );
}