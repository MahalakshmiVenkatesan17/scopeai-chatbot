import React from "react";
import {
  Eye,
  Palette,
  Plane,
  BarChart3,
  Users,
  BadgeCheck,
  Wallet,
  Activity,
  TrendingUp,
  Target,
  Coins,
  Gauge,
  Building2,
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  Database,
  MessageSquare,
  ArrowRight,
  Calendar,
  Settings,
  Shield,
  Bell,
  Download,
  Share2,
  Filter,
  ChevronRight,
  LineChart,
  PieChart,
  AreaChart,
  Layers,
  Brain,
  Cpu,
  Server,
  Cloud,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/common/Card";

const featureCards = [
  {
    title: "Real-time usage insights",
    description:
      "Monitor request activity, chatbot usage, and engagement signals as they happen.",
    icon: Activity,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "API request trends",
    description:
      "Understand traffic patterns over time to identify spikes, growth, or unexpected drops.",
    icon: TrendingUp,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Success rate tracking",
    description:
      "Keep an eye on delivery quality and ensure your AI assistant performs reliably.",
    icon: Target,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Token consumption monitoring",
    description:
      "Understand usage cost drivers and maintain visibility into model consumption patterns.",
    icon: Coins,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Performance metrics",
    description:
      "Track response speed, document processing, and session activity in one place.",
    icon: Gauge,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Multi-tenant visibility",
    description:
      "Analyze usage by tenant, workspace, or deployment to support enterprise customers at scale.",
    icon: Building2,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
];

export default function AnalyticsDashboard() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Hero Section */}
      <section
        id="overview"
        className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 dark:from-blue-950/20 dark:via-gray-950 dark:to-purple-950/20 transition-colors"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.14),transparent_25%),radial-gradient(circle_at_75%_45%,rgba(99,102,241,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.2),transparent_25%),radial-gradient(circle_at_75%_45%,rgba(99,102,241,0.15),transparent_25%)]"></div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          {/* Left */}
          <div>
            <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors">
              <Sparkles className="w-4 h-4 mr-2" />
              Product Feature • Analytics & Usage
            </div>

            <h1 className="pb-3 mt-6 text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent sm:text-5xl lg:text-6xl">
              Turn chatbot activity into actionable insights
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400 transition-colors">
              Measure every conversation, monitor request trends, track
              performance, and understand usage across tenants — all from one
              beautifully designed analytics dashboard built for modern AI
              teams.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#"
                className="inline-flex items-center rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                Start Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a
                href="#"
                className="inline-flex items-center rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Demo
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                  Request Visibility
                </p>
                <p className="mt-2 text-2xl font-bold dark:text-white">
                  3,001+
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>+24% this week</span>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                  Success Rate
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  98.93%
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>+2.1% improvement</span>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                  Fast Response
                </p>
                <p className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">
                  104ms
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <Zap className="w-3 h-3" />
                  <span>Optimized</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Dashboard Preview Mini */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-blue-200/40 to-purple-200/40 dark:from-blue-900/40 dark:to-purple-900/40 blur-3xl transition-all"></div>

            <div className="relative rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between border-b border-blue-50 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400"></span>
                  <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                  <span className="h-3 w-3 rounded-full bg-green-400"></span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-3 h-3 text-gray-400" />
                  <span className="rounded-xl bg-blue-50 dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Analytics Console
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-blue-50 dark:bg-gray-800/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold dark:text-white">
                        Analytics & Usage
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        TechCorp Solutions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    Last 30 Days
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 border-t-4 border-t-blue-500">
                    <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-500">
                      Requests
                    </p>
                    <p className="mt-2 text-xl font-bold dark:text-white">
                      3,001
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 border-t-4 border-t-emerald-500">
                    <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-500">
                      Success
                    </p>
                    <p className="mt-2 text-xl font-bold dark:text-white">
                      98.93%
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      API Requests
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Last 10 days
                    </p>
                  </div>
                  <div className="mt-3 h-28 rounded-lg bg-blue-50 dark:bg-gray-900 p-2">
                    <svg viewBox="0 0 500 120" className="h-full w-full">
                      <path
                        d="M 0 80 C 50 55, 90 30, 130 45 S 220 110, 280 75 S 360 20, 410 40 S 460 90, 500 70 L 500 120 L 0 120 Z"
                        fill="rgba(139,92,246,0.12)"
                      />
                      <path
                        d="M 0 80 C 50 55, 90 30, 130 45 S 220 110, 280 75 S 360 20, 410 40 S 460 90, 500 70"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-sky-100 dark:border-sky-900 bg-sky-50 dark:bg-sky-900/20 p-3">
                    <p className="text-[10px] uppercase text-gray-500 dark:text-gray-500">
                      Response
                    </p>
                    <p className="mt-2 text-sm font-bold text-sky-700 dark:text-sky-400">
                      104ms
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 p-3">
                    <p className="text-[10px] uppercase text-gray-500 dark:text-gray-500">
                      Docs
                    </p>
                    <p className="mt-2 text-sm font-bold text-blue-700 dark:text-gray-300">
                      0
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-3">
                    <p className="text-[10px] uppercase text-gray-500 dark:text-gray-500">
                      Sessions
                    </p>
                    <p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Marketing Highlights */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent sm:text-4xl">
              Built to make ScopeAIChat performance visible
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Showcase the same operational data your team sees internally —
              translated into clear, business-friendly visibility for growth,
              support, and performance.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold dark:text-white group-hover:text-blue-600 transition-colors">
                Request Volume Tracking
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Understand how many conversations and API calls your chatbot
                handles over time with trend visibility at a glance.
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold dark:text-white group-hover:text-blue-600 transition-colors">
                Active User Visibility
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                See how customers engage with your assistant and monitor usage
                across tenants, environments, or business units.
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold dark:text-white group-hover:text-emerald-600 transition-colors">
                Success Rate Monitoring
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Track how reliably your chatbot performs with response success
                metrics that help surface quality and delivery confidence.
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold dark:text-white group-hover:text-amber-600 transition-colors">
                Cost Transparency
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Keep token and infrastructure costs visible so teams can
                optimize AI operations without losing control of spend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Showcase */}
      <section id="dashboard-preview" className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-xl sm:p-8 lg:p-10 backdrop-blur-sm">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                <Eye className="w-4 h-4 mr-2" />
                Product Preview
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent sm:text-4xl">
                A clear view of your ScopeAIChat performance
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                This is how we showcase analytics on a marketing page: not by
                reproducing the full admin dashboard, but by presenting a
                polished product preview that highlights the most valuable
                insights customers care about.
              </p>
            </div>

            {/* Mockup */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-gray-800 shadow-lg">
              <div className="flex items-center justify-between border-b border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400"></span>
                  <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                  <span className="h-3 w-3 rounded-full bg-green-400"></span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="rounded-xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    TechCorp Solutions
                  </span>
                  <span className="rounded-xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Last 30 Days
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                {/* Preview Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold dark:text-white">
                        Analytics & Dashboard
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Viewing data for: TechCorp Solutions
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    <Shield className="w-3 h-3 mr-1" />
                    Enterprise Insights
                  </span>
                </div>

                {/* KPI Row */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm border-t-4 border-t-blue-500">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                          Total Requests
                        </p>
                        <p className="mt-3 text-3xl font-bold tracking-tight dark:text-white">
                          3,001
                        </p>
                      </div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm border-t-4 border-t-gray-500">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                          Active Users
                        </p>
                        <p className="mt-3 text-3xl font-bold tracking-tight dark:text-white">
                          0
                        </p>
                      </div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm border-t-4 border-t-emerald-500">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                          Success Rate
                        </p>
                        <p className="mt-3 text-3xl font-bold tracking-tight dark:text-white">
                          98.93%
                        </p>
                      </div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm border-t-4 border-t-orange-500">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                          Total Cost
                        </p>
                        <p className="mt-3 text-3xl font-bold tracking-tight dark:text-white">
                          $0.00
                        </p>
                      </div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <Wallet className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Preview */}
                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div className="rounded-2xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
                    <div>
                      <h4 className="text-lg font-bold dark:text-white">
                        API Requests Over Time
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                        Last 10 days
                      </p>
                    </div>

                    <div className="mt-5 h-[280px] rounded-xl border border-blue-50 dark:border-gray-800 bg-blue-50 dark:bg-gray-800/50 p-4">
                      <div className="relative h-full w-full">
                        <div className="absolute inset-0 flex flex-col justify-between">
                          <div className="border-t border-dashed border-blue-100 dark:border-gray-700"></div>
                          <div className="border-t border-dashed border-blue-100 dark:border-gray-700"></div>
                          <div className="border-t border-dashed border-blue-100 dark:border-gray-700"></div>
                          <div className="border-t border-dashed border-blue-100 dark:border-gray-700"></div>
                          <div className="border-t border-dashed border-blue-100 dark:border-gray-700"></div>
                        </div>

                        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-gray-400 dark:text-gray-500">
                          <span>1000</span>
                          <span>750</span>
                          <span>500</span>
                          <span>250</span>
                          <span>0</span>
                        </div>

                        <div className="absolute inset-x-8 top-2 bottom-8">
                          <svg viewBox="0 0 1000 300" className="h-full w-full">
                            <path
                              d="M 0 190 C 70 140, 120 90, 180 130 S 280 250, 350 220 S 460 250, 550 220 S 650 40, 720 60 S 810 280, 880 220 S 940 180, 1000 200 L 1000 300 L 0 300 Z"
                              fill="rgba(139,92,246,0.12)"
                            />
                            <path
                              d="M 0 190 C 70 140, 120 90, 180 130 S 280 250, 350 220 S 460 250, 550 220 S 650 40, 720 60 S 810 280, 880 220 S 940 180, 1000 200"
                              fill="none"
                              stroke="#7c3aed"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <div className="absolute inset-x-8 bottom-0 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                          <span>Mar 11</span>
                          <span>Mar 12</span>
                          <span>Mar 13</span>
                          <span>Mar 16</span>
                          <span>Mar 17</span>
                          <span>Mar 18</span>
                          <span>Mar 19</span>
                          <span>Mar 20</span>
                          <span>Mar 23</span>
                          <span>Mar 27</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
                    <div>
                      <h4 className="text-lg font-bold dark:text-white">
                        Token Usage
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                        Last 0 days
                      </p>
                    </div>

                    <div className="mt-5 flex h-[280px] items-center justify-center rounded-xl border border-blue-50 dark:border-gray-800 bg-blue-50 dark:bg-gray-800">
                      <div className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500">
                          <Coins className="w-6 h-6" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-500">
                          No data available
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mt-6 rounded-2xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold dark:text-white">
                        Performance Metrics
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Core operational performance indicators
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-sky-100 dark:border-sky-900 bg-sky-50 dark:bg-sky-900/20 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                        Avg Response Time
                      </p>
                      <p className="mt-4 text-3xl font-bold tracking-tight text-sky-700 dark:text-sky-400">
                        104.4895ms
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-blue-50 dark:bg-gray-800 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                        Documents Processed
                      </p>
                      <p className="mt-4 text-3xl font-bold tracking-tight text-blue-700 dark:text-white">
                        0
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                        Chat Sessions
                      </p>
                      <p className="mt-4 text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                        0
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold dark:text-white">
                        Summary
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Usage snapshot for the selected date range
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-blue-50 dark:border-gray-800 bg-blue-50 dark:bg-gray-800 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                        Total Token Usage
                      </p>
                      <p className="mt-3 text-2xl font-bold dark:text-white">
                        0
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-50 dark:border-gray-800 bg-blue-50 dark:bg-gray-800 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                        Data Tracked
                      </p>
                      <p className="mt-3 text-2xl font-bold dark:text-white">
                        30 days
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-50 dark:border-gray-800 bg-blue-50 dark:bg-gray-800 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                        Period
                      </p>
                      <p className="mt-3 text-2xl font-bold dark:text-white">
                        30d
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explain why */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-5 shadow-sm backdrop-blur-sm">
                <h3 className="font-bold dark:text-white">
                  Show the product, not the admin shell
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Use focused product mockups instead of full sidebars, filters,
                  or internal operator controls.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-5 shadow-sm backdrop-blur-sm">
                <h3 className="font-bold dark:text-white">
                  Lead with outcomes
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Market what customers gain: performance visibility, usage
                  insights, and operational confidence.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-5 shadow-sm backdrop-blur-sm">
                <h3 className="font-bold dark:text-white">
                  Use real UI as proof
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  A realistic dashboard preview builds trust and makes the
                  feature feel tangible and enterprise-ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Capabilities */}
      <section id="capabilities" className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent sm:text-4xl">
              Everything your team needs to measure AI performance
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Built for operators, product teams, and customer success teams
              that need reliable visibility into chatbot behavior at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight dark:text-white group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Performance Insights Section */}
      <section id="insights" className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-8 shadow-xl lg:p-10 backdrop-blur-sm">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                <Zap className="w-4 h-4 mr-2" />
                Operational Insight
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent sm:text-4xl">
                Performance visibility that scales with your AI product
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Analytics isn't just about charts — it's about knowing how your
                chatbot behaves in production and giving teams the confidence to
                optimize faster.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-sky-100 dark:border-sky-900 bg-sky-50 dark:bg-sky-900/20 p-6 hover:shadow-lg transition-all">
                <Clock className="w-8 h-8 text-sky-600 dark:text-sky-400 mb-3" />
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                  Avg Response Time
                </p>
                <p className="mt-2 text-5xl font-bold tracking-tight text-sky-700 dark:text-sky-400">
                  104.4ms
                </p>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Monitor how quickly your assistant responds to users and
                  detect latency regressions before they impact experience.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-blue-50 dark:bg-gray-800 p-6 hover:shadow-lg transition-all">
                <Database className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                  Documents Processed
                </p>
                <p className="mt-2 text-5xl font-bold tracking-tight text-blue-700 dark:text-white">
                  0
                </p>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Track how your knowledge base and document workflows
                  contribute to chatbot performance and response quality.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-6 hover:shadow-lg transition-all">
                <MessageSquare className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                  Chat Sessions
                </p>
                <p className="mt-2 text-5xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                  0
                </p>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Understand how many active sessions are happening and how user
                  engagement evolves across time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
