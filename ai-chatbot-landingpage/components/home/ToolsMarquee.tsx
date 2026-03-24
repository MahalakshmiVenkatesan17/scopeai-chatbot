"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";
import { brands } from "@/lib/Constants";

export function ToolsMarquee() {
  return (
    <section className="w-full py-28 home-tools-gradient overflow-hidden">
      {/* Heading */}
      <h2 className="md:text-4xl text-2xl font-bold text-center mb-2 text-black">
        Connect your AI chatbot to the tools you already use
      </h2>

      <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">
        Sync knowledge from CRMs, docs, and support tools seamlessly.
      </p>

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
