'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SubscriptionPlansComponent from '@/components/subscription/SubscriptionPlansComponent';
import apiClient from '@/lib/api-client';

interface User {
  id: number;
  email: string;
  role: string;
  tenant_id?: number;
}

function SubscriptionPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await apiClient.getCurrentUser();
        setCurrentUser(user as User);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 transition-colors">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionPlansComponent
      userRole="tenant_admin"
      currentUser={currentUser}
      sessionId={sessionId}
    />
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 transition-colors">Loading plans...</p>
        </div>
      </div>
    }>
      <SubscriptionPageContent />
    </Suspense>
  );
}