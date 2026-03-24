

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionPlansComponent from '@/components/subscription/SubscriptionPlansComponent';
import apiClient from '@/lib/api-client';


interface User {
  id: number;
  email: string;
  role: string;
  tenant_id?: number;
}

export default function MastersSubscriptionPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await apiClient.getCurrentUser();
        setCurrentUser(user as User);

        // Check if user is super_admin
        if (user.role !== 'super_admin') {
          alert('Access denied. Super admin role required.');
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b a-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'super_admin') {
    return null;
  }

  return (
    <SubscriptionPlansComponent
      userRole="super_admin"
      currentUser={currentUser}
      sessionId={null}
    />
  );
}