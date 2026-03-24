"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { ChevronLeft, Mail, ArrowRight, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-background p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl/50 p-8 space-y-8 border border-transparent dark:border-gray-800 transition-colors">
        <div className="space-y-2">
          <Link href="/login" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Forgot password?</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            Enter your email and we'll automatically redirect you to set a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
              Email address <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 w-full bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="main"
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center group"
            isLoading={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Request Reset
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{" "}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 underline underline-offset-4">
            Log in here
          </Link>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
}
