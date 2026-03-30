"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";

type FeatureProps = {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
  badgeText?: string;
  badgeIcon?: LucideIcon;
};

function FeatureBlock({
  title,
  description,
  image,
  reverse,
  badgeText,
  badgeIcon: BadgeIcon,
}: FeatureProps) {
  return (
    <div
      className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* CONTENT FIRST ON MOBILE */}
      <div className="w-full lg:w-1/2 text-center lg:text-left order-1 lg:order-none">
        {(badgeText || BadgeIcon) && (
          <div className="flex justify-center lg:justify-start">
            <div className="flex items-center px-3 py-1 mb-4 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 w-fit">
              {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
              {badgeText}
            </div>
          </div>
        )}

        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          {title}
        </h2>

        <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
      </div>

      {/* IMAGE ALWAYS BELOW ON MOBILE */}
      <div className="w-full lg:w-1/2 order-2 lg:order-none">
        <Image
          src={image}
          alt={title}
          width={600}
          height={400}
          className="w-full h-auto rounded-2xl shadow-lg"
        />
      </div>
    </div>
  );
}

export default FeatureBlock;
