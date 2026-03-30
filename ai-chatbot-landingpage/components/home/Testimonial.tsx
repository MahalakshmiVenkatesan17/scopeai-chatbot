"use client";

import Marquee from "react-fast-marquee";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Orlando Diggs",
    role: "Position, Company name",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.",
    accent: "from-pink-500 to-orange-400",
  },
  {
    name: "Mollie Hall",
    role: "Position, Company name",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.",
    accent: "from-slate-700 to-orange-300",
  },
  {
    name: "Lori Bryson",
    role: "Position, Company name",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.",
    accent: "from-orange-500 to-sky-400",
  },
  {
    name: "Corey Hunt",
    role: "Position, Company name",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.",
    accent: "from-cyan-500 to-indigo-500",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonial() {
  return (
    <section className="overflow-hidden px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="inline-flex rounded-full bg-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            What customers say
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-black md:text-5xl">
            Customer testimonials
          </h2>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 md:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 md:w-24" />

          <Marquee speed={28} gradient={false} pauseOnHover autoFill>
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="mx-3 w-[290px] rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1 md:mx-4 md:w-[320px]"
              >
                <div className="mb-5 flex items-center gap-1 text-[#ff8a1f]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-current"
                      strokeWidth={0}
                    />
                  ))}
                </div>

                <p className="min-h-[112px] text-sm leading-7 text-black">
                  &ldquo;{item.quote}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${item.accent} text-xs font-semibold text-white`}
                  >
                    {getInitials(item.name)}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-black">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
