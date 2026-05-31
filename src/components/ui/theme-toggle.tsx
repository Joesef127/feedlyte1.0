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
      style={{
        display: "flex",
        alignItems: "center",
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "1px solid var(--sidebar-border)",
        background: "var(--secondary)",
        padding: "2px",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <span
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary-foreground)",
          transform: dark ? "translateX(0)" : "translateX(20px)",
          transition: "transform 0.2s",
          flexShrink: 0,
        }}
      >
        {dark ? <Moon size={10} /> : <Sun size={10} />}
      </span>
    </button>
  );
}
