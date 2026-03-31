"use client";

import {
  Check,
  ArrowUpRight,
  BarChart2,
  Users,
  FileText,
  Code2,
  Eye,
  CreditCard,
  Brain,
  Zap,
  BookOpen,
  DollarSign,
  Sparkles,
  ChevronRight,
} from "lucide-react";

// Type

type SectionBadgeProps = {
  children: React.ReactNode;
};

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  green?: boolean;
};

/* ---------------------------------- */
/* DATA CONFIG */
/* ---------------------------------- */

const coreFeatures = [
  {
    icon: FileText,
    title: "Knowledge Base",
    desc: "Upload documents and build a structured knowledge layer for accurate, context-aware responses.",
    accent: "#6366f1",
    accentBg: "#eef2ff",
  },
  {
    icon: Brain,
    title: "Chatbot Configuration",
    desc: "Customize prompts, tone, branding, behavior, and advanced response settings with ease.",
    accent: "#8b5cf6",
    accentBg: "#f5f3ff",
  },
  {
    icon: Code2,
    title: "Widget Code Deployment",
    desc: "Deploy your chatbot anywhere using lightweight embed code with minimal setup.",
    accent: "#0ea5e9",
    accentBg: "#f0f9ff",
  },
  {
    icon: Eye,
    title: "Visitor Insights",
    desc: "Track visitor sessions, interactions, engagement trends, and chatbot usage quality.",
    accent: "#f59e0b",
    accentBg: "#fffbeb",
  },
  {
    icon: BarChart2,
    title: "Analytics & Reporting",
    desc: "Measure requests, response times, usage cost, token consumption, and overall performance.",
    accent: "#10b981",
    accentBg: "#ecfdf5",
  },
  {
    icon: Users,
    title: "Multi-Tenant Management",
    desc: "Manage workspaces, tenants, users, subscriptions, and role-based access from one platform.",
    accent: "#ef4444",
    accentBg: "#fef2f2",
  },
];

const analyticsStats = [
  {
    label: "Visitor Sessions",
    value: "5,812",
    change: "+18.4%",
    positive: true,
  },
  {
    label: "Avg Response Time",
    value: "1.1s",
    change: "Optimized",
    positive: true,
  },
  {
    label: "Engagement Rate",
    value: "72%",
    change: "Strong quality",
    positive: true,
  },
  { label: "Usage Cost", value: "$428", change: "Transparent", positive: true },
];

const enterpriseStats = [
  { label: "Workspaces", value: "12" },
  { label: "Active Users", value: "86" },
  { label: "System Health", value: "99.9%", green: true },
  { label: "Active Plans", value: "27" },
];

/* ---------------------------------- */
/* SUB-COMPONENTS */
/* ---------------------------------- */

function SectionBadge({ children }: SectionBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-semibold tracking-wide text-indigo-600 uppercase">
      <Sparkles size={11} />
      {children}
    </span>
  );
}

