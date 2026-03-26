import { journeyStats } from "@/lib/Constants";
import React from "react";
import {
  TrendingUp,
  Users,
  MessageCircle,
  Globe,
  Sparkles,
  BarChart3,
} from "lucide-react";

export function Journey() {
  const getIcon = (icon: string, label: string) => {
    if (icon === "🌱" || label.includes("conversations")) return MessageCircle;
    if (icon === "🤝" || label.includes("teams")) return Users;
    if (icon === "💬" || label.includes("support")) return TrendingUp;
    if (icon === "🌐" || label.includes("countries")) return Globe;
    return BarChart3;
  };

  const getGradientColor = (label: string) => {
    if (label.includes("conversations")) return "from-green-500 to-emerald-500";
    if (label.includes("teams")) return "from-blue-500 to-cyan-500";
    if (label.includes("support")) return "from-orange-500 to-red-500";
    if (label.includes("countries")) return "from-purple-500 to-pink-500";
    return "from-blue-500 to-purple-500";
  };

  const getCardClasses = (label: string, index?: number) => {
    if (label.includes("conversations")) {
      return {
        card: `
        bg-[#DFF7EA] border border-[#A7F3D0]
        dark:bg-[#DFF7EA] dark:border-[#A7F3D0]
        shadow-[0_8px_24px_rgba(16,185,129,0.08)]
      `,
        title: "text-[#0F172A] dark:text-[#0F172A]",
        text: "text-[#475569] dark:text-[#475569]",
        bubble: "bg-black/5",
      };
    }

    if (label.includes("teams")) {
      return {
        card: `
        bg-[#FDECF5] border border-[#F9A8D4]
        dark:bg-[#FDECF5] dark:border-[#F9A8D4]
        shadow-[0_8px_24px_rgba(236,72,153,0.08)]
      `,
        title: "text-[#0F172A] dark:text-[#0F172A]",
        text: "text-[#475569] dark:text-[#475569]",
        bubble: "bg-black/5",
      };
    }

    // 40% support card -> make it pastel too
    if (label.includes("support")) {
      return {
        card: `
        bg-[#FFF4E8] border border-[#FDBA74]
        dark:bg-[#FFF4E8] dark:border-[#FDBA74]
        shadow-[0_8px_24px_rgba(249,115,22,0.08)]
      `,
        title: "text-[#0F172A] dark:text-[#0F172A]",
        text: "text-[#475569] dark:text-[#475569]",
        bubble: "bg-black/5",
      };
    }

    if (label.includes("countries")) {
      return {
        card: `
        bg-[#F3ECFF] border border-[#D8B4FE]
        dark:bg-[#F3ECFF] dark:border-[#D8B4FE]
        shadow-[0_8px_24px_rgba(168,85,247,0.08)]
      `,
        title: "text-[#0F172A] dark:text-[#0F172A]",
        text: "text-[#475569] dark:text-[#475569]",
        bubble: "bg-black/5",
      };
    }

    return {
      card: `
      bg-white border border-gray-200
      dark:bg-white dark:border-gray-200
    `,
      title: "text-[#0F172A] dark:text-[#0F172A]",
      text: "text-[#475569] dark:text-[#475569]",
      bubble: "bg-black/5",
    };
  };

  return (
    <section className="relative w-full overflow-hidden py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1026] dark:via-[#111633] dark:to-[#0B1026] transition-colors">
      {/* Background glow for dark mode */}
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(124,58,237,0.08),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.05),transparent_30%)]"></div>

      {/* Light mode subtle bg */}
      <div className="absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.03),transparent_25%)]"></div>

      {/* Heading */}
      <div className="relative z-10 mx-auto mb-12 max-w-4xl px-6 text-center md:mb-16">
        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 mb-4 dark:border-[#3B44D1]/50 dark:bg-[#1A1B52]/60 backdrop-blur-sm">
          <Sparkles className="mr-2 h-4 w-4 text-blue-600 dark:text-[#8B93FF]" />
          <span className="text-sm font-medium text-blue-700 dark:text-[#A5B4FC]">
            Our Impact
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          Our journey in a few numbers
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-sm md:text-xl leading-7 md:leading-8 text-gray-600 dark:text-gray-300">
          With ScopeAIChat you can build Conversational AI Agents that truly
          understand your needs and create intelligent conversations.
        </p>
      </div>

      {/* Stats */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {journeyStats.map((item, index) => {
            const IconComponent = getIcon(item.icon, item.label);
            const styles = getCardClasses(item.label, index);

            return (
              <div
                key={index}
                className={`
                  group relative overflow-hidden rounded-[22px]
                  px-6 py-8 md:px-7 md:py-9
                  min-h-[215px]
                  transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                  ${styles.card}
                `}
              >
                {/* Icon */}
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getGradientColor(
                    item.label
                  )} shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>

                {/* Value */}
                <h3
                  className={`text-4xl md:text-5xl font-bold tracking-tight ${styles.title}`}
                >
                  {item.value}
                </h3>

                {/* Label */}
                <p
                  className={`mt-3 max-w-[13rem] text-sm md:text-base leading-6 ${styles.text}`}
                >
                  {item.label}
                </p>

                {/* Decorative bubble */}
                <div
                  className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full ${styles.bubble} opacity-60 group-hover:scale-110 transition-transform duration-300`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}