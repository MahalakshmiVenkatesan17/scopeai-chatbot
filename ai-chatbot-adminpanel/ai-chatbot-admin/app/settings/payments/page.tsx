"use client";

import { useEffect, useState } from "react";
import { RotateCw, Eye, Search, User, LogOut, Settings } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import apiClient from "@/lib/api-client";
import type { Tenant } from '@/types';
import { useAuthStore } from '@/store/auth-store';

type PaymentTransaction = {
    id: number;
    user_id: number;
    tenant_id?: number;
    subscription_id: string;
    plan_id: string;
    plan_name?: string;
    payment_id?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    subscription_status: 'created' | 'authenticated' | 'active' | 'paused' | 'halted' | 'cancelled' | 'completed' | 'expired';
    subscribed_date?: string;
    payment_date?: string;
    start_date?: string;
    end_date?: string;
    total_count: number;
    quantity: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    first_name?: string;
};

export default function PaymentsPage() {
    const { user } = useAuthStore();

    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [tenantFilter, setTenantFilter] = useState<string>('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        fetchTransactions();
        fetchTenants();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [transactions, search, statusFilter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params: any = {};

            if (tenantFilter) {
                params.tenant_id = Number(tenantFilter);
            }

            const data = await apiClient.getPaymentTransactions(params);
            setTransactions(data?.data || []);
        } catch (error) {
            console.error("Failed to fetch payment transactions:", error);
            showToast("Failed to fetch payment transactions", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchTenants = async () => {
        try {
            const response = await apiClient.getTenants({ page: 1, limit: 100 });
             setTenants(response.items?.filter((t: any) => t.status !== "suspended") || []);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...transactions];

        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (transaction) =>
                    transaction.first_name?.toLowerCase().includes(searchLower) ||
                    transaction.plan_name?.toLowerCase().includes(searchLower) ||
                    transaction.subscription_id.toLowerCase().includes(searchLower) ||
                    transaction.payment_id?.toLowerCase().includes(searchLower) ||
                    transaction.id.toString().includes(searchLower)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((transaction) => transaction.status === statusFilter);
        }

        setFilteredTransactions(filtered);
    };

    const handleSearch = () => {
        applyFilters();
    };

    const handleViewDetails = (transaction: PaymentTransaction) => {
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTransaction(null);
    };

    const getStatusBadgeClass = (status: string) => {
        const statusClasses = {
            paid: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50",
            pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50",
            failed: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50",
            refunded: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
        };
        return (statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700") + " transition-colors";
    };

    const getSubscriptionStatusBadgeClass = (status: string) => {
        const statusClasses = {
            active: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50",
            created: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
            authenticated: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
            paused: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50",
            halted: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50",
            cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50",
            completed: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50",
            expired: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
        };
        return (statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700") + " transition-colors";
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    const parseNotes = (notes?: string) => {
        try {
            return notes ? JSON.parse(notes) : {};
        } catch {
            return {};
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors">
                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Payment Transactions</h1>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                                    View all your subscription payment transactions and their status.
                                </p>
                            </div>


                        </div>
                    </div>

                    {/* Filters Card */}
                    <Card className="mb-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* Search */}
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by user name, plan"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                >
                                    <option value="all">All Payment Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>

                                {/* Tenant Filter */}
                                {user?.role === "super_admin" && (
                                    <select
                                        value={tenantFilter}
                                        onChange={(e) => setTenantFilter(e.target.value)}
                                        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                    >
                                        <option value="">All Tenants</option>
                                        {tenants.map((tenant) => (
                                            <option key={tenant.id} value={tenant.id}>
                                                {tenant.name}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <Button
                                    variant="primary"
                                    onClick={fetchTransactions}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Search
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transactions Table */}
                    <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                                <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                                                    User Name
                                                </TableHead>
                                                <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                                                    Amount
                                                </TableHead>
                                                <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                                                    Payment Status
                                                </TableHead>
                                                <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                                                    Subscription Status
                                                </TableHead>
                                                <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                                                    Payment Date
                                                </TableHead>
                                                <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                                            {filteredTransactions.length > 0 ? (
                                                filteredTransactions.map((transaction) => (
                                                    <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">
                                                                {transaction?.first_name || "—"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                                                                {formatCurrency(transaction.amount, transaction.currency)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                                                    transaction.status
                                                                )}`}
                                                            >
                                                                {transaction.status.toUpperCase()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionStatusBadgeClass(
                                                                    transaction.subscription_status
                                                                )}`}
                                                            >
                                                                {transaction.subscription_status.toUpperCase()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-gray-100 transition-colors">
                                                                {formatDate(transaction.payment_date)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleViewDetails(transaction)}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <td colSpan={6} className="px-6 py-24 text-center">
                                                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                                                            {search || statusFilter !== 'all' || tenantFilter
                                                                ? "No transactions match your search criteria"
                                                                : "No payment transactions found"}
                                                        </div>
                                                    </td>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transaction Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={handleCloseDetailModal}
                title="Transaction Details"
                size="lg"
            >
                {selectedTransaction && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 transition-colors">Payment Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Transaction ID</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 transition-colors">{selectedTransaction.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Payment ID</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono transition-colors">
                                        {selectedTransaction.payment_id || "—"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Amount</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-semibold transition-colors">
                                        {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Payment Status</label>
                                    <p className="mt-1 transition-colors">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                                selectedTransaction.status
                                            )}`}
                                        >
                                            {selectedTransaction.status.toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 transition-colors">Subscription Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Subscription ID</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono break-all transition-colors">
                                        {selectedTransaction.subscription_id}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Plan ID</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono break-all transition-colors">
                                        {selectedTransaction.plan_id}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Plan Name</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 transition-colors">{selectedTransaction.plan_name || "—"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Subscription Status</label>
                                    <p className="mt-1 transition-colors">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionStatusBadgeClass(
                                                selectedTransaction.subscription_status
                                            )}`}
                                        >
                                            {selectedTransaction.subscription_status.toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 transition-colors">Date Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Payment Date</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 transition-colors">
                                        {formatDate(selectedTransaction.payment_date)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Subscribed Date</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 transition-colors">
                                        {formatDate(selectedTransaction.subscribed_date)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {selectedTransaction.notes && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Additional Information</h3>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-transparent dark:border-gray-700">
                                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                                        {JSON.stringify(parseNotes(selectedTransaction.notes), null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="secondary" onClick={handleCloseDetailModal}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {ToastComponent}
        </DashboardLayout>
    );
}