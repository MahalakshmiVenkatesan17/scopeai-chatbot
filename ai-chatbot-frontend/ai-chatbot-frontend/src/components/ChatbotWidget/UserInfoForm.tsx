"use client";

import React, { useEffect, useState } from "react";
import { VisitorInfo } from "@/types/chatbot";
import clsx from "clsx";

interface UserInfoFormProps {
  formData: { name: string; email: string };
  setFormData: React.Dispatch<
    React.SetStateAction<{ name: string; email: string }>
  >;
  onSubmit: (visitorInfo: VisitorInfo) => void;
  onSkip?: () => void;
  requireEmail?: boolean;
  primaryColor?: string;
  chatbotName?: string;
}

export function UserInfoForm({
  onSubmit,
  onSkip,
  requireEmail = false,
  primaryColor = "#007bff",
  chatbotName = "AI Assistant",
}: UserInfoFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};

    if (requireEmail && !email.trim()) {
      newErrors.email = "Email is required";
    } else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const visitorInfo: VisitorInfo = {};

      if (name.trim()) {
        visitorInfo.name = name.trim();
      }

      if (email.trim()) {
        visitorInfo.email = email.trim();
      }

      onSubmit(visitorInfo);
    }
  };

  const handleSkip = () => {
    if (onSkip && !requireEmail) {
      onSkip();
    }
  };
  useEffect(() => {
    const savedName = localStorage.getItem("chat_name") || "";
    const savedEmail = localStorage.getItem("chat_email") || "";

    setName(savedName);
    setEmail(savedEmail);
  }, []);

  return (
    <div className="p-6 bg-linear-to-br from-white to-gray-50/30">
      {/* Welcome section */}
      <div className="text-center mb-6 animate-slideIn">
        <div className="relative inline-block mb-4">
          <div
            className={clsx(
              "w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold",
              "shadow-lg transform transition-all duration-300 hover:scale-110",
            )}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
              boxShadow: `0 8px 25px ${primaryColor}30`,
            }}
          >
            AI
          </div>
          {/* Welcome pulse effect */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: primaryColor }}
          />
          {/* Sparkle effects */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>

        <h3 className="text-xl font-bold gradient-text mb-2">
          Welcome to {chatbotName}!
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {requireEmail
            ? "✨ Please share your details to unlock personalized assistance"
            : "🎯 Help us tailor your experience (completely optional)"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 animate-slideIn"
        style={{ animationDelay: "0.2s" }}
      >
        {/* Name field */}
        <div className="relative">
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            👤 Your Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                localStorage.setItem("chat_name", e.target.value);
              }}
              className={clsx(
                "w-full px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all duration-200",
                "focus:outline-none focus:ring-0 focus:border-opacity-100",
                "placeholder-gray-400 bg-white hover:shadow-md focus:shadow-lg",
                errors.name
                  ? "border-red-300 focus:border-red-400 bg-red-50/30"
                  : "border-gray-200 hover:border-gray-300 focus:border-blue-400",
              )}
              placeholder="What should we call you?"
            />
            {/* Input accent line */}
            <div
              className={clsx(
                "absolute bottom-0 left-0 h-0.5 bg-linear-to-r transition-all duration-300",
                name ? "w-full opacity-100" : "w-0 opacity-0",
              )}
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd)`,
              }}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-slideIn">
              <span>⚠️</span> {errors.name}
            </p>
          )}
        </div>

        {/* Email field */}
        <div className="relative">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            📧 Email Address{" "}
            {requireEmail === true && <span className="text-red-500 text-lg">*</span>}
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                localStorage.setItem("chat_email", e.target.value);
              }}
              className={clsx(
                "w-full px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all duration-200",
                "focus:outline-none focus:ring-0 focus:border-opacity-100",
                "placeholder-gray-400 bg-white hover:shadow-md focus:shadow-lg",
                errors.email
                  ? "border-red-300 focus:border-red-400 bg-red-50/30"
                  : "border-gray-200 hover:border-gray-300 focus:border-blue-400",
              )}
              placeholder="your@email.com"
              required={requireEmail}
            />
            {/* Input accent line */}
            <div
              className={clsx(
                "absolute bottom-0 left-0 h-0.5 bg-linear-to-r transition-all duration-300",
                email ? "w-full opacity-100" : "w-0 opacity-0",
              )}
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd)`,
              }}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-slideIn">
              <span>⚠️</span> {errors.email}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            className={clsx(
              "flex-1 py-3 px-6 rounded-xl text-white font-semibold text-sm",
              "transition-all duration-200 transform hover:scale-105 active:scale-95",
              "shadow-lg hover:shadow-xl relative overflow-hidden group",
            )}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
              boxShadow: `0 4px 14px ${primaryColor}40`,
            }}
          >
            {/* Button shimmer effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <span className="relative z-10 flex items-center justify-center gap-2">
              🚀 Start Chatting
            </span>
          </button>

          {!requireEmail && onSkip && (
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-3 text-gray-500 text-sm font-medium hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Skip for now
            </button>
          )}
        </div>

        {/* Trust indicators */}
        <div
          className="text-center pt-3 animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <span>🔒</span>
            Your information is secure and never shared
          </p>
        </div>
      </form>
    </div>
  );
}
