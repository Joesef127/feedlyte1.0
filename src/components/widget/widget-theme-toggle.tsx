"use client";

import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export function WidgetThemeToggle({ theme, onToggle }: WidgetThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span
        className={cn(
          "pointer-events-none flex h-4 w-4 items-center justify-center rounded-full bg-card text-primary shadow-sm border border-border/40 transition-transform duration-200",
          isDark ? "translate-x-4" : "translate-x-0.5",
        )}
      >
        {isDark ? (
          <Moon size={10} strokeWidth={2.5} />
        ) : (
          <Sun size={10} strokeWidth={2.5} />
        )}
      </span>
    </button>
  );
}
