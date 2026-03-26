import { versions } from "../../lib/Constants";
import { GitBranch, Clock, Archive, CheckCircle, RefreshCw, Shield } from "lucide-react";

export const VersionControlSection = () => {
  // Map emoji icons to Lucide icons
  const getIcon = (icon: string) => {
    switch (icon) {
      case "🔒": return Shield;
      case "📦": return Archive;
      case "🗂️": return GitBranch;
      default: return RefreshCw;
    }
  };

  return (
    <section className="w-full py-20 px-6 md:px-16 relative overflow-hidden bg-white dark:bg-gray-950 transition-colors">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-5 dark:opacity-10 transition-opacity"
        style={{
          backgroundImage: "url('/images/knowledgeBase/knowledge-bg.png')",
        }}
      ></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 -z-5 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-950/50 dark:to-gray-950"></div>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Title + Subtitle */}
      <div className="text-center mb-12 max-w-7xl mx-auto">
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
          <GitBranch className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Track & Manage</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors">
          Version Control
        </h2>

        <p className="text-lg mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors">
          Ensure your ScopeAIChat always answers from the latest content.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {versions.map((item, index) => {
          const IconComponent = getIcon(item.icon);

          return (
            <div
              key={index}
              className="group bg-white dark:bg-gray-900/80 rounded-2xl shadow-lg hover:shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 backdrop-blur-sm"
            >
              {/* Icon with gradient background */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <IconComponent className="w-7 h-7 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed transition-colors">
                {item.desc}
              </p>

              {/* Time with status indicator */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400">{item.time}</span>
                </div>

                {item.title === "Latest Version" && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Active</span>
                  </div>
                )}

                {item.title === "Previous Version" && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <RefreshCw className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Rollback</span>
                  </div>
                )}

                {item.title === "Archived Version" && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                    <Archive className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Archived</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      {/* <div className="text-center mt-12 max-w-7xl mx-auto">
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300">
          <GitBranch className="w-4 h-4" />
          View Version History
        </button>
      </div> */}
    </section>
  );
};