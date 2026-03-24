"use client";

import { useState } from "react";
import AuthCard from "./AuthCard";
import Link from "next/link";
import { Button } from "../common";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <AuthCard variant="login">
        {/* Logo */}
        <img src="/images/navbar/logo.svg" alt="Logo" className="w-32 mb-6" />

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Log In
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Welcome back! Please enter your details.
        </p>

        <div className="space-y-5">
          {/* Email */}
          <Input label="Email address" type="email" />

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none
                focus:border-gray-600 focus:ring-1 focus:ring-gray-100 transition text-gray-950"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-gray-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <div className="flex gap-4 items-center flex-wrap">
            <Button radius="rounded-xl" text="Log In" height="h-10" />

            <p className="text-gray-800 text-sm">
              Don’t have an account?
              <Link
                href="/auth/signUp"
                className="hover:underline cursor-pointer ms-1"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

/* Reusable Input */
function Input({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type={type}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none
        focus:border-gray-600 focus:ring-1 focus:ring-gray-100 transition text-gray-950"
      />
    </div>
  );
}
