"use client";

import Image from "next/image";
import { Button } from "../common";
import clsx from "clsx";

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
        "flex gap-12 p-6 rounded-3xl home-feature-card-bg",
        isStacked
          ? "flex-col items-start"
          : "flex-col lg:flex-row items-center justify-between",
        !isStacked && reverse && "lg:flex-row-reverse",
      )}
    >
      {/* TEXT */}
      <div className={clsx("max-w-xl", isStacked && "mx-auto")}>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight mb-4">
          {title}
        </h2>

        <p className="text-gray-600 text-base leading-relaxed mb-6">
          {description}
        </p>

        <div
          className={clsx(
            "flex",
            isStacked
              ? "justify-start"
              : reverse
                ? "justify-end"
                : "justify-start",
          )}
        >
          {/* <Button text={btnText} /> */}
        </div>
      </div>

      {/* IMAGE */}
      <div
        className={clsx(
          "relative w-full",
          isStacked
            ? "home-feature-card-image-stacked mx-auto"
            : "home-feature-card-image",
        )}
      >
        <Image
          src={image}
          alt={imageAlt}
          width={900}
          height={600}
          className={clsx(
            "h-auto rounded-xl",
            isStacked ? "w-full" : "mx-auto",
          )}
          priority
        />
      </div>
    </div>
  );
}
