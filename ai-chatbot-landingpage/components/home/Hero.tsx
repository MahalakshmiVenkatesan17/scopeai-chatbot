import Image from "next/image";
import { Sparkles, Zap, ArrowRight, CheckCircle, MessageSquare, Users, TrendingUp, Clock } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 transition-colors" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-20 text-center relative z-10">
        {/* Integrations Icons */}
        <div className="relative mb-10 flex justify-center gap-4 sm:gap-8">
          {[
            { src: "/whatsapp.svg", label: "WhatsApp", color: "from-green-500 to-emerald-500" },
            { src: "/meta.svg", label: "Meta", color: "from-blue-500 to-cyan-500" },
            { src: "/google-ads.svg", label: "Google Ads", color: "from-blue-500 to-sky-500" },
            { src: "/wordpress.svg", label: "WordPress", color: "from-blue-600 to-purple-600" },
          ].map((icon, index) => (
            <div
              key={index}
              className="group relative flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-gray-900 shadow-md hover:shadow-xl ring-1 ring-gray-200 dark:ring-gray-800 transition-all duration-300 hover:scale-110"
            >
              <Image
                src={icon.src}
                alt={icon.label}
                width={28}
                height={28}
                className="dark:brightness-200 transition-transform duration-300 group-hover:scale-110"
              />
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-xs font-medium bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded whitespace-nowrap">
                  {icon.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-6 transition-colors">
          <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Customer Engagement</span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            ScopeAIChat that convert
          </span>
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-2">
            visitors into customers
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 dark:text-gray-400 md:text-lg transition-colors">
          Automate support, qualify leads, and boost conversions with 24/7
          AI-powered conversations that feel human.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            BOOK A FREE DEMO
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          {/* <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 px-8 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-lg ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-blue-300 dark:hover:ring-blue-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Zap className="w-4 h-4" />
            Watch Demo
          </a> */}
        </div>

        {/* Trust Indicators
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>2-minute setup</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <span>24/7 AI support</span>
          </div>
        </div> */}
        {/* Dashboard Preview */}
        <div className="relative mt-16">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative mx-auto max-w-5xl rounded-2xl bg-white dark:bg-gray-950 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden group">
            {/* Browser mockup header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">app.scopeai.chat/dashboard</span>
              </div>
              <div className="w-16"></div>
            </div>

            <Image
              src="/images/home/hero-section.png"
              alt="ScopeAIChat Dashboard - AI-powered customer engagement platform"
              width={1200}
              height={700}
              className="rounded-b-2xl dark:brightness-90"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}