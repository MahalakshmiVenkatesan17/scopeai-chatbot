"use client";

import Link from "next/link";
import { Button } from "../common";
import Image from "next/image";

import { useRouter } from "next/navigation";

export function Footer() {
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <footer className="bg-white">
      {/* Top Blue Strip */}

      <div className="max-w-7xl mx-auto px-6 py-10 lg:flex space-y-10">
        {/* LOGO + CTA */}
        <div className="space-y-10">
          <a href="#" className="px-2">
            <Image
              src="/images/navbar/logo.svg"
              alt="Chat360 Logo"
              width={60}
              height={60}
              className="w-32"
            />
          </a>
          <p className="text-gray-500 max-w-62.5 ">
            Empowering businesses with intelligent AI solutions for
            next-generation customer engagement.
          </p>

          {/* <Button
            text="Sign Up now"
            radius="rounded-4xl"
            onClick={() => navigate("/signup")}
          /> */}

          <div className="flex items-center gap-4 text-lg px-2">
            <Image
              src="/images/footer/Link-instagram.png"
              alt="Instagram"
              width={24}
              height={24}
              className="cursor-pointer"
            />

            <Image
              src="/images/footer/Link-Facebook.png"
              alt="Facebook"
              width={24}
              height={24}
              className="cursor-pointer"
            />
            <Image
              src="/images/footer/Link-Linkedin.png"
              alt="LinkedIn"
              width={24}
              height={24}
              className="cursor-pointer"
            />
            <Image
              src="/images/footer/Link-Youtube.png"
              alt="Youtube"
              width={24}
              height={24}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="sm:flex mx-auto lg:gap-10 gap-15 pt-5">
          {/* Company */}
          <div className="mb-3">
            <h4 className="text-[var(--foundation--blue-blue-700)] font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-black ">
              <li className="cursor-pointer hover:underline">
                <Link href="/" className="cursor-pointer hover:underline">
                  {" "}
                  Home
                </Link>
              </li>
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/contact"
                  className="cursor-pointer hover:underline"
                >
                  Contact Us
                </Link>
              </li>
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/privacyPolicy"
                  className="cursor-pointer hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/termsCondition"
                  className="cursor-pointer hover:underline"
                >
                  Terms and Condition
                </Link>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div className="mb-3">
            <h4 className="text-[var(--foundation--blue-blue-700)] font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-black">
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/features"
                  className="cursor-pointer hover:underline"
                >
                  Features
                </Link>
              </li>
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/integration"
                  className="cursor-pointer hover:underline"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="mb-3">
            <h4 className="text-[var(--foundation--blue-blue-700)] font-bold mb-4">
              <Link
                href="/Resources"
                className="cursor-pointer hover:underline"
              >
                Resources
              </Link>
            </h4>
            <ul className="space-y-2 text-black">
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/knowledgeBase"
                  className="cursor-pointer hover:underline"
                >
                  Knowledge Base
                </Link>
              </li>
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/visitor-insights"
                  className="cursor-pointer hover:underline"
                >
                  Visitor Insights
                </Link>
              </li>

              <li className="cursor-pointer hover:underline">
                <Link href="/context">Context</Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="mb-3">
            <h4 className="text-[var(--foundation--blue-blue-700)] font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-black">
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/analytics"
                  className="cursor-pointer hover:underline"
                >
                  Analytics & Dashboard
                </Link>
              </li>
              <li className="cursor-pointer hover:underline">
                <Link
                  href="/pricing"
                  className="cursor-pointer hover:underline"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="mb-3">
            <h4 className="text-[var(--foundation--blue-blue-700)] font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-black">
              <li className="cursor-pointer hover:underline">
                <Link href="/faq" className="cursor-pointer hover:underline">
                  FAQ
                </Link>
              </li>
              <li className="cursor-pointer hover:underline">
                <Link href="/auth/signUp" className="cursor-pointer hover:underline">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto border-t border-gray-300" />

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid md:grid-cols-[0.4fr_1fr] text-xs text-gray-500 md:text-start text-center space-y-3">
        <p>Copyright © 2026 AI ChatBot. All rights reserved.</p>
        <p>
          Hey there! We’re excited to have you here. Just a quick note—our
          website uses cookies to enhance your experience and our partners’ use
          of cookies for analytics, personalization, and improving our services.
          You can manage or revoke your consent anytime in your browser
          settings. Read our{" "}
          <span className="text-[var(--foundation-blue-blue-600)] cursor-pointer">Cookies Policy</span>.
        </p>
      </div>
    </footer>
  );
}
