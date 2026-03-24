"use client";

import FeatureCard from "./FeatureCard";
import { HeroWithPreview } from "./HeroWithPreview";

export function FeaturesSection() {
  return (
    <section className="w-full bg-white pb-24">
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 ">
        <HeroWithPreview
          badge="Revolutionize"
          title="AI Search, built into your chatbot experience"
          subtitle="Help users find answers instantly through conversational search."
          buttonText="Start optimizing your site for free"
          image="/images/home/Margin.png"
        />
        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Card 1 */}
          <FeatureCard
            title="Elevate your website with AI-powered search."
            description="With Bolt, harness the Crisp AI data hub..."
            btnText="Start optimizing your site for free"
            image="/images/home/Picture-1.png"
            layout="stacked"
          />

          {/* Card 2 */}
          <FeatureCard
            title="Empower users to self-serve with AI-enhanced search"
            description="Integrate our Javascript SDK..."
            btnText="Start optimizing your site for free"
            image="/images/home/Picture.png"
            layout="stacked"
          />

          {/* Card 3 – FULL WIDTH */}
          <div className="lg:col-span-2">
            <FeatureCard
              title="Unlock insights into your users' search behavior"
              description="Don't let users leave empty-handed..."
              btnText="Start optimizing your site for free"
              image="/images/home/Picture-2.png"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
