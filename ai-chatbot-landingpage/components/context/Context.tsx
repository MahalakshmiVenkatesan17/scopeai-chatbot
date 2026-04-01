import { CheckCircle2, Layers3, Zap, Brain, Sparkles, Cpu, Database, Globe, Shield, TrendingUp, MessageSquare, BarChart3 } from "lucide-react";
import Image from "next/image";
import { ContextFeatures } from "@/lib/Constants";

export default function Context() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 transition-colors">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/40 dark:bg-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/35 dark:bg-purple-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-400/25 dark:bg-blue-600/20 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute top-40 right-1/3 w-48 h-48 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-pulse delay-700"></div>
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#40404025_1px,transparent_1px),linear-gradient(to_bottom,#40404025_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        
        {/* Existing Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]"></div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
            <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">ScopeAIChat Core Technology</span>
          </div>

          <h1 className="mt-6 text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            How ScopeAIChat Understands Context
          </h1>

          <p className="mt-5 max-w-3xl mx-auto text-lg leading-8 text-gray-600 dark:text-gray-400 transition-colors">
            See how ScopeAIChat combines document context, conversation memory, and structured prompts to deliver accurate, human-like responses.
          </p>

          {/* Stats */}
          {/* <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <Cpu className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">70%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reduced Hallucinations</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <Zap className="w-8 h-8 mx-auto text-yellow-600 dark:text-yellow-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3x</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Faster Responses</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <TrendingUp className="w-8 h-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy Rate</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <Database className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1M+</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Context Tokens</p>
            </div>
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          {ContextFeatures.map((item, index) => (
            <div
              key={index}
              className="grid md:grid-cols-2 gap-12 items-center group"
            >
              <div className={index % 2 ? "md:order-2" : ""}>
                <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 mb-4 transition-colors">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {index === 0 ? "Foundation Layer" : index === 1 ? "Architecture Layer" : "Implementation Layer"}
                  </span>
                </div>
                <h3 className="text-4xl md:text-5xl leading-tight font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                  {item.title}
                </h3>
                <p className="text-lg leading-8 text-gray-600 dark:text-gray-400 mb-8 transition-colors">
                  {item.description}
                </p>
                <ul className="space-y-4">
                  {item.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 group/item">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                      <span className="text-gray-700 dark:text-gray-300 transition-colors">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`${index % 2 ? "md:order-1" : ""
                  } rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm group/card`}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                  <img
                    src={item.image}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="w-full rounded-xl relative z-10 transform group-hover/card:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <h4 className="mt-6 text-3xl leading-tight font-bold text-gray-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                  {index === 0
                    ? "Precision Through Context"
                    : index === 1
                      ? "Multi-Layer Intelligence"
                      : "Context-Aware Recall"}
                </h4>
                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">
                  {index === 0
                    ? "Well-engineered context acts as a guiding framework, ensuring AI responses stay accurate, relevant, and on-brand."
                    : index === 1
                      ? "Each layer serves a specific purpose, working together to create sophisticated AI understanding."
                      : "Advanced retrieval systems pull only the most relevant information, reducing latency and improving accuracy."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-950 py-24 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 px-4 py-1.5 mb-4 transition-colors">
              <Layers3 className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Capabilities</span>
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              How ScopeAIChat Improves Responses
            </h2>
            <p className="mt-5 mx-auto max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-400 transition-colors">
              Advanced tools and techniques that transform basic chatbots into intelligent
              conversational partners.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-7">
            {[
              {
                title: "Memory & Retrieval",
                desc: "Embeddings retrieve only relevant knowledge instead of flooding the model with data, ensuring faster, precise answers.",
                icon: Brain,
                color: "from-blue-500 to-cyan-500",
                gradient: "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50",
              },
              {
                title: "Adaptive Context",
                desc: "Chatbots adapt continuously using personalization signals and live data streams without retraining.",
                icon: Zap,
                color: "from-yellow-500 to-orange-500",
                gradient: "from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50",
              },
              {
                title: "Real-Time Optimization",
                desc: "Dynamic context adjustment based on conversation flow, user feedback, and performance metrics.",
                icon: Layers3,
                color: "from-purple-500 to-pink-500",
                gradient: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className={`mx-auto mb-6 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-10 w-10 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400`} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">
                  {feature.desc}
                </p>

                {/* Learn more link */}
                {/* <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Smarter Conversations?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Start leveraging context engineering to create AI that truly understands your users.
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
            Get Started
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </section> */}
    </div>
  );
}