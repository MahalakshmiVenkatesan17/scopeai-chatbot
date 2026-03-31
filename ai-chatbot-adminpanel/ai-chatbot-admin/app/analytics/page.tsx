"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  MessageSquare,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Building2,
  CalendarRange,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import type { UsageMetrics, Tenant } from "@/types";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuthStore } from "@/store/auth-store";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number>();
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [tenantsError, setTenantsError] = useState<string | null>(null);
  const loggedInUser = useAuthStore().user;

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      fetchMetrics();
    }
  }, [period, selectedTenantId]);

  // Set selected tenant to current user's tenant when tenants are loaded
  useEffect(() => {
    if (tenants.length > 0 && loggedInUser?.tenant_id) {
      setSelectedTenantId(loggedInUser.tenant_id);
    }
  }, [tenants, loggedInUser?.tenant_id]);

  const fetchTenants = async () => {
    setTenantsLoading(true);
    setTenantsError(null);

    try {
      const response = await apiClient.getTenants();

      const tenantsArray = response?.items ?? [];

      setTenants(tenantsArray.filter((t) => t.status !== "suspended"));
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
      setTenantsError("Failed to load tenants");
      setTenants([]);
    } finally {
      setTenantsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    if (!selectedTenantId) return;

    setLoading(true);
    try {
      const data = await apiClient.getUsageMetrics({
        period,
        tenantId: selectedTenantId,
      });
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Prepare chart data from API response
  const apiRequestsChartData =
    metrics?.apiRequestsOverTime?.map((item) => ({
      date: formatDate(item.date),
      requests: item.count,
    })) || [];

  const tokenUsageChartData =
    metrics?.tokenUsageOverTime?.map((item) => ({
      date: formatDate(item.date),
      tokens: item.tokens,
    })) || [];

  // Format numbers for better readability
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getSelectedTenantName = () => {
    const tenant = tenants.find((t) => t.id === selectedTenantId);
    return tenant?.name || "Unknown Tenant";
  };

  // Safe tenants array for rendering
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  const premiumCardClass =
    "border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1220] shadow-sm dark:shadow-2xl rounded-2xl overflow-hidden";

  const premiumSelectClass =
    "rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2.5 bg-white dark:bg-[#171F33] text-gray-900 dark:text-slate-200 focus:border-[#635BDF] focus:outline-none focus:ring-2 focus:ring-[#635BDF]/20 transition-colors";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#070B14] transition-colors p-6 relative overflow-hidden">
        {/* Glow Background */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block">
          <div className="absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute top-24 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          {/* Header */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-r from-gray-50 to-white dark:from-[#0F172A] dark:via-[#0B1220] dark:to-[#111827] px-6 py-5 shadow-sm dark:shadow-2xl">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635BDF] text-white shadow-[0_0_24px_rgba(99,91,223,0.25)] shrink-0">
                  <BarChart3 className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Analytics & Usage
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    {selectedTenantId
                      ? `Viewing data for: ${getSelectedTenantName()}`
                      : "Track platform usage and performance"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {tenantsLoading ? (
                  <select
                    disabled
                    className={`${premiumSelectClass} min-w-[220px] opacity-70`}
                  >
                    <option>Loading tenants...</option>
                  </select>
                ) : tenantsError ? (
                  <select
                    disabled
                    className={`${premiumSelectClass} min-w-[220px] opacity-70`}
                  >
                    <option>Error loading tenants</option>
                  </select>
                ) : (
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <select
                      value={selectedTenantId ?? ""}
                      onChange={(e) =>
                        setSelectedTenantId(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      className={`${premiumSelectClass} min-w-[240px] pl-10`}
                    >
                      <option value="" className="dark:bg-[#171F33]">
                        Select a tenant
                      </option>
                      {safeTenants.map((tenant) => (
                        <option
                          key={tenant.id}
                          value={tenant.id}
                          className="dark:bg-[#171F33]"
                        >
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className={`${premiumSelectClass} min-w-[180px] pl-10`}
                  >
                    <option value="24h" className="dark:bg-[#171F33]">
                      Last 24 Hours
                    </option>
                    <option value="7d" className="dark:bg-[#171F33]">
                      Last 7 Days
                    </option>
                    <option value="30d" className="dark:bg-[#171F33]">
                      Last 30 Days
                    </option>
                    <option value="90d" className="dark:bg-[#171F33]">
                      Last 90 Days
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {tenantsError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-red-300">{tenantsError}</p>
                    <p className="mt-1 text-sm text-red-200/80">
                      Unable to fetch tenant list. Please try again.
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchTenants}
                  className="inline-flex items-center rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {!selectedTenantId ? (
            <div
              className={`${premiumCardClass} flex items-center justify-center h-64`}
            >
              <p className="text-gray-500 dark:text-slate-400 transition-colors">
                {safeTenants.length === 0 && !tenantsLoading
                  ? "No tenants available"
                  : "Please select a tenant to view analytics"}
              </p>
            </div>
          ) : loading ? (
            <div
              className={`${premiumCardClass} flex items-center justify-center h-64`}
            >
              <div className="text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#635BDF] border-r-transparent"></div>
                <p className="mt-4 text-gray-500 dark:text-slate-400">
                  Loading metrics...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total Requests"
                  value={formatNumber(metrics?.totalRequests || 0)}
                  icon={MessageSquare}
                  iconColor="bg-[#635BDF]"
                  borderColor="border-t-[#635BDF]"
                  backgroundColor="bg-[#635BDF]/5"
                  borderRadius="rounded-2xl"
                />
                <StatsCard
                  title="Active Users"
                  value={metrics?.activeUsers || 0}
                  icon={Users}
                  iconColor="bg-blue-500"
                  borderColor="border-t-blue-500"
                  backgroundColor="bg-blue-500/5"
                  borderRadius="rounded-2xl"
                />
                <StatsCard
                  title="Success Rate"
                  value={`${metrics?.successRate || 0}%`}
                  icon={TrendingUp}
                  iconColor="bg-emerald-500"
                  borderColor="border-t-emerald-500"
                  backgroundColor="bg-emerald-500/5"
                  borderRadius="rounded-2xl"
                />
                <StatsCard
                  title="Total Cost"
                  value={`$${metrics?.totalCost || "0.00"}`}
                  icon={DollarSign}
                  iconColor="bg-amber-500"
                  borderColor="border-t-amber-500"
                  backgroundColor="bg-amber-500/5"
                  borderRadius="rounded-2xl"
                />
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className={premiumCardClass}>
                  <CardHeader className="border-b border-gray-100 dark:border-white/[0.06] bg-transparent">
                    <CardTitle className="text-gray-900 dark:text-slate-100">
                      API Requests Over Time
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      Last {metrics?.apiRequestsOverTime?.length || 0} days
                    </p>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {apiRequestsChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={apiRequestsChartData}>
                          <defs>
                            <linearGradient
                              id="colorRequests"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#635BDF"
                                stopOpacity={0.35}
                              />
                              <stop
                                offset="95%"
                                stopColor="#635BDF"
                                stopOpacity={0.03}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148,163,184,0.10)"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#94A3B8" }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#94A3B8" }}
                          />

                          <Tooltip
                            cursor={{ stroke: "#818CF8", strokeWidth: 1 }}
                            contentStyle={{
                              borderRadius: "14px",
                              border: "1px solid rgba(148,163,184,0.12)",
                              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                              fontSize: "12px",
                              backgroundColor: "#111827",
                              color: "#E2E8F0",
                            }}
                            itemStyle={{ color: "#E2E8F0" }}
                            labelStyle={{ color: "#CBD5E1" }}
                            formatter={(value: number | undefined) => [
                              value?.toString() ?? "0",
                              "Requests",
                            ]}
                          />

                          <Area
                            type="monotone"
                            dataKey="requests"
                            stroke="#635BDF"
                            strokeWidth={2.5}
                            fill="url(#colorRequests)"
                            dot={false}
                            activeDot={{
                              r: 5,
                              strokeWidth: 0,
                              fill: "#726AF0",
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[320px]">
                        <p className="text-gray-400 dark:text-slate-500">
                          No data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className={premiumCardClass}>
                  <CardHeader className="border-b border-gray-100 dark:border-white/[0.06] bg-transparent">
                    <CardTitle className="text-gray-900 dark:text-slate-100">
                      Token Usage
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      Last {metrics?.tokenUsageOverTime?.length || 0} days
                    </p>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {tokenUsageChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={tokenUsageChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148,163,184,0.10)"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#94A3B8" }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#94A3B8" }}
                          />

                          <Tooltip
                            cursor={{ stroke: "#818CF8", strokeWidth: 1 }}
                            contentStyle={{
                              borderRadius: "14px",
                              border: "1px solid rgba(148,163,184,0.12)",
                              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                              fontSize: "12px",
                              backgroundColor: "#111827",
                              color: "#E2E8F0",
                            }}
                            itemStyle={{ color: "#E2E8F0" }}
                            labelStyle={{ color: "#CBD5E1" }}
                            formatter={(value: number | undefined) => [
                              value?.toString() ?? "0",
                              "Tokens",
                            ]}
                          />

                          <Line
                            type="monotone"
                            dataKey="tokens"
                            stroke="#635BDF"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{
                              r: 5,
                              fill: "#726AF0",
                              strokeWidth: 0,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[320px]">
                        <p className="text-gray-400 dark:text-slate-500">
                          No data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card className={premiumCardClass}>
                <CardHeader className="border-b border-gray-100 dark:border-white/[0.06]">
                  <CardTitle className="text-gray-900 dark:text-slate-100">
                    Performance Metrics
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Avg Response Time */}
                    <div className="group relative rounded-2xl p-6 border border-cyan-500/10 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/[0.04] dark:to-blue-500/[0.04] hover:border-cyan-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide uppercase">
                        Avg Response Time
                      </p>
                      <p className="mt-3 text-4xl font-bold text-cyan-700 dark:text-cyan-400 tracking-tight">
                        {metrics?.averageResponseTime || 0}ms
                      </p>
                    </div>

                    {/* Documents Processed */}
                    <div className="group relative rounded-2xl p-6 border border-violet-500/10 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/[0.04] dark:to-purple-500/[0.04] hover:border-violet-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide uppercase">
                        Documents Processed
                      </p>
                      <p className="mt-3 text-4xl font-bold text-[#818CF8] tracking-tight">
                        {formatNumber(metrics?.documentsProcessed || 0)}
                      </p>
                    </div>

                    {/* Chat Sessions */}
                    <div className="group relative rounded-2xl p-6 border border-emerald-500/10 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/[0.04] dark:to-teal-500/[0.04] hover:border-emerald-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide uppercase">
                        Chat Sessions
                      </p>
                      <p className="mt-3 text-4xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
                        {formatNumber(metrics?.chatSessions || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              {metrics && (
                <Card className={premiumCardClass}>
                  <CardHeader className="border-b border-gray-100 dark:border-white/[0.06]">
                    <CardTitle className="text-gray-900 dark:text-slate-100">
                      Summary
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 lg:gap-y-0 lg:divide-x lg:divide-gray-200 dark:lg:divide-white/[0.06]">
                      {/* Total Tokens */}
                      <div className="lg:pr-8">
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          Total Token Usage
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                          {formatNumber(metrics.totalTokensUsed || 0)}
                        </p>
                      </div>

                      {/* Data Tracked */}
                      <div className="lg:px-8">
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          Data Tracked
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                          {metrics.daysTracked} days
                        </p>
                      </div>

                      {/* Period */}
                      <div className="lg:pl-8">
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          Period
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                          {period}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
