"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  FileText,
  MessageSquare,
  DollarSign,
  MessageSquareReply,
  GitPullRequestDraft,
  Ticket,
  TrendingUp,
  User,
  LayoutDashboard,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import apiClient from "@/lib/api-client";
import type { DashboardStats, Tenant } from "@/types";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  AreaChart,
  Area,
  Bar,
} from "recharts";
import { useAuthStore } from "@/store/auth-store";
import { te } from "date-fns/locale";
import { set } from "date-fns";
// import SuperAdminDashboardPage from './super-admin-dashboard';
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]); // for dropdown
  const [tenantPlans, setTenantPlans] = useState<
    { name: string; value: number }[]
  >([]); // for chart
  const [selectedTenant, setSelectedTenant] = useState<string>(""); // for dropdown selection
  const [activityData, setActivityData] = useState<
    { date: string; sessions: number; messages: number; documents: number }[]
  >([]);
  const [tenantName, setTenantName] = useState<string>("");
  const { user: loggedInUser, isAuthenticated } = useAuthStore();

  // Fetch dashboard stats for selected tenant
  const fetchDashboardStats = async (tenantId: number) => {
    setLoading(true);
    try {
      const data = await apiClient.getDashboardSummary(tenantId);

      setStats({
        totalTenants: data?.totalTenants, // 1
        activeTenants: 0, // placeholder
        totalUsers: 0, // placeholder
        activeUsers: data?.activeUsers, // 30.4286
        totalDocuments: data?.totalDocuments, // 3
        processedDocuments: data?.totalDocuments, // 3
        totalChatSessions: data?.chatSessions, // 48.8571
        totalRequests: data?.totalRequests, // 2580
        avgProcessingTime: data?.avgProcessingTime, // 1228.5714
        totalCost: data?.totalCost, // 0.036729
        totalChatCost: data?.totalChatCost, // 0.025634
        todayChatCost: data?.todayChatCost, // 0.025634
        avgTokens: data?.avgTokens, // 379.8596
        totalTokens: data?.totalTokens, // 21652
        assistantMessageCount: data?.assistantMessageCount, // 114
        systemUptime: 0, // placeholder
        memoryUsage: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
        },
        growth: data?.growth, // { tenants: 1, users: 30.4286, documents: 3, sessions: 48.8571 }

        // 🔹 Current / period stats
        current: {
          activeUsers: data?.current?.activeUsers || 0,
          chatSessions: data?.current?.chatSessions || 0,
          requests: data?.current?.requests || 0,
          documents: data?.current?.documents || 0,
          tokenCount: data?.current?.tokenCount || 0,
        },
      });

      fetchWeeklyActivity(tenantId); // also fetch weekly activity
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return; // Do not call API if not authenticated
    fetchTenants();
  }, [loggedInUser, isAuthenticated]);

  const [usageData, setUsageData] = useState<
    { date: string; requests: number }[]
  >([]);

  const fetchWeeklyActivity = async (tenantId?: number) => {
    try {
      if (!tenantId) return;

      const response = await apiClient.getWeeklyActivityStats({
        tenantId,
        period: "7d",
      });
      const { dailyUsers, dailySessions, dailyMessages, dailyDocuments } = response;

      // ✅ Keep your original weekly logic as is
      // This mapping is correct — keep as-is once backend is fixed:
      const combined = dailySessions.map((s) => {
        const date = new Date(s.date).toLocaleDateString("en-US", { weekday: "short" });
        const messages = dailyMessages.find((m) => m.date === s.date)?.count || 0;
        const documents = dailyDocuments.find((d) => d.date === s.date)?.count || 0;
        return { date, sessions: s.count, messages, documents }; // sessions = chat_sessions per day ✅
      });

      setActivityData(combined.reverse());

      // ✅ Separate 10-day dataset for the BarChart
      // Using `dailyMessages` as "requests" (you can change this to dailyDocuments or dailyUsers)
      const sortedData = [...dailyMessages].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      const last10Days = sortedData.slice(-10).map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        requests: item.count,
      }));

      setUsageData(last10Days);
    } catch (error) {
      console.error("Failed to fetch tenant analytics:", error);
    }
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTenants({ page: 1, limit: 100 });

      const items = response.items ?? [];

      setTenants(items.filter((t: any) => t.status !== "suspended"));

      if (loggedInUser?.tenant_id) {
        const tenantExists = items.find(
          (t) => t.id === loggedInUser.tenant_id
        );

        if (tenantExists) {
          setSelectedTenant(String(tenantExists.id));
        }

        const getTenantName =
          items.find((t) => t.id === loggedInUser.tenant_id)?.name ||
          "Unknown Tenant";

        setTenantName(getTenantName);
      }

      const planCounts = items.reduce((acc, tenant) => {
        const plan = tenant.subscription_plan || "No Plan";
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setTenantPlans(
        Object.entries(planCounts).map(([name, value]) => ({ name, value }))
      );
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTenant) {
      fetchDashboardStats(Number(selectedTenant));
    } else {
      setStats(null);
      setActivityData([]);
    }
  }, [selectedTenant]);

  //   const usageData = [
  //   { date: 'Week 1', requests: 3400, tokens: 450000 },
  //   { date: 'Week 2', requests: 4100, tokens: 520000 },
  //   { date: 'Week 3', requests: 3800, tokens: 480000 },
  //   { date: 'Week 4', requests: 4500, tokens: 580000 },
  // ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors p-6">
          <div className="flex items-center justify-center h-[70vh]">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#5856d6] border-r-transparent"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    // loggedInUser?.role==='tenant_admin' ?
    // (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-white/[0.06] dark:bg-[#0F172A] dark:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5856d6] shadow-lg dark:bg-[#635BDF] dark:shadow-[0_0_24px_rgba(99,91,223,0.25)]">
                  <LayoutDashboard className="h-7 w-7 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    Welcome back! Here&apos;s an overview of your AI Chatbot platform.
                  </p>
                </div>
              </div>

              {/* ✅ Tenant Dropdown */}
              {loggedInUser?.role !== "tenant_admin" && (
                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="tenant"
                    className="text-sm font-medium text-gray-700 dark:text-slate-300"
                  >
                    Select Tenant:
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
                      setTenantName(selected ? selected.name : "All Tenants");
                    }}
                    className="rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#5856d6] focus:ring-2 focus:ring-[#5856d6]/20 transition-colors cursor-pointer outline-none min-w-52"
                  >
                    {/* <option value="">All Tenants</option> */}
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id} className="dark:bg-[#0F172A]">
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Tenant"
              value={tenantName ? tenantName : "-"}
              changeType="positive"
              icon={Building2}
              iconColor="bg-violet-500"
              borderColor="border-t-violet-500"
              backgroundColor="bg-violet-50 dark:bg-violet-500/10"
              borderRadius="rounded-2xl"
            />
            <StatsCard
              title="Active Users"
              value={Math.round(stats?.activeUsers || 0)}
              // change="+8% from last month"
              changeType="positive"
              icon={Users}
              iconColor="bg-blue-500"
              borderColor="border-t-blue-500"
              backgroundColor="bg-blue-50 dark:bg-blue-500/10"
              borderRadius="rounded-2xl"
            />
            <StatsCard
              title="Documents"
              value={stats?.totalDocuments || 0}
              // change="+23% from last month"
              changeType="positive"
              icon={FileText}
              iconColor="bg-emerald-500"
              borderColor="border-t-emerald-500"
              backgroundColor="bg-emerald-50 dark:bg-emerald-500/10"
              borderRadius="rounded-2xl"
            />
            <StatsCard
              title="Chat Sessions"
              value={Math.round(stats?.totalChatSessions || 0).toLocaleString()}
              // change="+15% from last month"
              changeType="negative"
              icon={MessageSquare}
              iconColor="bg-amber-500"
              borderColor="border-t-amber-500"
              backgroundColor="bg-amber-50 dark:bg-amber-500/10"
              borderRadius="rounded-2xl"
            />
            <StatsCard
              title="Total Requests"
              value={stats?.totalRequests || 0}
              icon={GitPullRequestDraft}
              iconColor="bg-teal-500"
              borderColor="border-t-teal-500"
              backgroundColor="bg-teal-50 dark:bg-teal-500/10"
              borderRadius="rounded-2xl"
            />
            <StatsCard
              title="Avg Response Time"
              value={Math.round(stats?.avgProcessingTime || 0) + " ms"}
              icon={MessageSquareReply}
              iconColor="bg-orange-500"
              borderColor="border-t-orange-500"
              backgroundColor="bg-orange-50 dark:bg-orange-500/10"
              borderRadius="rounded-2xl"
            />
            {/* <StatsCard
                      title="Success Rate"
                      value={`${metrics?.successRate || 0}%`}
                      icon={TrendingUp}
                      iconColor="bg-purple-500"
                    /> */}
            <StatsCard
              title="Total Cost"
              value={stats?.totalCost || 0}
              icon={DollarSign}
              iconColor="bg-pink-500"
              borderColor="border-t-pink-500"
              backgroundColor="bg-pink-50 dark:bg-pink-500/10"
              borderRadius="rounded-2xl"
            />

            <StatsCard
              title="Average Count Token"
              value={Math.round(stats?.avgTokens || 0)}
              icon={Ticket}
              iconColor="bg-rose-500"
              borderColor="border-t-rose-500"
              backgroundColor="bg-rose-50 dark:bg-rose-500/10"
              borderRadius="rounded-2xl"
            />
          </div>

          {/* Charts Row */}
          {/* lg:grid-cols-2 */}
          {/* Charts Row */}
          <div className="grid gap-6">
            {/* Activity Chart */}
            <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
              <CardHeader className="!border-b-0">
                <CardTitle className="text-gray-900 dark:text-white">
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Custom code */}
                <div className="w-full h-50 sm:h-60 md:h-70 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      {/* Gradient */}
                      <defs>
                        <linearGradient
                          id="sessionsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#5856d6"
                            stopOpacity={0.22}
                          />
                          <stop
                            offset="100%"
                            stopColor="#5856d6"
                            stopOpacity={0.03}
                          />
                        </linearGradient>
                      </defs>

                      {/* Grid */}
                      <CartesianGrid
                        stroke="var(--chart-grid)"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      {/* X Axis */}
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
                      />

                      {/* Hide Y axis like design */}
                      <YAxis hide />

                      {/* Tooltip */}
                      <Tooltip content={<CustomTooltip />} />

                      <Legend content={<CustomLegend />} />

                      {/* Area under primary line */}
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stroke="#5856d6"
                        fill="url(#sessionsGradient)"
                        style={{ cursor: "pointer" }}
                        name="Chat Sessions"
                      />

                   

                      {/* Primary Line */}
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="#5856d6"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 7, fill: "#5856d6" }}
                        name="Chat Sessions"
                        style={{ cursor: "pointer" }}
                      />

                      {/* Secondary lines (lighter & subtle) */}
                      <Line
                        type="monotone"
                        dataKey="messages"
                        stroke="#A5B4FC"
                        strokeWidth={2}
                        dot={false}
                        name="Messages"
                        style={{ cursor: "pointer" }}
                      />

                      <Line
                        type="monotone"
                        dataKey="documents"
                        stroke="#818CF8"
                        strokeWidth={2}
                        dot={false}
                        name="Documents"
                        style={{ cursor: "pointer" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
              <CardHeader className="!border-b-0">
                <CardTitle className="text-gray-900 dark:text-white">
                  API Requests Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Own component */}
                <div className="w-full h-55 sm:h-65 md:h-75">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData} barCategoryGap={18}>
                      {/* Grid */}
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--chart-grid)"
                      />

                      {/* X Axis */}
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
                      />

                      {/* Y Axis */}
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--chart-axis)", fontSize: 12 }}
                      />

                      {/* Tooltip */}
                      <Tooltip
                        content={<UsageTooltip />}
                        cursor={{ fill: "transparent" }}
                      />

                      {/* Bars */}
                      <Bar
                        dataKey="requests"
                        fill="#5856d6"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={100}
                        activeBar={false}
                        className="transition-all duration-300"
                        style={{ cursor: "pointer" }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="p-3 border-r border-r-gray-200">
                <div className=" flex gap-3 items-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.current?.activeUsers || 0}
                    </p>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border-r border-r-gray-200">
                <div className=" flex gap-3 items-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.current?.chatSessions || 0}
                    </p>
                    <p className="text-sm text-gray-600">Chat Sessions</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border-r border-r-gray-200">
                <div className=" flex gap-3 items-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.current?.documents || 0}
                    </p>
                    <p className="text-sm text-gray-600">Documents</p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className=" flex gap-3 items-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.current?.tokenCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">Token Count</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}

          <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
            <CardHeader className="!border-b-0">
              <CardTitle className="text-gray-900 dark:text-white">
                Cost Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Total Cost */}
                <div className="relative rounded-3xl p-6 shadow-sm border border-pink-200 bg-pink-50 dark:border-pink-500/15 dark:bg-pink-500/10 overflow-hidden transition-colors">
                  {/* top accent line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-pink-500 rounded-t-3xl" />

                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-500/15 mb-4">
                      <DollarSign className="h-7 w-7 text-pink-500 dark:text-pink-300" />
                    </div>

                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Total Cost
                    </p>

                    <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">
                      ${stats?.totalChatCost?.toFixed(4) || "0.0000"}
                    </p>
                  </div>
                </div>

                {/* Today's Cost */}
                <div className="relative rounded-3xl p-6 shadow-sm border border-blue-200 bg-blue-50 dark:border-blue-500/15 dark:bg-blue-500/10 overflow-hidden transition-colors">
                  {/* top accent line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-3xl" />

                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/15 mb-4">
                      <DollarSign className="h-7 w-7 text-blue-500 dark:text-blue-300" />
                    </div>

                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Today&apos;s Chat Cost
                    </p>

                    <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">
                      ${stats?.todayChatCost?.toFixed(4) || "0.0000"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Table */}
          {/* <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { tenant: 'TechCorp', action: 'Document uploaded', time: '5 minutes ago' },
                { tenant: 'StartupXYZ', action: 'New user registered', time: '12 minutes ago' },
                { tenant: 'GlobalInc', action: 'API key created', time: '1 hour ago' },
                { tenant: 'DevTeam', action: 'Chatbot config updated', time: '2 hours ago' },
                { tenant: 'DataCo', action: 'Document processed', time: '3 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{activity.tenant}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
        </div>
      </div>
    </DashboardLayout>
  );
  // :
  // (<SuperAdminDashboardPage/>

  // )
  // )
}
type TooltipItem = Payload<number | string, string>;

interface CustomTooltipProps {
  active?: boolean;

  payload?: TooltipItem[];

  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const seen = new Set<string>();

  const filteredPayload = payload.filter((item) => {
    if (!item.name || !item.dataKey) return false;

    const key = String(item.dataKey);

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });

  if (!filteredPayload.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl dark:border-white/[0.06] dark:bg-[#0F172A] text-xs min-w-44 transition-colors">
      <p className="text-gray-500 dark:text-slate-400 mb-2">{label}</p>

      <div className="space-y-1.5">
        {filteredPayload.map((item) => (
          <div
            key={String(item.dataKey)}
            className="flex justify-between items-center gap-3"
          >
            <span className="font-medium" style={{ color: item.color }}>
              {item.name}
            </span>

            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type LegendItem = Payload<number | string, string>;

interface CustomLegendProps {
  payload?: LegendItem[];
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload || !payload.length) return null;

  const seen = new Set<string>();

  const uniqueItems = payload.filter((item) => {
    if (!item.dataKey) return false;

    const key = String(item.dataKey);

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });

  return (
    <div className="flex justify-center md:gap-6 gap-2 mt-4 md:text-sm text-[10px]">
      {uniqueItems.map((item) => (
        <div key={String(item.dataKey)} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />

          <span className="font-medium" style={{ color: item.color }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

type UsageTooltipItem = Payload<number | string, string>;

interface UsageTooltipProps {
  active?: boolean;

  payload?: UsageTooltipItem[];

  label?: string;
}

function UsageTooltip({ active, payload, label }: UsageTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl dark:border-white/[0.06] dark:bg-[#0F172A] text-xs min-w-36 transition-colors">
      <p className="font-medium mb-2 text-gray-500 dark:text-slate-400">{label}</p>

      <div className="flex justify-between gap-4">
        <span className="text-gray-500 dark:text-slate-400">Requests</span>

        <span className="font-semibold text-gray-900 dark:text-white">
          {payload[0].value}
        </span>
      </div>
    </div>
  );
}