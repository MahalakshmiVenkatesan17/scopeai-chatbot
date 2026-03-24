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
      group flex gap-4 rounded-xl bg-white p-6
      shadow-sm
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:shadow-lg
    "
  >
    {/* Icon */}
    <div
      className="
        flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
        bg-[var(--foundation-blue-blue-50)] text-[var(--foundation-blue-blue-600)]
        transition-all duration-300 ease-out
        group-hover:bg-[var(--foundation-blue-blue-600)] group-hover:text-white
        group-hover:scale-105
      "
    >
      <Icon size={30} strokeWidth={1.5} />
    </div>

    {/* Content */}
    <div>
      <h3 className="font-semibold text-gray-900 transition-colors duration-300">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-relaxed text-gray-500">{desc}</p>

      <a
        href="#"
        className="
          mt-3 inline-block text-sm font-medium text-[var(--foundation-blue-blue-600)]
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
