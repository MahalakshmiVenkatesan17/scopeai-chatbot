"use client";

import { Check, ArrowUpRight, BarChart2, Users, FileText, Code2, Eye, CreditCard, Brain, Zap, BookOpen, DollarSign } from "lucide-react";

import { otherFeatures } from "@/lib/Constants";
import Image from "next/image";
import { primaryFeatures } from "@/lib/Constants";
import { Button } from "../common";
/* ---------------------------------- */
/* DATA CONFIG */
/* ---------------------------------- */

const tabs = ["Customer Support Team", "Agency", "E-commerce Business"];

const bulletPoints = [
  "Intelligent Conversational AI",
  "Multi-Seed Responses",
  "Learning from Conversations",
];

const features = [
  {
    icon: BarChart2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "Multi-Tenant Dashboard",
    desc: "Track tenants, active users, documents, chat sessions, total requests, response time, total cost, and average token count — with weekly activity and cost overview insights.",
    tags: ["Weekly activity", "Cost overview", "Usage metrics"],
  },
  {
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-400",
    title: "User Management",
    desc: "Let each tenant create and manage users within the same company, enabling team collaboration, access control, and shared operational ownership.",
    tags: ["Team access", "Company-level users"],
  },
  {
    icon: FileText,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    title: "Document Management",
    desc: "Upload company-specific documents and organize them using master categories so your chatbot can operate with a structured, scalable knowledge base.",
    tags: ["Knowledge base", "Master categories"],
  },
  {
    icon: Code2,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    title: "Widget Code Integration",
    desc: "Add your chatbot to websites or applications in minutes using simple script-based widget code. Fast deployment, low-code setup, and production-ready.",
    tags: ["Embed widget", "Low-code setup"],
  },
  {
    icon: Eye,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
    title: "Visitor Intelligence",
    desc: "Save conversations, track visitor profiles, and retain interaction context so teams can understand behavior, improve responses, and build better customer experiences.",
    tags: ["Visitor tracking", "Conversation history"],
  },
  {
    icon: CreditCard,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-500",
    title: "Billing & Settings",
    desc: "Manage subscription settings, access invoices for pricing plans, and keep billing centralized for finance, operations, and admin teams.",
    tags: ["Invoices", "Subscription plans"],
  },
];

const checkItems = [
  {
    title: "Operational visibility",
    desc: "Track tenants, users, sessions, requests, and usage from a single view.",
  },
  {
    title: "Performance monitoring",
    desc: "Understand response times, token averages, and overall efficiency.",
  },
  {
    title: "Cost awareness",
    desc: "See usage-driven cost patterns and make better scaling decisions.",
  },
];

const stats = [
  { label: "DOCUMENTS", value: "842" },
  { label: "CHAT SESSIONS", value: "3.8k" },
];

const bottomStats = [
  { label: "REQUESTS", value: "18.4k" },
  { label: "AVG TOKENS", value: "1.8k" },
  { label: "AVG RESP.", value: "104ms" },
];

const featuresTeam = [
  {
    icon: Brain,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-400",
    title: "Unified AI operations",
    desc: "Manage users, tenants, documents, and analytics in one connected control center.",
  },
  {
    icon: Zap,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-400",
    title: "Faster deployment",
    desc: "Launch your chatbot anywhere with simple widget scripts and low-code integration.",
  },
  {
    icon: BookOpen,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-500",
    title: "Structured knowledge",
    desc: "Organize documents by company and category so your chatbot stays accurate and scalable.",
  },
  {
    icon: DollarSign,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
    title: "Usage & cost visibility",
    desc: "Understand performance, usage trends, visitor context, and cost in real time.",
  },
];


/* ---------------------------------- */
/* COMPONENT */
/* ---------------------------------- */

