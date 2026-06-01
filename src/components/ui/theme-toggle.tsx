"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "feedlyte-theme";

// useSyncExternalStore wiring — lets React safely read localStorage on client
// while providing a stable server snapshot for SSR.
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
const getSnapshot = () => localStorage.getItem(STORAGE_KEY) !== "light";
const getServerSnapshot = () => true; // always dark during SSR

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep the HTML data-theme attribute in sync (DOM side-effect, not setState — no cascade).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => {
    const theme = dark ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
    // Dispatch a storage event so useSyncExternalStore re-reads the snapshot.
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center w-11 h-6 rounded-[12px] border border-sidebar-border bg-secondary p-0.5 cursor-pointer shrink-0 transition-colors duration-200"
    >
      <span
        className={`w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-transform duration-200 shrink-0 ${
          dark ? "translate-x-0" : "translate-x-5"
        }`}
      >
        {dark ? <Moon size={10} /> : <Sun size={10} />}
      </span>
    </button>
  );
}
