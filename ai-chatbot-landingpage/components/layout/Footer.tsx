"use client";

import Link from "next/link";
import { Button } from "../common";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Heart,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
} from "lucide-react";

export function Footer() {
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/login",
      label: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/home",
      label: "LinkedIn",
      color: "hover:text-blue-700",
    },
    {
      icon: Twitter,
      href: "https://x.com/",
      label: "Twitter",
      color: "hover:text-gray-900",
    },
    {
      icon: Youtube,
      href: "https://www.youtube.com/",
      label: "YouTube",
      color: "hover:text-red-600",
    },
  ];

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Home", href: "/" },
        { label: "Features", href: "/features" },
        { label: "Context", href: "/context" },
        { label: "Pricing", href: "/pricing" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Company",
      links: [{ label: "Contact Us", href: "/contact" }],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacyPolicy" },
        { label: "Terms and Condition", href: "/termsCondition" },
      ],
    },
    {
      title: "Account",
      links: [
        {
          label: "Login",
          href: "https://admin-scopeaichat.scopethinkers.ai/login",
        },
      ],
    },
  ];

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-white dark:bg-gray-950 transition-colors relative overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.02),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.05),transparent_25%)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-16">
          {/* LOGO + CTA Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block group">
              <Image
                src={
                  mounted && resolvedTheme === "dark"
                    ? "/images/navbar/logo-dark.svg"
                    : "/images/navbar/logo.svg"
                }
                alt="ScopeAIChat Logo"
                width={60}
                height={60}
                className="object-contain w-32 sm:w-40 h-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm transition-colors">
              Empowering businesses with intelligent AI solutions for
              next-generation customer engagement.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@scopethinkers.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Phone className="w-4 h-4" />
                <span> +91 7305 672226</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ${social.color} hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h4 className="text-[#5856d6] dark:text-blue-400 font-semibold text-sm uppercase tracking-wider transition-colors">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 text-sm hover:text-[#5856d6] dark:hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t border-gray-200 dark:border-gray-800 transition-colors" />
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid md:grid-cols-[auto_1fr] gap-4 text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
          <p className="flex items-center justify-center md:justify-start gap-1">
            Copyright © {currentYear} ScopeAIChat.
            <span className="hidden md:inline">All rights reserved.</span>
          </p>
          <p className="text-xs leading-relaxed flex flex-wrap items-center justify-center md:justify-end gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Made with <Heart className="w-3 h-3 text-red-500 mx-0.5" /> for
            better customer conversations
            {/* <span className="hidden sm:inline mx-1">•</span>
            <Shield className="w-3 h-3 text-green-500 ml-1" />
            <span>SOC 2 • GDPR Compliant</span> */}
          </p>
        </div>

        {/* Cookie notice */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400 dark:text-gray-500">
          <p className="flex flex-wrap items-center justify-center gap-1">
            <Globe className="w-3 h-3" />
            We use cookies to enhance your experience. By continuing, you agree
            to our{" "}
            <Link
              href="/privacyPolicy"
              className="text-[#5856d6] dark:text-blue-400 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
