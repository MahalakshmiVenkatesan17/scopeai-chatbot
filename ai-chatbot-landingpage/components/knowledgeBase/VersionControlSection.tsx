import { versions } from "../../lib/Constants";

export const VersionControlSection = () => {
  return (
    <section className="w-full py-20 px-6 md:px-16 relative">
      {/* Background (You will add your pattern image here) */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-white"
        style={{
          backgroundImage: "url('/images/knowledgeBase/knowledge-bg.png')",
        }}
      ></div>

      {/* Title + Subtitle */}
      <div className="text-white mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-bold">Version Control</h2>
        <p className="text-lg mt-2 opacity-90">
          Ensure your AI chatbot always answers from the latest content.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {versions.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-[var(--foundation-blue-blue-50)] flex items-center justify-center text-2xl text-[var(--foundation-blue-blue-600)] mb-4">
              {item.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mt-2">{item.desc}</p>

            {/* Time */}
            <div className="flex items-center gap-2 mt-4 text-sm text-[var(--foundation-blue-blue-600)]">
              <span className="w-2 h-2 bg-[var(--foundation-blue-blue-50)]0 rounded-full"></span>
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
