import {
  Hero,
  BrandMarquee,
  HomeFeature,
  Journey,
  PrivacySecurity,
  Testimonial,
  FeaturesSection,
  ToolsMarquee,
  VendorComparison,
} from "@/components/home";

export default function Home() {
  return (
    <div>
      <Hero />
      <BrandMarquee />
      <HomeFeature />
      <ToolsMarquee />
      <PrivacySecurity />
      <Journey />
      <Testimonial />
      <FeaturesSection />
      <VendorComparison />
    </div>
  );
}
