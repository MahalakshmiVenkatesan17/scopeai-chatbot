"use client";

import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();
  const handleLoginPage = async () => {
    window.location.href = "/profile";
  };
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 px-6 justify-between lg:justify-end">
      {/* Search */}
      {/* <div className="flex flex-1 items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div> */}

      <button
        onClick={onMenuClick}
        className="mr-4 rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {/* Notifications */}
        {/* <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button> */}
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full primary-bg-color text-white font-medium">
            {user?.first_name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p
              className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
              onClick={handleLoginPage}
            >
              {user?.role
                ? user.role
                  .split("_")
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
                : "Admin User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || "admin@example.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
