"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumb() {
  const pathname = usePathname();

  // Split path into segments
  const segments = pathname.split("/").filter(Boolean);

  // Map specific URLs to custom display names
  const customLabels: Record<string, string> = {
    analytics: "Analytics & Dashboard",
    integration: "Widget Code",
  };

  // Build breadcrumb paths
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");

    // Use custom label if it exists, otherwise use default formatting
    const label =
      customLabels[segment] ||
      segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return { href, label };
  });

  // Don't show breadcrumb on homepage
  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full bg-gray-50 dark:bg-gray-900/50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <ol className="flex items-center flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
          <li>
            <Link
              href="/"
              className="hover:text-[var(--foundation-blue-blue-600)] dark:hover:text-blue-400 font-medium transition-colors"
            >
              Home
            </Link>
          </li>

          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-2">
              <span className="text-gray-400 dark:text-gray-600">/</span>
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-gray-900 dark:text-white transition-colors">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-[var(--foundation-blue-blue-600)] dark:hover:text-blue-400 font-medium transition-colors"
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
