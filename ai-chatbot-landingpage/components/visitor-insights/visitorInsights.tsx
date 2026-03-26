import { INSIGHTS, VISITORSTATS } from "@/lib/Constants";
import { StatCard } from "./statCard";
import { InsightCard } from "./InsightCard";
import Image from "next/image";
import { Sparkles, BarChart3, Users, Brain, Eye, TrendingUp, MessageSquare, Zap } from "lucide-react";

export function VisitorInsights() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 transition-colors">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
            <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Powered Platform</span>
          </div>

          <h1 className="mt-4 text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Visitor Insights Dashboard
          </h1>

          <p className="mt-4 max-w-3xl mx-auto text-gray-600 dark:text-gray-400 text-lg transition-colors">
            Understand visitor behavior, track chatbot interactions, and uncover
            actionable insights.
          </p>

          <div className="mt-12 rounded-2xl p-6 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <Image
                src="/images/visitor/visitordashboard.png"
                alt="Visitor analytics dashboard showing real-time visitor behavior and chat interactions"
                width={1200}
                height={400}
                className="w-full rounded-xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= AI PROFILES ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="lg:text-left text-center">
          <div className="inline-flex items-center rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 px-4 py-1.5 mb-4 transition-colors">
            <Brain className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Visitor Profiles</span>
          </div>

          <h2 className="text-3xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            AI-Generated Visitor Profiles That Understand Every User
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md mx-auto lg:mx-0 text-lg transition-colors">
            AI-generated visitor profiles based on interaction patterns, demographics, and behavior. Each profile helps personalize conversations and predict needs.
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-900/80 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 backdrop-blur-sm group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/images/visitor/visitorprofile.png"
              alt="AI visitor profiles showing user demographics and interaction patterns"
              width={600}
              height={400}
              className="w-full rounded-lg relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* ================= WHY SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="px-6 lg:order-1 order-2 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/images/visitor/visitorInsight-illustration.png"
              alt="Visitor insight illustration showing AI analytics and data visualization"
              width={600}
              height={400}
              className="img-fluid rounded-xl relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="lg:text-left text-center">
            <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
              <BarChart3 className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Why Choose Us</span>
            </div>

            <h2 className="text-3xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Why Our Visitor Insight AI Stands Out
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md mx-auto lg:mx-0 text-lg transition-colors">
              Understand visitor intent instantly and turn conversations into
              insights and conversions.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {VISITORSTATS.map((stat) => (
              <StatCard key={stat.id} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= ACTIONABLE INSIGHTS ================= */}
      <section className="bg-[url('/images/visitor/bg-visitorInsights.png')] bg-cover bg-center bg-no-repeat pt-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-[#ffffff]">
            Actionable Insights
          </h2>
          <p className="mt-4 text-center text-[#ffffff] max-w-xl mx-auto">
            AI-generated insights help support and sales teams prioritize
            efforts and improve conversions.
          </p>

          <div className="relative md:-bottom-8 mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {INSIGHTS.map((item) => (
              <InsightCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CHAT HISTORY ================= */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 px-4 py-1.5 mb-4 transition-colors">
            <MessageSquare className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Conversation Analytics</span>
          </div>

          <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Chat History & Analysis
          </h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-lg transition-colors">
            Complete visibility into AI-powered conversations, insights, and
            performance metrics.
          </p>
        </div>

        <div className="mt-12 p-6 lg:p-10 bg-white dark:bg-gray-900/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/images/visitor/chatHistory.png"
              alt="Chat history and analysis dashboard showing conversation metrics and insights"
              width={1500}
              height={800}
              className="img-fluid rounded-xl mx-auto relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>

        {/* Additional metrics */}
        {/* <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <TrendingUp className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">87%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Response Accuracy</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <Users className="w-8 h-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">10K+</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Conversations</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <Eye className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">2.3s</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <MessageSquare className="w-8 h-8 mx-auto text-orange-600 dark:text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customer Satisfaction</p>
          </div>
        </div> */}
      </section>
    </div>
  );
}