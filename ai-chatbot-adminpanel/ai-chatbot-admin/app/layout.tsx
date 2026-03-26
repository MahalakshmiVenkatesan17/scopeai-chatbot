import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SessionManager from "@/components/auth/SessionManager";
import BodyClassController from "@/components/BodyClassController";
import RouteGuard from "@/components/auth/RouteGuard";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ScopeAIChat Admin Panel",
  description: "Admin panel for ScopeAIChat SaaS Platform",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider>
          <BodyClassController />
          <SessionManager />
          <RouteGuard>{children}</RouteGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
