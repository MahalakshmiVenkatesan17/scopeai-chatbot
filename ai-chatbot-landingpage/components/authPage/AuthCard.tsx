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
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl grid grid-cols-1 md:grid-cols-2">
      {/* LEFT : Image */}
      <div className="relative hidden md:block">
        <img
          src="/images/authpage/authPage_Img.png"
          alt="Welcome"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 auth-image-overlay" />

        {/* Text */}
        <div className="relative z-10 h-full flex flex-col justify-end px-10 text-white">
          <h2 className="text-3xl font-bold mb-4">{content[variant].title}</h2>
          <p className="text-white/80 max-w-sm mb-5">
            {content[variant].description}
          </p>
        </div>
      </div>

      {/* RIGHT : Form */}
      <div className="px-6 py-8 sm:px-10 sm:py-12">{children}</div>
    </div>
  );
}
