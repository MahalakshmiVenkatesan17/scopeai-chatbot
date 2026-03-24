import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "bg-[#635BDF]",
  borderColor = "border-t-[#635BDF]",
  backgroundColor = "",
  borderRadius = "rounded-2xl",
}: StatsCardProps) {
  const changeColors = {
    positive:
      "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
    negative: "text-red-400 bg-red-500/10 border border-red-500/20",
    neutral: "text-slate-300 bg-slate-500/10 border border-slate-500/20",
  };

  const changeSignMap = {
    positive: "+",
    negative: "-",
    neutral: "",
  };

  return (
    <Card className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1220] shadow-sm dark:shadow-2xl overflow-hidden">
      <CardContent
        className={`p-6 border-t-[3px] ${borderColor} ${backgroundColor} dark:bg-[#0B1220] ${borderRadius} transition-colors rounded-lg h-full`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
              {title}
            </p>

            <div className="flex gap-2 items-center mt-3 flex-wrap">
              <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100 max-w-full truncate">
                {value}
              </p>

              {change && (
                <p
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${changeColors[changeType]}`}
                >
                  {changeSignMap[changeType]}
                  {change}
                </p>
              )}
            </div>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconColor} text-white shadow-lg`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}