import { VendorComparisonFeatures } from "@/lib/Constants";
import { Check, X } from "lucide-react";
import Image from "next/image";

const vendors = [
  "Intercom (Fin AI)",
  "FreshDesk (Freddy AI)",
  "Tidio (Lyro AI)",
  "Zendesk",
  "HelpScout",
  "Crisp",
];

export function VendorComparison() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto home-vendor-wrapper px-12 py-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-16 mb-20">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-4xl leading-tight font-semibold text-slate-900 mb-6">
              Still doubting?
              <br />
              Here are the top 5 leading vendors compared
            </h2>

            <p className="text-sm md:text-base leading-relaxed text-[var(--foundation-blue-blue-50)]0">
              Compare the top 5 leading customer support platforms and see how
              they embed AI in their solutions.
            </p>
          </div>

          <div className="hidden md:block">
            <Image
              src="/images/articles/comparison-illustration.png"
              alt="Comparison Illustration"
              width={260}
              height={220}
              priority
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="relative overflow-x-auto">
          <table className="w-full border-collapse text-center home-vendor-table">
            <thead>
              <tr className="border-b border-[var(--foundation-blue-blue-100)]">
                <th className="py-6 text-left text-sm font-medium home-vendor-muted" />
                {vendors.map((vendor) => (
                  <th
                    key={vendor}
                    className="py-6 text-sm font-medium text-slate-900"
                  >
                    {vendor}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {VendorComparisonFeatures.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-[var(--foundation-blue-blue-100)] last:border-none"
                >
                  <td className="py-6 text-left text-sm font-medium home-vendor-muted">
                    {row.name}
                  </td>

                  {row.values.map((value, i) => (
                    <td key={i} className="py-6">
                      {value ? (
                        <span className="inline-flex home-vendor-icon rounded-full bg-[var(--foundation-blue-blue-600)] items-center justify-center">
                          <Check size={14} className="text-white stroke-2" />
                        </span>
                      ) : (
                        <span className="inline-flex home-vendor-icon rounded-full bg-[var(--foundation-blue-blue-100)] items-center justify-center">
                          <X size={14} className="text-slate-400 stroke-2" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* CTA ROW */}
              {/* <tr>
                <td className="py-6 text-left text-sm font-medium home-vendor-muted">
                  See detailed comparison
                </td>

                {vendors.map((_, i) => (
                  <td
                    key={i}
                    className="py-6 text-sm font-medium home-vendor-accent hover:underline cursor-pointer"
                  >
                    Learn more
                  </td>
                ))}
              </tr> */}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
