"use client";

import React, { useState } from "react";
import { plans } from "@/lib/Constants";
import { Check } from "lucide-react";

export function PricingSection() {
  const [billing, setBilling] = useState<"yearly" | "monthly">("monthly");

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3e3d98] via-[#302f76] to-[#6e11b0]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.12),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_25%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.2),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_25%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors">
              ScopeAIChat — AI chatbots for real conversations, sales & support
            </span>

            {/* <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl transition-colors"> */}
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#ffffff] sm:text-5xl lg:text-6xl transition-colors">
              Choose a plan that grows with your AI chatbot needs
            </h1>

            {/* <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400 transition-colors"> */}
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#ffffff] transition-colors">
              Start free, scale as usage grows, and unlock advanced controls, analytics, and enterprise features as your chatbot operations expand.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="/contact" className="inline-flex items-center rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20 pb-0!">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Billing Toggle UI */}
            <div className="mb-10 flex w-fit items-center gap-4 rounded-full border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900/80 px-5 py-3 shadow-sm transition-colors backdrop-blur-sm mx-auto">
              <span className={`text-sm font-semibold transition-colors ${billing === "monthly" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"}`}>
                Monthly
              </span>
              <button
                onClick={toggleBilling}
                className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-100 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer"
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
          <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {plans.map((plan, idx) => (
              <div key={idx} className={`rounded-2xl border ${plan.highlighted ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 'border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900/50'} p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm relative`}>
                {plan.tag && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-blue-600 dark:bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                      {plan.tag}
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">{plan.description}</p>

                <div className="mt-6 flex items-end gap-1">
                  {plan.custom ? (
                    <>
                      <span className="text-5xl font-bold text-gray-900 dark:text-white transition-colors">Custom</span>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-bold text-gray-900 dark:text-white transition-colors">
                        {formatPrice(getPrice(plan.price.monthly))}
                      </span>
                      <span className="mb-1 text-gray-500 dark:text-gray-400 transition-colors">{getPeriodText()}</span>
                    </>
                  )}
                </div>

                <a href="#" className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                  plan.highlighted 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg hover:shadow-xl' 
                    : plan.custom
                    ? 'border border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                    : 'bg-blue-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700'
                }`}>
                  {plan.button}
                </a>

                <ul className="mt-8 space-y-3 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-20 overflow-hidden rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-lg backdrop-blur-sm">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Compare all features</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">See exactly what's included in each plan</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-t border-blue-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Silver</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white">Gold</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Platinum</th>
                  </tr>
                </thead>
                <tbody className="">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Chatbots</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">1</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">3</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white">10</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Team Members</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">2</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">10</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white">25</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Document Collections</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">2</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">10</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white">Unlimited</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Widget Deployment</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Basic</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Advanced</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white">Advanced</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">White-label</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Analytics & Insights</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Basic</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Visitor insights</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white">Advanced</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Enterprise</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Multi-Tenant Controls</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">-</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">-</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white">Basic</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Advanced</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Support</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Community</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Email</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white">Priority</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Dedicated</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Price</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">$0</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">$29/mo</td>
                    <td className="px-6 py-4 text-center text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white">$79/mo</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">Custom</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}