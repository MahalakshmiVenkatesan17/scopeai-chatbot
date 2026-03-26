"use client";

import { useState, useMemo } from "react";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { brands } from "@/lib/Constants";
import { Sparkles, ChevronRight, CheckCircle } from "lucide-react";

const tabs = [
  "All",
  "Retail",
  "Automotive",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
];

export function BrandMarquee() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredBrands = useMemo(() => {
    if (activeTab === "All") return brands;
    return brands.filter((b) => b.category === activeTab);
  }, [activeTab]);

  const shouldAnimate = activeTab === "All";

  // Get count for each category
  const getCategoryCount = (category: string) => {
    if (category === "All") return brands.length;
    return brands.filter((b) => b.category === category).length;
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-950 transition-colors relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none"></div>

      <div className="relative z-10">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
            <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Trusted Partners</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Trusted by <span className="text-blue-600 dark:text-blue-400">350+</span> Global Brands
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-center mt-4 max-w-2xl mx-auto text-lg transition-colors">
            Trusted by fast-growing teams and global brands to automate customer
            conversations with AI-powered solutions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`group px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105"
                }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-white/20 rounded-full">
                  {getCategoryCount(tab)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Marquee */}
        {filteredBrands.length > 0 ? (
          shouldAnimate ? (
            <div className="relative">
              {/* Gradient overlays for smooth edges */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none"></div>

              <Marquee
                speed={40}
                pauseOnHover
                gradient={false}
                className="py-4"
              >
                {filteredBrands.map((brand, index) => (
                  <div
                    key={index}
                    className="mx-8 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      width={80}
                      height={60}
                      className="object-contain transition-all duration-300 dark:brightness-200 dark:contrast-125 opacity-70 hover:opacity-100"
                    />
                  </div>
                ))}
                {/* Duplicate brands to ensure seamless loop with no gap */}
                {filteredBrands.map((brand, index) => (
                  <div
                    key={`duplicate-${index}`}
                    className="mx-8 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      width={80}
                      height={60}
                      className="object-contain transition-all duration-300 dark:brightness-200 dark:contrast-125 opacity-70 hover:opacity-100"
                    />
                  </div>
                ))}
              </Marquee>
            </div>
          ) : (
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-10 px-4">
              {filteredBrands.map((brand, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={80}
                    height={60}
                    className="object-contain transition-all duration-300 dark:brightness-200 dark:contrast-125 opacity-70 hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No brands available for this category</p>
          </div>
        )}
      </div>
    </section>
  );
}