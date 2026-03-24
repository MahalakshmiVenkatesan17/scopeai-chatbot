"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BodyClassController() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/chatbot-config")) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
  }, [pathname]);

  return null;
}