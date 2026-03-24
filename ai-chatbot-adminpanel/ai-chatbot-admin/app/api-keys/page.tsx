'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import apiClient from '@/lib/api-client';
import type { Tenant, ApiKey } from '@/types';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';

export default function ApiKeysPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState({ keyName: '', permissions: [] });
  const { user: loggedInUser } = useAuthStore();

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchApiKeys();
    }
  }, [selectedTenant]);

  const fetchTenants = async () => {
    try {
      const response = await apiClient.getTenants({ page: 1, limit: 100 });

      setTenants(response.items?.filter((t: any) => t.status !== "suspended") || []);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  const fetchApiKeys = async () => {
    if (!selectedTenant) return;
    try {
      const keys = await apiClient.getTenantApiKeys(selectedTenant);
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const handleCreateKey = async () => {
    if (!selectedTenant || !newKey.keyName) return;
    try {
      const result = await apiClient.createTenantApiKey(selectedTenant, newKey);
      alert(`API Key created:\n\n${result.apiKey}\n\nPlease save this key securely. It will not be shown again.`);
      setShowCreateModal(false);
      setNewKey({ keyName: '', permissions: [] });
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleRevoke = async (keyId: number) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      try {
        await apiClient.revokeApiKey(keyId);
        fetchApiKeys();
      } catch (error) {
        console.error('Failed to revoke API key:', error);
      }
    }
  };
  useEffect(() => {
    if (!loggedInUser || tenants.length === 0) return;
 
    if (loggedInUser.role === 'tenant_admin') {
      setSelectedTenant(loggedInUser.tenant_id);
    }
  }, [loggedInUser, tenants]);

    const isTenantAdmin = (loggedInUser?.role as string) === 'tenant_admin';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors p-6">
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">API Keys</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">Manage tenant API keys</p>
          </div>
          {selectedTenant && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          )}
        </div>
 {!isTenantAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Select Tenant</CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
          <select
              value={selectedTenant || ''}
              onChange={(e) => setSelectedTenant(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              disabled={loggedInUser?.role === 'tenant_admin'} // ✅ Optional: make dropdown read-only for tenant_admin
            >
              <option value="">Select a tenant...</option>
 
              {/* ✅ Filter tenant list */}
              {loggedInUser?.role === 'tenant_admin'
                ? tenants
                    .filter((t) => t.id === loggedInUser.tenant_id)
                    .map((tenant) => (
                      <option key={tenant.id} value={tenant.id} className="dark:bg-gray-800">
                        {tenant.name} ({tenant.slug})
                      </option>
                    ))
                : tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id} className="dark:bg-gray-800">
                      {tenant.name} ({tenant.slug})
                    </option>
                  ))}
            </select>
          </CardContent>
        </Card>)}

        {selectedTenant && (
          <Card>
            <CardContent className="p-0">
              {apiKeys.length === 0 ? (
                <div className="py-12 text-center text-gray-600 dark:text-gray-400">
                  No API keys found for this tenant
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-800/50 transition-colors">
                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="text-gray-900 dark:text-gray-100 font-semibold px-6 py-4">Name</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100 font-semibold px-6 py-4">Key Prefix</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100 font-semibold px-6 py-4">Status</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100 font-semibold px-6 py-4">Rate Limit</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100 font-semibold px-6 py-4">Last Used</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100 font-semibold px-6 py-4">Created</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100 font-semibold px-6 py-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white dark:bg-gray-800/30 transition-colors">
                    {apiKeys.map((key) => (
                      <TableRow key={key.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/10 transition-colors">
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100 transition-colors px-6 py-4">{key.key_name}</TableCell>
                        <TableCell>
                          <code className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 transition-colors">
                            {key.api_key_prefix}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.is_active ? 'success' : 'danger'}>
                            {key.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 transition-colors">{key.rate_limit_per_minute}/min</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 transition-colors">
                          {key.last_used_at
                            ? format(new Date(key.last_used_at), 'MMM d, yyyy')
                            : 'Never'}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 transition-colors">{format(new Date(key.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {key.is_active && (
                            <button
                              onClick={() => handleRevoke(key.id)}
                              className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create API Key</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKey.keyName}
                    onChange={(e) => setNewKey({ ...newKey, keyName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    placeholder="Production API Key"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleCreateKey}>
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
