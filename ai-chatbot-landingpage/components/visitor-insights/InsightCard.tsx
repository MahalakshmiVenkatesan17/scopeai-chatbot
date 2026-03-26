import { LucideIcon, MapPin } from "lucide-react";


interface Props {
  title: string;
  desc: string;
  action: string;
  icon: LucideIcon;
}

export const InsightCard = ({ title, desc, action, icon: Icon }: Props) => {
  return (
   <div
    className="
      group flex gap-4 rounded-xl bg-white dark:bg-gray-900 p-6
      shadow-sm border border-transparent dark:border-gray-800
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:shadow-lg transition-colors
    "
  >
    {/* Icon */}
    <div
      className="
        flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
        bg-[var(--foundation-blue-blue-50)] dark:bg-gray-800 text-[var(--foundation-blue-blue-600)] dark:text-blue-400
        transition-all duration-300 ease-out
        group-hover:bg-[var(--foundation-blue-blue-600)] group-hover:text-white
        group-hover:scale-105
      "
    >
      <Icon size={30} strokeWidth={1.5} />
    </div>

    {/* Content */}
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400 transition-colors">{desc}</p>

      <a
        href="#"
        className="
          mt-3 inline-block text-sm font-medium text-[var(--foundation-blue-blue-600)] dark:text-blue-400
          transition-all duration-300
          group-hover:translate-x-1 hover:underline
        "
      >
        {action}
      </a>
    </div>
  </div>
  );
};
