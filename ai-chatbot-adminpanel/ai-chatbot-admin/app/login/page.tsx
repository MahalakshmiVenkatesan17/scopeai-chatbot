"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, token: storeToken } = useAuthStore();
  const { showToast, ToastComponent } = useToast();

  const [email, setEmail] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  // ✅ Form Validation
  const validateForm = () => {
    const errors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    const password = passwordRef.current?.value || "";
    if (!password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // ✅ Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const password = passwordRef.current?.value || "";
      await login(email, password);

      // ✅ clear password from memory/DOM
      if (passwordRef.current) {
        passwordRef.current.value = "";
      }

      // ✅ Save token to localStorage explicitly
      if (storeToken) {
        localStorage.setItem("admin_token", storeToken);
      }

      // ✅ success message
      showToast("Login successful.", "success");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {

      const message =
        err?.response?.data?.error?.message || // backend error
        err?.response?.data?.detail || // fallback
        err?.response?.data?.message || // fallback
        "Something went wrong"; // default

      // 🔴 Only show red border for invalid credentials
      if (
        message === "Invalid email or password" ||
        message === "Incorrect email or password"
      ) {
        setFormErrors({
          email: " ",
          password: " ",
        });
      }

      showToast(message, "error");
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
              AI-powered admin workspace
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#5856d6] shadow-xl dark:bg-[#635BDF] dark:shadow-[0_0_30px_rgba(99,91,223,0.35)] shrink-0">
                  <Image src="/icon-white.svg" alt="icon" width={34} height={34} />
                </div>

                <div>
                  <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    AI Chatbot Admin
                  </h1>
                  <p className="mt-2 text-base text-gray-600 dark:text-slate-400">
                    Securely manage tenants, users, subscriptions, and analytics.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Secure admin access
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Protected login with clean, fast access to your full admin console.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Unified control panel
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Manage billing, analytics, chatbot settings, and platform operations in one place.
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

            {/* Login card */}
            <div className="rounded-[28px] border border-gray-200 bg-white/85 p-6 sm:p-8 shadow-xl backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0F172A]/80 dark:shadow-[0_10px_50px_rgba(0,0,0,0.35)] transition-colors">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Welcome
                </h2>

                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  Sign in to your admin account
                </p>
              </div>

              {/* FORM */}
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors">
                    Email address
                  </label>

                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormErrors({ ...formErrors, email: "" });
                    }}
                    className={`block w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-4 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors
                    ${formErrors.email
                        ? "border-red-500 focus:ring-red-500/15"
                        : "border-gray-300 dark:border-white/[0.06] focus:border-[#5856d6] focus:ring-[#5856d6]/15"
                      }`}
                    placeholder="admin@example.com"
                  />

                  {formErrors.email && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      onChange={() => {
                        setFormErrors({ ...formErrors, password: "" });
                      }}
                      className={`block w-full rounded-2xl border px-4 py-3 pr-12 text-sm shadow-sm focus:outline-none focus:ring-4 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors
                      ${formErrors.password
                          ? "border-red-500 focus:ring-red-500/15"
                          : "border-gray-300 dark:border-white/[0.06] focus:border-[#5856d6] focus:ring-[#5856d6]/15"
                        }`}
                      placeholder="••••••••"
                    />

                    {/* Toggle Password */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>

                  {/* <div className="mt-2 flex items-center justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-[#5856d6] hover:text-[#4f46e5] dark:text-[#A5B4FC] dark:hover:text-white transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div> */}

                  {formErrors.password && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full rounded-2xl bg-[#5856d6]! hover:bg-[#4f46e5] text-white shadow-lg dark:bg-[#635BDF] dark:hover:bg-[#5856d6]"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {ToastComponent}
    </div>
  );
}
