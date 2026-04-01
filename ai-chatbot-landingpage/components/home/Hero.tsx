"use client";

import { ArrowRight, Zap, Shield, BarChart3, Bot, Upload, Settings, Code, Users, LineChart, Building2, Palette, Sparkles, CheckCircle2, Globe, Clock, CreditCard, LayoutDashboard, FileText, Share2, Lock, TrendingUp, Award, Briefcase, MessageSquare, PieChart, GitBranch } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Add CSS animation
const style = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
`;

export function Hero() {
  const [activeMetric, setActiveMetric] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const metrics = [
    { label: "Active Workspaces", value: "12", change: "+2 this week" },
    { label: "Team Members", value: "86", change: "+12 new" },
    { label: "Documents", value: "1,248", change: "+243 added" },
    { label: "Chat Sessions", value: "3,642", change: "+28% vs last month" }
  ];

  const chatMessages = [
    {
      type: 'bot',
      message: "Hello! I'm ScopeAI Assistant, ready to help you with questions about our platform. What would you like to know?",
      time: "3:47 PM"
    },
    {
      type: 'user',
      message: "I'm interested in the multi-tenant features. Can you explain how workspaces work?",
      time: "3:48 PM"
    },
    {
      type: 'bot',
      message: "Great question! ScopeAI Chat supports multi-tenant architecture with:",
      list: ["Separate workspaces for each tenant", "Role-based access control", "Isolated data and configurations", "Centralized admin oversight"],
      time: "3:48 PM"
    },
    {
      type: 'user',
      message: "How quickly can I deploy a chatbot on my website?",
      time: "3:49 PM"
    },
    {
      type: 'bot',
      message: "Deployment is incredibly fast! Once you upload your documents and configure settings, you'll get a simple embed code. Just copy-paste it into your website - typically takes less than 5 minutes total!",
      time: "3:49 PM"
    }
  ];

  // Auto-scroll function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const metricInterval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(metricInterval);
  }, []);

  useEffect(() => {
    // Start showing messages one by one in an endless loop
    const messageInterval = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev < chatMessages.length) {
          return prev + 1;
        } else {
          // Reset to 0 to restart the loop after a brief pause
          setTimeout(() => {
            setVisibleMessages(0);
          }, 1500); // 3 second pause before restart
          return prev; // Keep current messages visible during pause
        }
      });
    }, 2000); // Show new message every 2 seconds

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    // Show typing indicator before bot messages
    if (visibleMessages > 0 && visibleMessages <= chatMessages.length) {
      const currentMessage = chatMessages[visibleMessages - 1];
      if (currentMessage && currentMessage.type === 'user' && visibleMessages < chatMessages.length) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    }
  }, [visibleMessages]);

  // Auto-scroll when messages change or typing indicator appears
  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, isTyping]);

  const features = [
    { icon: LayoutDashboard, title: "Centralized Dashboard", desc: "Track Usage, Sessions, Costs, Activity, And Performance In One Centralized Workspace." },
    { icon: FileText, title: "Knowledge Base & Documents", desc: "Upload And Manage Documents To Power Accurate, Context-Aware Chatbot Responses." },
    { icon: Settings, title: "Chatbot Configuration", desc: "Adjust Prompts, Branding, Tone, And Behavior Settings Without Complexity." },
    { icon: Code, title: "Widget Deployment", desc: "Deploy Your Chatbot Anywhere Using A Lightweight Embed Code For Fast Launch." },
    { icon: LineChart, title: "Visitor Insights & Analytics", desc: "Store Visitor Conversations, View Engagement History, And Track Visitor Profiles For Better Follow-Up And Support Visibility." },
    { icon: Users, title: "Multi-Tenant & Role Management", desc: "Manage Workspaces, Users, Permissions, Subscriptions, And Reports From One Platform." }
  ];

  const enterpriseFeatures = [
    { icon: Shield, title: "System Health Monitoring", desc: "Track Platform Uptime, Service Stability, And Operational Confidence." },
    { icon: CreditCard, title: "Plans, Billing & Usage Reports", desc: "Get Visibility Into Active Plans, Usage Limits, Billing, And Subscription Growth." },
    { icon: Lock, title: "Role-Based Access", desc: "Secure Permissions For Platform Admins, Tenant Admins, And Operational Teams." }
  ];

  return (
    <>
      <style>{style}</style>
      
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute top-40 right-1/3 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative inline-flex items-center rounded-full bg-white dark:bg-gray-900 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                  <Zap className="w-4 h-4 mr-2 text-indigo-500" />
                  ScopeAIChat — AI chatbots for real conversations, sales, and support
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2]">
                <span className="text-gray-900 dark:text-white">Unified platform for Build, Deploy, And Scale </span>
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
                  AI Chatbots
                </span>
                {/* <br />
                <span className="text-gray-900 dark:text-white">From One Unified Platform</span> */}
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mt-6">
                All-in-one AI chatbot platform—upload, customize, deploy, and monitor everything in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="#" className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
                <a href="#features" className="group inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-black dark:text-black hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 hover:shadow-md">
                  <Shield className="w-4 h-4" />
                  Book Demo
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-2 group cursor-default">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2 group cursor-default">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Multi-Role Access</span>
                </div>
                <div className="flex items-center gap-2 group cursor-default">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Secure & Scalable</span>
                </div>
              </div>
            </div>

            {/* Chatbot Widget Preview */}
            <div className="relative">
              {/* Animated Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>

              <div className="relative rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#ffffff]">ScopeAI Assistant</h3>
                      {/* <span className="text-sm text-[#ffffff]/80">ScopeAIChat — AI chatbots for real conversations, sales, and support</span> */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-[#ffffff]/80">Online</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="h-[28rem] overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 space-y-4 scrollbar-hide"
                  style={{
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none', /* IE and Edge */
                  }}
                >
                  <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none; /* Chrome, Safari and Opera */
                    }
                  `}</style>
                  
                  {chatMessages.slice(0, visibleMessages).map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''} animate-fadeIn`}>
                      {msg.type === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className={`${msg.type === 'user' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm' 
                        : 'bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm'
                      }`}>
                        <p className={`text-sm ${msg.type === 'user' ? 'text-[#ffffff]' : 'text-gray-800 dark:text-gray-200'}`}>
                          {msg.message}
                        </p>
                        {msg.list && (
                          <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {msg.list.map((item, listIdx) => (
                              <li key={listIdx}>• {item}</li>
                            ))}
                          </ul>
                        )}
                        <span className={`text-xs mt-1 block ${msg.type === 'user' ? 'text-[#ffffff]/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          {msg.time}
                        </span>
                      </div>
                      
                      {msg.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 animate-fadeIn">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Type your message..." 
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      readOnly
                    />
                    {/* <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg">
                      Get Started Free
                    </button>
                    <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 shadow-lg border border-gray-200 dark:border-gray-600">
                      Book Demo
                    </button> */}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">0/1000 characters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-white dark:to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Simple Setup</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Launch Your AI Chatbot In
              <span className="text-indigo-600 dark:text-indigo-400"> 3 Simple Steps</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">A Clean Workflow Designed for Fast Setup, Easy Management, and Scalable Growth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Upload, step: "1", title: "Add Your Knowledge", desc: "Create a Powerful Knowledge Base With PDFs, Docs, and Structured Content Sources.", color: "from-blue-500 to-cyan-500" },
              { icon: Settings, step: "2", title: "Customize Your Chatbot", desc: "Customize Branding, Prompts, Behavior, Settings, and Workspace Controls.", color: "from-indigo-500 to-purple-500" },
              { icon: Code, step: "3", title: "Deploy & Optimize", desc: "Deploy Using Widget Code and Improve Performance Using Analytics and Visitor Insights.", color: "from-purple-500 to-pink-500" }
            ].map((step, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${step.color} p-0.5`}>
                    <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="absolute top-8 right-8 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-4 py-1.5 mb-4">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Core Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Everything You Need to Run
              <span className="text-indigo-600 dark:text-indigo-400"> AI Chatbots at Scale</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">A Unified Platform that Combines Chatbot Operations, Team Management, and Enterprise-Grade Control.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="group rounded-3xl border border-slate-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#ffffff]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                {/* <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team & Workspace */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-4 py-1.5 mb-4">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Team & Workspace</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Bring Teams, Tenants, and Operations into
                <span className="text-indigo-600 dark:text-indigo-400"> One Shared Control Center</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Manage Users, Assign Roles, Switch Workspaces, and Keep Collaboration Secure While Maintaining Full Operational Visibility.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Invite users and assign role-based access",
                  "Manage tenant-level and platform-level workspaces",
                  "Scale securely across growing teams",
                  "Real-time collaboration and activity tracking"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">Access Snapshot</h3>
                  <Building2 className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="space-y-4">
                  {[
                    { role: "Admins", desc: "Platform & Tenant Control", count: "6", color: "from-indigo-500 to-purple-500" },
                    { role: "Support Agents", desc: "Daily Chatbot Operations", count: "42", color: "from-blue-500 to-cyan-500" },
                    { role: "Knowledge Editors", desc: "Knowledge & Configuration Contributors", count: "18", color: "from-purple-500 to-pink-500" }
                  ].map((item, idx) => (
                    <div key={idx} className="rounded-2xl bg-white border border-slate-200 dark:border-gray-700 p-5 flex items-center justify-between group hover:shadow-md transition-all">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.role}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl font-bold text-[#ffffff]">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customization */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 shadow-xl">
                  <div className="flex items-start gap-2 mb-6">
                    <Palette className="w-6 h-6 text-indigo-500 mt-2 shrink-0" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Build, Deploy, and Scale AI Chatbots from One Unified Platform
                    </h1>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: "Branding", desc: "Logo, colors, widget appearance" },
                      { title: "Prompt & Behavior Controls", desc: "Tone, behavior, and response style" },
                      { title: "Workspace Settings", desc: "Tenant preferences and admin controls" },
                      { title: "Advanced Admin Controls", desc: "Reusable configuration modules" }
                    ].map((item, idx) => (
                      <div key={idx} className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 p-4 group hover:scale-[1.02] transition-transform">
                        <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-4 py-1.5 mb-4">
                <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Customization</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Tailor Your Chatbot to Your
                <span className="text-indigo-600 dark:text-indigo-400"> Brand and Workflows</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Configure Chatbot Behavior, Widget Appearance, Tenant Settings, and Advanced Modules to Create a Consistent Customer Experience.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Fine-Tune Chatbot Behavior Without Engineering Effort",
                  "Keep Branding Consistent Across All Widget Experiences",
                  "Scale Operations Using Centralized Advanced Controls",
                  "Create Reusable Templates for Different Use Cases"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-4 py-1.5 mb-4">
              <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Analytics & Insights</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              See What Visitors Are Doing
              <span className="text-indigo-600 dark:text-indigo-400"> in Real Time</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Measure Engagement, Optimize Chatbot Performance, and Make Smarter Decisions with Clear Analytics.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Visitor Sessions", value: "5,812", change: "+18.4% this month", trend: "up", color: "from-emerald-500 to-green-500" },
              { label: "Avg Response Time", value: "1.1s", change: "Fast & Optimized", trend: "up", color: "from-blue-500 to-cyan-500" },
              { label: "Engagement Rate", value: "72%", change: "Strong Interaction Quality", trend: "up", color: "from-purple-500 to-pink-500" },
              { label: "Usage Cost", value: "$428.65", change: "Transparent Cost Tracking", trend: "neutral", color: "from-indigo-500 to-purple-500" }
            ].map((stat, idx) => (
              <div key={idx} className="group rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <p className="text-sm text-slate-500 dark:text-gray-400">{stat.label}</p>
                <p className={`mt-3 text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
                <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {stat.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-4 py-1.5 mb-4">
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Enterprise Ready</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Built for Reliability,
                <span className="text-indigo-600 dark:text-indigo-400"> Governance, and Scale</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                From System Health Monitoring to Active Plan Reports and Role-Based Access, ScopeAIChat is Designed for Production-Ready AI Deployments.
              </p>

              <div className="mt-8 space-y-4">
                {enterpriseFeatures.map((feature, idx) => (
                  <div key={idx} className="rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 p-5 hover:shadow-md transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-[#ffffff]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                        <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-6 h-6 text-indigo-500 shrink-0" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Why Teams Choose ScopeAIChat</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "1-line", desc: "Widget Deployment", icon: Code },
                    { title: "Multi-role", desc: "Tenant & Admin Architecture", icon: Users },
                    { title: "Analytics", desc: "For Usage & Cost Visibility", icon: LineChart },
                    { title: "99.9%", desc: "System Health Visibility", icon: Shield }
                  ].map((item, idx) => (
                    <div key={idx} className="rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-800/80 p-5 border border-slate-200 dark:border-gray-700 group hover:shadow-md transition-all">
                      <item.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Add this to your global CSS file:
// @keyframes gradient-x {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }
// .animate-gradient-x {
//   background-size: 200% auto;
//   animation: gradient-x 3s ease infinite;
// }