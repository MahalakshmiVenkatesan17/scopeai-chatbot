"use client";

import { useState } from "react";
import AuthCard from "./AuthCard";
import Link from "next/link";
import { Button } from "../common";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <AuthCard variant="signup">
        {/* Logo */}
        <img src="/images/navbar/logo.svg" alt="Logo" className="w-32 mb-6" />

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Sign Up
        </h3>
        <p className="text-sm text-gray-500 mb-6">
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
            <p className="text-gray-400 text-sm ms-2 -mt-1">
              Use 8 or more characters with a mix of letters, numbers & symbols.
            </p>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-gray-950" />
            <span>
              By creating an account, I agree to our{" "}
              <span className=" cursor-pointer underline">Terms of Use</span> &{" "}
              <span className=" cursor-pointer underline">Privacy Policy</span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-gray-950" />
            <span>
              By creating an account, I am also consenting to receive SMS
              messages and emails, including product new feature updates,
              events, and marketing promotions.
            </span>
          </label>

          {/* Button */}
          <div className="flex gap-4 items-center flex-wrap">
            <Button radius="rounded-xl" text={"Sign Up"} height="h-10"></Button>
            <p className="text-gray-800 text-sm">
              Already have an Account?
              <Link
                href="/auth/logIn"
                className="hover:underline cursor-pointer ms-1"
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
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type="text"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none
        focus:border-gray-600 focus:ring-1 focus:ring-gray-100 transition text-gray-950"
      />
    </div>
  );
}
