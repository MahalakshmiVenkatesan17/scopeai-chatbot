import { features } from "../../lib/Constants";
import HomeFeatureCard from "./HomeFeatureCard";

export function HomeFeature() {
  return (
    <section className="py-28 px-2 bg-white">
      <h2 className="md:text-4xl text-2xl font-bold text-center mb-2 text-black">
        AI Chatbots that understand your customers
      </h2>

      <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto">
        Our AI chatbots understand intent, respond naturally, and resolve
        customer queries without human intervention.
      </p>

      <div className="space-y-14">
        {features.map((item, index) => (
          <HomeFeatureCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}
