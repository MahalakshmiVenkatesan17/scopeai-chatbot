"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  MessageSquare,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  ShieldUser,
  ChevronDown,
  ChevronRight,
  UserStar,
  CircleCheck,
  Settings2,
  Proportions,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import FullPageLoader from "@/components/ui/FullPageLoader";
import { useToast } from "../ui/Toast";

interface SubMenuItem {
  href: string;
  label: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenants", label: "Tenants", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/chatbot-config", label: "Chatbot Config", icon: MessageSquare },
  {
    href: "/masters",
    label: "Masters",
    icon: ShieldUser,
    subItems: [
      { href: "/masters/categories", label: "Categories" },
      { href: "/masters/subscriptions", label: "Subscriptions" },
    ],
  },
  { href: "/widget-integration", label: "Widget Code", icon: Settings },
  { href: "/visitor-info", label: "Visitor Info", icon: UserStar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/subscription", label: "Subscription", icon: CircleCheck },
  { href: "/system-health", label: "System Health", icon: Activity },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings2,
    subItems: [{ href: "/settings/billing", label: "Billing" }],
  },
  { href: "/plans-report", label: "Active Plan Reports", icon: Proportions },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const { showToast, ToastComponent } = useToast();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredNavItems = navItems
    .map((item) => {
      if (item.href === "/masters" && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter((sub) => {
            if (
              sub.href === "/masters/subscriptions" &&
              user?.role !== "super_admin"
            ) {
              return false;
            }
            return true;
          }),
        };
      }

      if (item.href === "/tenants")
        return user?.role === "super_admin" ? item : null;
      if (item.href === "/analytics")
        return user?.role === "super_admin" ? item : null;
      if (item.href === "/system-health")
        return user?.role === "super_admin" ? item : null;
      if (item.href === "/settings")
        return user?.role !== "super_admin" ? item : null;
      if (item.href === "/subscription")
        return user?.role !== "super_admin" ? item : null;
      if (item.href === "/plans-report")
        return user?.role === "super_admin" ? item : null;

      return item;
    })
    .filter(Boolean) as NavItem[];

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href);
  };

  const handleNavigation = (href: string) => {
    const normalizedPath = pathname.replace(/\/$/, "") || "/";
    const normalizedHref = href.replace(/\/$/, "") || "/";

    if (normalizedPath !== normalizedHref) {
      setIsNavigating(true);
      router.push(href);
      onClose();
    } else {
      onClose();
    }
  };

  const handleLogout = async () => {
    // setIsNavigating(true);
    await logout();
    showToast("You have been logged out successfully.", "success");
    window.location.href = "/login";
    // setTimeout(() => {
    //   window.location.href = "/login";
    // }, 1500);
  };

  useEffect(() => {
    let matchedMenu: string | null = null;

    for (const item of filteredNavItems) {
      if (item.subItems) {
        const match = item.subItems.find((sub) =>
          pathname.startsWith(sub.href),
        );
        if (match) {
          matchedMenu = item.href;
          break;
        }
      }
    }

    setOpenSubmenu(matchedMenu);
    setIsNavigating(false);
  }, [pathname]);

  return (
    <>
      {isNavigating && <FullPageLoader />}

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72
        bg-[#5856d6] dark:bg-[#0B1220]
        border-r border-transparent dark:border-white/[0.06]
        shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.35)]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex lg:flex-col`}
      >
        {/* subtle glow only in dark mode */}
        <div className="pointer-events-none absolute inset-0 hidden dark:block">
          <div className="absolute top-20 left-0 h-48 w-48 rounded-full bg-violet-600/8 blur-3xl" />
          <div className="absolute bottom-24 right-0 h-48 w-48 rounded-full bg-indigo-500/8 blur-3xl" />
        </div>

        <div className="relative flex h-full flex-col">
          {/* LOGO */}
          <div className="flex h-20 items-center px-5 border-b border-white/10 dark:border-white/[0.06]">
            <img
              src="/ScopeAIChat_Logo_White.svg"
              alt="logo"
              className="h-10 w-auto"
            />
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar px-4 py-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                item.subItems?.some((sub) => pathname.startsWith(sub.href));

              const hasSubmenu = item.subItems?.length;
              const isSubmenuOpen = openSubmenu === item.href;

              return (
                <div key={item.href}>
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.href)}
                        className={`group flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-medium transition-all cursor-pointer border
                        ${
                          isActive || isSubmenuOpen
                            ? "bg-white text-[#5856d6] border-white/20 shadow-sm dark:bg-[#635BDF]/12 dark:text-[#A5B4FC] dark:border-[#635BDF]/20 dark:shadow-[0_0_20px_rgba(99,91,223,0.08)]"
                            : "text-white/85 border-transparent hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center min-w-0">
                          <div
                            className={`mr-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors
                            ${
                              isActive || isSubmenuOpen
                                ? "bg-[#5856d6]/10 text-[#5856d6] dark:bg-[#635BDF]/15 dark:text-[#818CF8]"
                                : "bg-white/10 text-white/75 group-hover:text-white dark:bg-white/[0.04] dark:text-slate-400 dark:group-hover:text-[#A5B4FC]"
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {isSubmenuOpen ? (
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
                        )}
                      </button>

                      {isSubmenuOpen && (
                        <div className="relative ml-5 mt-2 space-y-1.5 pl-5">
                          <span className="absolute left-0 top-1 bottom-1 w-px bg-white/20 dark:bg-white/[0.08]" />

                          {item.subItems?.map((subItem) => {
                            const isSubItemActive = pathname.startsWith(
                              subItem.href,
                            );

                            return (
                              <button
                                key={subItem.href}
                                onClick={() => handleNavigation(subItem.href)}
                                className={`relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer border
                                ${
                                  isSubItemActive
                                    ? "bg-white/90 text-[#5856d6] border-white/20 dark:bg-[#635BDF]/10 dark:text-[#A5B4FC] dark:border-[#635BDF]/15"
                                    : "text-white/75 border-transparent hover:bg-white/10 hover:text-white dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200"
                                }`}
                              >
                                <span className="absolute -left-5 top-1/2 h-px w-3 bg-white/20 dark:bg-white/[0.08]"></span>
                                {subItem.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`group flex w-full items-center rounded-2xl px-3.5 py-3 text-sm font-medium transition-all cursor-pointer border
                      ${
                        isActive
                          ? "bg-white text-[#5856d6] border-white/20 shadow-sm dark:bg-[#635BDF]/12 dark:text-[#A5B4FC] dark:border-[#635BDF]/20 dark:shadow-[0_0_20px_rgba(99,91,223,0.08)]"
                          : "text-white/85 border-transparent hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
                      }`}
                    >
                      <div
                        className={`mr-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors
                        ${
                          isActive
                            ? "bg-[#5856d6]/10 text-[#5856d6] dark:bg-[#635BDF]/15 dark:text-[#818CF8]"
                            : "bg-white/10 text-white/75 group-hover:text-white dark:bg-white/[0.04] dark:text-slate-400 dark:group-hover:text-[#A5B4FC]"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </button>
                  )}
                </div>
              );
            })}

            {/* UPGRADE CARD */}
            {user?.role === "tenant_admin" && (
              <div className="my-5">
                <div className="relative overflow-hidden rounded-2xl border border-white/15 dark:border-white/10 bg-white/95 dark:bg-gradient-to-br dark:from-[#111827] dark:via-[#0F172A] dark:to-[#171F33] p-4 shadow-lg">
                  <div className="pointer-events-none absolute -top-10 right-0 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl hidden dark:block" />

                  <img
                    src={
                      mounted && resolvedTheme === "dark"
                        ? "/Illustrations-dark.png"
                        : "/Illustrations.png"
                    }
                    alt="upgrade-plan"
                    className="w-full rounded-xl opacity-95"
                  />

                  <div className="mt-4">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Upgrade your plan
                    </h2>

                    <p className="mt-1 text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                      Your subscription plan will expire soon. Upgrade now for
                      uninterrupted access.
                    </p>

                    <button
                      onClick={() => handleNavigation("/subscription")}
                      className="mt-3 w-full rounded-xl bg-[#5856d6] dark:bg-[#635BDF] text-white py-2.5 font-medium hover:opacity-95 dark:hover:bg-[#726AF0] transition shadow-sm dark:shadow-[0_0_20px_rgba(99,91,223,0.18)]"
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* LOGOUT */}
            <div className="pt-2 pb-4">
              <button
                onClick={handleLogout}
                className="group flex w-full items-center rounded-2xl px-3.5 py-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400 border border-transparent dark:hover:border-red-500/10 transition cursor-pointer"
              >
                <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/75 group-hover:bg-white/15 group-hover:text-white dark:bg-white/[0.04] dark:text-slate-400 dark:group-hover:bg-red-500/10 dark:group-hover:text-red-400 transition-colors">
                  <LogOut className="h-4.5 w-4.5" />
                </div>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {ToastComponent}
    </>
  );
}
