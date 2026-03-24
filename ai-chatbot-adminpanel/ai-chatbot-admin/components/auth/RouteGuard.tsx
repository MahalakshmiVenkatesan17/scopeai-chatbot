"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

// Routes that are accessible without a token (excluding root '/')
const PUBLIC_AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
};

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { _hasHydrated } = useAuthStore();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for hydration from storage

    const token = getToken();
    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
      (route) => pathname === route || pathname?.startsWith(route + "/")
    );
    const isRoot = pathname === "/" || pathname === "";

    // 1. Not authenticated (no token)
    if (!token) {
      if (isPublicAuthRoute) {
        // At login/register without token → fine
        setAuthorized(true);
      } else {
        // At root or private route without token → go to login
        setAuthorized(false);
        router.replace("/login");
      }
    } 
    // 2. Authenticated (token exists)
    else {
      if (isPublicAuthRoute || isRoot) {
        // At login/register/root with token → go to dashboard
        setAuthorized(false);
        router.replace("/dashboard");
      } else {
        // At private route with token → fine
        setAuthorized(true);
      }
    }
  }, [pathname, router, _hasHydrated]);

  // Show spinner until we determine the user is authorized for THIS URL
  if (authorized === null || !authorized) {
    return <Spinner />;
  }

  return <>{children}</>;
}

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        background: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid #e5e7eb",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
    </div>
  );
}
