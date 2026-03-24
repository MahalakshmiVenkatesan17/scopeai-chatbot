"use client";

import { Brain, Sliders, Zap } from "lucide-react";

const ICONS = {
  brain: Brain,
  sliders: Sliders,
  zap: Zap,
};

type IconName = keyof typeof ICONS;

interface ContextFeatureProps {
  icon: IconName;
  title: string;
  desc: string;
  color: string;
  isLast?: boolean;
}

export default function ContextFeature({
  icon,
  title,
  desc,
  color,
  isLast = false,
}: ContextFeatureProps) {
  const Icon = ICONS[icon];

  return (
    <div
      className={`group flex gap-5 p-5 transition ${
        isLast ? "" : "border-b border-gray-300"
      }`}
    >
      <div className={`flex items-center justify-center ${color}`}>
        <Icon size={30} />
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="mt-1 text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}
