"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { LAUNCHER_ICONS } from "./widget-types";

interface WidgetLauncherProps {
  open: boolean;
  onToggle: () => void;
  launcherRef: React.RefObject<HTMLButtonElement | null>;
  primaryColor: string;
  widgetLabel: string;
  showLabel: boolean;
  launcherIcon: string;
  launcherStyle: "tab" | "pill";
  isSharpCorners: boolean;
  prefersReducedMotion: boolean;
}

export function WidgetLauncher({
  open,
  onToggle,
  launcherRef,
  primaryColor,
  widgetLabel,
  showLabel,
  launcherIcon,
  launcherStyle,
  isSharpCorners,
  prefersReducedMotion,
}: WidgetLauncherProps) {
  const LauncherIcon = LAUNCHER_ICONS[launcherIcon] ?? MessageSquare;

  return (
    <button
      ref={launcherRef}
      type="button"
      onClick={onToggle}
      aria-label="Toggle feedback form"
      aria-controls="feedlyte-feedback-form"
      aria-expanded={open}
      aria-haspopup="dialog"
      data-state={open ? "open" : "closed"}
      className={cn(
        "border-none text-primary-foreground mx-2.5 text-[13px] font-semibold cursor-pointer flex items-center justify-center font-sans whitespace-nowrap outline-none select-none",
        "shadow-lg focus-visible:ring-2 focus-visible:ring-ring",
        showLabel ? "px-4.5 py-2.5 gap-1.5" : "p-3 gap-0",
        isSharpCorners
          ? "rounded"
          : !showLabel
            ? "rounded-full"
            : launcherStyle === "tab"
              ? "rounded-t-[7px] rounded-b-none"
              : "rounded-[22px]",
        prefersReducedMotion
          ? "transition-none"
          : "transition-transform duration-150 ease-out hover:scale-105 active:scale-95",
      )}
      style={{
        background: primaryColor,
        color: "#ffffff",
      }}
    >
      <LauncherIcon size={showLabel ? 15 : 18} strokeWidth={2.25} />
      {showLabel && widgetLabel}
    </button>
  );
}
