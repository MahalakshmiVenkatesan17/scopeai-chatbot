"use client";
import {
  Tags,
  GitBranch,
  Search,
  Sparkles,
  Zap,
  Cpu,
} from "lucide-react";

import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-purple-50/80 dark:from-blue-950/40 dark:via-gray-950 dark:to-purple-950/40 transition-colors">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-300/30 dark:bg-pink-600/20 rounded-full blur-2xl" />

      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center max-w-7xl">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-6 transition-colors">
          <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-medium tracking-wide text-blue-600 dark:text-blue-400">
            AI-Powered Platform
          </p>
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-5xl text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent transition-colors">
          AI-Powered Knowledge Base
          <br />
          for Smarter Responses
        </h1>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 transition-colors">
          Centralize, organize, and power your ScopeAIChat with accurate,
          up-to-date knowledge.
        </p>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { label: "Smart Tagging", icon: Tags, color: "from-blue-500 to-cyan-500" },
            { label: "Version Control", icon: GitBranch, color: "from-purple-500 to-pink-500" },
            { label: "AI Search", icon: Search, color: "from-green-500 to-emerald-500" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900/80 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer backdrop-blur-sm"
              >
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${item.color} p-1 text-white group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={14} className="w-full h-full" />
                </div>
                {item.label}
              </div>
            );
          })}
        </div>

        {/* Secondary Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-500 dark:text-gray-400 transition-colors">
          Built to improve chatbot accuracy and speed.
        </p>

        {/* Dashboard Preview */}
        <div className="mt-12 sm:mt-16 flex justify-center">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 via-transparent to-transparent dark:from-gray-950/20 pointer-events-none" />

            {/* Decorative glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <Image
              src="/images/knowledgeBase/hero-img.png"
              alt="Knowledge base dashboard - AI-powered platform for smarter chatbots"
              width={1200}
              height={720}
              className="w-full object-cover transform hover:scale-105 transition-transform duration-700"
              priority
            />

            {/* Floating badge */}
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">AI-Powered Search</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}