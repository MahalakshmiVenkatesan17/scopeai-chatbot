"use client";

import { useState, useMemo } from "react";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { brands } from "@/lib/Constants";

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

  return (
    <section className="py-16 bg-white">
      {/* Title */}
      <h2 className="md:text-4xl text-2xl font-bold text-center mb-4 text-black">
        Trusted by <span className="text-[var(--foundation-blue-blue-600)]">350+</span> Global Brands
      </h2>
      <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto">
        Trusted by fast-growing teams and global brands to automate customer
        conversations.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${
                activeTab === tab
                  ? "bg-[var(--foundation-blue-blue-600)] text-white"
                  : "bg-[var(--foundation-blue-blue-50)] text-[var(--foundation-blue-blue-600)] hover:bg-[var(--foundation-blue-blue-100)]"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Marquee */}
      {filteredBrands.length > 0 ? (
        shouldAnimate ? (
          <Marquee speed={40} pauseOnHover gradient={false}>
            {filteredBrands.map((brand, index) => (
              <div key={index} className="mx-12 flex items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={70}
                  height={50}
                  className="object-contain transition"
                />
              </div>
            ))}
          </Marquee>
        ) : (
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {filteredBrands.map((brand, index) => (
              <div key={index} className="flex items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={70}
                  height={50}
                  className="object-contain transition"
                />
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="text-center text-gray-500">
          No brands available for this category
        </p>
      )}
    </section>
  );
}
