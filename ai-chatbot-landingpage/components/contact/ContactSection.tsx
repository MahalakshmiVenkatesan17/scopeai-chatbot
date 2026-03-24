"use client";

  import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const socialLinks = [
  { icon: Facebook, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Instagram, href: "#" },
];

export default function ContactForm() {
  return (
    <section className="w-full bg-[#f5f7fb] py-20">
      <div className="max-w-300 mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-[36px] font-semibold text-[#0f172a]">
            Talk to our AI Chatbot Experts
          </h1>
          <p className="mt-3 text-[#6b7280] text-[16px]">
            Have questions about AI chatbots, integrations, or pricing? Our team
            is here to help
          </p>
        </div>

        {/* Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] rounded-[14px] overflow-hidden bg-white shadow-sm">
          {/* LEFT PANEL */}
          <div className="bg-[#3b3fa3] rounded-l-[20px] px-10 py-12 text-white relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-6 right-6 w-32 h-32 bg-white/5 rounded-xl rotate-45"></div>
            <div className="absolute top-24 right-14 w-20 h-20 bg-white/5 rounded-xl rotate-45"></div>

            {/* Title */}
            <h2 className="text-[28px] font-semibold mb-10">
              Contact Information
            </h2>

            {/* Info */}
            <div className="space-y-8">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 4h16v16H4z" />
                    <path d="M4 4l8 8 8-8" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] tracking-wide text-white/70 mb-1">
                    EMAIL US
                  </p>
                  <p className="text-[15px] font-medium">info@golio.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.12.81.31 1.6.57 2.35a2 2 0 0 1-.45 2.11L9.91 10.09a16 16 0 0 0 4 4l.91-.91a2 2 0 0 1 2.11-.45c.75.26 1.54.45 2.35.57a2 2 0 0 1 1.72 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] tracking-wide text-white/70 mb-1">
                    PHONE NUMBER
                  </p>
                  <p className="text-[15px] font-medium">+1-202-555-0138</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] tracking-wide text-white/70 mb-1">
                    LOCATION
                  </p>
                  <p className="text-[15px] leading-6 font-medium">
                    901 N Pitt Str., Suite 170
                    <br />
                    Alexandria, VA 22314, USA
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-10">
              <span className="w-10 h-px bg-white/50"></span>
              <p className="text-[14px]">Follow us for updates</p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
  {socialLinks.map(({ icon: Icon, href }, i) => (
    <a
      key={i}
      href={href}
      className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20 transition duration-300"
    >
      <Icon size={16} className="text-white"  />
    </a>
  ))}
</div>
          </div>

          {/* RIGHT */}
          {/* RIGHT SECTION – FORM */}
          <div className="px-10 py-12">
            <form className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] text-[#6b7280] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full h-12 border border-[#e5e7eb] rounded-md px-4 text-[14px] focus:outline-none focus:border-[#5856d6]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] text-[#6b7280] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full h-12 border border-[#e5e7eb] rounded-md px-4 text-[14px] focus:outline-none focus:border-[#5856d6]"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-[13px] text-[#6b7280] mb-2">
                  Website
                </label>
                <input
                  type="text"
                  placeholder="Brand/Company/Product Name"
                  className="w-full h-12 border border-[#e5e7eb] rounded-md px-4 text-[14px] focus:outline-none focus:border-[#5856d6]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[13px] text-[#6b7280] mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your project..."
                  className="w-full border border-[#e5e7eb] rounded-md px-4 py-3 text-[14px] resize-none focus:outline-none focus:border-[#5856d6]"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#5856d6] text-white text-[14px] font-medium px-6 py-3 rounded-md hover:bg-[#4b49c4] transition cursor-pointer"
              >
                Send Message
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
