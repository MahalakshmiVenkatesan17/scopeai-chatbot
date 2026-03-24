'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
  const router = useRouter();

  const handleRetry = () => {
    const saved = sessionStorage.getItem('checkoutParams');
    if (saved) {
      const p = JSON.parse(saved);
      const params = new URLSearchParams();
      if (p.plan) params.set('plan', p.plan);
      if (p.billing) params.set('billing', p.billing);
      if (p.planId) params.set('planId', p.planId);
      if (p.price) params.set('price', String(p.price));
      if (p.stripePriceId) params.set('stripePriceId', p.stripePriceId);
      if (p.description) params.set('description', p.description);
      if (p.features) params.set('features', p.features);
      params.set('cancelled', 'true');
      router.push(`/checkout?${params.toString()}`);
    } else {
      router.push('/checkout');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-background transition-colors">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 inline-flex w-20 h-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 transition-colors">
            <XCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors">
            Payment Cancelled
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors">
            Your payment was cancelled. No charges were made to your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border-2 border-gray-200 dark:border-slate-800 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
              <button
              onClick={()=> router.push('/subscription')}
              className="px-6 py-3 primary-bg-color text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
            >
             Try Again with a Plan
            </button>
            {/* <button
              onClick={handleRetry}
              className="px-6 py-3 primary-bg-color text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
            >
              Try Again
            </button> */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}