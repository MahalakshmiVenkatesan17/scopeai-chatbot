import { features } from "../../lib/Constants";
import HomeFeatureCard from "./HomeFeatureCard";

export function HomeFeature() {
  return (
    <section className="py-28 px-2 bg-white dark:bg-gray-950 transition-colors">
      <h2 className="md:text-4xl text-2xl font-bold text-center mb-2 text-black dark:text-white">
        ScopeAIChat that understand your customers
      </h2>

      <p className="text-gray-500 dark:text-gray-400 text-center mb-10 max-w-2xl mx-auto">
        Our ScopeAIChat understand intent, respond naturally, and resolve
        customer queries without human intervention.
      </p>

      <div className="space-y-8">
        {features.map((item, index) => (
          <HomeFeatureCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}
