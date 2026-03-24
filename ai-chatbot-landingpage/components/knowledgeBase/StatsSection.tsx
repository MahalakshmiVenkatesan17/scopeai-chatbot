import { stats } from "../../lib/Constants";

export const StatsSection = () => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 px-6 md:px-16 py-6 md:py-16 bg-white">
      {stats.map((item, index) => (
        <div
          key={index}
          className={`rounded-2xl p-8 shadow-sm border border-gray-100 ${item.bg}`}
        >
          <h2 className="text-4xl font-bold text-gray-900">{item.value}</h2>
          <p className="text-gray-600 mt-2">{item.label}</p>

          {item.sublabel && (
            <p className={`mt-2 text-sm font-medium ${item.subColor}`}>
              {item.sublabel}
            </p>
          )}

          {item.change && (
            <div className="flex items-center gap-1 mt-3 text-sm font-medium">
              <span className={item.changeColor}>{item.icon}</span>
              <span className={item.changeColor}>{item.change}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
