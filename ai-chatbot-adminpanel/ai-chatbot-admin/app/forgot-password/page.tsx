"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import {
  ChevronLeft,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter your email address", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.forgotPassword({ email });

      if (response.resetToken) {
        showToast("Reset token received. Redirecting...", "success");
        // Auto-redirect to reset password page with the token
        setTimeout(() => {
          router.push(`/reset-password?token=${response.resetToken}`);
        }, 800);
      } else {
        showToast("Email not Found", "error");
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message || "Failed to send reset link",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-[#020617] transition-colors">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Light mode gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,91,223,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(88,86,214,0.14),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff,_#f8fafc)] dark:hidden" />

        {/* Dark mode gradient */}
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_top_right,_rgba(99,91,223,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(88,86,214,0.18),_transparent_35%),linear-gradient(to_bottom,_#020617,_#0b1120,_#020617)]" />

        {/* Decorative blur blobs */}
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] [background-image:linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Left side branding / hero */}
        <div className="hidden lg:flex items-center justify-center px-10 xl:px-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-4 py-2 text-sm font-medium text-violet-700 backdrop-blur-md dark:border-violet-500/20 dark:bg-white/[0.04] dark:text-violet-300">
              <Sparkles className="h-4 w-4" />
              Secure account recovery
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#5856d6] shadow-xl dark:bg-[#635BDF] dark:shadow-[0_0_30px_rgba(99,91,223,0.35)] shrink-0">
                  <Image src="/icon-white.svg" alt="icon" width={34} height={34} />
                </div>

                <div>
                  <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Reset Access
                  </h1>
                  <p className="mt-2 text-base text-gray-600 dark:text-slate-400">
                    Recover your admin access securely and continue managing your platform.
                  </p>
                </div>
              </div>

              <div className="mt-10 grid gap-4">
                <div className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Protected recovery flow
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Your reset process is routed securely so you can regain access safely.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Fast password reset
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Enter your email and continue directly to the reset password step.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side form */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-6 text-center lg:hidden">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#5856d6] shadow-xl dark:bg-[#635BDF] dark:shadow-[0_0_24px_rgba(99,91,223,0.3)]">
                <Image src="/icon-white.svg" alt="icon" width={35} height={35} />
              </div>
            </div>

            {/* Forgot password card */}
            <div className="rounded-[28px] border border-gray-200 bg-white/85 p-6 sm:p-8 shadow-xl backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0F172A]/80 dark:shadow-[0_10px_50px_rgba(0,0,0,0.35)] transition-colors">
              {/* Back link */}
              <div className="mb-5">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-[#5856d6] dark:hover:text-[#A5B4FC] transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </Link>
              </div>

              {/* Header */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                  <Mail className="h-6 w-6" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Forgot password?
                </h1>

                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 leading-6">
                  Enter your email and we&apos;ll automatically redirect you to set a new password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors"
                  >
                    Email address <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />

                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#5856d6]/15 focus:border-[#5856d6] transition-colors"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full rounded-2xl bg-[#5856d6]! hover:bg-[#4f46e5] text-white shadow-lg dark:bg-[#635BDF] dark:hover:bg-[#5856d6] h-12 font-semibold flex items-center justify-center group"
                  isLoading={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Request Reset
                  {!isLoading && (
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-[#5856d6] dark:text-[#A5B4FC] font-semibold hover:text-[#4f46e5] dark:hover:text-white underline underline-offset-4 transition-colors"
                >
                  Log in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ToastComponent}
    </div>
  );
}