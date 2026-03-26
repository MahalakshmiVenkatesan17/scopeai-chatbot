"use client";

import { useState } from "react";
import AuthCard from "./AuthCard";
import Link from "next/link";
import { Button } from "../common";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4 transition-colors">
      <AuthCard variant="signup">
        {/* Logo */}
        <img src="/images/navbar/logo.svg" alt="Logo" className="w-32 mb-6 dark:invert" />

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
          Sign Up
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">
          Create your account. It's free and only takes a minute.
        </p>

        <div className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" />
            <Input label="Last Name" />
          </div>

          {/* Email */}
          <Input label="Email" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Name" />
            <Input label="Company Domain" />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-300 transition-colors">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-sm outline-none
                focus:border-gray-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-gray-100 dark:focus:ring-gray-800 transition text-gray-950 dark:text-white dark:bg-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm ms-2 -mt-1 transition-colors">
              Use 8 or more characters with a mix of letters, numbers & symbols.
            </p>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer transition-colors">
            <input type="checkbox" className="mt-1 accent-gray-950 dark:accent-blue-500" />
            <span>
              By creating an account, I agree to our{" "}
              <span className=" cursor-pointer underline text-[#5856d6] dark:text-blue-400">Terms of Use</span> &{" "}
              <span className=" cursor-pointer underline text-[#5856d6] dark:text-blue-400">Privacy Policy</span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer transition-colors">
            <input type="checkbox" className="mt-1 accent-gray-950 dark:accent-blue-500" />
            <span>
              By creating an account, I am also consenting to receive SMS
              messages and emails, including product new feature updates,
              events, and marketing promotions.
            </span>
          </label>

          {/* Button */}
          <div className="flex gap-4 items-center flex-wrap">
            <Button radius="rounded-xl" text={"Sign Up"} height="h-10"></Button>
            <p className="text-gray-800 dark:text-gray-300 text-sm transition-colors">
              Already have an Account?
              <Link
                href="/auth/logIn"
                className="hover:underline cursor-pointer ms-1 text-[#5856d6] dark:text-blue-400"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

/* Reusable Input */
function Input({ label }: { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-700 dark:text-gray-400 transition-colors">{label}</label>
      <input
        type="text"
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-sm outline-none
        focus:border-gray-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-gray-100 dark:focus:ring-gray-800 transition text-gray-950 dark:text-white dark:bg-gray-900"
      />
    </div>
  );
}
