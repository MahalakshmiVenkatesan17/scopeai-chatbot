import React from "react";
import Image from "next/image";
import { Shield, Lock, Fingerprint, CheckCircle, Sparkles, ShieldCheck, Eye, Database } from "lucide-react";

export function PrivacySecurity() {
  const securityBadges = [
    { name: "SOC 2", icon: Shield, color: "from-blue-500 to-cyan-500" },
    { name: "GDPR", icon: ShieldCheck, color: "from-green-500 to-emerald-500" },
    { name: "ISO", icon: Fingerprint, color: "from-purple-500 to-pink-500" },
    { name: "HIPAA", icon: Lock, color: "from-red-500 to-orange-500" },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-950 transition-colors relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.03),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_25%)]"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/5 dark:bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* LEFT CONTENT */}
        <div className="text-center md:text-left">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 mb-5 transition-colors">
            <Shield className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Privacy & Security</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-5 md:text-left text-center">
            We'll never let you lose sleep over privacy and security concerns
          </h2>

          <p className="text-gray-600 dark:text-gray-400 max-w-lg text-center md:text-left mx-auto md:mx-0 transition-colors">
            At ScopeAIChat, we take privacy and security very seriously. We are
            compliant with SOC 2, GDPR, ISO, and HIPAA.
          </p>

          {/* Security badges */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            {securityBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-800"
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${badge.color} p-1 flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{badge.name}</span>
                </div>
              );
            })}
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Enterprise-grade encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Eye className="w-4 h-4 text-blue-500" />
              <span>Data never used for training</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Database className="w-4 h-4 text-purple-500" />
              <span>EU-hosted available</span>
            </div>
          </div>
        </div>

        {/* RIGHT - CERT GRID */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl">
            <Image
              src="/images/articles/privacy-security.png"
              alt="Privacy and Security certifications - SOC 2, GDPR, ISO, HIPAA compliant"
              width={500}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent"></div>
    </section>
  );
}