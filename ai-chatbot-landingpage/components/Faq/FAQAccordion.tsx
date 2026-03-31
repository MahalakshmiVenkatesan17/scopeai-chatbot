"use client";

import { useState, useRef, useEffect } from "react";
import { faqs } from "@/lib/Constants";
import { Button } from "../common";

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [heights, setHeights] = useState<{ [key: number]: number }>({});
  const contentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const newHeights: { [key: number]: number } = {};
    Object.keys(contentRefs.current).forEach((key) => {
      const index = parseInt(key);
      const ref = contentRefs.current[index];
      if (ref) {
        newHeights[index] = openIndex === index ? ref.scrollHeight : 0;
      }
    });
    setHeights(newHeights);
  }, [openIndex]);

  return (
    <section className="w-full pb-20 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3e3d98] via-[#302f76] to-[#6e11b0]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.12),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_25%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.2),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_25%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors">
              ScopeAIChat — AI chatbots for real conversations, sales & support
            </span>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#ffffff] sm:text-5xl lg:text-6xl transition-colors">
              Frequently Asked Questions
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#ffffff] transition-colors">
              Quick answers to common questions about using ScopeAIChat to automate
              customer conversations.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16 sm:py-20">
        <div className="faq-container mx-auto px-4 mb-3 max-w-4xl">
          {/* Group FAQs by category */}
          {['Getting Started', 'Setup & Deployment', 'Features & Customization', 'Pricing & Billing', 'Security & Support'].map((category) => {
            const categoryFaqs = faqs.filter(faq => faq.category === category);
            if (categoryFaqs.length === 0) return null;
            
            return (
              <div key={category} className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {category}
                </h3>
                <div className="divide-y divide-[var(--foundation-blue-blue-100)]">
                  {categoryFaqs.map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq);
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div key={globalIndex} className="py-5">
                        <div className="overflow-hidden">
                          <button
                            onClick={() => toggleFAQ(globalIndex)}
                            className="w-full flex items-center justify-between text-left py-4"
                          >
                            <span className="text-base font-medium dark:text-[black] transition-colors">
                              {faq.question}
                            </span>
                            <span 
                              className={`text-slate-400 dark:text-gray-500 text-xl leading-none transition-all duration-300 transform ${
                                isOpen ? 'rotate-45' : 'rotate-0'
                              } transition-colors`}
                            >
                              +
                            </span>
                          </button>
                        </div>

                        <div 
                          ref={(el) => { contentRefs.current[globalIndex] = el; }}
                          style={{ height: `${heights[globalIndex] || 0}px` }}
                          className="overflow-hidden transition-all duration-300 ease-in-out"
                        >
                          <div className="faq-open-bg rounded-lg px-6 py-5 text-white mt-2">
                            <p className="text-sm leading-6 text-[#ffffff]">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* <Button
        radius="rounded-lg"
        text={"Still have questions? Let's talk."}
        className="mx-auto"
      ></Button> */}
    </section>
  );
}
