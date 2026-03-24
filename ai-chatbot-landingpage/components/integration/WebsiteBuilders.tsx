import { MonitorSmartphone, Paintbrush, RefreshCw, Rocket, ShieldOff, Zap } from "lucide-react";
import React from "react";

export function WebsiteBuilders() {
  const data = [
    {
      icon: ShieldOff,
      title: "No authentication required",
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
    <section className="integration-native-bg py-10">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Everything included out of the box
        </h2>
        <p className="text-gray-500 mb-10 text-lg leading-relaxed sm:leading-8">
          Built to deliver beautiful customer conversations without heavy engineering effort.
        </p>

        <div className="grid grid-col-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, i) => {
            const IconComponent = item.icon;
            
            return (
              <div
                key={i}
                className="bg-white rounded-xl p-6 flex flex-col shadow-sm hover:shadow-md transition border border-gray-100"
              >
                {/* Icon */}
                <IconComponent className="w-6 h-6 text-gray-800 mb-5" strokeWidth={1.8} />

                <h3 className="font-bold text-gray-900 mb-2 text-base">
                  {item.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
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
