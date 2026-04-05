"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dorm-theme";

function resolveIsDark(value) {
  if (typeof window === "undefined") return false;
  if (value === "dark") return true;
  if (value === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(value) {
  document.documentElement.classList.toggle("dark", resolveIsDark(value));
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    return localStorage.getItem(STORAGE_KEY) || "system";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    const nextTheme = resolveIsDark(theme)
      ? "light"
      : "dark";
    setTheme(nextTheme);
  }

  return { theme, isDark: resolveIsDark(theme), toggle };
}
