"use client";
import {
  Tags,
  GitBranch,
  Search,
} from "lucide-react";

import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden knowledge-base-hero-gradient ">
      {/* Background glows */}
      <div className="absolute -top-32 -left-32 knowledge-base-hero-glow rounded-full bg-(--foundation--blue-blue-300)" />
      <div className="absolute -bottom-32 -right-32 knowledge-base-hero-glow rounded-full bg-pink-300" />

      <div className="relative mx-auto px-6 knowledge-base-hero-padding text-center">
        {/* Badge */}
        <p className="mb-5 text-xs font-medium tracking-wide text-(--foundation-blue-blue-600)">
          AI-Powered Platform
        </p>

        {/* Heading */}
        <h1 className="mx-auto knowledge-base-hero-title text-4xl sm:text-5xl font-semibold leading-tight text-gray-900">
          AI-Powered Knowledge Base
          <br />
          for Smarter Chatbots
        </h1>

        {/* Description */}
        <p className="mx-auto mt-6 knowledge-base-hero-description text-base leading-relaxed text-gray-600">
          Centralize, organize, and power your ScopeAIChat with accurate,
          up-to-date knowledge.
        </p>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {[
            { label: "Smart Tagging", icon: Tags},
            { label: "Version Control", icon: GitBranch },
            { label: "AI Search", icon: Search },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 knowledge-base-pill-shadow"
              >
                <Icon
                  size={16}
                  className="text-(--foundation-blue-blue-600)"
                />
                {item.label}
              </div>
            );
          })}
        </div>
        {/* Description */}
        <p className="mx-auto mt-6 knowledge-base-hero-description text-base leading-relaxed text-gray-600">
          Built to improve chatbot accuracy and speed.
        </p>

        {/* Dashboard Preview */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-full knowledge-base-hero-preview overflow-hidden rounded-2xl knowledge-base-hero-shadow">
            <Image
              src="/images/knowledgeBase/hero-img.png"
              alt="Knowledge base dashboard"
              width={1200}
              height={720}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
