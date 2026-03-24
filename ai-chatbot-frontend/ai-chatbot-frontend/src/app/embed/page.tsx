'use client';

import { ChatbotWidget } from '@/components/ChatbotWidget/ChatbotWidget';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function EmbedContent() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant') || '';

  // Get API URL with proper localhost handling for development
  const getApiUrl = () => {
    // Try environment variable first
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envApiUrl) {
      return envApiUrl;
    }

    // Check if running on localhost for development
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
        return 'http://localhost:3001'; // Local development backend
      }
    }

    // Default to production URL
    return 'https://ai-api.scopethinkers.ai';
  };

  const apiUrl = getApiUrl();

  if (!tenant) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Missing tenant parameter. Use: /embed/?tenant=your-tenant-slug
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-transparent">
      <ChatbotWidget
        tenantSlug={tenant}
        apiUrl={apiUrl}
        onError={(error) => {
          console.error('Chatbot error:', error);
        }}
      />
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-white" />}>
      <EmbedContent />
    </Suspense>
  );
}
