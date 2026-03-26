"use client";

import Image from "next/image";
import { Button } from "../common";
import clsx from "clsx";
import { ArrowRight, Sparkles, CheckCircle, Zap, Star } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  btnText: string;
  image: string;
  imageAlt?: string;
  reverse?: boolean;
  layout?: "default" | "stacked";
}

export default function FeatureCard({
  title,
  description,
  btnText,
  image,
  imageAlt = "",
  reverse = false,
  layout = "default",
}: FeatureCardProps) {
  const isStacked = layout === "stacked";

  return (
    <div
      className={clsx(
        "group relative overflow-hidden",
        "flex gap-8 lg:gap-12 p-6 md:p-8 rounded-3xl",
        "bg-white dark:bg-gray-900/80",
        "border border-gray-200 dark:border-gray-800",
        isStacked
          ? "flex-col items-start"
          : "flex-col lg:flex-row items-center justify-between",
        !isStacked && reverse && "lg:flex-row-reverse",
      )}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* TEXT */}
      <div className={clsx("max-w-xl relative z-10", isStacked && "mx-auto text-center")}>
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 mb-4 transition-colors">
          <Sparkles className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI-Powered</span>
        </div>

        <h2 className={clsx(
          "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4 transition-colors",
          "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
        )}>
          {title}
        </h2>

        {/* <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6 transition-colors">
          {description}
        </p> */}
      </div>

      {/* IMAGE */}
      <div
        className={clsx(
          "relative group/image",
          isStacked
            ? "w-full max-w-2xl mx-auto mt-6"
            : "w-full lg:w-1/2",
        )}
      >
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-500"></div>

        <div className="relative overflow-hidden rounded-xl shadow-xl">
          <Image
            src={image}
            alt={imageAlt || title}
            width={900}
            height={600}
            className={clsx(
              "h-auto rounded-xl transition-transform",
              isStacked ? "w-full" : "w-full"
            )}
            priority
          />
        </div>
      </div>
    </div>
  );
}