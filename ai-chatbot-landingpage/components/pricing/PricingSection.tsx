"use client";

import React, { useState } from "react";
import { plans } from "@/lib/Constants";
import { Check } from "lucide-react";

export function PricingSection() {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");

  return (
    <section className="w-full pb-20 px-6 bg-gray-50">
      {/* <!-- Hero --> */}
  <section className="relative overflow-hidden bg-gradient-to-br from-[var(--foundation-blue-blue-50)] via-white to-brand-50">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.12),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_25%)]"></div>

    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          Simple & scalable pricing
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Choose a plan that grows with your AI chatbot
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Start free, scale as usage grows, and unlock advanced features when your chatbot becomes business-critical.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {/* <a href="#" className="inline-flex items-center rounded-2xl bg-[var(--foundation-blue-blue-600)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition">
            Start Free
          </a> */}
          <a href="/contact" className="inline-flex items-center rounded-2xl border border-slate-300 bg-[var(--foundation-blue-blue-50)] px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[var(--foundation-blue-blue-600)] transition hover:text-white">
            Talk to Sales
          </a>
        </div>

        {/* <!-- Billing Toggle UI --> */}
        <div className="mt-10 inline-flex items-center gap-4 rounded-full border border-[var(--foundation-blue-blue-100)] bg-white px-5 py-3 shadow-sm">
          <span className="text-sm font-semibold text-brand-700">Monthly</span>
          <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-[var(--foundation-blue-blue-100)]">
            <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow"></span>
          </button>
          <span className="text-sm font-medium text-[var(--foundation-blue-blue-50)]0">Yearly</span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Save 20%</span>
        </div>
      </div>
    </div>
  </section>

  {/* <!-- Pricing Cards --> */}
  <section className="py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">

        {/* <!-- Free --> */}
        <div className="rounded-[2rem] border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card">
          <h3 className="text-2xl font-bold">Free</h3>
          <p className="mt-2 text-sm text-slate-600">Best for trying out your first chatbot.</p>

          <div className="mt-6 flex items-end gap-1">
            <span className="text-5xl font-bold">$0</span>
            <span className="mb-1 text-[var(--foundation-blue-blue-50)]0">/month</span>
          </div>

          <a href="#" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--foundation-blue-blue-50)] px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-[var(--foundation-blue-blue-100)] transition">
            Start Free
          </a>

          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            <li>✓ Up to 5 users</li>
            <li>✓ 20 document collections</li>
            <li>✓ Unlimited uploads</li>
            <li>✓ Unlimited storage</li>
          </ul>
        </div>

        {/* <!-- Gold (Recommended) --> */}
        <div className="relative rounded-[2rem] bg-gradient-to-br from-brand-600 to-[var(--foundation-blue-blue-600)] p-[1px] shadow-glow">
          <div className="rounded-[2rem] bg-[var(--foundation-blue-blue-600)] p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Gold</h3>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Recommended</span>
            </div>

            <p className="mt-2 text-sm text-white/80">Perfect for growing teams and active deployments.</p>

            <div className="mt-6 flex items-end gap-1">
              <span className="text-5xl font-bold">$99</span>
              <span className="mb-1 text-white/80">/month</span>
            </div>

            <a href="#" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[var(--foundation-blue-blue-600)] hover:bg-[var(--foundation-blue-blue-50)] transition">
              Get Started
            </a>

            <ul className="mt-8 space-y-3 text-sm text-white">
              <li>✓ Up to 25 users</li>
              <li>✓ 15 document collections</li>
              <li>✓ 500MB file upload</li>
              <li>✓ Unlimited storage</li>
            </ul>
          </div>
        </div>

        {/* <!-- Platinum --> */}
        <div className="rounded-[2rem] border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card">
          <h3 className="text-2xl font-bold">Platinum</h3>
          <p className="mt-2 text-sm text-slate-600">For teams needing higher limits and support.</p>

          <div className="mt-6 flex items-end gap-1">
            <span className="text-5xl font-bold">$400</span>
            <span className="mb-1 text-[var(--foundation-blue-blue-50)]0">/month</span>
          </div>

          <a href="#" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition">
            Book Demo
          </a>

          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            <li>✓ Up to 40 users</li>
            <li>✓ 40 document collections</li>
            <li>✓ 1000MB file upload</li>
            <li>✓ Priority support</li>
          </ul>
        </div>

        {/* <!-- Silver / Enterprise --> */}
        <div className="rounded-[2rem] border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card">
          <h3 className="text-2xl font-bold">Silver</h3>
          <p className="mt-2 text-sm text-slate-600">For enterprise teams with custom requirements.</p>

          <div className="mt-6 flex items-end gap-1">
            <span className="text-5xl font-bold">$499</span>
            <span className="mb-1 text-[var(--foundation-blue-blue-50)]0">/month</span>
          </div>

          <a href="#" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition">
            Contact Sales
          </a>

          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            <li>✓ Unlimited users</li>
            <li>✓ Custom APIs</li>
            <li>✓ 24/7 SLA support</li>
            <li>✓ Enterprise onboarding</li>
          </ul>
        </div>

      </div>
    </div>
  </section>

  {/* <!-- Compact Comparison Table --> */}
  <section className="pb-16 sm:pb-20">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card sm:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Compare plans at a glance
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Pick the right fit based on team size, usage, and support needs.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--foundation-blue-blue-100)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[var(--foundation-blue-blue-600)] text-white">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold">Feature</th>
                  <th className="px-6 py-4 text-sm font-semibold">Free</th>
                  <th className="px-6 py-4 text-sm font-semibold">Gold</th>
                  <th className="px-6 py-4 text-sm font-semibold">Platinum</th>
                  <th className="px-6 py-4 text-sm font-semibold">Silver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--foundation-blue-blue-100)] bg-white text-sm text-slate-700">
                <tr>
                  <td className="px-6 py-4 font-semibold">Users</td>
                  <td className="px-6 py-4">5</td>
                  <td className="px-6 py-4">25</td>
                  <td className="px-6 py-4">40</td>
                  <td className="px-6 py-4">Unlimited</td>
                </tr>
                <tr className="bg-[var(--foundation-blue-blue-50)]">
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
                <tr className="bg-[var(--foundation-blue-blue-50)]">
                  <td className="px-6 py-4 font-semibold">Support</td>
                  <td className="px-6 py-4">Basic</td>
                  <td className="px-6 py-4">7-day</td>
                  <td className="px-6 py-4">Priority</td>
                  <td className="px-6 py-4">24/7 SLA</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold">Price</td>
                  <td className="px-6 py-4 font-semibold">Free</td>
                  <td className="px-6 py-4 font-semibold text-brand-700">$99/mo</td>
                  <td className="px-6 py-4 font-semibold">$400/mo</td>
                  <td className="px-6 py-4 font-semibold">$499/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* <!-- FAQ --> */}
  <section className="pb-16 sm:pb-20">
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-lg text-slate-600">
          Everything you need to know before choosing a plan.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card">
          <h3 className="text-lg font-bold">Can I change plans later?</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Yes, you can upgrade or downgrade anytime as your chatbot usage changes.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card">
          <h3 className="text-lg font-bold">Do you offer yearly billing?</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Yes, yearly billing is available and typically includes discounted pricing.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card">
          <h3 className="text-lg font-bold">Do you offer enterprise plans?</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Yes, enterprise customers can get custom onboarding, SLAs, and tailored integrations.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-6 shadow-card">
          <h3 className="text-lg font-bold">Can I cancel anytime?</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Absolutely. Your plan remains active until the end of your billing cycle.
          </p>
        </div>
      </div>
    </div>
  </section>
    </section>
  );
}
