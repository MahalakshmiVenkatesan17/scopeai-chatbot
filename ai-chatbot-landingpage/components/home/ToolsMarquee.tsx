"use client";
import { Plug } from "lucide-react";

import Marquee from "react-fast-marquee";
import Image from "next/image";
import { brands } from "@/lib/Constants";

export function ToolsMarquee() {
  return (
    <section className="w-full py-28 home-tools-gradient overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Heading */}
      <div className="relative z-10 text-center mb-12">
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
          <Plug className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Seamless Integrations</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Connect your ScopeAIChat to the tools you already use
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-center mt-4 max-w-2xl mx-auto transition-colors">
          Sync knowledge from CRMs, docs, and support tools seamlessly.
        </p>
      </div>

      {/* TOP MARQUEE */}
      <Marquee
        speed={35}
        gradient={false}
        pauseOnHover
        autoFill
        className="home-marquee-top"
      >
        <div className="flex gap-8 px-8 home-marquee-inner-top">
          {brands.map((brand, i) => (
            <IconCard key={i} src={brand.logo} />
          ))}
        </div>
      </Marquee>

      {/* CENTER HUB */}
      <div className="relative flex justify-center my-14">
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-48 h-48 rounded-full border border-[var(--foundation--blue-blue-200)] animate-pulse" />
          <div className="w-32 h-32 rounded-full border border-[var(--foundation--blue-blue-300)] absolute" />
        </div>

        <div className="relative z-10 w-20 h-20 rounded-2xl home-tools-core flex items-center justify-center shadow-xl">
          <Image
            src="/images/home/Tars Logo.svg"
            alt="Core"
            width={40}
            height={40}
          />
        </div>
      </div>

      {/* BOTTOM MARQUEE */}
      <Marquee
        speed={35}
        gradient={false}
        direction="right"
        pauseOnHover
        autoFill
        className="home-marquee-bottom"
      >
        <div className="flex gap-8 px-8 home-marquee-inner-bottom">
          {brands.map((brand, i) => (
            <IconCard key={i} src={brand.logo} />
          ))}
        </div>
      </Marquee>
    </section>
  );
}

/* -------------------------------- */
/* Icon Card */
/* -------------------------------- */
export function IconCard({ src }: { src: string }) {
  return (
    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white shadow-md flex items-center justify-center transition-transform hover:scale-110">
      <Image src={src} alt="icon" width={28} height={28} />
    </div>
  );
}
