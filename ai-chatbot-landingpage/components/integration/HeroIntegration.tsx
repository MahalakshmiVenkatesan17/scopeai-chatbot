import { Button } from "../common";

export function HeroIntegration() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 dark:from-blue-950/40 dark:via-gray-950 dark:to-purple-950/40 transition-colors">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.08),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.15),transparent_25%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-6 transition-colors">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Seamless Integration
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 transition-colors">
              ScopeAIChat Integrations
            </h2>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed sm:leading-8 max-w-md mx-auto md:mx-0 mb-6 text-base sm:text-lg transition-colors">
              Embed your ScopeAIChat on any website in minutes. Works with HTML, React, Next.js, and modern website builders — built for fast deployment and beautiful customer experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                radius="rounded-xl"
                text="Start Free"
                height="h-12"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              />
              <button className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium
                text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800/50 
                hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 
                transition-all duration-300 cursor-pointer shadow-sm hover:shadow">
                View Documentation
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>2-minute setup</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center md:justify-end relative">
            {/* Decorative glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-full blur-3xl"></div>

            <div className="relative">
              <img
                src="/images/integration/hero-integration.png"
                alt="ScopeAIChat Integrations - Embed on any website"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />

              {/* Floating badge */}
              {/* <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 animate-bounce-slow">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Ready to embed</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}