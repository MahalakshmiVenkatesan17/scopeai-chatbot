import { benefits } from "../../lib/Constants";
import { Brain, HelpCircle, BookOpen, Zap, BarChart3, Clock, Sparkles, TrendingUp, Shield, Users } from "lucide-react";

export const BenefitsSection = () => {
  // Map emoji icons to Lucide icons
  const getIcon = (icon: string, title: string) => {
    switch (icon) {
      case "🧠": return Brain;
      case "❓": return HelpCircle;
      case "📚": return BookOpen;
      case "💡": return Zap;
      case "📊": return BarChart3;
      default: return Sparkles;
    }
  };

  // Get icon color based on title
  const getIconColor = (title: string) => {
    if (title.includes("24/7")) return "text-blue-600 dark:text-blue-400";
    if (title.includes("Scalable")) return "text-green-600 dark:text-green-400";
    if (title.includes("Consistent")) return "text-purple-600 dark:text-purple-400";
    if (title.includes("Reduced")) return "text-orange-600 dark:text-orange-400";
    if (title.includes("Data-Driven")) return "text-cyan-600 dark:text-cyan-400";
    return "text-blue-600 dark:text-blue-400";
  };

  // Get gradient background for icon
  const getIconGradient = (title: string) => {
    if (title.includes("24/7")) return "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50";
    if (title.includes("Scalable")) return "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50";
    if (title.includes("Consistent")) return "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50";
    if (title.includes("Reduced")) return "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50";
    if (title.includes("Data-Driven")) return "from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50";
    return "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50";
  };

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-950 py-20 px-6 md:px-16 transition-colors">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.05),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.1),transparent_25%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.05),transparent_25%)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.08),transparent_25%)]"></div>

      {/* Title Section */}
      <div className="text-center mb-14 max-w-7xl mx-auto">
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
          <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Why Choose Us</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors">
          Benefits That Speak Volumes
        </h2>

        <p className="text-lg mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors">
          Discover how ScopeAIChat transforms your customer experience with intelligent automation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Top Row - First 3 benefits */}
        {benefits.slice(0, 3).map((item, index) => {
          const IconComponent = getIcon(item.icon, item.title);
          const iconColor = getIconColor(item.title);
          const iconGradient = getIconGradient(item.title);

          return (
            <div
              key={index}
              className="group bg-white dark:bg-gray-900/80 rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 backdrop-blur-sm"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className={`w-7 h-7 ${iconColor}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed transition-colors">
                {item.desc}
              </p>
            </div>
          );
        })}

        {/* Bottom Row - Benefit 4 (Data-Driven Insights) - Span 2 columns */}
        <div className="md:col-span-2 group bg-white dark:bg-gray-900/80 rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 backdrop-blur-sm">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
            <BarChart3 className="w-7 h-7 text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {benefits[3].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed transition-colors">
            {benefits[3].desc}
          </p>

          {/* Additional metrics */}
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>+40% efficiency</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
              <span>Real-time insights</span>
            </div>
          </div>
        </div>

        {/* Bottom Row - Benefit 5 (Data-Driven Insights subtitle) - Span 1 column */}
        <div className="md:col-span-1 group bg-white dark:bg-gray-900/80 rounded-2xl shadow-lg hover:shadow-xl p-8 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 backdrop-blur-sm">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
            <Zap className="w-7 h-7 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {benefits[4].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed transition-colors">
            {benefits[4].desc}
          </p>

          {/* Quick stat */}
          <div className="mt-4 flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
            <Clock className="w-4 h-4" />
            <span>Seconds, not minutes</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {/* <div className="text-center mt-12 max-w-7xl mx-auto">
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300">
          <Sparkles className="w-4 h-4" />
          See All Benefits
        </button>
      </div> */}
    </div>
  );
};