"use client";

import { useState } from "react";
import AuthCard from "./AuthCard";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email address is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(""); // clear error on typing
  };

  const handleSubmit = () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4 transition-colors">
      <AuthCard variant="login">
        {/* Logo */}
        <img src="/images/navbar/logo.svg" alt="Logo" className="w-32 mb-6 dark:invert" />

        {!submitted ? (
          <>
            {/* Title */}
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
              Forgot Password?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">
              No worries! Enter your email and we'll send you a reset link.
            </p>

            <div className="space-y-5">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm text-gray-700 dark:text-gray-400 transition-colors">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={handleChange}
                  onBlur={() => setError(validateEmail(email))}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition text-gray-950 dark:text-white dark:bg-gray-900
                    focus:ring-1 focus:ring-gray-100 dark:focus:ring-gray-800
                    ${error
                      ? "border-red-400 focus:border-red-400"
                      : "border-gray-300 dark:border-gray-700 focus:border-gray-600 dark:focus:border-blue-500"
                    }`}
                />
                {/* Error message */}
                {error && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </p>
                )}
              </div>

              {/* Send Reset Link Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white
                bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 transition"
              >
                Send Reset Link
              </button>

              {/* Back to Login */}
              <div className="flex justify-center">
                <Link
                  href="/auth/logIn"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1 text-[#5856d6] dark:text-blue-400 transition-colors"
                >
                  <span>&#8592;</span> Back to Log In
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="flex flex-col items-start">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                Check your email
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">
                We've sent a password reset link to{" "}
                <span className="font-medium text-gray-800 dark:text-white transition-colors">{email}</span>.
                Check your inbox and follow the instructions.
              </p>

              <div className="space-y-4 w-full">
                {/* Resend email */}
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                    setError("");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium
                  text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Resend email
                </button>

                {/* Back to Login */}
                <div className="flex justify-center">
                  <Link
                    href="/auth/logIn"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1 text-[#5856d6] dark:text-blue-400 transition-colors"
                  >
                    <span>&#8592;</span> Back to Log In
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </AuthCard>
    </div>
  );
}
