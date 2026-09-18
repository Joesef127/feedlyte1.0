import { Bug, Lightbulb, Heart, HelpCircle } from "lucide-react";
import type { Status } from "@/types";

export const CATEGORY_ICONS: Record<string, typeof Bug> = {
  bug: Bug,
  idea: Lightbulb,
  praise: Heart,
  question: HelpCircle,
};

export const ALL_STATUSES: { id: Status; label: string }[] = [
  { id: "unreviewed", label: "Unreviewed" },
  { id: "in_review", label: "In Review" },
  { id: "accepted", label: "Accepted" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
  { id: "not_feasible", label: "Not Feasible" },
  { id: "closed", label: "Closed" },
  { id: "spam", label: "Spam" },
];

export const REDUNDANT_TECH_KEYS = new Set([
  "browser & os",
  "browser",
  "os",
  "operating system",
  "user agent",
  "useragent",
  "timestamp",
  "date",
  "time",
  "current url",
  "page url",
  "url",
  "pageurl",
  "currenturl",
]);

export function parseUserAgent(ua: string): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };

  const browser = ua.includes("Edg/")
    ? "Edge"
    : ua.includes("Chrome/")
      ? "Chrome"
      : ua.includes("Firefox/")
        ? "Firefox"
        : ua.includes("Safari/")
          ? "Safari"
          : ua.includes("OPR/")
            ? "Opera"
            : "Unknown";

  const os = ua.includes("Windows NT")
    ? "Windows"
    : ua.includes("Mac OS X")
      ? "macOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone")
          ? "iOS"
          : ua.includes("iPad")
            ? "iPadOS"
            : ua.includes("Linux")
              ? "Linux"
              : "Unknown";

  return { browser, os };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export function formatDuration(ms: number): string {
  if (ms < 0) return "Instant";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return `${days}d ${remHours > 0 ? `${remHours}h` : ""}`;
  }
  if (hours > 0) {
    const remMins = minutes % 60;
    return `${hours}h ${remMins > 0 ? `${remMins}m` : ""}`;
  }
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function getOpenDuration(createdAt: string | Date): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  return formatDuration(diff);
}
