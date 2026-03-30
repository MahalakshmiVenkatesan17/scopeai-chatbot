"use client";

import Image from "next/image";
import { ArrowRight, Calendar, Star, Sparkles, CheckCircle, Zap, Users, MessageSquare } from "lucide-react";

export default function CTASection() {
  return (
    <section className="w-full relative overflow-hidden">
      {/* Background with gradient */}
      <div className="relative w-full bg-gradient-to-br from-[#3e3d98] via-[#302f76] to-[#6e11b0] overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1),transparent_25%)]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]"></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-white/40 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping delay-700"></div>

        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 lg:py-24 flex flex-col items-center text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 mb-6 transition-all duration-300 hover:scale-105">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
            <span className="text-xs font-medium text-[#ffffff]">Limited Time Offer</span>
          </div>

          {/* Heading */}
          <h2 className="text-[#ffffff] font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight mb-4">
             Need help getting started with
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">ScopeAIChat?</span>
          </h2>

          {/* Feature list */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-1.5 text-[#ffffff]/70 text-xs">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              <span>30-min personalized demo</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#ffffff]/70 text-xs">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>No commitment required</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#ffffff]/70 text-xs">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Expert consultation</span>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 hover:bg-gray-100 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-12"
          >
            <Calendar className="w-4 h-4" />
            Schedule a Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Badges
          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            {[
              { src: "/images/CTA/badge-1.svg", alt: "G2 High Performer", width: 72, height: 88 },
              { src: "/images/CTA/badge-2.svg", alt: "Capterra Top Rated", width: 72, height: 88 },
              { src: "/images/CTA/badge-3.svg", alt: "Trustpilot 4.9", width: 72, height: 88 },
              { src: "/images/CTA/badge-4.svg", alt: "SaaS Award Winner", width: 72, height: 88 },
            ].map((badge, index) => (
              <div key={index} className="group relative hover:scale-110 transition-transform duration-300">
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  className="w-14 sm:w-16 md:w-20 h-auto opacity-90 group-hover:opacity-100 transition-opacity"
                />
                Tooltip
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  <span className="text-[10px] font-medium bg-gray-900 text-white px-2 py-1 rounded shadow-lg">
                    {badge.alt}
                  </span>
                </div>
              </div>
            ))}
          </div> */}

          {/* Bottom decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}