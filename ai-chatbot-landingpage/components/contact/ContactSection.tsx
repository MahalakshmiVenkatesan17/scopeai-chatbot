"use client";

import {
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  MessageCircle,
  Globe,
  User,
  AtSign,
} from "lucide-react";

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/login", label: "Facebook" },
  { icon: Twitter, href: "https://x.com/", label: "Twitter" },
  { icon: Linkedin, href: "https://www.linkedin.com/home", label: "LinkedIn" },
  { icon: Youtube, href: "https://www.youtube.com/", label: "Youtube" },
];

export default function ContactForm() {
  return (
    <section className="w-full transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3e3d98] via-[#302f76] to-[#6e11b0]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.12),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_25%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.2),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_25%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-4 transition-colors">
              <MessageCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Get in Touch
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#ffffff] sm:text-5xl lg:text-6xl transition-colors">
              Talk to our ScopeAIChat Experts
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#ffffff] transition-colors">
              Have questions about ScopeAIChat, widget setup, or pricing? Our
              team is here to help
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-950 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Card */}
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-xl transition-colors">
            {/* LEFT PANEL - Text colors fixed to white */}
            <div className="bg-gradient-to-br from-[#3e3d98] via-[#302f76] to-[#6e11b0] px-8 py-12 relative overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full"></div>
              <div className="absolute top-1/2 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full"></div>

              {/* Abstract pattern */}
              <div className="absolute top-10 left-10 w-24 h-24 border border-white/10 rounded-2xl rotate-12"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full"></div>

              {/* Title - Keep white */}
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-2 text-[#ffffff]">
                  <MessageCircle className="w-7 h-7 text-[#ffffff]" />
                  Contact Information
                </h2>
              </div>

              {/* Info - All text remains white */}
              <div className="space-y-8 relative z-10">
                {/* Email */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                    <Mail className="w-5 h-5 text-[#ffffff]" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wide text-[#ffffff] mb-1 uppercase">
                      EMAIL US
                    </p>
                    <p className="text-base font-medium text-[#ffffff] group-hover:text-white/90 transition-colors">
                      info@scopethinkers.com
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                    <Phone className="w-5 h-5 text-[#ffffff]" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wide text-[#ffffff] mb-1 uppercase">
                      PHONE NUMBER
                    </p>
                    <p className="text-base font-medium text-[#ffffff] group-hover:text-white/90 transition-colors">
                      +91 7305 672226
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                    <MapPin className="w-5 h-5 text-[#ffffff]" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wide text-[#ffffff] mb-1 uppercase">
                      LOCATION
                    </p>
                    <p className="text-sm leading-relaxed font-medium text-[#ffffff] group-hover:text-white/90 transition-colors">
                      Sterling Technopolis, 6th Floor 4/293, SH 49A,
                      <br />
                      Old Mahabalipuram Road,
                      <br />
                      Perungudi, Chennai, Tamil Nadu 600096.
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider - Keep white */}
              <div className="flex items-center gap-4 mt-10 relative z-10">
                <span className="flex-1 h-px bg-[#ffffff]"></span>
                <p className="text-sm text-[#ffffff]">Follow us for updates</p>
                <span className="flex-1 h-px bg-[#ffffff]"></span>
              </div>

              {/* Social Icons - Icons remain white */}
              <div className="flex gap-3 mt-6 relative z-10">
                {socialLinks.map(({ icon: Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300"
                  >
                    <Icon size={18} className="text-[#ffffff]" />
                  </a>
                ))}
              </div>

              {/* Availability badge - Keep white */}
              {/* <div className="mt-8 relative z-10">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white/80">Available 24/7 for support</span>
              </div>
            </div> */}
            </div>

            {/* RIGHT SECTION – FORM */}
            <div className="px-8 py-12 lg:px-12">
              <form className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Send us a message
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We'll get back to you within 24 hours
                  </p>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      <User className="w-4 h-4 inline mr-2 text-gray-500 dark:text-[#ffffff]" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full h-12 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      <AtSign className="w-4 h-4 inline mr-2 text-gray-500 dark:text-gray-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="john@company.com"
                      className="w-full h-12 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    <Globe className="w-4 h-4 inline mr-2 text-gray-500 dark:text-gray-400" />
                    Website / Company
                  </label>
                  <input
                    type="text"
                    placeholder="Your company or product name"
                    className="w-full h-12 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    <MessageCircle className="w-4 h-4 inline mr-2 text-gray-500 dark:text-gray-400" />
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your project, requirements, or questions..."
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Send Message
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                  By submitting this form, you agree to our privacy policy and
                  terms of service.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
