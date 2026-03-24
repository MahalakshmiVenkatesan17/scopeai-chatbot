'use client';

import React, { useEffect, useState } from 'react';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import clsx from 'clsx';

export default function HomePage() {
  const [isEmbedMode, setIsEmbedMode] = useState<boolean | null>(null);
  const [tenantSlug, setTenantSlug] = useState('scope-thinkers');

  useEffect(() => {
    // Check if running in embed mode
    const params = new URLSearchParams(window.location.search);
    const embed = params.get('embed') === 'true';
    const tenant = params.get('tenant');

    setIsEmbedMode(embed);
    if (tenant) {
      setTenantSlug(tenant);
    }
  }, []);

  // Demo tenant configuration - replace with actual tenant slug
  const DEMO_TENANT_SLUG = tenantSlug;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-api.scopethinkers.ai';

  const handleError = (error: unknown) => {
    console.error('Chatbot error:', error);
  };

  const handleMessage = (message: string, response: unknown) => {

    // You can add analytics tracking here
    // gtag('event', 'chatbot_interaction', { message_length: message.length });
  };

  // Show loading state while determining mode
  if (isEmbedMode === null) {
    return <div className="w-full h-screen bg-white" />;
  }

  // If in embed mode, only show the chatbot widget
  if (isEmbedMode) {
    return (
      <div className="w-full h-screen bg-transparent">
        <ChatbotWidget
          tenantSlug={DEMO_TENANT_SLUG}
          apiUrl={API_URL}
          onError={handleError}
          onMessage={handleMessage}
          autoOpen={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br` from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-cyan-300/10 to-blue-300/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-slideIn">
              <h1 className="text-4xl font-bold gradient-text">
                AI Chatbot Demo ✨
              </h1>
              <p className="text-gray-600 mt-2 text-lg font-medium">
                Experience next-generation intelligent customer support
              </p>
            </div>
            <div className="flex items-center space-x-4 animate-slideInFromRight">
              <div className="relative">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-linear-to-r from-green-400 to-emerald-400 text-white shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse block" />
                  Live & Ready
                </span>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left column - Information */}
          <div className="space-y-8">
            {/* Hero section */}
            <div className="card-modern p-8 animate-slideIn border-l-4 border-gradient-to-b from-blue-400 to-purple-400">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <div className="w-8 h-8 text-white font-bold text-xl">🏢</div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold gradient-text mb-4">
                    Welcome to Tech
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    We&apos;re a leading technology company providing innovative solutions
                    for businesses worldwide. Our AI-powered chatbot is here to help
                    you with any questions about our products and services.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-8">
                {[
                  {
                    icon: '🚀',
                    title: '24/7 Support',
                    desc: 'Get instant answers to your questions anytime, day or night.',
                    gradient: 'from-emerald-400 to-cyan-400'
                  },
                  {
                    icon: '🧠',
                    title: 'Smart Responses',
                    desc: 'Our AI understands context and provides accurate, helpful information.',
                    gradient: 'from-blue-400 to-indigo-400'
                  },
                  {
                    icon: '⚡',
                    title: 'Easy Integration',
                    desc: 'Simple to add to any website with just a few lines of code.',
                    gradient: 'from-purple-400 to-pink-400'
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50/50 transition-all duration-200 group animate-slideIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`p-2 bg-linear-to-r ${feature.gradient} rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <div className="text-white text-lg">{feature.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample questions */}
            <div className="card-modern p-8 animate-slideIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-linear-to-r from-orange-400 to-red-400 rounded-lg shadow-lg">
                  <div className="text-white text-lg">💬</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Try asking about:
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { q: 'What products do you offer?', icon: '🛍️' },
                  { q: 'How can I contact support?', icon: '📞' },
                  { q: 'What are your pricing plans?', icon: '💰' },
                  { q: 'How do I reset my password?', icon: '🔑' },
                  { q: 'What are your business hours?', icon: '🕒' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={clsx(
                      'p-4 bg-linear-to-r from-gray-50 to-gray-100/50 rounded-xl',
                      'text-sm text-gray-700 cursor-pointer transition-all duration-200',
                      'hover:from-blue-50 hover:to-purple-50 hover:scale-[1.02]',
                      'hover:shadow-md border border-transparent hover:border-blue-200/50',
                      'group animate-slideIn'
                    )}
                    style={{ animationDelay: `${index * 0.05 + 0.3}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:animate-bounce">{item.icon}</span>
                      <span className="font-medium">&quot;{item.q}&quot;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Features */}
          <div className="space-y-8">
            {/* Features grid */}
            <div className="card-modern p-8 animate-slideIn" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-linear-to-r from-cyan-400 to-blue-400 rounded-lg shadow-lg">
                  <div className="text-white text-lg">✨</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Powerful Features
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: '🤖',
                    title: 'AI Powered',
                    desc: 'Advanced AI models',
                    gradient: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: '🏗️',
                    title: 'Multi-tenant',
                    desc: 'Isolated data per tenant',
                    gradient: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: '🎨',
                    title: 'Customizable',
                    desc: 'Brand colors & styling',
                    gradient: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: '📱',
                    title: 'Responsive',
                    desc: 'Works on all devices',
                    gradient: 'from-orange-500 to-red-500'
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group text-center p-5 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer animate-slideIn"
                    style={{
                      background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                      animationDelay: `${index * 0.1 + 0.2}s`
                    }}
                  >
                    <div className={`w-12 h-12 bg-linear-to-r ${feature.gradient} rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                      <div className="text-white text-xl">{feature.icon}</div>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration code example */}
            <div className="card-modern p-8 animate-slideIn" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-linear-to-r from-indigo-400 to-purple-400 rounded-lg shadow-lg">
                  <div className="text-white text-lg">🚀</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Easy Integration
                </h3>
              </div>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Add this powerful chatbot to your website with just a few lines of code:
              </p>

              <div className="relative">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-red-500 rounded-full"></div>
                <div className="absolute -top-3 -left-1 w-6 h-6 bg-yellow-500 rounded-full"></div>
                <div className="absolute -top-3 left-1 w-6 h-6 bg-green-500 rounded-full"></div>

                <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-sm text-gray-300 overflow-x-auto border border-gray-700 shadow-2xl">
                  <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-700">
                    <div className="text-green-400 font-mono">→</div>
                    <span className="text-gray-400 text-xs">integration.html</span>
                  </div>
                  <pre className="leading-relaxed">
{`<!-- Add to your website -->
<script>
  window.AIChatbotConfig = {
    tenant: 'your-tenant-slug',
    apiUrl: '${API_URL}'
  };
</script>
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"></script>`}
                  </pre>
                </div>

                {/* Copy button */}
                <button className="absolute top-2 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 group">
                  <div className=" text-gray-300 group-hover:text-white">📋</div>
                </button>
              </div>
            </div>

            {/* Call to action */}
            <div className="card-modern p-8 bg-linear-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 animate-slideIn" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <div className="w-16 h-16 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-bounce">
                  <div className="text-white text-2xl">💬</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Ready to get started?
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Click the chat icon in the bottom-right corner to experience the magic of AI-powered support!
                </p>
                <div className="inline-flex items-center space-x-2 text-sm text-indigo-600 font-medium">
                  <span>👆</span>
                  <span>Try it now</span>
                  <span className="animate-pulse">✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center animate-slideIn" style={{ animationDelay: '0.6s' }}>
          <div className="card-modern p-8 bg-linear-to-r from-gray-50 to-white border border-gray-100">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-lg">🎯</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Experience the Future of Customer Support
                </h3>
              </div>

              <div className="text-gray-600 text-sm max-w-2xl leading-relaxed mb-4">
                Click the <strong>chat icon</strong> in the bottom-right corner to start an intelligent conversation!
                Our AI assistant is ready to help you discover the possibilities.
              </div>

              <div className="flex items-center space-x-6 text-xs text-gray-500 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  <span>🚀</span>
                  <span>Demo Mode</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⚡</span>
                  <span>Real-time AI</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🛡️</span>
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Chatbot Widget */}
      <ChatbotWidget
        tenantSlug={DEMO_TENANT_SLUG}
        apiUrl={API_URL}
        onError={handleError}
        onMessage={handleMessage}
        autoOpen={true}
      />
    </div>
  );
}
