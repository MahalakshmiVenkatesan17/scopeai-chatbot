"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, X, ChevronRight, Sparkles, LogIn } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Widget Code", href: "/integration" },
    { label: "Knowledge Base", href: "/knowledgeBase" },
    { label: "Contact us", href: "/contact" },
  ];

  const linkClass = (href: string) =>
    `text-[14px] font-medium transition-all duration-200 relative ${
      pathname === href
        ? "text-[#5856d6] dark:text-[#5856d6]"
        : "text-gray-700 dark:text-gray-300 hover:text-[#5856d6] dark:hover:text-[#5856d6]"
    }`;

  const activeIndicatorClass = (href: string) =>
    pathname === href
      ? "absolute -bottom-1 left-0 right-0 h-0.5 bg-[#5856d6] rounded-full"
      : "";

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="w-full z-50 sticky top-0">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-[#5856d6] to-[#7c3aed] py-2.5 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1),transparent_25%)]"></div>

        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3 flex-wrap relative z-10">
          <Sparkles className="w-4 h-4 text-[#ffffff] animate-pulse" />
          <p className="text-[#ffffff] text-[13px] font-medium text-center">
            ScopeAIChat: Human-Like Agent Voices for Real Conversations, Sales &
            Support
          </p>
          <Link
            href="/contact"
            className="group bg-white/10 backdrop-blur-sm text-[#ffffff] text-[12px] font-semibold px-4 py-1.5 rounded-full hover:bg-white/20 transition-all duration-300 inline-flex items-center gap-1"
          >
            Check now
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Navbar */}
      <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-colors sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center h-full group cursor-pointer">
            <Image
              src={
                mounted && resolvedTheme === "dark"
                  ? "/images/navbar/logo-dark.svg"
                  : "/images/navbar/logo.svg"
              }
              alt="ScopeAIChat Logo"
              width={170}
              height={40}
              className="object-contain w-32 sm:w-40 h-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`${linkClass(item.href)} relative group cursor-pointer`}
              >
                {item.label}
                <span
                  className={`${activeIndicatorClass(item.href)} transition-all duration-300 group-hover:opacity-100 ${pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                ></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="https://admin-scopeaichat.scopethinkers.ai/login"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#5856d6] to-[#7c3aed] text-[#ffffff] text-[14px] font-semibold px-5 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
            <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`${linkClass(item.href)} py-2 flex items-center justify-between group`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5856d6]"></span>
                  )}
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
                <Link
                  href="https://admin-scopeaichat.scopethinkers.ai/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#5856d6] to-[#7c3aed] text-white text-[14px] font-semibold py-2.5 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
