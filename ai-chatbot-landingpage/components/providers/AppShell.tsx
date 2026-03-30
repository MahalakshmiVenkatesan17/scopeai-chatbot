"use client";

import { usePathname } from "next/navigation";
import CTASection from "@/components/sections/CTASection";
import { Footer, Navbar } from "@/components/layout";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main>{children}</main>
      {!isAuthPage && <CTASection />}
      {!isAuthPage && <Footer />}
    </>
  );
}