function StatCard({ label, value, change, positive, green }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <p className="relative text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`relative mt-2 text-3xl font-bold tracking-tight ${green ? "text-emerald-600" : "text-black/90"}`}
      >
        {value}
      </p>
      {change && (
        <p className="relative mt-1.5 text-xs font-medium text-emerald-600">
          {change}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------- */
/* MAIN COMPONENT */
/* ---------------------------------- */

export function Features() {
  return (
    <div className="bg-white">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/40 dark:bg-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/35 dark:bg-purple-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-400/25 dark:bg-blue-600/20 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute top-40 right-1/3 w-48 h-48 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-pulse delay-700"></div>
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#40404025_1px,transparent_1px),linear-gradient(to_bottom,#40404025_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-indigo-100/60 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-100/40 to-transparent blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <SectionBadge>ScopeAIChat Features</SectionBadge>
              <h1 className="mt-6 text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-black">
                Build, manage,and
                <span className="text-indigo-600"> scale AI experiences </span>
              </h1>
              <p className="mt-6 text-lg text-black/50 leading-relaxed max-w-lg">
                ScopeAIChat combines knowledge management, chatbot
                configuration, deployment, analytics, and multi-tenant
                administration in one unified platform.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  "Knowledge Base",
                  "Analytics",
                  "Multi-Tenant",
                  "Widget Deploy",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-sm font-medium text-black/60 shadow-sm"
                  >
                    <Check size={13} className="text-indigo-500" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Visual card stack */}
            <div className="flex justify-center md:justify-end">
              <img src="/images/features/hero-image.svg" alt="Hero" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURE GRID ─────────────────────────────── */}
      <section className="py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <SectionBadge>Core Features</SectionBadge>
            <h2 className="mt-5 text-4xl font-bold text-black">
              A complete AI platform
            </h2>
            <p className="mt-4 text-slate-500">
              Designed for startups, teams, tenant admins, and enterprise
              operations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-slate-200 bg-white p-7 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: f.accentBg }}
                >
                  <f.icon size={20} style={{ color: f.accent }} />
                </div>
                <h3 className="text-lg font-semibold text-black/90 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
                <div
                  className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: f.accent }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KNOWLEDGE BASE ────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionBadge>Knowledge Base & Documents</SectionBadge>
              <h2 className="mt-5 text-4xl font-bold text-slate-900 leading-tight">
                Train your chatbot
                <br />
                with the right knowledge
              </h2>
              <p className="mt-5 text-slate-500 leading-relaxed">
                Upload documents, organize content, and create a reliable source
                of truth for your chatbot. Improve answer quality and reduce
                irrelevant responses.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Upload PDFs, docs, and structured content",
                  "Organize knowledge for better context retrieval",
                  "Improve chatbot response accuracy",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-indigo-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-black/90">
                  Knowledge Snapshot
                </h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200">
                  ● Live
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Documents", value: "1,248" },
                  { label: "Sources", value: "36" },
                  { label: "Collections", value: "14" },
                  { label: "Sync Status", value: "Active", green: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-slate-50 border border-slate-100 p-5"
                  >
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p
                      className={`mt-2 text-3xl font-bold ${item.green ? "text-emerald-600" : "text-slate-900"}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHATBOT CONFIGURATION ─────────────────────────── */}
      <section className="py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual card — left */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl order-2 lg:order-1">
              <h3 className="text-xl font-bold text-black/90 mb-8">
                Configuration Controls
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    label: "Branding",
                    desc: "Logo, colors, widget appearance",
                    color: "bg-indigo-50 border-indigo-100 text-indigo-700",
                  },
                  {
                    label: "Prompt Logic",
                    desc: "Tone, behavior, response style",
                    color: "bg-amber-50 border-amber-100 text-amber-700",
                  },
                  {
                    label: "Context Rules",
                    desc: "Control how context is applied",
                    color: "bg-red-50 border-red-100 text-red-700",
                  },
                  {
                    label: "Advanced Settings",
                    desc: "Reusable admin-level controls",
                    color: "bg-sky-50 border-sky-100 text-sky-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border p-5 ${item.color.split(" ").slice(0, 2).join(" ")}`}
                  >
                    <p
                      className={`font-semibold text-sm ${item.color.split(" ")[2]}`}
                    >
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Text — right */}
            <div className="order-1 lg:order-2">
              <SectionBadge>Chatbot Configuration</SectionBadge>
              <h2 className="mt-5 text-4xl font-bold text-black/90 leading-tight">
                Control behavior,
                <br />
                branding, and experience
              </h2>
              <p className="mt-5 text-slate-500 leading-relaxed">
                Configure how your chatbot behaves, how it looks, and how it
                responds — without adding unnecessary complexity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WIDGET CODE ───────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="min-w-0 w-full">
              <SectionBadge>Widget Code Deployment</SectionBadge>
              <h2 className="mt-5 text-4xl font-bold text-slate-900 leading-tight">
                Deploy your chatbot
                <br />
                with a simple embed
              </h2>
              <p className="mt-5 text-slate-500 leading-relaxed">
                Launch your chatbot on websites and applications quickly with
                lightweight widget code that's easy to integrate.
              </p>

              {/* Code block */}
              <div className="mt-8 rounded-2xl bg-slate-900 overflow-hidden shadow-2xl w-full">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700/60">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-slate-400 font-mono">
                    embed.html
                  </span>
                </div>
                <div className="p-5 text-xs font-mono leading-6 overflow-x-auto w-full">
                  <pre className="text-slate-400">
                    {"<!-- Add before </body> -->"}
                  </pre>
                  <pre className="text-sky-400">
                    {"<script "}
                    <span className="text-emerald-400">src</span>
                    <span className="text-slate-300">
                      {'="https://cdn.scopeaichat.com/widget.js"'}
                    </span>
                    <span className="text-sky-400">{"></script>"}</span>
                  </pre>
                  <pre className="text-sky-400">{"<script>"}</pre>
                  <pre className="text-slate-300">
                    {"  ScopeAIChat."}
                    <span className="text-yellow-400">init</span>
                    <span className="text-slate-300">{"({ "}</span>
                    <span className="text-emerald-400">botId</span>
                    <span className="text-slate-300">{": "}</span>
                    <span className="text-orange-400">{'"your-bot-id"'}</span>
                    <span className="text-slate-300">{" });"}</span>
                  </pre>
                  <pre className="text-sky-400">{"</script>"}</pre>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <h3 className="text-xl font-bold text-black/90 mb-8">
                Deployment Benefits
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: Zap,
                    label: "Fast Setup",
                    desc: "Add the widget to your site in minutes with minimal code.",
                    color: "bg-amber-50 text-amber-600",
                  },
                  {
                    icon: Eye,
                    label: "Brand Ready",
                    desc: "Match widget appearance to your brand and customer experience.",
                    color: "bg-pink-50 text-pink-600",
                  },
                  {
                    icon: BarChart2,
                    label: "Scalable",
                    desc: "Works across multiple sites, tenants, and deployment environments.",
                    color: "bg-indigo-50 text-indigo-600",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color.split(" ")[0]}`}
                    >
                      <item.icon
                        size={17}
                        className={item.color.split(" ")[1]}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANALYTICS ─────────────────────────────────────── */}
      <section className="py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <SectionBadge>Insights & Analytics</SectionBadge>
            <h2 className="mt-5 text-4xl font-bold text-black/90">
              Understand performance beyond conversations
            </h2>
            <p className="mt-4 text-slate-500">
              Track what visitors do, how the chatbot responds, and how usage
              evolves over time.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-5 ">
            <div className="grid sm:grid-cols-2 gap-5">
              {analyticsStats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            {/* Mini chart bar visual */}
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-semibold text-black/90">
                    Weekly Activity
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chat sessions over 7 days
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200">
                  ↑ 18.4% vs last week
                </span>
              </div>
              <div className="flex items-end gap-2 h-20">
                {[40, 65, 50, 80, 70, 95, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-500 to-indigo-300 transition-all duration-300 hover:from-indigo-600 hover:to-indigo-400 cursor-pointer"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <p
                    key={d}
                    className="flex-1 text-center text-xs text-slate-400"
                  >
                    {d}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE ────────────────────────────────────── */}
      <section className="py-24  bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionBadge>Enterprise Controls</SectionBadge>
              <h2 className="mt-5 text-4xl font-bold text-slate-900 leading-tight">
                Built for reliability,
                <br />
                governance, and scale
              </h2>
              <p className="mt-5 text-slate-500 leading-relaxed">
                ScopeAIChat supports multi-tenant operations with strong admin
                controls, visibility, and platform-level reporting.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Multi-tenant and role-based access",
                  "System health monitoring and operational visibility",
                  "Active plan reports, usage tracking, and subscription oversight",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-indigo-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-black/90">
                  Platform Snapshot
                </h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200">
                  ● All systems operational
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {enterpriseStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-slate-50 border border-slate-100 p-5"
                  >
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p
                      className={`mt-2 text-3xl font-bold ${item.green ? "text-emerald-600" : "text-slate-900"}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
