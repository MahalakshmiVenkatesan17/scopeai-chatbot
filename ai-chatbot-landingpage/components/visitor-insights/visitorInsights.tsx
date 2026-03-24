import { INSIGHTS, VISITORSTATS } from "@/lib/Constants";
import { StatCard } from "./statCard";
import { InsightCard } from "./InsightCard";
import Image from "next/image";

export function VisitorInsights() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* ================= HERO ================= */}
      <section className="bg-[linear-gradient(180deg,#F2F3FF_0%,#F7F7FF_45%,#FBFBFF_85%,white_65%)]">
        <div className="max-w-7xl mx-auto px-6 pt-20 text-center">
          <p className="text-sm font-medium text-[var(--foundation-blue-blue-600)]">
            AI Powered Platform
          </p>

          <h1 className="mt-4 text-4xl xl:text-[48px] font-bold text-gray-900">
            Visitor Insights Dashboard
          </h1>

          <p className="mt-4 max-w-3xl mx-auto text-gray-500">
            Understand visitor behavior, track chatbot interactions, and uncover
            actionable insights.
          </p>

          <div className="mt-20 rounded-2xl p-6">
            <Image
              src="/images/visitor/visitordashboard.png"
              alt="Visitor analytics dashboard"
              width={1200}
              height={400}
              className="w-full rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* ================= AI PROFILES ================= */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="lg:text-left text-center">
          <h2 className="text-3xl xl:text-[53px] font-bold text-gray-900">
          AI-Generated Visitor Profiles That Understand Every User
          </h2>
          <p className="mt-4 text-gray-500 max-w-md mx-auto lg:mx-0 xl:text-[20px] text-[16px]">
          AI-generated visitor profiles based on interaction patterns, demographics, and behavior. Each profile helps personalize conversations and predict needs.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          {/* <img
            src="/visitorprofile.png"
            alt="AI visitor profiles"
            className="w-full rounded-lg"
          /> */}

          <Image
            src="/images/visitor/visitorprofile.png"
            alt="AI visitor profiles"
            width={600}
            height={400}
            className="w-full rounded-lg"
          />
        </div>
      </section>

      {/* ================= WHY SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="px-6 lg:order-1 order-2">
          <Image
            src="/images/visitor/visitorInsight-illustration.png"
            alt="Visitor illustration"
            width={600}
            height={400}
            className="img-fluid rounded-xl"
          />
        </div>

        <div className="order-1 lg:order-2 ">
          <div className="lg:text-left text-center">
            <h2 className="text-3xl xl:text-[53px] font-bold text-gray-900">
              Why Our Visitor Insight AI Stands Out
            </h2>
            <p className="mt-4 text-gray-500 max-w-md mx-auto lg:mx-0 xl:text-[20px] text-[16px]">
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
          <h2 className="text-center text-3xl font-bold text-white">
            Actionable Insights
          </h2>
          <p className="mt-4 text-center text-[var(--foundation-blue-blue-100)] max-w-xl mx-auto">
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
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Chat History & Analysis
        </h2>
        <p className="mt-4 text-center text-gray-500 max-w-xl mx-auto">
          Complete visibility into AI-powered conversations, insights, and
          performance metrics.
        </p>

        <div className="p-10">
          <Image
            src="/images/visitor/chatHistory.png"
            alt="Chat History"
            width={1500}
            height={800}
            className="img-fluid rounded-xl mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
