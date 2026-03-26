import React from "react";

type AuthCardProps = {
  children: React.ReactNode;
  variant?: "signup" | "login";
};

export default function AuthCard({
  children,
  variant = "signup",
}: AuthCardProps) {
  const content = {
    signup: {
      title: "Welcome",
      description: "Create your account. It's free and only takes a minute.",
    },
    login: {
      title: "Welcome back!",
      description:
        "Available at no cost for individuals. Team plans offer collaborative features.",
    },
  };

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl grid grid-cols-1 md:grid-cols-2 border border-transparent dark:border-gray-800 transition-colors">
      {/* LEFT : Image */}
      <div className="relative hidden md:block">
        <img
          src="/images/authpage/authPage_Img.png"
          alt="Welcome"
          className="absolute inset-0 w-full h-full object-cover dark:opacity-60 transition-opacity"
        />

        {/* Overlay */}
        <div className="absolute inset-0 auth-image-overlay dark:opacity-40 transition-opacity" />

        {/* Text */}
        <div className="relative z-10 h-full flex flex-col justify-end px-10 text-white">
          <h2 className="text-3xl font-bold mb-4">{content[variant].title}</h2>
          <p className="text-white/80 max-w-sm mb-5 transition-colors">
            {content[variant].description}
          </p>
        </div>
      </div>

      {/* RIGHT : Form */}
      <div className="px-6 py-8 sm:px-10 sm:py-12 bg-white dark:bg-gray-950 transition-colors">{children}</div>
    </div>
  );
}
