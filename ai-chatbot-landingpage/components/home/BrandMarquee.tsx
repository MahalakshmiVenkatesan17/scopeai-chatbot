import Image from "next/image";
import { brands } from "@/lib/Constants";

const featuredBrands = brands.slice(0, 4);

export function BrandMarquee() {
  return (
    <section className="bg-white px-6 py-14 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-black md:text-4xl">
          Trusted by <span className="text-[var(--foundation-blue-blue-600)]">10+</span>{" "}
          Brands
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-sm text-slate-500 md:text-lg">
          Trusted by fast-growing teams and global brands to automate customer
          conversations.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
          {featuredBrands.map((brand) => (
            <div
              key={brand.name}
              className="flex h-12 items-center justify-center"
            >
              <Image
                src={brand.logo}
                alt={`${brand.name} logo`}
                width={140}
                height={48}
                className="h-auto w-auto max-h-12 object-contain opacity-85"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
