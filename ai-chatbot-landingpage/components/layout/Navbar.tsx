"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integration", href: "/integration" },
    { label: "Knowledge Base", href: "/knowledgeBase" },
    { label: "Contact us", href: "/contact" },
  ];

  const linkClass = (href: string) =>
    `text-[14px] font-medium transition ${
      pathname === href
        ? "text-[#5856d6]"
        : "text-gray-700 hover:text-[#5856d6]"
    }`;

  return (
    <header className="w-full">
      {/* 🔹 Announcement Bar */}
      <div className="bg-[#5856d6] py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3 flex-wrap">
          <p className="text-white text-[13px] font-medium text-center">
            AI Chatbot: Human-Like Agent Voices for Real Conversations, Sales &
            Support
          </p>
          <Link
            href="/contact"
            className="bg-white text-[#5856d6] text-[12px] font-semibold px-3 py-1 rounded-full hover:bg-[var(--foundation-blue-blue-50)] transition"
          >
            Check now
          </Link>
        </div>
      </div>

      {/* 🔹 Navbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center h-full">
            <Image
              src="/images/navbar/logo.svg"
              alt="Chatbot AI Logo"
              width={60}
              height={60}
              className="object-contain w-32"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={linkClass(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/auth/logIn"
              className="text-[14px] font-medium text-gray-700 hover:text-[#5856d6]"
            >
              Login
            </Link>
            <Link
              href="/auth/signUp"
              className="bg-[#5856d6] text-white text-[14px] font-semibold px-5 py-2 rounded-full hover:bg-[var(--foundation--blue-blue-700)] transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? (
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-6 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={linkClass(item.href)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-4 border-t flex flex-col gap-3">
                <Link
                  href="/logIn"
                  onClick={() => setMenuOpen(false)}
                  className="text-[14px] font-medium text-gray-700"
                >
                  Login
                </Link>
                <Link
                  href="/signUp"
                  onClick={() => setMenuOpen(false)}
                  className="bg-[#5856d6] text-white text-center text-[14px] font-semibold py-2.5 rounded-full"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
