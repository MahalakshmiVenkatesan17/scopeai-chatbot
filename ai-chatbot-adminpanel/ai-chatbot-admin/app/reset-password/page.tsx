"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import Image from "next/image";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showToast, ToastComponent } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      showToast("Invalid or missing reset token", "error");
    }
  }, [token, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast("Missing reset token", "error");
      return;
    }

    if (password.length < 8) {
      showToast("Password must be at least 8 characters long", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.resetPassword({
        token,
        new_password: password,
      });
      showToast("Password has been reset successfully", "success");
      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message || "Failed to reset password",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <div className="rounded-[28px] border border-gray-200 bg-white/85 p-6 sm:p-8 text-center shadow-xl backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0F172A]/80 dark:shadow-[0_10px_50px_rgba(0,0,0,0.35)] transition-colors">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-300" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Invalid link
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-400">
            This password reset link is invalid or has expired. Please request a new one.
          </p>

          <div className="pt-6">
            <Link href="/forgot-password">
              <Button
                variant="primary"
                className="w-full h-12 rounded-2xl bg-[#5856d6] hover:bg-[#4f46e5] text-white shadow-lg dark:bg-[#635BDF] dark:hover:bg-[#5856d6] group"
              >
                Request new link
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
        {ToastComponent}
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <div className="rounded-[28px] border border-gray-200 bg-white/85 p-6 sm:p-8 text-center shadow-xl backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0F172A]/80 dark:shadow-[0_10px_50px_rgba(0,0,0,0.35)] transition-colors">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-300" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Password reset!
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-400">
            Your password has been successfully updated. You will be redirected to the login page shortly.
          </p>

          <div className="pt-6">
            <Link href="/login">
              <Button
                variant="secondary"
                className="w-full h-12 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.05] group"
              >
                Go to Login
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
        {ToastComponent}
      </>
    );
  }

  return (
    <>
      <div className="rounded-[28px] border border-gray-200 bg-white/85 p-6 sm:p-8 shadow-xl backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0F172A]/80 dark:shadow-[0_10px_50px_rgba(0,0,0,0.35)] transition-colors">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            <KeyRound className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Set new password
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-400">
            Choose a strong password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors"
            >
              New password <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] pl-12 pr-12 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#5856d6]/15 focus:border-[#5856d6] transition-colors"
                disabled={isLoading}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors"
            >
              Confirm new password <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />

              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-2xl border border-gray-300 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#5856d6]/15 focus:border-[#5856d6] transition-colors"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-12 rounded-2xl bg-[#5856d6]! hover:bg-[#4f46e5] text-white shadow-lg dark:bg-[#635BDF] dark:hover:bg-[#5856d6] font-semibold group"
            isLoading={isLoading}
          >
            Reset Password
          </Button>
        </form>
      </div>
      {ToastComponent}
    </>
  );
}

export default function ResetPasswordPage() {
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
        <div className="hidden lg:flex items-center justify-center px-10 xl:px-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-4 py-2 text-sm font-medium text-violet-700 backdrop-blur-md dark:border-violet-500/20 dark:bg-white/[0.04] dark:text-violet-300">
              <Sparkles className="h-4 w-4" />
              Secure password reset
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#5856d6] shadow-xl dark:bg-[#635BDF] dark:shadow-[0_0_30px_rgba(99,91,223,0.35)] shrink-0">
                  <Image src="/icon-white.svg" alt="icon" width={34} height={34} />
                </div>

                <div>
                  <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Create New Password
                  </h1>
                  <p className="mt-2 text-base text-gray-600 dark:text-slate-400">
                    Finish your recovery securely and get back into your admin workspace.
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
                        Secure password recovery
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Set a new password safely and continue managing your platform without interruption.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Strong password required
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Use at least 8 characters to create a secure password for your admin account.
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

            <Suspense
              fallback={
                <div className="rounded-[28px] border border-gray-200 bg-white/85 p-8 text-center shadow-xl backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0F172A]/80 dark:shadow-[0_10px_50px_rgba(0,0,0,0.35)] transition-colors relative z-10">
                  <p className="text-gray-500 dark:text-slate-400">Loading...</p>
                </div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}