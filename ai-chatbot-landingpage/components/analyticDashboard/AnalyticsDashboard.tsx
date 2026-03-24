import React from "react";
import { Eye, Palette, Plane,BarChart3,
  Users,
  BadgeCheck,
  Wallet,Activity,
  TrendingUp,
  Target,
  Coins,
  Gauge,
  Building2 } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/common/Card";

const featureCards = [
  {
    title: "Real-time usage insights",
    description:
      "Monitor request activity, chatbot usage, and engagement signals as they happen.",
    icon: Activity,
    iconBg: "bg-[var(--foundation-blue-blue-100)]",
    iconColor: "text-[var(--foundation-blue-blue-600)]",
  },
  {
    title: "API request trends",
    description:
      "Understand traffic patterns over time to identify spikes, growth, or unexpected drops.",
    icon: TrendingUp,
    iconBg: "bg-[var(--foundation-blue-blue-100)]",
    iconColor: "text-[var(--foundation-blue-blue-600)]",
  },
  {
    title: "Success rate tracking",
    description:
      "Keep an eye on delivery quality and ensure your AI assistant performs reliably.",
    icon: Target,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Token consumption monitoring",
    description:
      "Understand usage cost drivers and maintain visibility into model consumption patterns.",
    icon: Coins,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    title: "Performance metrics",
    description:
      "Track response speed, document processing, and session activity in one place.",
    icon: Gauge,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Multi-tenant visibility",
    description:
      "Analyze usage by tenant, workspace, or deployment to support enterprise customers at scale.",
    icon: Building2,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
];

export default function AnalyticsDashboard() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* <!-- Hero --> */}
  <section id="overview" className="relative overflow-hidden bg-gradient-to-br from-[var(--foundation-blue-blue-50)] via-white to-brand-50">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.14),transparent_25%),radial-gradient(circle_at_75%_45%,rgba(99,102,241,0.10),transparent_25%)]"></div>

    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
      {/* <!-- Left --> */}
      <div>
        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          Product Feature • Analytics & Usage
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Turn chatbot activity into actionable insight
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Measure every conversation, monitor request trends, track performance, and understand usage across tenants — all from one beautifully designed analytics dashboard built for modern AI teams.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a href="#" className="inline-flex items-center rounded-2xl bg-[var(--foundation-blue-blue-600)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition">
            Start Free
          </a>
          <a href="#" className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[var(--foundation-blue-blue-50)] transition">
            View Demo
          </a>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--foundation-blue-blue-100)] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Request Visibility</p>
            <p className="mt-2 text-2xl font-bold">3,001+</p>
          </div>
          <div className="rounded-2xl border border-[var(--foundation-blue-blue-100)] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Success Rate</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">98.93%</p>
          </div>
          <div className="rounded-2xl border border-[var(--foundation-blue-blue-100)] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Fast Response</p>
            <p className="mt-2 text-2xl font-bold text-sky-600">104ms</p>
          </div>
        </div>
      </div>

      {/* <!-- Right Dashboard Preview Mini --> */}
      <div className="relative">
        <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-200/40 to-[var(--foundation--blue-blue-200)]/40 blur-3xl"></div>

        <div className="relative rounded-[2rem] border border-[var(--foundation-blue-blue-100)] bg-white p-4 shadow-glow">
          {/* <!-- mock browser top --> */}
          <div className="flex items-center justify-between border-b border-[var(--foundation-blue-blue-50)] pb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400"></span>
              <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
              <span className="h-3 w-3 rounded-full bg-green-400"></span>
            </div>
            <span className="rounded-xl bg-[var(--foundation-blue-blue-50)] px-3 py-1.5 text-xs font-semibold text-slate-600">Analytics Console</span>
          </div>

          <div className="mt-4 rounded-3xl bg-[var(--foundation-blue-blue-50)] p-4">
            {/* <!-- header --> */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-[var(--foundation-blue-blue-600)] text-white shadow-soft">
                  📊
                </div>
                <div>
                  <p className="font-bold">Analytics & Usage</p>
                  <p className="text-xs text-[var(--foundation-blue-blue-50)]0">TechCorp Solutions</p>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--foundation-blue-blue-100)] bg-white px-3 py-2 text-xs font-medium text-slate-600">
                Last 30 Days
              </div>
            </div>

            {/* <!-- KPI mini --> */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--foundation-blue-blue-100)] bg-white p-3 border-t-4 border-t-brand-500">
                <p className="text-[10px] font-semibold uppercase text-[var(--foundation-blue-blue-50)]0">Requests</p>
                <p className="mt-2 text-xl font-bold">3,001</p>
              </div>
              <div className="rounded-2xl border border-[var(--foundation-blue-blue-100)] bg-white p-3 border-t-4 border-t-emerald-500">
                <p className="text-[10px] font-semibold uppercase text-[var(--foundation-blue-blue-50)]0">Success</p>
                <p className="mt-2 text-xl font-bold">98.93%</p>
              </div>
            </div>

            {/* <!-- mini chart --> */}
            <div className="mt-4 rounded-2xl border border-[var(--foundation-blue-blue-100)] bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">API Requests</p>
                <p className="text-[10px] text-slate-400">Last 10 days</p>
              </div>
              <div className="mt-3 h-28 rounded-xl bg-[var(--foundation-blue-blue-50)] p-2">
                <svg viewBox="0 0 500 120" className="h-full w-full">
                  <path
                    d="M 0 80 C 50 55, 90 30, 130 45 S 220 110, 280 75 S 360 20, 410 40 S 460 90, 500 70 L 500 120 L 0 120 Z"
                    fill="rgba(139,92,246,0.12)"
                  />
                  <path
                    d="M 0 80 C 50 55, 90 30, 130 45 S 220 110, 280 75 S 360 20, 410 40 S 460 90, 500 70"
                    fill="none"
                    stroke="#7c3aed"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* <!-- bottom metrics --> */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
                <p className="text-[10px] uppercase text-[var(--foundation-blue-blue-50)]0">Response</p>
                <p className="mt-2 text-sm font-bold text-sky-700">104ms</p>
              </div>
              <div className="rounded-2xl border border-[var(--foundation-blue-blue-100)] bg-[var(--foundation-blue-blue-50)] p-3">
                <p className="text-[10px] uppercase text-[var(--foundation-blue-blue-50)]0">Docs</p>
                <p className="mt-2 text-sm font-bold text-[var(--foundation--blue-blue-700)]">0</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[10px] uppercase text-[var(--foundation-blue-blue-50)]0">Sessions</p>
                <p className="mt-2 text-sm font-bold text-emerald-700">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* <!-- KPI Marketing Highlights --> */}
  <section className="py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Built to make AI chatbot performance measurable
        </h2>
        <p className="mt-3 text-lg text-slate-600">
          Showcase the same operational data your team sees internally — translated into clear, business-friendly visibility for growth, support, and performance.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card hover:-translate-y-1 hover:shadow-soft transition">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--foundation-blue-blue-100)] text-[var(--foundation-blue-blue-600)]">
      <BarChart3 className="h-5 w-5" />
    </div>
          <h3 className="mt-5 text-xl font-bold">Request Volume Tracking</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Understand how many conversations and API calls your chatbot handles over time with trend visibility at a glance.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card hover:-translate-y-1 hover:shadow-soft transition">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--foundation-blue-blue-100)] text-[var(--foundation-blue-blue-600)]">
      <Users className="h-5 w-5" />
    </div>
          <h3 className="mt-5 text-xl font-bold">Active User Visibility</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            See how customers engage with your assistant and monitor usage across tenants, environments, or business units.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card hover:-translate-y-1 hover:shadow-soft transition">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
      <BadgeCheck className="h-5 w-5" />
    </div>
          <h3 className="mt-5 text-xl font-bold">Success Rate Monitoring</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Track how reliably your chatbot performs with response success metrics that help surface quality and delivery confidence.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card hover:-translate-y-1 hover:shadow-soft transition">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
      <Wallet className="h-5 w-5" />
    </div>
          <h3 className="mt-5 text-xl font-bold">Cost Transparency</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Keep token and infrastructure costs visible so teams can optimize AI operations without losing control of spend.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* <!-- Dashboard Preview Showcase --> */}
  <section id="dashboard-preview" className="pb-16 sm:pb-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            Product Preview
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A clear view of your AI chatbot performance
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            This is how we showcase analytics on a marketing page: not by reproducing the full admin dashboard, but by presenting a polished product preview that highlights the most valuable insights customers care about.
          </p>
        </div>

        {/* <!-- Mockup --> */}
        <div className="mt-10 overflow-hidden rounded-[2rem] border border-[var(--foundation-blue-blue-100)] bg-[var(--foundation-blue-blue-50)] shadow-soft">
          <div className="flex items-center justify-between border-b border-[var(--foundation-blue-blue-100)] bg-white px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400"></span>
              <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
              <span className="h-3 w-3 rounded-full bg-green-400"></span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="rounded-xl border border-[var(--foundation-blue-blue-100)] bg-white px-3 py-2 text-xs font-medium text-slate-600">TechCorp Solutions</span>
              <span className="rounded-xl border border-[var(--foundation-blue-blue-100)] bg-white px-3 py-2 text-xs font-medium text-slate-600">Last 30 Days</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            {/* <!-- Preview Header --> */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-[var(--foundation-blue-blue-600)] text-white shadow-soft text-xl">
                  📊
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Analytics & Usage</h3>
                  <p className="text-sm text-[var(--foundation-blue-blue-50)]0">Viewing data for: TechCorp Solutions</p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
                Enterprise Insights
              </span>
            </div>

            {/* <!-- KPI Row --> */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm border-t-4 border-t-brand-500">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Total Requests</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight">3,001</p>
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--foundation-blue-blue-100)] text-[var(--foundation-blue-blue-600)]">
      <BarChart3 className="h-5 w-5" />
    </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm border-t-4 border-t-[var(--foundation-blue-blue-50)]0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Active Users</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight">0</p>
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--foundation-blue-blue-100)] text-[var(--foundation-blue-blue-600)]">
      <Users className="h-5 w-5" />
    </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm border-t-4 border-t-emerald-500">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Success Rate</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight">98.93%</p>
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
      <BadgeCheck className="h-5 w-5" />
    </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm border-t-4 border-t-orange-500">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Total Cost</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight">$0.00</p>
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
      <Wallet className="h-5 w-5" />
    </div>
                </div>
              </div>
            </div>

            {/* <!-- Charts Preview --> */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* <!-- API Requests --> */}
              <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm">
                <div>
                  <h4 className="text-lg font-bold">API Requests Over Time</h4>
                  <p className="mt-1 text-sm text-[var(--foundation-blue-blue-50)]0">Last 10 days</p>
                </div>

                <div className="mt-5 h-[280px] rounded-2xl border border-[var(--foundation-blue-blue-50)] bg-[var(--foundation-blue-blue-50)] p-4">
                  <div className="relative h-full w-full">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      <div className="border-t border-dashed border-[var(--foundation-blue-blue-100)]"></div>
                      <div className="border-t border-dashed border-[var(--foundation-blue-blue-100)]"></div>
                      <div className="border-t border-dashed border-[var(--foundation-blue-blue-100)]"></div>
                      <div className="border-t border-dashed border-[var(--foundation-blue-blue-100)]"></div>
                      <div className="border-t border-dashed border-[var(--foundation-blue-blue-100)]"></div>
                    </div>

                    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-slate-400">
                      <span>1000</span>
                      <span>750</span>
                      <span>500</span>
                      <span>250</span>
                      <span>0</span>
                    </div>

                    <div className="absolute inset-x-8 top-2 bottom-8">
                      <svg viewBox="0 0 1000 300" className="h-full w-full">
                        <path
                          d="M 0 190
                             C 70 140, 120 90, 180 130
                             S 280 250, 350 220
                             S 460 250, 550 220
                             S 650 40, 720 60
                             S 810 280, 880 220
                             S 940 180, 1000 200
                             L 1000 300 L 0 300 Z"
                          fill="rgba(139,92,246,0.12)"
                        />
                        <path
                          d="M 0 190
                             C 70 140, 120 90, 180 130
                             S 280 250, 350 220
                             S 460 250, 550 220
                             S 650 40, 720 60
                             S 810 280, 880 220
                             S 940 180, 1000 200"
                          fill="none"
                          stroke="#7c3aed"
                          stroke-width="4"
                          stroke-linecap="round"
                        />
                      </svg>
                    </div>

                    <div className="absolute inset-x-8 bottom-0 flex justify-between text-[10px] text-slate-400">
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

              {/* <!-- Token Usage --> */}
              <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm">
                <div>
                  <h4 className="text-lg font-bold">Token Usage</h4>
                  <p className="mt-1 text-sm text-[var(--foundation-blue-blue-50)]0">Last 0 days</p>
                </div>

                <div className="mt-5 flex h-[280px] items-center justify-center rounded-2xl border border-[var(--foundation-blue-blue-50)] bg-[var(--foundation-blue-blue-50)]">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--foundation-blue-blue-100)] text-[var(--foundation-blue-blue-50)]0">
                      ∅
                    </div>
                    <p className="mt-4 text-sm font-medium text-[var(--foundation-blue-blue-50)]0">No data available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- Performance Metrics --> */}
            <div className="mt-6 rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-[var(--foundation-blue-blue-600)] text-white shadow-soft">
                  ⚙
                </div>
                <div>
                  <h4 className="text-lg font-bold">Performance Metrics</h4>
                  <p className="text-sm text-[var(--foundation-blue-blue-50)]0">Core operational performance indicators</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Avg Response Time</p>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-sky-700">104.4895ms</p>
                </div>

                <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-[var(--foundation-blue-blue-50)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Documents Processed</p>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-[var(--foundation--blue-blue-700)]">0</p>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Chat Sessions</p>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-emerald-700">0</p>
                </div>
              </div>
            </div>

            {/* <!-- Summary --> */}
            <div className="mt-6 rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-[var(--foundation-blue-blue-600)] text-white shadow-soft">
                  📌
                </div>
                <div>
                  <h4 className="text-lg font-bold">Summary</h4>
                  <p className="text-sm text-[var(--foundation-blue-blue-50)]0">Usage snapshot for the selected date range</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[var(--foundation-blue-blue-50)] bg-[var(--foundation-blue-blue-50)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Total Token Usage</p>
                  <p className="mt-3 text-2xl font-bold">0</p>
                </div>

                <div className="rounded-2xl border border-[var(--foundation-blue-blue-50)] bg-[var(--foundation-blue-blue-50)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Data Tracked</p>
                  <p className="mt-3 text-2xl font-bold">30 days</p>
                </div>

                <div className="rounded-2xl border border-[var(--foundation-blue-blue-50)] bg-[var(--foundation-blue-blue-50)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Period</p>
                  <p className="mt-3 text-2xl font-bold">30d</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Explain why --> */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm">
            <h3 className="font-bold">Show the product, not the admin shell</h3>
            <p className="mt-2 text-sm text-slate-600">
              Use focused product mockups instead of full sidebars, filters, or internal operator controls.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm">
            <h3 className="font-bold">Lead with outcomes</h3>
            <p className="mt-2 text-sm text-slate-600">
              Market what customers gain: performance visibility, usage insights, and operational confidence.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-sm">
            <h3 className="font-bold">Use real UI as proof</h3>
            <p className="mt-2 text-sm text-slate-600">
              A realistic dashboard preview builds trust and makes the feature feel tangible and enterprise-ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* <!-- Analytics Capabilities --> */}
  <section id="capabilities" className="pb-16 sm:pb-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Everything your team needs to measure AI performance
        </h2>
        <p className="my-3 text-lg text-slate-600">
          Built for operators, product teams, and customer success teams that need reliable visibility into chatbot behavior at scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {featureCards.map((item) => {
    const Icon = item.icon;

    return (
      <div
        key={item.title}
        className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-sm hover:shadow-md transition"
      >
        <div
          className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          {item.title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-[var(--foundation-blue-blue-50)]0">
          {item.description}
        </p>
      </div>
    );
  })}
</div>
    </div>
  </section>

  {/* <!-- Performance Insights Section --> */}
  <section id="insights" className="pb-16 sm:pb-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[var(--foundation-blue-blue-100)] bg-white p-8 shadow-card lg:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            Operational Insight
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Performance visibility that scales with your AI product
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Analytics isn’t just about charts — it’s about knowing how your chatbot behaves in production and giving teams the confidence to optimize faster.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Avg Response Time</p>
            <p className="mt-4 text-5xl font-bold tracking-tight text-sky-700">104.4ms</p>
            <p className="mt-3 text-sm text-slate-600">
              Monitor how quickly your assistant responds to users and detect latency regressions before they impact experience.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-[var(--foundation-blue-blue-50)] p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Documents Processed</p>
            <p className="mt-4 text-5xl font-bold tracking-tight text-[var(--foundation--blue-blue-700)]">0</p>
            <p className="mt-3 text-sm text-slate-600">
              Track how your knowledge base and document workflows contribute to chatbot performance and response quality.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foundation-blue-blue-50)]0">Chat Sessions</p>
            <p className="mt-4 text-5xl font-bold tracking-tight text-emerald-700">0</p>
            <p className="mt-3 text-sm text-slate-600">
              Understand how many active sessions are happening and how user engagement evolves across time.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
    </div>
  );
}
