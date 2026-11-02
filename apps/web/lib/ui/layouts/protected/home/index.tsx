"use client";

import { IProtectedHomeLayoutComponent } from "@/lib/utils/interfaces";

// Single-vendor: the old Discovery / Restaurants / Store tab bar is gone -
// "/discovery" now forwards to the nearest BTB branch's menu.
export default function HomeLayout({ children }: IProtectedHomeLayoutComponent) {
  return (
    <div className="w-screen h-full flex flex-col bg-white dark:bg-gray-900">
      {children}
    </div>
  );
}
