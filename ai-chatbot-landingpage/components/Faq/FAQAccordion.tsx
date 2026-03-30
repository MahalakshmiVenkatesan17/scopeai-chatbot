"use client";

import { useState } from "react";
import { faqs } from "@/lib/Constants";
import { Button } from "../common";

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white dark:bg-gray-950 py-24 transition-colors">
      <div className="faq-container mx-auto px-4 mb-3">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white mb-4 transition-colors">
            Frequently Asked Questions
          </h2>

          <p className="text-[var(--foundation-blue-blue-50)]0 dark:text-gray-400 text-base faq-header-width mx-auto transition-colors">
            Quick answers to common questions about using ScopeAIChat to automate
            customer conversations.
          </p>
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-[var(--foundation-blue-blue-100)]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} className="py-5">
                {isOpen ? (
                  /* OPEN */
                  <div className="faq-open-bg rounded-lg px-6 py-5 text-white">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-base font-medium">
                        {faq.question}
                      </span>
                      <span className="text-xl leading-none">×</span>
                    </button>

                    <div className="h-px my-4 faq-divider" />

                    <p className="text-sm leading-6 text-white/90">
                      {faq.answer}
                    </p>
                  </div>
                ) : (
                  /* CLOSED */
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between text-left py-4"
                  >
                    <span className="text-base font-medium text-slate-900 dark:text-white transition-colors">
                      {faq.question}
                    </span>
                    <span className="text-slate-400 dark:text-gray-500 text-xl leading-none transition-colors">
                      +
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* <Button
        radius="rounded-lg"
        text={"Still have questions? Let’s talk."}
        className="mx-auto"
      ></Button> */}
    </section>
  );
}
