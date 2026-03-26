"use client";

import React, { useState } from "react";
import { plans } from "@/lib/Constants";
import { Check } from "lucide-react";

export function PricingSection() {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");

  // Helper function to get price based on billing cycle
  const getPrice = (monthlyPrice: number, yearlyDiscount: number = 20) => {
    if (billing === "monthly") return monthlyPrice;
    return Math.round(monthlyPrice * 12 * (1 - yearlyDiscount / 100));
  };

  // Helper to get formatted price display
  const formatPrice = (price: number) => {
    if (price === 0) return "$0";
    return `$${price}`;
  };

  // Helper to get period text
  const getPeriodText = () => {
    return billing === "monthly" ? "/month" : "/year";
  };

  const toggleBilling = () => {
    setBilling(prev => prev === "monthly" ? "yearly" : "monthly");
  };

  return (
    <section className="w-full pb-20 bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 dark:from-blue-950/30 via-white dark:via-gray-950 to-purple-50 dark:to-purple-950/30 transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.12),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_25%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.2),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_25%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors">
              Simple & scalable pricing
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl transition-colors">
              Choose a plan that grows with your ScopeAIChat
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400 transition-colors">
              Start free, scale as usage grows, and unlock advanced features when your chatbot becomes business-critical.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="/contact" className="inline-flex items-center rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                Talk to Sales
              </a>
            </div>

            {/* Billing Toggle UI */}
            <div className="mt-10 inline-flex items-center gap-4 rounded-full border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900/80 px-5 py-3 shadow-sm transition-colors backdrop-blur-sm">
              <span className={`text-sm font-semibold transition-colors ${billing === "monthly" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"}`}>
                Monthly
              </span>
              <button
                onClick={toggleBilling}
                className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-100 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                role="switch"
                aria-checked={billing === "yearly"}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-300 shadow-md transition-transform duration-200 ease-in-out ${billing === "yearly" ? "translate-x-8" : "translate-x-1"
                    }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${billing === "yearly" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"}`}>
                Yearly
              </span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-colors">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">

            {/* Free */}
            <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Free</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">Best for trying out your first chatbot.</p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-bold text-gray-900 dark:text-white transition-colors">$0</span>
                <span className="mb-1 text-gray-500 dark:text-gray-400 transition-colors">/month</span>
              </div>

              <a href="#" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-50 dark:bg-gray-800 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 transition-all duration-200">
                Start Free
              </a>

              <ul className="mt-8 space-y-3 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  Up to 5 users
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  20 document collections
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  Unlimited uploads
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  Unlimited storage
                </li>
              </ul>
            </div>

            {/* Gold (Recommended) */}
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-[1px] shadow-2xl">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#ffffff]">Gold</h3>
                  <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">Recommended</span>
                </div>

                <p className="mt-2 text-sm text-[#ffffff]/80">Perfect for growing teams and active deployments.</p>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-bold text-[#ffffff]">
                    {billing === "monthly" ? "$99" : `$${getPrice(99)}`}
                  </span>
                  <span className="mb-1 text-[#ffffff]/80">{getPeriodText()}</span>
                </div>

                <a href="#" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200">
                  Get Started
                </a>

                <ul className="mt-8 space-y-3 text-sm text-[#ffffff]">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Up to 25 users
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    15 document collections
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    500MB file upload
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Unlimited storage
                  </li>
                </ul>
              </div>
            </div>

            {/* Platinum */}
            <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Platinum</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">For teams needing higher limits and support.</p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-bold text-gray-900 dark:text-white transition-colors">
                  {billing === "monthly" ? "$400" : `$${getPrice(400)}`}
                </span>
                <span className="mb-1 text-gray-500 dark:text-gray-400 transition-colors">{getPeriodText()}</span>
              </div>

              <a href="#" className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200">
                Book Demo
              </a>

              <ul className="mt-8 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  Up to 40 users
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  40 document collections
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  1000MB file upload
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  Priority support
                </li>
              </ul>
            </div>

            {/* Silver / Enterprise */}
            <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Silver</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">For enterprise teams with custom requirements.</p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-bold text-gray-900 dark:text-white transition-colors">
                  {billing === "monthly" ? "$499" : `$${getPrice(499)}`}
                </span>
                <span className="mb-1 text-gray-500 dark:text-gray-400 transition-colors">{getPeriodText()}</span>
              </div>

              <a href="#" className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200">
                Contact Sales
              </a>

              <ul className="mt-8 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  Unlimited users
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  Custom APIs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  24/7 SLA support
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  Enterprise onboarding
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Compact Comparison Table */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg sm:p-8 transition-all duration-300 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl transition-colors">
                Compare plans at a glance
              </h2>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 transition-colors">
                Pick the right fit based on team size, usage, and support needs.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border border-blue-100 dark:border-gray-800 transition-colors">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-blue-600 dark:bg-blue-700 text-white transition-colors">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold">Feature</th>
                      <th className="px-6 py-4 text-sm font-semibold">Free</th>
                      <th className="px-6 py-4 text-sm font-semibold">Gold</th>
                      <th className="px-6 py-4 text-sm font-semibold">Platinum</th>
                      <th className="px-6 py-4 text-sm font-semibold">Silver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100 dark:divide-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    <tr>
                      <td className="px-6 py-4 font-semibold">Users</td>
                      <td className="px-6 py-4">5</td>
                      <td className="px-6 py-4">25</td>
                      <td className="px-6 py-4">40</td>
                      <td className="px-6 py-4">Unlimited</td>
                    </tr>
                    <tr className="bg-blue-50/50 dark:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">Collections</td>
                      <td className="px-6 py-4">20</td>
                      <td className="px-6 py-4">15</td>
                      <td className="px-6 py-4">40</td>
                      <td className="px-6 py-4">Custom</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold">Max Upload</td>
                      <td className="px-6 py-4">Unlimited</td>
                      <td className="px-6 py-4">500MB</td>
                      <td className="px-6 py-4">1000MB</td>
                      <td className="px-6 py-4">Custom</td>
                    </tr>
                    <tr className="bg-blue-50/50 dark:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">Support</td>
                      <td className="px-6 py-4">Basic</td>
                      <td className="px-6 py-4">7-day</td>
                      <td className="px-6 py-4">Priority</td>
                      <td className="px-6 py-4">24/7 SLA</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold">Price</td>
                      <td className="px-6 py-4 font-semibold">Free</td>
                      <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
                        {billing === "monthly" ? "$99/mo" : `$${getPrice(99)}/yr`}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {billing === "monthly" ? "$400/mo" : `$${getPrice(400)}/yr`}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {billing === "monthly" ? "$499/mo" : `$${getPrice(499)}/yr`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16 sm:pb-20 transition-colors">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl transition-colors">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 transition-colors">
              Everything you need to know before choosing a plan.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes, you can upgrade or downgrade anytime as your chatbot usage changes."
              },
              {
                question: "Do you offer yearly billing?",
                answer: "Yes, yearly billing is available and typically includes discounted pricing (save 20%)."
              },
              {
                question: "Do you offer enterprise plans?",
                answer: "Yes, enterprise customers can get custom onboarding, SLAs, and tailored integrations."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Absolutely. Your plan remains active until the end of your billing cycle."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400 transition-colors">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}