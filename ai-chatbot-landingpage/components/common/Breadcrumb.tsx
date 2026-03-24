"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export  function Breadcrumb() {
  const pathname = usePathname();

  // Split path into segments
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb paths
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return { href, label };
  });

  // Don't show breadcrumb on homepage
  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <ol className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-[var(--foundation-blue-blue-600)] font-medium">
              Home
            </Link>
          </li>

          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-gray-900">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-[var(--foundation-blue-blue-600)] font-medium"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
