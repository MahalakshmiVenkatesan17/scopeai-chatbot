import {
  MonitorSmartphone,
  Paintbrush,
  RefreshCw,
  Rocket,
  ShieldOff,
  Zap,
} from "lucide-react";
import React from "react";

export function WebsiteBuilders() {
  const data = [
    {
      icon: ShieldOff,
      title: "No visitor login required",
      desc: "Zero friction for end users. Your chatbot is instantly accessible on your site.",
    },
    {
      icon: MonitorSmartphone,
      title: "Fully responsive",
      desc: "Optimized for desktop, tablet, and mobile so conversations feel native everywhere.",
    },
    {
      icon: Paintbrush,
      title: "Customizable appearance",
      desc: "Match your brand with custom colors, welcome messages, launcher styles, and widget position.",
    },
    {
      icon: RefreshCw,
      title: "Session persistence",
      desc: "Keep context across page reloads and deliver a smoother repeat-visitor experience.",
    },
    {
      icon: Zap,
      title: "Asynchronous loading",
      desc: "The widget loads fast without blocking your page render or hurting performance.",
    },
    {
      icon: Rocket,
      title: "Fast deployment",
      desc: "Go from setup to live customer conversations in just a few minutes.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.05),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.1),transparent_25%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.05),transparent_25%)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.08),transparent_25%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 mb-4 transition-colors">
            <Rocket className="w-4 h-4 mr-2" />
            Out of the Box
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            Everything included out of the box
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed transition-colors">
            Built to deliver beautiful customer conversations without heavy
            engineering effort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, i) => {
            const IconComponent = item.icon;

            return (
              <div
                key={i}
                className="group bg-white dark:bg-gray-900/50 rounded-2xl p-6 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 backdrop-blur-sm"
              >
                {/* Icon with gradient background */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent
                    className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors"
                    strokeWidth={1.8}
                  />
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {item.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
