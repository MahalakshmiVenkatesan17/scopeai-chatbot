import Image from "next/image";

const toolLogos = [
  { name: "Calendly", src: "/images/integration/calendly.png" },
  { name: "Slack", src: "/images/integration/slack.png" },
  { name: "Zapier", src: "/images/integration/zapier.png" },
  { name: "Monday", src: "/images/integration/airtable.png" },
  { name: "Outlook", src: "/images/integration/hubspot.png" },
  { name: "Downloads", src: "/images/integration/googlesheets.png" },
  { name: "Notion", src: "/images/integration/segment.png" },
  { name: "Stream", src: "/images/integration/sendgrid.png" },
];

export function ToolsMarquee() {
  return (
    <section className="overflow-hidden bg-white px-6 py-18 dark:bg-none dark:bg-transparent md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center md:justify-start">
          <div className="w-full justify-center inline-flex items-center gap-3 text-center md:text-left">
            <span className="relative h-4 w-4">
              <span className="absolute left-1 top-0 h-[1px] w-2 rotate-45 bg-slate-400" />
              <span className="absolute left-0 top-1.5 h-[1px] w-1.5 rotate-[18deg] bg-slate-400" />
              <span className="absolute left-2 top-2.5 h-[1px] w-1.5 rotate-[70deg] bg-slate-400" />
            </span>
            <h2 className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-black md:text-[48px]">
              Connect with tools where your data lies
            </h2>
          </div>
        </div>

        <div className="relative mt-10 flex min-h-[210px] items-center justify-center md:min-h-[150px]">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7dbef] opacity-55 md:h-[420px] md:w-[420px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7dbef] opacity-55 md:h-[320px] md:w-[320px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[164px] w-[164px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7dbef] opacity-55 md:h-[220px] md:w-[220px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(114,127,221,0.16)_0%,rgba(114,127,221,0.08)_38%,transparent_70%)] blur-xl md:h-[138px] md:w-[138px]" />

          <div className="relative z-10 flex w-full max-w-[760px] items-center justify-center gap-3 md:gap-5">
            {toolLogos.slice(0, 4).map((tool) => (
              <ToolIcon key={tool.name} name={tool.name} src={tool.src} />
            ))}

            <div className="relative z-10 mx-1 flex h-[78px] w-[78px] items-center justify-center rounded-full border border-[#2f3447] bg-[radial-gradient(circle,rgba(252,252,255,0.98)_0%,rgba(229,232,247,0.98)_100%)] shadow-[0_12px_36px_rgba(103,111,184,0.18)] md:mx-3 md:h-[92px] md:w-[92px]">
              <div className="absolute h-[116px] w-[116px] rounded-full bg-[#6d79de]/10 blur-2xl md:h-[142px] md:w-[142px]" />
              <div className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-[#2f3447] bg-white md:h-[56px] md:w-[56px]">
                <div className="h-3 w-6 rounded-b-full border-x-[3px] border-b-[3px] md:h-4 md:w-7" />
              </div>
            </div>

            {toolLogos.slice(4).map((tool) => (
              <ToolIcon key={tool.name} name={tool.name} src={tool.src} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolIcon({ name, src }: { name: string; src: string }) {
  return (
    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center md:h-12 md:w-12">
      <Image
        src={src}
        alt={name}
        width={46}
        height={46}
        className="h-auto w-auto object-contain"
      />
    </div>
  );
}

export { ToolIcon as IconCard };
