import { LucideIcon } from "lucide-react";


interface Props {
  value: string;
  label: string;
  bg: string;
  icon: LucideIcon;
  iconColor: string;
}

export const StatCard = ({ value, label, bg, icon: Icon, iconColor }: Props) => {
  return (
      <div className={`flex items-center gap-4 rounded-xl p-4 ${bg}`}>
    {/* Icon */}
    <div className={`flex h-10 w-10 items-center justify-center ${iconColor}`}>
      <Icon size={30} strokeWidth={1.5} />
    </div>

    {/* Text */}
    <div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
    </div>
  </div>
  );
};
