import { benefits } from "../../lib/Constants";

export const BenefitsSection = () => {
  return (
    <div className="w-full benefits-section-bg py-20 px-6 md:px-16">
      <h2 className="text-center text-4xl md:text-5xl font-bold text-gray-900 mb-14">
        Benefits That Speak Volumes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Top Row */}
        {benefits.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900">
              {item.title}
            </h3>
            <p className="text-gray-600 mt-2">{item.desc}</p>
          </div>
        ))}

        {/* Bottom Row */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-xl font-semibold text-gray-900">
            {benefits[3].title}
          </h3>
          <p className="text-gray-600 mt-2">{benefits[3].desc}</p>
        </div>

        <div className="md:col-span-1 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900">
            {benefits[4].title}
          </h3>
          <p className="text-gray-600 mt-2">{benefits[4].desc}</p>
        </div>
      </div>
    </div>
  );
};
