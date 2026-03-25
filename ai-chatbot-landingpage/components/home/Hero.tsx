import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden ">
      {/* Background connection lines (decorative) */}
      {/* <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 h-px w-64 border-t border-dashed border-[var(--foundation--blue-blue-300)]" />
        <div className="absolute top-24 right-10 h-px w-64 border-t border-dashed border-[var(--foundation--blue-blue-300)]" />
      </div> */}

      {/* <div
        className="absolute inset-0 -z-1 bg-contain bg-top bg-no-repeat "
        style={{
          backgroundImage: "url('/images/home/hero-bg.png')",
        }}
      /> */}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#F2F3FF_0%,#F7F7FF_45%,#FBFBFF_85%,white_65%)]" />

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-20 text-center">
        {/* Integrations Icons */}
        <div className="relative mb-10 flex justify-center gap-8">
          {[
            "/whatsapp.svg",
            "/meta.svg",
            "/google-ads.svg",
            "/wordpress.svg",
          ].map((icon, index) => (
            <div
              key={index}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[var(--foundation-blue-blue-100)]"
            >
              <Image src={icon} alt="integration" width={28} height={28} />
            </div>
          ))}
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          ScopeAIChat that convert
          <span className="block text-[var(--foundation-blue-blue-600)]">visitors into customers</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 md:text-lg">
          Automate support, qualify leads, and boost conversions with 24/7
          AI-powered conversations.
        </p>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <a href="/contact" className="cursor-pointer inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-lg ring-1 ring-[var(--foundation-blue-blue-100)] transition hover:scale-105">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            BOOK A FREE DEMO
          </a>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mt-20">
          <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-[var(--foundation-blue-blue-100)]">
            <Image
              src="/images/home/hero-section.png"
              alt="ScopeAIChat Dashboard"
              width={1200}
              height={700}
              className="rounded-2xl"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
