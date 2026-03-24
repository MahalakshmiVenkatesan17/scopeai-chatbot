import { journeyStats } from "@/lib/Constants";
import React from "react";

export function Journey() {
  return (
    <section className="w-full py-24 bg-white">
      {/* Heading */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h2 className="md:text-4xl text-2xl font-bold text-center mb-2 text-black">
          Our journey in a few numbers
        </h2>

        <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto">
          With AI Chatbot you can build Conversational AI Agents that truly
          understand your needs and create intelligent conversations.
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {journeyStats.map((item, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden
              rounded-2xl
              border ${item.border}
              ${item.bg}
              px-6 py-8
              text-left
              shadow-sm
            `}
          >
            {/* Watermark Icon */}
            <div className="absolute top-4 right-4 text-5xl opacity-10">
              {item.icon}
            </div>

            <h3 className="text-3xl font-bold text-gray-900">{item.value}</h3>

            <p className="mt-2 text-sm text-gray-600 leading-snug max-w-50">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
