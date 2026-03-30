import { stats } from "../../lib/Constants";

export const StatsSection = () => {
  const getCardBg = (label: string, index: number) => {
    if (label.includes("Document")) return "bg-[#f3f4f6] dark:bg-[#1f2937]";
    if (label.includes("Accuracy")) return "bg-[#f7f3fb] dark:bg-[#2a2238]";
    if (label.includes("Query") || label.includes("Response")) return "bg-[#f2f8f4] dark:bg-[#1d2b24]";
    if (label.includes("Knowledge")) return "bg-[#faf5ef] dark:bg-[#2c241d]";

    // fallback by index
    const fallback = [
      "bg-[#f3f4f6] dark:bg-[#1f2937]",
      "bg-[#f7f3fb] dark:bg-[#2a2238]",
      "bg-[#f2f8f4] dark:bg-[#1d2b24]",
      "bg-[#faf5ef] dark:bg-[#2c241d]",
    ];

    return fallback[index % fallback.length];
  };

  const getChangeColor = (label: string, sublabel?: string, changeColor?: string) => {
    if (label.includes("Accuracy") || sublabel?.toLowerCase().includes("premium")) {
      return "text-violet-500 dark:text-violet-400";
    }

    if (label.includes("Knowledge")) {
      return "text-orange-500 dark:text-orange-400";
    }

    if (changeColor) return changeColor;

    return "text-emerald-500 dark:text-emerald-400";
  };

  const getBottomText = (item: any) => {
    if (item.sublabel) return item.sublabel;
    if (item.change) return item.change;
    return "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 bg-white dark:bg-gray-950 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item, index) => {
          const bottomText = getBottomText(item);

          return (
            <div
              key={index}
              className={`rounded-2xl border border-gray-200 dark:border-gray-800 ${getCardBg(
                item.label,
                index
              )} px-4 py-4 min-h-[92px] transition-colors`}
            >
              {/* Value */}
              <h2 className="text-[28px] sm:text-[30px] font-bold leading-none tracking-[-0.03em] text-gray-900 dark:text-white">
                {item.value}
              </h2>

              {/* Label */}
              <p className="mt-2 text-[12px] font-medium leading-[1.2] text-gray-500 dark:text-gray-400">
                {item.label}
              </p>

              {/* Bottom text */}
              {bottomText && (
                <p
                  className={`mt-1 text-[11px] font-medium leading-none ${getChangeColor(
                    item.label,
                    item.sublabel,
                    item.changeColor
                  )}`}
                >
                  {bottomText}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};