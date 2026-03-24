import { CheckCircle2, Layers3, Zap, Brain } from "lucide-react";
import Image from "next/image";
import { ContextFeatures } from "@/lib/Constants";

export default function Context() {
  return (
    <div className="w-full min-h-screen bg-white">
      <section className="context-hero-gradient border-b border-[var(--foundation-blue-blue-100)]">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="inline-flex items-center rounded-full border border-[var(--foundation--blue-blue-200)] bg-[var(--foundation-blue-blue-50)] px-4 py-1 text-xs font-medium text-[var(--foundation-blue-blue-600)]">
            AI Chatbot Core Technology
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-[var(--foundation-blue-blue-600)]">
            Context Engineering
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-lg leading-8 text-slate-500">
            The art and science of shaping intelligent AI conversations - designing what
            the model knows, remembers, and prioritizes at every interaction to deliver
            human-like understanding.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          {ContextFeatures.map((item, index) => (
            <div
              key={index}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className={index % 2 ? "md:order-2" : ""}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foundation-blue-blue-50)]0">
                  {index === 0
                    ? "Foundation"
                    : index === 1
                    ? "Architecture"
                    : "Technology"}
                </p>
                <h3 className="text-[42px] leading-tight font-bold text-slate-900 mb-6">
                  {item.title}
                </h3>
                <p className="text-[17px] leading-8 text-slate-500 mb-8">
                  {item.description}
                </p>
                <ul className="space-y-3">
                  {item.points.map((point, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[var(--foundation-blue-blue-600)]" />
                      <span className="text-[15px] text-slate-800">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`${
                  index % 2 ? "md:order-1" : ""
                } rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="w-full rounded-2xl"
                />
                <h4 className="mt-5 text-[32px] leading-tight font-bold text-slate-900">
                  {index === 0
                    ? "Precision Through Context"
                    : index === 1
                    ? "Multi-Layer Intelligence"
                    : "Context-Aware Recall"}
                </h4>
                <p className="mt-4 text-[16px] leading-7 text-slate-500">
                  {index === 0
                    ? "Well-engineered context acts as a guiding framework, ensuring AI responses stay accurate, relevant, and on-brand[citation:9]."
                    : index === 1
                    ? "Each layer serves a specific purpose, working together to create sophisticated AI understanding[citation:7]."
                    : "Advanced retrieval systems pull only the most relevant information, reducing latency and improving accuracy[citation:4]."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foundation-blue-blue-50)]0">
              Capabilities
            </p>
            <h2 className="mt-4 text-[44px] leading-tight font-semibold text-slate-900">
              Core Context Engineering Features
            </h2>
            <p className="mt-5 mx-auto max-w-3xl text-[17px] leading-8 text-slate-500">
              Advanced tools and techniques that transform basic chatbots into intelligent
              conversational partners[citation:5].
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-7">
            {[
              {
                title: "Memory & Retrieval",
                desc: "Embeddings retrieve only relevant knowledge instead of flooding the model with data, ensuring faster, precise answers[citation:1].",
                icon: Brain,
              },
              {
                title: "Adaptive Context",
                desc: "Chatbots adapt continuously using personalization signals and live data streams without retraining[citation:9].",
                icon: Zap,
              },
              {
                title: "Real-Time Optimization",
                desc: "Dynamic context adjustment based on conversation flow, user feedback, and performance metrics[citation:5].",
                icon: Layers3,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-[var(--foundation-blue-blue-100)] bg-white px-8 py-10 text-center shadow-[0_8px_32px_rgba(15,23,42,0.05)]"
              >
                <div className="mx-auto mb-7 flex h-18 w-18 items-center justify-center rounded-full bg-[var(--foundation-blue-blue-50)] text-[var(--foundation-blue-blue-50)]0">
                  <feature.icon className="h-10 w-10" />
                </div>
                <h3 className="text-[24px] font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-5 text-[15px] leading-7 text-slate-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
