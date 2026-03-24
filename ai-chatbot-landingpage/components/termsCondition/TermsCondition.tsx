import {
  PageHeader,
  Paragraph,
  SectionHeader,
  BulletList,
} from "@/components/common/PolicyComponents";
import { termsConditionsData } from "@/lib/Constants";

export default function TermsConditions() {
  const { title, subtitle, lastUpdated, intro, sections } = termsConditionsData;

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-xl text-gray-500 mb-6">
          Last Updated: <span className="font-medium">{lastUpdated}</span>
        </p>

        <Paragraph>{intro}</Paragraph>

        {sections.map((section, index) => (
          <SectionHeader key={index} title={section.title}>
            {section.items && <BulletList items={section.items} />}
            {section.content && <Paragraph>{section.content}</Paragraph>}
          </SectionHeader>
        ))}
      </div>
    </div>
  );
}
