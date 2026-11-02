"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// BTB has a single light brand theme (there's no dark design, same rule as
// the mobile apps), so this always resolves to "light" and clears any "dark"
// preference saved by the old Enatega toggle.
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  useEffect(() => {
    localStorage.removeItem("theme");
    document.documentElement.classList.remove("dark");
  }, [pathname]);

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
