"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Code,
  ExternalLink,
  Building,
  Atom,
  Layers,
  Settings,
  Terminal,
  Star,
  PackageOpen,
  Shield,
  SlidersHorizontal,
  AlertCircle,
  GitBranch,
  Network,
  RefreshCw,
  Zap,
  Bot,
  Sparkles,
  Globe,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/api-client";
import type { Tenant } from "@/types";
import { useAuthStore } from "@/store/auth-store";

function CodeBlock({
  code,
  onCopy,
  copied,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0b1220]/80 shadow-inner">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onCopy}
          className="rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/[0.03]"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </>
          )}
        </Button>
      </div>

      <pre className="p-4 text-sm text-gray-900 dark:text-gray-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:shadow-xl hover:shadow-2xl transition-all">
      <CardContent className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold mb-4 shadow-lg shadow-violet-500/20">
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-6">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function FeatureItem({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WidgetIntegrationPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: loggedInUser } = useAuthStore();

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (!loggedInUser || tenants.length === 0) return;

    if (loggedInUser.role === "tenant_admin") {
      const userTenant = tenants.find((t) => t.id === loggedInUser.tenant_id);
      if (userTenant) setSelectedTenant(userTenant);
    }
  }, [loggedInUser, tenants]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getTenants({ page: 1, limit: 100 });
      setTenants(
        response.items?.filter((t: any) => t.status !== "suspended") || [],
      );
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getApiUrl = () => {
    return (
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      "https://api-scopeaichat.scopethinkers.ai/api/v1"
    );
  };

  const getFrontendUrl = () => {
    return (
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      "https://frontend-scopeaichat.scopethinkers.ai/"
    );
  };

  const getWidgetScriptUrl = () => {
    return `${getFrontendUrl()}/widget.js`;
  };

  const getBasicIntegrationCode = () => {
    if (!selectedTenant) return "";

    return `<!-- ScopeAIChat Widget -->
<script>
  window.AIChatbotConfig = {
    tenant: '${selectedTenant.slug}',
    apiUrl: '${getApiUrl()}'
  };
</script>
<script src="${getWidgetScriptUrl()}" async></script>`;
  };

  const getAdvancedIntegrationCode = () => {
    if (!selectedTenant) return "";

    return `<!-- ScopeAIChat Widget - Advanced Configuration -->
<script>
  window.AIChatbotConfig = {
    tenant: '${selectedTenant.slug}',
    apiUrl: '${getApiUrl()}',

    // Optional: Override default styling
    customCSS: \`
      .chatbot-widget {
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      }
    \`,

    // Optional: Event callbacks
    onLoad: function() {
      console.log('Chatbot widget loaded');
    },
    onOpen: function() {
      console.log('Chatbot opened');
    },
    onClose: function() {
      console.log('Chatbot closed');
    },
    onMessage: function(message, response) {
      console.log('Message sent:', message);
      console.log('Response received:', response);
    }
  };
</script>
<script src="${getWidgetScriptUrl()}" async></script>`;
  };

  const getReactIntegrationCode = () => {
    if (!selectedTenant) return "";

    return `// React Component Integration
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    window.AIChatbotConfig = {
      tenant: '${selectedTenant.slug}',
      apiUrl: '${getApiUrl()}'
    };

    const script = document.createElement('script');
    script.src = '${getWidgetScriptUrl()}';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  );
}

export default App;`;
  };

  const getNextJsIntegrationCode = () => {
    if (!selectedTenant) return "";

    return `// Next.js Integration (app/layout.tsx or pages/_app.tsx)
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}

        <Script
          id="chatbot-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: \`
              window.AIChatbotConfig = {
                tenant: '${selectedTenant.slug}',
                apiUrl: '${getApiUrl()}'
              };
            \`
          }}
        />
        <Script
          src="${getWidgetScriptUrl()}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`;
  };

  const getCurlTestCommand = () => {
    if (!selectedTenant) return "";

    return `# Test configuration endpoint
curl -X GET "${getApiUrl()}/public/chat/config/${selectedTenant.slug}"

# Expected response:
# {
#   "success": true,
#   "data": {
#     "chatbot_name": "AI Assistant",
#     "welcome_message": "Hello! How can I help you?",
#     "primary_color": "#8B5CF6",
#     "widget_position": "bottom-right"
#   }
# }`;
  };

  const isTenantAdmin = (loggedInUser?.role as string) === "tenant_admin";

  const shellCard =
    "rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:shadow-2xl";

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
          <div className={shellCard + " p-5"}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                  <Bot className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Widget Integration
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Copy the integration code and embed the chatbot widget on
                    your website
                  </p>
                </div>
              </div>

              {/* <Button
                variant="secondary"
                onClick={fetchTenants}
                className="rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button> */}
            </div>
          </div>

          {loading ? (
            <Card className={shellCard}>
              <CardContent>
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500"></div>
                      <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-md" />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Loading integration details...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Tenant Selection */}
              {!isTenantAdmin && (
                <Card className={shellCard}>
                  <CardTitle className="flex items-center px-5 pt-5 text-gray-900 dark:text-gray-100">
                    <span className="p-3 me-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                      <Building className="h-5 w-5" />
                    </span>
                    Select Tenant
                  </CardTitle>

                  <CardContent className="space-y-4">
                    <select
                      value={selectedTenant?.id || ""}
                      onChange={(e) => {
                        const tenant = tenants.find(
                          (t) => t.id === Number(e.target.value),
                        );
                        setSelectedTenant(tenant || null);
                      }}
                      className="w-full rounded-xl border border-gray-300 dark:border-white/10 px-4 py-3 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 transition-colors focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] focus:outline-none"
                    >
                      <option value="" className="dark:bg-[#111827]">
                        Select a tenant...
                      </option>
                      {tenants.map((tenant) => (
                        <option
                          key={tenant.id}
                          value={tenant.id}
                          className="dark:bg-[#111827]"
                        >
                          {tenant.name} ({tenant.slug})
                        </option>
                      ))}
                    </select>

                    {selectedTenant && (
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Slug
                          </div>
                          <code className="text-sm font-semibold text-violet-700 dark:text-violet-300 break-all">
                            {selectedTenant.slug}
                          </code>
                        </div>

                        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Tenant
                          </div>
                          <code className="text-sm font-semibold text-violet-700 dark:text-violet-300 break-all">
                            {selectedTenant.name}
                          </code>
                        </div>

                        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Widget Script URL
                          </div>
                          <code className="text-sm font-semibold text-violet-700 dark:text-violet-300 break-all">
                            {getWidgetScriptUrl()}
                          </code>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedTenant && (
                <>
                  {/* Active Tenant Badge for tenant_admin too */}
                  {isTenantAdmin && (
                    <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300">
                      <Sparkles className="h-4 w-4" />
                      Active Tenant: {selectedTenant.name} (
                      {selectedTenant.slug})
                    </div>
                  )}

                  {/* Quick Start */}
                  <div className="grid lg:grid-cols-3 gap-4">
                    <InfoCard
                      icon={<span>1</span>}
                      title="Configure Your Chatbot"
                      description="Go to Chatbot Configuration and customize appearance, behavior, welcome messages, colors, and knowledge base settings for your chatbot."
                    />

                    <InfoCard
                      icon={<span>2</span>}
                      title="Copy the Integration Code"
                      description="Choose the correct code snippet for your stack (HTML, React, Next.js). It already includes your tenant slug and API endpoint."
                    />

                    <InfoCard
                      icon={<span>3</span>}
                      title="Add to Your Website"
                      description="Paste the code before the closing </body> tag, or place it inside your framework layout. The widget loads asynchronously."
                    />
                  </div>

                  <div className="flex justify-start">
                    <a
                      href="/chatbot-config"
                      className="inline-flex items-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 me-2" />
                      Open Chatbot Configuration
                    </a>
                  </div>

                  {/* Basic Integration */}
                  <Card className={shellCard}>
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <span className="p-3 me-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                          <Code className="h-5 w-5" />
                        </span>
                        Basic HTML Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        For vanilla HTML websites. Add this code before the
                        closing{" "}
                        <code className="rounded bg-gray-100 dark:bg-white/[0.05] px-1.5 py-0.5">
                          &lt;/body&gt;
                        </code>{" "}
                        tag.
                      </p>

                      <CodeBlock
                        code={getBasicIntegrationCode()}
                        copied={copiedSection === "basic"}
                        onCopy={() =>
                          handleCopy(getBasicIntegrationCode(), "basic")
                        }
                      />
                    </CardContent>
                  </Card>

                  {/* React */}
                  <Card className={shellCard}>
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <span className="p-3 me-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                          <Atom className="h-5 w-5" />
                        </span>
                        React Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        For React applications. Add this to your main App
                        component or layout.
                      </p>

                      <CodeBlock
                        code={getReactIntegrationCode()}
                        copied={copiedSection === "react"}
                        onCopy={() =>
                          handleCopy(getReactIntegrationCode(), "react")
                        }
                      />
                    </CardContent>
                  </Card>

                  {/* Next.js */}
                  <Card className={shellCard}>
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <span className="p-3 me-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                          <Layers className="h-5 w-5" />
                        </span>
                        Next.js Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        For Next.js applications (App Router or Pages Router).
                        Add this to your root layout.
                      </p>

                      <CodeBlock
                        code={getNextJsIntegrationCode()}
                        copied={copiedSection === "nextjs"}
                        onCopy={() =>
                          handleCopy(getNextJsIntegrationCode(), "nextjs")
                        }
                      />
                    </CardContent>
                  </Card>

                  {/* Advanced */}
                  <Card className={shellCard}>
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <span className="p-3 me-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                          <Settings className="h-5 w-5" />
                        </span>
                        Advanced Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        With custom styling, event callbacks, and analytics
                        integration.
                      </p>

                      <CodeBlock
                        code={getAdvancedIntegrationCode()}
                        copied={copiedSection === "advanced"}
                        onCopy={() =>
                          handleCopy(getAdvancedIntegrationCode(), "advanced")
                        }
                      />
                    </CardContent>
                  </Card>

                  <div className="xl:grid grid-cols-2 gap-5">
                    {/* Testing */}
                    <Card className={shellCard}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <span className="p-3 me-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                            <Terminal className="h-5 w-5" />
                          </span>
                          Test Configuration
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Test your chatbot configuration using curl or directly
                          in the browser.
                        </p>

                        <CodeBlock
                          code={getCurlTestCommand()}
                          copied={copiedSection === "curl"}
                          onCopy={() =>
                            handleCopy(getCurlTestCommand(), "curl")
                          }
                        />

                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={`${getApiUrl()}/public/chat/config/${selectedTenant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Test in Browser
                          </a>

                          {/* <a
                            href={getWidgetScriptUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Open widget.js
                          </a> */}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Features */}
                    <Card className={shellCard}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <span className="p-3 me-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                            <Star className="h-5 w-5" />
                          </span>
                          <div>
                            <p>Widget Features</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                              Everything included out of the box
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <PackageOpen className="w-5 h-5 text-violet-500" />
                            Out of the Box
                          </h4>

                          <div className="space-y-3">
                            <FeatureItem
                              title="No authentication required"
                              desc="Zero setup for end users"
                              icon={<Shield className="w-5 h-5" />}
                            />
                            <FeatureItem
                              title="Fully responsive"
                              desc="Mobile, tablet, and desktop ready"
                              icon={<Shield className="w-5 h-5" />}
                            />
                            <FeatureItem
                              title="Customizable appearance"
                              desc="Match your brand colors and style"
                              icon={<Shield className="w-5 h-5" />}
                            />
                            <FeatureItem
                              title="Session persistence"
                              desc="Keeps context across page reloads"
                              icon={<Shield className="w-5 h-5" />}
                            />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <SlidersHorizontal className="h-5 w-5 text-orange-500" />
                            Customization
                          </h4>

                          <div className="flex flex-wrap gap-3">
                            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                              Brand colors
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                              Welcome messages
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                              Widget position
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-xs font-semibold">
                              Custom CSS
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Important Notes */}
                  <Card className={shellCard}>
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <span className="p-3 me-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/20">
                          <AlertCircle className="h-5 w-5" />
                        </span>
                        <div>
                          <p>Important Notes</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                            Things to keep in mind
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <FeatureItem
                        title="CORS Configuration"
                        desc="Make sure your domain is allowed in backend CORS settings for cross-origin requests."
                        icon={<GitBranch className="w-5 h-5" />}
                      />

                      <FeatureItem
                        title="Asynchronous Loading"
                        desc="The widget loads asynchronously and will not block your page render."
                        icon={<Network className="w-5 h-5" />}
                      />

                      <FeatureItem
                        title="Automatic Updates"
                        desc="The widget uses the latest tenant configuration automatically from the admin panel."
                        icon={<RefreshCw className="w-5 h-5" />}
                      />

                      <FeatureItem
                        title="Need Help?"
                        desc="Use the chatbot configuration page to adjust colors, messages, and behavior."
                        icon={<Zap className="w-5 h-5" />}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
