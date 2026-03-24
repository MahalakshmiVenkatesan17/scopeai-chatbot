"use client";

import Image from "next/image";
import { Button } from "../common";

interface HeroWithPreviewProps {
  badge?: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  image: string;
}

export function HeroWithPreview({
  badge,
  title,
  subtitle,
  buttonText,
  image,
}: HeroWithPreviewProps) {
  return (
    <section className="w-full">
      <div className="max-w-6xl mx-auto  mb-10">
        <div className="rounded-3xl home-hero-inner-bg px-6 sm:px-10 lg:px-16 py-16 text-center">
          {/* BADGE */}
          {badge && (
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-medium text-[var(--foundation-blue-blue-600)] shadow-sm">
                ✨ {badge}
              </span>
            </div>
          )}

          {/* TITLE */}
          <h1 className="mx-auto home-hero-title text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight mb-4">
            {title}
          </h1>

          {/* SUBTITLE */}
          {subtitle && (
            <p className="mx-auto home-hero-subtitle text-gray-600 text-sm sm:text-base mb-8">
              {subtitle}
            </p>
          )}

          {/* CTA */}
          {/* <div className="flex justify-center mb-14">
            <Button text={buttonText} />
          </div> */}

          {/* IMAGE PREVIEW */}
          <div className="relative mx-auto home-hero-preview">
            <Image
              src={image}
              alt="Product preview"
              width={1200}
              height={700}
              className="w-full rounded-xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
