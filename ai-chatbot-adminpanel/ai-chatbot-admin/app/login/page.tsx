"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, token: storeToken } = useAuthStore();
  const { showToast, ToastComponent } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

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
      await login(email, password);

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background px-4 py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full max-w-md space-y-8">
        {/* Logo + Title */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-upgrade-gradient">
            <Image src="/icon-white.svg" alt="icon" width={35} height={35} />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            AI Chatbot Admin
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-white">
            Sign in to your admin account
          </p>
        </div>

        {/* FORM */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 shadow-sm transition-colors">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
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
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors
                ${formErrors.email
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500/20"
                  }`}
                placeholder="admin@example.com"
              />

              {formErrors.email && (
                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors({ ...formErrors, password: "" });
                  }}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors
                  ${formErrors.password
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500/20"
                    }`}
                  placeholder="••••••••"
                />

                {/* Toggle Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {formErrors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.password}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-upgrade-gradient"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>

      {ToastComponent}
    </div>
  );
}
