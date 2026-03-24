"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Activity } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api-client";
import type { SystemHealth } from "@/types";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await apiClient.getSystemHealth();
      setHealth(data);
    } catch (error) {
      console.error("Failed to fetch system health:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      default:
        return <XCircle className="h-5 w-5 text-rose-500 dark:text-rose-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "danger"> = {
      healthy: "success",
      degraded: "warning",
      unhealthy: "danger",
    };
    return (
      <Badge variant={variants[status] || "default"} className="border capitalize">
        {status}
      </Badge>
    );
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20";
      case "degraded":
        return "bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20";
      case "unhealthy":
        return "bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20";
      default:
        return "bg-gray-50 border border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.06]";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors p-6">
          <div className="flex items-center justify-center h-[70vh]">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#5856d6] border-r-transparent"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading system health...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-white/[0.06] dark:bg-[#0F172A] dark:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5856d6] shadow-lg dark:bg-[#635BDF] dark:shadow-[0_0_24px_rgba(99,91,223,0.25)]">
                <Activity className="h-7 w-7 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                  System Health
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 transition-colors">
                  Monitor real-time platform status, service availability, and memory usage
                </p>
              </div>
            </div>
          </div>

          {/* Top Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* System Status */}
            <Card>
              <CardHeader className="!border-b-0 !border-none">
                <CardTitle className="text-gray-900 dark:text-white transition-colors">
                  System Status
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div
                  className={`mb-5 rounded-2xl p-5 transition-colors ${getStatusBg(
                    health?.status || "unknown"
                  )}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-white/[0.04]">
                        {getStatusIcon(health?.status || "unknown")}
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                          Current Status
                        </p>
                        <div className="mt-1">{getStatusBadge(health?.status || "unknown")}</div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 transition-colors">
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-white/[0.06] transition-colors">
                  <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                      Uptime
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatUptime(health?.uptime || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                      Version
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {health?.version || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                      Timestamp
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                      {health?.timestamp
                        ? new Date(health.timestamp).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="!border-b-0 !border-none">
                <CardTitle className="text-gray-900 dark:text-white transition-colors">
                  Memory Usage
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-white/[0.06] dark:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      RSS
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatBytes(health?.memory.rss || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-white/[0.06] dark:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Heap Total
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatBytes(health?.memory.total || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-white/[0.06] dark:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Heap Used
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatBytes(health?.memory.used || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-white/[0.06] dark:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Unit
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                      {health?.memory.unit || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Status */}
          <Card>
            <CardHeader className="!border-b-0 !border-none">
              <CardTitle className="text-gray-900 dark:text-white transition-colors">
                Service Status
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {health?.services &&
                  Object.entries(health.services).map(([service, info]) => (
                    <div
                      key={service}
                      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.045] transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.04] transition-colors">
                            {getStatusIcon(info.status)}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                              Service
                            </p>
                            <p className="mt-1 font-semibold capitalize text-gray-900 dark:text-white truncate">
                              {service.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">{getStatusBadge(info.status)}</div>
                      </div>
                    </div>
                  ))}

                {!health?.services && (
                  <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-white/[0.08] dark:bg-white/[0.02]">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      No service status data available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}