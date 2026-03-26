"use client";

import Image from "next/image";
import { Button } from "../common";
import { Sparkles, ArrowRight, Zap, Star, CheckCircle } from "lucide-react";

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
    <section className="w-full py-12 md:py-16 relative overflow-hidden rounded-lg">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
        <div className="rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 px-6 sm:px-10 lg:px-16 py-12 md:py-16 text-center relative overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 transition-colors">
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

          {/* BADGE */}
          {badge && (
            <div className="flex justify-center mb-6 relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-800 px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 group hover:scale-105">
                <Sparkles className="w-3 h-3" />
                {badge}
              </span>
            </div>
          )}

          {/* TITLE */}
          <h1 className="mx-auto text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4 transition-colors relative z-10">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* SUBTITLE */}
          {subtitle && (
            <p className="mx-auto text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg mb-8 max-w-2xl transition-colors relative z-10">
              {subtitle}
            </p>
          )}

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 relative z-10">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <Star className="w-3.5 h-3.5 text-purple-500" />
              <span>4.9/5 customer rating</span>
            </div>
          </div>

          {/* IMAGE PREVIEW */}
          <div className="relative mx-auto mt-4 group">
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative rounded-xl overflow-hidden shadow-2xl">
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
      </div>
    </section>
  );
}