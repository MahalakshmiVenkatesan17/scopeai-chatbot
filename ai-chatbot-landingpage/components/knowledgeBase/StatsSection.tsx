import { stats } from "../../lib/Constants";
import { Zap, TrendingUp, Database, Award, Clock } from "lucide-react";

export const StatsSection = () => {
  // Map of icons to use for each stat
  const getIconForStat = (value: string, label: string) => {
    if (value === "50K" || label.includes("Document")) return Database;
    if (value === "98.6%" || label.includes("Accuracy")) return Award;
    if (value === "2.4s" || label.includes("Query")) return Clock;
    if (value === "256TB" || label.includes("Knowledge")) return Database;
    return TrendingUp;
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 px-6 md:px-16 py-6 md:py-16 bg-white dark:bg-gray-950 transition-colors">
      {stats.map((item, index) => {
        const IconComponent = getIconForStat(item.value, item.label);

        return (
          <div
            key={index}
            className="rounded-2xl p-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {/* Icon */}
            <div className="mb-4">
              <IconComponent
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                strokeWidth={1.5}
              />
            </div>

            <h2 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors">
              {item.value}
            </h2>

            <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors">
              {item.label}
            </p>

            {item.sublabel && (
              <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors">
                {item.sublabel}
              </p>
            )}

            {item.change && (
              <div className="flex items-center gap-1 mt-3 text-sm font-medium">
                {item.icon === "⚡" ? (
                  <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : item.icon === "📈" ? (
                  <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                ) : (
                  <span className={item.changeColor}>{item.icon}</span>
                )}
                <span className={item.changeColor}>{item.change}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};