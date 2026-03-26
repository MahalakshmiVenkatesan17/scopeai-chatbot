import { TestimonialItems } from "@/lib/Constants";
import { Star, Quote, User, Building2, Sparkles } from "lucide-react";

export function Testimonial() {
  return (
    <section className="w-full py-16 md:py-24 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-950 transition-colors relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.03),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_25%)]"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-400/5 dark:bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16 relative z-10">
        <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
          <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Customer Stories</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          What our customers say
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-center mt-4 max-w-2xl mx-auto transition-colors">
          Join thousands of businesses that trust ScopeAIChat to power their customer conversations.
        </p>
      </div>

      {/* Masonry Grid */}
      <div
        className="
          max-w-7xl mx-auto
          columns-1 sm:columns-2 lg:columns-3
          gap-6
          space-y-6
          relative z-10
        "
      >
        {TestimonialItems.map((item, index) => (
          <div
            key={index}
            className="
              break-inside-avoid
              rounded-2xl
              border border-gray-200 dark:border-gray-800
              bg-white dark:bg-gray-900/80
              shadow-md hover:shadow-xl
              overflow-hidden
              transition-all duration-300
              hover:-translate-y-1
              backdrop-blur-sm
              group
            "
          >
            {/* IMAGE CARD */}
            {item.type === "image" && item.img && (
              <div className="relative overflow-hidden">
                <img
                  src={item.img}
                  alt={item.label || 'Customer testimonial'}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105 dark:brightness-90"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <span
                  className="
                    absolute bottom-3 left-3
                    bg-black/80 backdrop-blur-sm
                    text-white
                    text-xs font-medium
                    px-3 py-1.5
                    rounded-full
                    flex items-center gap-1.5
                    transition-all duration-300
                    group-hover:scale-105
                  "
                >
                  <User className="w-3 h-3" />
                  {item.label}
                </span>
              </div>
            )}

            {/* TEXT CARD */}
            {item.type === "text" && (
              <div className="p-6">
                {/* Rating */}
                {item.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-orange-400 text-orange-400"
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                )}

                {/* Quote icon */}
                {item.quote && (
                  <div className="mb-3">
                    <Quote className="w-8 h-8 text-gray-300 dark:text-gray-700 transition-colors" strokeWidth={1} />
                  </div>
                )}

                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 transition-colors">
                  {item.text}
                </p>

                {(item.name || item.company) && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                    {item.name && (
                      <p className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5 transition-colors">
                        <User className="w-3 h-3 text-blue-500" />
                        {item.name}
                      </p>
                    )}
                    {item.company && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 flex items-center gap-1.5 transition-colors">
                        <Building2 className="w-3 h-3" />
                        {item.company}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}