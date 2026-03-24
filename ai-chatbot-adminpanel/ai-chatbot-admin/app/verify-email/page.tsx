"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        await apiClient.verifyEmail(token);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.error?.message ||
          "Failed to verify email. The link may be invalid or expired."
        );
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl/50 p-8 text-center space-y-6 border border-transparent dark:border-gray-800 transition-colors">
      {status === "loading" && (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4 transition-colors">
            <Loader2 className="w-10 h-10 text-indigo-500 dark:text-indigo-400 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Verifying...</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">Please wait while we verify your email address.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full mb-4 transition-colors">
            <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Email verified!</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            Thank you! Your email has been successfully verified. You can now log in to your account.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <Button variant="main" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all group">
                Continue to Login
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full mb-4 transition-colors">
            <XCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Verification failed</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">{message}</p>
          <div className="pt-4">
            <Link href="/login">
              <Button variant="secondary" className="w-full h-12 rounded-xl">
                Back to Login
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-background p-4 transition-colors">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-2xl/50 p-8 text-center border border-transparent dark:border-gray-800 transition-colors relative z-10">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      }>
        <div className="relative z-10 w-full flex justify-center">
          <VerifyEmailContent />
        </div>
      </Suspense>
    </div>
  );
}
