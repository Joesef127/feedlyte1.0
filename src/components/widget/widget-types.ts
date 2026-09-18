import {
  MessageSquare,
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
} from "lucide-react";

export interface WidgetSearchParams {
  project?: string;
  position?: string;
  color?: string;
  label?: string;
  offset?: string;
  width?: string;
  theme?: string;
  fields?: string;
  consent?: string;
  launcher?: string;
  telemetry?: string;
  url?: string;
  lang?: string;
  rtl?: string;
}

export const LAUNCHER_ICONS: Record<string, typeof MessageSquare> = {
  "message-square": MessageSquare,
  bug: Bug,
  lightbulb: Lightbulb,
  heart: Heart,
  "help-circle": HelpCircle,
};

export const CATEGORY_OPTIONS: {
  value: string;
  label: string;
  Icon: typeof MessageSquare;
}[] = [
  { value: "bug", label: "Bug", Icon: Bug },
  { value: "idea", label: "Idea", Icon: Lightbulb },
  { value: "praise", label: "Praise", Icon: Heart },
  { value: "question", label: "Question", Icon: HelpCircle },
];

export const TECHNICAL_DETAIL_FIELDS: { key: string; label: string }[] = [
  { key: "browser", label: "Browser & OS" },
  { key: "viewport", label: "Viewport size" },
  { key: "url", label: "Current URL" },
  { key: "referrer", label: "Referrer" },
  { key: "timestamp", label: "Timestamp" },
];

export const EMPTY_PARAMS_PROMISE: Promise<WidgetSearchParams> = Promise.resolve({});

export function sanitizePageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : "";
  } catch {
    return "";
  }
}

export function sanitizeWidgetColor(color: string | undefined): string {
  return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#F59E0B";
}

export function sanitizeWidgetLabel(label: string | undefined): string {
  return label && label.length <= 40 ? label : "Feedback";
}

export function sanitizeWidgetNumber(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
    ? Math.round(parsed)
    : fallback;
}

export function sanitizeWidgetTheme(theme: string | undefined): "dark" | "light" {
  return theme === "light" ? "light" : "dark";
}

export function sanitizeWidgetFields(fields: string | undefined): { email: boolean } {
  return { email: fields?.split(",").map((field) => field.trim()).includes("email") ?? true };
}

export function computeTechnicalDetail(key: string, pageUrl: string): string {
  switch (key) {
    case "browser":
      return typeof navigator !== "undefined" ? navigator.userAgent : "";
    case "viewport":
      return typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "";
    case "url":
      return pageUrl || "";
    case "referrer":
      return typeof document !== "undefined" ? document.referrer : "";
    case "timestamp":
      return new Date().toISOString();
    default:
      return "";
  }
}