export function Features() {
  return (
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* hero  */}
        <section className="py-16">  
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
             {/* Text Content */}
                      <div className="text-center md:text-left text-sm">
                        <p className="mb-3 w-fit border border-gray-800 text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full">
                          Unified ScopeAIChat Operations
                        </p>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                          Everything you need to manage and scale ScopeAIChat operations
                        </h2>
                        <p className="text-gray-500 leading-relaxed sm:leading-8 max-w-md mx-auto md:mx-0 mb-4">
                        Manage tenants, users, documents, analytics, visitor intelligence, widget deployment, subscriptions, and billing — all from one unified platform built for modern businesses.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                          {/* <Button radius="rounded-xl" text="Start Free" height="h-12" /> */}
                          <a href="/contact" className=" px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium bg-[var(--foundation-blue-blue-50)]
                            text-gray-700 hover:bg-[var(--foundation-blue-blue-600)] transition cursor-pointer hover:text-white">
                              Book a demo
                          </a>
                        </div>
                        <div className="flex my-5 gap-2 flex-wrap justify-center md:justify-start">
                           <p className="text-sm text-gray-900 leading-relaxed sm:leading-8 border border-gray-300 rounded-2xl w-fit px-3">
                          Multi-tenant ready
                        </p>
                         <p className="text-sm text-gray-900 leading-relaxed sm:leading-8 border border-gray-300 rounded-2xl w-fit px-3">
                          Low-code widget deployment
                        </p> 
                        <p className="text-sm text-gray-900 leading-relaxed sm:leading-8  border border-gray-300 rounded-2xl w-fit px-3">
                          Usage & cost visibility
                        </p>
                        </div>
                      </div>
          
                    {/* Image */}
                    <div className="flex justify-center md:justify-end">
                      <img
                        src="/images/features/hero-image.png"
                        alt="hero-banner"
                        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto"
                      />
                    </div>       
         </div>
              
        </section>

        {/* core platform features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            {/* Badge */}
            <div className="mb-4">
              <span className="border border-gray-800 text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full">
                Core Platform Features
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold text-gray-900 mb-4 max-w-2xl">
              Built to run your entire ScopeAIChat platform
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-2xl">
              Every core capability from the admin platform is reimagined here as a
              customer-facing product advantage — from analytics and team access to
              documents, widget deployment, and billing.
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col hover:shadow-md transition"
                  >
                    {/* Icon badge */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.iconBg}`}
                    >
                      <Icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={2.5} />
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-1">
                      {item.desc}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {item.tags.map((tag, j) => (
                        <span
                          key={j}
                          className="text-xs text-gray-600 border border-gray-200 rounded-full px-3 py-1 bg-gray-50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* product preview */}
        <section className="py-16 ">
           <div className="max-w-7xl mx-auto px-6">
              <div className="bg-white rounded-3xl border border-gray-200 p-10 flex flex-col lg:flex-row gap-10 items-center">
                {/* Left: Text */}
                <div className="flex-1">
                  <span className="border border-gray-800 text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full inline-block mb-6">
                    Product Preview
                  </span>

                  <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    A clear view of ScopeAIChat performance and operations
                  </h2>

                  <p className="text-gray-500 text-base leading-relaxed mb-8">
                    Monitor KPI metrics, weekly activity, cost trends, request volume,
                    and performance indicators in one premium dashboard experience
                    designed for fast decision-making.
                  </p>

                  <ul className="flex flex-col gap-4">
                    {checkItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-gray-700 mt-1 flex-shrink-0" strokeWidth={2.5} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                          <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Dashboard Preview */}
                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
                  {/* Top stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map((s, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-400 font-semibold tracking-widest mb-1">
                          {s.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Cost Overview</p>
                        <p className="text-xs text-gray-400">Monthly trend</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-600 font-medium px-3 py-1 rounded-full">
                        Stable
                      </span>
                    </div>

                    {/* SVG Chart */}
                    <svg viewBox="0 0 300 80" className="w-full mt-3" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0,60 C30,55 60,30 90,28 C120,26 150,20 180,22 C210,24 240,45 270,40 C285,37 295,35 300,33"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Bottom stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {bottomStats.map((s, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-400 font-semibold tracking-widest mb-1">
                          {s.label}
                        </p>
                        <p className="text-xl font-bold text-gray-900">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        </section>

        {/* why team choose us */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            {/* Badge */}
            <div className="flex justify-center mb-5">
              <span className="border border-gray-800 text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full">
                Why Teams Choose Us
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold text-gray-900 mb-4 max-w-2xl mx-auto leading-tight">
              One platform for operations, deployment, and insight
            </h2>

            <p className="text-gray-500 text-base mb-12 max-w-xl mx-auto">
              Replace fragmented tools with one connected platform for ScopeAIChat management.
            </p>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
              {featuresTeam.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition flex flex-col"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.iconBg}`}
                    >
                      <Icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
  );
}
