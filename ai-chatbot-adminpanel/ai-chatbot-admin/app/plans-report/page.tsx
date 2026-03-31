"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  Users,
  Crown,
  Star,
  Zap,
  CheckCircle,
  Clock,
  Gift,
  Shield,
  Gem,
  FileBarChart2,
} from "lucide-react";
import apiClient from "@/lib/api-client";

interface SubscriptionPlan {
  id: number;
  tenant_id: number;
  name: string;
  plan_name: string;
  subscription_status: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  payment_id: string | null;
  invoice_data: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ActivePlansReportPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [filteredData, setFilteredData] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch data from API
  const fetchData = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await apiClient.getAllActivePlans({ page, limit });

      const apiData =
        response?.data?.map((item: any) => ({
          ...item,
          amount: Number(item.amount) || 0,
        })) || [];

      setSubscriptions(apiData);
      setFilteredData(apiData);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to load active plans", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and reload on pagination change
  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Apply search filter (client-side filtering on current page)
  useEffect(() => {
    let result = subscriptions;

    if (searchTerm) {
      result = result.filter(
        (sub) =>
          sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.subscription_id
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sub.tenant_id.toString().includes(searchTerm) ||
          sub.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredData(result);
  }, [searchTerm, subscriptions]);

  const getTenantInitials = (name: string | null | undefined) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getPlanIcon = (planName: string) => {
    const icons: { [key: string]: any } = {
      Enterprise: Crown,
      Pro: Zap,
      Basic: Star,
      Silver: Shield,
      Free: Gift,
      Gold: Crown,
      Platinum: Gem,
    };
    const IconComponent = icons[planName] || Building2;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPlanColor = (planName: string) => {
    const colors: { [key: string]: string } = {
      Enterprise:
        "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
      Pro: "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20",
      Basic:
        "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:border-white/[0.06]",
      Silver:
        "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
      Free: "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-white/[0.04] dark:text-slate-300 dark:border-white/[0.06]",
      Gold: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
      Platinum:
        "bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-500/10 dark:text-zinc-200 dark:border-zinc-500/20",
    };
    return (
      colors[planName] ||
      "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-white/[0.04] dark:text-slate-300 dark:border-white/[0.06]"
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5 w-fit">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/[0.06] flex items-center gap-1.5 w-fit capitalize">
        <Clock className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const calculateEndDate = (createdAt: string, billingCycle: string) => {
    if (!createdAt) return "N/A";
    const date = new Date(createdAt);
    if (billingCycle === "monthly") {
      date.setMonth(date.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate statistics (based on all active subscriptions on current page)
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.subscription_status === "active",
  );

  const totalMRR = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billing_cycle === "monthly") return sum + sub.amount;
    if (sub.billing_cycle === "yearly") return sum + sub.amount / 12;
    return sum;
  }, 0);

  const totalARR = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billing_cycle === "yearly") return sum + sub.amount;
    if (sub.billing_cycle === "monthly") return sum + sub.amount * 12;
    return sum;
  }, 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors p-6">
          <div className="flex items-center justify-center h-[70vh]">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#5856d6] border-r-transparent"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                Loading subscription data...
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5856d6] shadow-lg dark:bg-[#635BDF] dark:shadow-[0_0_24px_rgba(99,91,223,0.25)] shrink-0">
                  <FileBarChart2 className="h-7 w-7 text-white" />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Active Plans Report
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    Overview of subscription plans, billing cycles, and revenue
                    insights
                  </p>
                </div>
              </div>

              <Badge className="w-fit border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300 px-3 py-1.5 text-sm">
                {pagination.total} Total Plans
              </Badge>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
              <CardContent className="p-6!">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Total Active Plans
                    </p>
                    <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                      {pagination.total}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-sm">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
              <CardContent className="p-6!">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Monthly Revenue (MRR)
                    </p>
                    <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalMRR, "USD")}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-sm">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
              <CardContent className="p-6!">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Annual Revenue (ARR)
                    </p>
                    <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalARR, "USD")}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 shadow-sm">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
              <CardContent className="p-6!">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Unique Plans
                    </p>
                    <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                      {new Set(subscriptions.map((sub) => sub.plan_name)).size}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-sm">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
            <CardHeader className="!border-b-0 !pb-0">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white transition-colors">
                <Filter className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                Search & Filter
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                  <input
                    placeholder="Search plans, tenants, or subscription IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:border-[#5856d6] focus:outline-none focus:ring-2 focus:ring-[#5856d6]/20 transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plans Table */}
          <Card className="border-gray-200 bg-white dark:border-white/[0.06] dark:bg-[#0F172A] transition-colors">
            <CardHeader className="!border-b-0">
              <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-900 dark:text-white">
                  Subscriptions
                </span>
                <Badge className="w-fit text-sm bg-gray-100 dark:bg-white/[0.04] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/[0.06]">
                  {filteredData.length} of {pagination.total} subscriptions
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06]">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-white/[0.03]">
                    <TableRow className="border-gray-200 dark:border-white/[0.06]">
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-200 px-6 py-4">
                        Plan Details
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-200 px-6 py-4">
                        Tenant
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-200 px-6 py-4">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-200 px-6 py-4">
                        Billing
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-200 px-6 py-4 text-right">
                        Amount
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-200 px-6 py-4">
                        Period
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-white dark:bg-transparent">
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="px-6 py-12">
                          <div className="text-center">
                            <Search className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-lg font-semibold text-gray-700 dark:text-slate-300">
                              No subscription plans found
                            </p>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                              Try adjusting your search terms
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((subscription) => (
                        <TableRow
                          key={subscription.id}
                          className="border-gray-100 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.025] transition-colors"
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${getPlanColor(
                                  subscription.plan_name,
                                )}`}
                              >
                                {getPlanIcon(subscription.plan_name)}
                              </div>

                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {subscription.plan_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                                  {subscription.subscription_id
                                    ? `${subscription.subscription_id.slice(0, 12)}...`
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5856d6] dark:bg-[#635BDF] shadow-sm">
                                <span className="text-xs font-bold text-white">
                                  {getTenantInitials(subscription.name)}
                                </span>
                              </div>

                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {subscription.name}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            {getStatusBadge(subscription.subscription_status)}
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            <Badge
                              className={
                                subscription.billing_cycle === "yearly"
                                  ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20"
                                  : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20"
                              }
                            >
                              {subscription.billing_cycle
                                .charAt(0)
                                .toUpperCase() +
                                subscription.billing_cycle.slice(1)}
                            </Badge>
                          </TableCell>

                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-bold text-[#5856d6] dark:text-[#A5B4FC]">
                                {formatCurrency(
                                  subscription.amount,
                                  subscription.currency,
                                )}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                {subscription.billing_cycle === "yearly"
                                  ? `${formatCurrency(
                                      subscription.amount / 12,
                                      subscription.currency,
                                    )}/mo`
                                  : `${formatCurrency(
                                      subscription.amount * 12,
                                      subscription.currency,
                                    )}/yr`}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-slate-300">
                                <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                                <span>
                                  {formatDate(subscription.created_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                                <span>→</span>
                                <span>
                                  {formatDate(
                                    calculateEndDate(
                                      subscription.created_at,
                                      subscription.billing_cycle,
                                    ),
                                  )}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 0 && (
                <div className="mt-5">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    showItemsPerPage={true}
                    itemsPerPageOptions={[10, 25, 50, 100]}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
