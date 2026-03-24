"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

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
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl/50 p-8 text-center space-y-6 border border-transparent dark:border-gray-800 transition-colors">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full mb-4 transition-colors">
          <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Invalid link</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <div className="pt-4">
          <Link href="/forgot-password">
            <Button variant="main" className="w-full h-12 rounded-xl group">
              Request new link
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        {ToastComponent}
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl/50 p-8 text-center space-y-6 border border-transparent dark:border-gray-800 transition-colors">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full mb-4 transition-colors">
          <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Password reset!</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors">
          Your password has been successfully updated. You will be redirected to the login page shortly.
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button variant="secondary" className="w-full h-12 rounded-xl group">
              Go to Login
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        {ToastComponent}
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl/50 p-8 space-y-8 border border-transparent dark:border-gray-800 transition-colors">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Set new password</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors">
          Choose a strong password with at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
            New password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 w-full bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
            Confirm new password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 h-12 w-full bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="main"
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all group"
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </form>
      {ToastComponent}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-background p-4 transition-colors">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-transparent dark:border-gray-800 transition-colors relative z-10">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      }>
        <div className="relative z-10 w-full flex justify-center">
          <ResetPasswordForm />
        </div>
      </Suspense>
    </div>
  );
}
