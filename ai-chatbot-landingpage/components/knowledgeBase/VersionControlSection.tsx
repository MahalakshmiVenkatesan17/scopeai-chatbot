import { versions } from "../../lib/Constants";
import { Info, Layers3, Package2, Clock3 } from "lucide-react";

export const VersionControlSection = () => {
  const getIcon = (title: string) => {
    if (title === "Latest Version") return Info;
    if (title === "Previous Version") return Layers3;
    if (title === "Archived Version") return Package2;
    return Info;
  };

  const getIconBoxStyle = (title: string) => {
    if (title === "Archived Version") {
      return "bg-[#5B5CE2] text-white dark:bg-[#6D6EF0] dark:text-white";
    }

    return "bg-[#ECECF8] text-[#5B5CE2] dark:bg-white/10 dark:text-[#A7A8FF]";
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#F5F5FA] dark:bg-[#0b1020] transition-colors duration-300">
      {/* Background Shape Image */}
      <div className="relative w-full h-[320px] sm:h-[360px] md:h-[430px] lg:h-[500px]">
        <img
          src="/images/knowledgeBase/Group 1000002789.svg"
          alt="Version Control Background"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />

        {/* Dark mode overlay (optional because SVG is light-theme based) */}
        <div className="absolute inset-0 hidden dark:block bg-[#1D2150]/70" />

        {/* Content on top of image */}
        <div className="relative z-10 mx-auto max-w-[1180px] px-6 md:px-10 lg:px-16 pt-12 sm:pt-14 md:pt-16 lg:pt-20">
          <h2 className="text-[34px] sm:text-[40px] md:text-[52px] lg:text-[58px] font-bold tracking-[-0.03em] text-[#ffffff] leading-none">
            Document Versioning
          </h2>

          <p className="mt-4 text-[13px] sm:text-[14px] md:text-[16px] font-semibold text-[#ffffff]/95">
            Complete document history and tracking
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 md:px-10 lg:px-10">
        <div className="-mt-40 sm:-mt-40 md:-mt-50 lg:-mt-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {versions.map((item, index) => {
            const IconComponent = getIcon(item.title);

            return (
              <div
                key={index}
                className="rounded-[16px] md:rounded-[18px] border border-[#E6E7EF] dark:border-white/10 bg-white dark:bg-[#11182b] px-5 py-5 sm:px-6 sm:py-6 md:px-7 md:py-7 shadow-[0_10px_28px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-colors duration-300 min-h-[170px] sm:min-h-[180px] md:min-h-[200px]"
              >
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl ${getIconBoxStyle(
                    item.title
                  )}`}
                >
                  <IconComponent className="h-5 w-5" strokeWidth={1.8} />
                </div>

                {/* Title */}
                <h3 className="mt-5 text-[18px] md:text-[20px] font-semibold tracking-[-0.02em] text-black dark:text-[#ffffff]!">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-[12px] md:text-[13px] leading-[1.65] text-[#667085] dark:text-gray-600">
                  {item.desc}
                </p>

                {/* Time */}
                <div className="mt-5 flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-[#4F5BFF] dark:text-[#A7A8FF]">
                  <Clock3 className="h-4 w-4" strokeWidth={2} />
                  <span>{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-12 sm:h-14 md:h-16 lg:h-20" />
    </section>
  );
};