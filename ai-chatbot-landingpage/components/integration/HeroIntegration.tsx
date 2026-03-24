import { Button } from "../common";

export function HeroIntegration() {
  return (
    <section className="integration-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              AI Chatbot Integrations
            </h2>
            <p className="text-gray-500 leading-relaxed sm:leading-8 max-w-md mx-auto md:mx-0 mb-4">
             Embed your AI chatbot on any website in minutes. Works with HTML, React, Next.js, and modern website builders — built for fast deployment and beautiful customer experiences.
            </p>  
            <div className="flex gap-4">
              <Button radius="rounded-xl" text="Start Free" height="h-12" />
            <button className=" px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium
                  text-gray-700 hover:bg-gray-300 transition cursor-pointer">View Documentation</button>
            </div>

          </div>

          {/* Image */}
          <div className="flex justify-center md:justify-end">
            <img
              src="/images/integration/hero-integration.png"
              alt="Integrations"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
