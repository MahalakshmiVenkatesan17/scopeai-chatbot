import Image from "next/image";

export const SmartTagging = () => {
  return (
    <section className="w-full py-20 px-4 text-center relative bg-white">
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
        Smart Tagging
      </h2>

      <p className="text-gray-600 text-lg mt-3 mb-12">
        Automatically organize content for faster chatbot retrieval.
      </p>

      {/* Image Wrapper */}
      <div className="flex justify-center">
        <Image
          src="/images/knowledgeBase/smart-tag.png" // Replace with your actual image
          alt="Smart Tagging Network"
          width={1200}
          height={600}
          className="object-contain"
          priority
        />
      </div>
    </section>
  );
};
