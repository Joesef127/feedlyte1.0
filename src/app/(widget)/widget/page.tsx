"use client";

import { useState, useEffect, useRef, use } from "react";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LAUNCHER_ICONS: Record<string, typeof MessageSquare> = {
  "message-square": MessageSquare,
  bug: Bug,
  lightbulb: Lightbulb,
  heart: Heart,
  "help-circle": HelpCircle,
};

const CATEGORY_OPTIONS: { value: string; label: string; Icon: typeof MessageSquare }[] = [
  { value: "bug", label: "Bug", Icon: Bug },
  { value: "idea", label: "Idea", Icon: Lightbulb },
  { value: "praise", label: "Praise", Icon: Heart },
  { value: "question", label: "Question", Icon: HelpCircle },
];

const TECHNICAL_DETAIL_FIELDS: { key: string; label: string }[] = [
  { key: "browser", label: "Browser & OS" },
  { key: "viewport", label: "Viewport size" },
  { key: "url", label: "Current URL" },
  { key: "referrer", label: "Referrer" },
  { key: "timestamp", label: "Timestamp" },
];

interface WidgetSearchParams {
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

// Stable fallback used when the Next.js searchParams prop is not provided
// (bare iframe URL, tests without DOM). Defined outside the component so the
// reference never changes between renders — use() must always be called
// unconditionally to satisfy the Rules of Hooks.
//
// Compatibility: React.use() for unwrapping Promises is available in
// React 19+ (this project uses React 19.2.3 / Next.js 16.1.6).
const EMPTY_PARAMS_PROMISE: Promise<WidgetSearchParams> = Promise.resolve({});

// Only allow http/https pageUrls — prevents protocol-injection attacks
// (e.g. javascript:, data:) slipping through before server validation.
function sanitizePageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? url
      : "";
  } catch {
    return "";
  }
}

function sanitizeWidgetColor(color: string | undefined): string {
  return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#F59E0B";
}

function sanitizeWidgetLabel(label: string | undefined): string {
  return label && label.length <= 40 ? label : "Feedback";
}

function sanitizeWidgetNumber(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? Math.round(parsed) : fallback;
}

function sanitizeWidgetTheme(theme: string | undefined): "dark" | "light" {
  return theme === "light" ? "light" : "dark";
}

function sanitizeWidgetFields(fields: string | undefined): { email: boolean } {
  return { email: fields?.split(",").map((field) => field.trim()).includes("email") ?? true };
}

export default function WidgetPage({
  searchParams = EMPTY_PARAMS_PROMISE,
}: {
  searchParams?: Promise<WidgetSearchParams>;
}) {
  // Always called unconditionally — satisfies Rules of Hooks.
  // When no real searchParams are provided, EMPTY_PARAMS_PROMISE resolves to {}
  // and the window.location fallback effect below takes over.
  const resolvedParams = use(searchParams);

  const [projectId, setProjectId] = useState(resolvedParams?.project ?? "");
  const [position, setPosition] = useState(resolvedParams?.position ?? "");
  const [widgetColor, setWidgetColor] = useState(sanitizeWidgetColor(resolvedParams?.color));
  const [widgetLabel, setWidgetLabel] = useState(sanitizeWidgetLabel(resolvedParams?.label));
  const [width, setWidth] = useState(sanitizeWidgetNumber(resolvedParams?.width, 360, 320, 480));
  const [theme, setTheme] = useState(sanitizeWidgetTheme(resolvedParams?.theme));
  const [fields, setFields] = useState(sanitizeWidgetFields(resolvedParams?.fields));
  const [consentText, setConsentText] = useState((resolvedParams?.consent ?? "").slice(0, 160));
  const [consentGiven, setConsentGiven] = useState(false);
  const [launcherStyle] = useState(resolvedParams?.launcher === "tab" ? "tab" : "pill");
  const telemetryEnabled = resolvedParams?.telemetry === "true";
  const [isRtl, setIsRtl] = useState(Boolean(resolvedParams?.rtl === "true" || resolvedParams?.rtl === "1"));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Optional, project-configurable widget capabilities (all default to "off"
  // so a project keeps today's minimal widget unless the owner opts in).
  const [categoryEnabled, setCategoryEnabled] = useState(false);
  const [ratingEnabled, setRatingEnabled] = useState(false);
  const [technicalDetailsEnabled, setTechnicalDetailsEnabled] = useState(false);
  const [launcherIcon, setLauncherIcon] = useState("message-square");
  const [cornerStyle, setCornerStyle] = useState("rounded");
  const [showLabel, setShowLabel] = useState(true);
  const [showBranding, setShowBranding] = useState(true);

  const [category, setCategory] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showTechnicalPanel, setShowTechnicalPanel] = useState(false);
  const [technicalSelections, setTechnicalSelections] = useState<Record<string, boolean>>({});
  const [trackingToken, setTrackingToken] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Prefer the value from searchParams prop (most reliable). The window.location
  // fallback below handles the case where the prop is absent.
  const [pageUrl, setPageUrl] = useState(resolvedParams?.url ?? "");

  useEffect(() => {
    // Only needed when the searchParams prop wasn't provided (e.g., bare
    // iframe URL not routed through Next.js, or in tests without DOM access).
    // resolvedParams.project is undefined when using the EMPTY_PARAMS fallback.
    if (resolvedParams.project) return;
    const params = new URLSearchParams(window.location.search);
    setProjectId(params.get("project") ?? "");
    setPosition(params.get("position") ?? "bottom-right");
    setWidgetColor(sanitizeWidgetColor(params.get("color") ?? undefined));
    setWidgetLabel(sanitizeWidgetLabel(params.get("label") ?? undefined));
    setWidth(sanitizeWidgetNumber(params.get("width") ?? undefined, 360, 320, 480));
    setTheme(sanitizeWidgetTheme(params.get("theme") ?? undefined));
    setFields(sanitizeWidgetFields(params.get("fields") ?? undefined));
    setConsentText((params.get("consent") ?? "").slice(0, 160));
    setIsRtl(params.get("rtl") === "true" || params.get("rtl") === "1");
    // Prefer the URL passed by widget.js (most reliable — runs on host page
    // before any cross-origin restrictions). Fall back to document.referrer
    // which browsers set on iframes when no referrer policy blocks it.
    setPageUrl(params.get("url") ?? document.referrer ?? "");
  }, [resolvedParams]);

  const reportMetric = (name: "open" | "submission_success" | "submission_failure", durationMs?: number) => {
    if (!telemetryEnabled || typeof window === "undefined") return;
    try {
      const targetOrigin = new URL(pageUrl || document.referrer).origin;
      if (targetOrigin === "null") return;
      window.parent.postMessage({ type: "feedlyte:metric", name, durationMs }, targetOrigin);
    } catch {
      return;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setPrefersReducedMotion(false);
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setPrefersReducedMotion(media.matches);
    updateReducedMotion();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateReducedMotion);
      return () => media.removeEventListener("change", updateReducedMotion);
    }

    media.addListener(updateReducedMotion);
    return () => media.removeListener(updateReducedMotion);
  }, []);

  // Fetch project config (color, label, optional feature toggles) from the
  // public widget-config endpoint. This ensures the widget always reflects
  // what's saved in the dashboard.
  useEffect(() => {
    const id = projectId || resolvedParams?.project;
    if (!id) return;
    const base = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "");
    fetch(`${base}/api/widget-config?project=${encodeURIComponent(id)}`).then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.color) setWidgetColor(sanitizeWidgetColor(data.color));
        if (data.label) setWidgetLabel(sanitizeWidgetLabel(data.label));
        if (data.position) setPosition(data.position);
        setCategoryEnabled(Boolean(data.categoryEnabled));
        setRatingEnabled(Boolean(data.ratingEnabled));
        setTechnicalDetailsEnabled(Boolean(data.technicalDetailsEnabled));
        if (data.launcherIcon && LAUNCHER_ICONS[data.launcherIcon]) setLauncherIcon(data.launcherIcon);
        if (data.cornerStyle === "sharp" || data.cornerStyle === "rounded") setCornerStyle(data.cornerStyle);
        if (typeof data.showLabel === "boolean") setShowLabel(data.showLabel);
        setShowBranding(data.showBranding !== false);
      })
      .catch(() => { });
  }, [projectId, resolvedParams?.project]);

  // Notify parent of height changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Use the known host-page origin instead of "*" to avoid broadcasting
    // widget state to unintended windows. Fall back to "*" only when the
    // origin cannot be determined (e.g., referrer policy blocks it).
    const targetOrigin = (() => {
      try {
        const origin = new URL(pageUrl || document.referrer).origin;
        // "null" is the serialised opaque origin some browsers return for
        // sandboxed iframes — treat it as unknown.
        return origin && origin !== "null" ? origin : "*";
      } catch {
        return "*";
      }
    })();
    const notifySize = () => {
      const height = Math.max(containerRef.current?.scrollHeight ?? 68, 68);
      window.parent.postMessage({ type: "feedlyte:resize", height }, targetOrigin);
    };
    notifySize();
    if (typeof ResizeObserver === "undefined" || !containerRef.current) return;
    const observer = new ResizeObserver(notifySize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [open, submitted, pageUrl]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => launcherRef.current?.focus());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => messageInputRef.current?.focus());
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const computeTechnicalDetailValue = (key: string): string => {
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
  };

  const toggleAllTechnicalDetails = (select: boolean) => {
    setTechnicalSelections(
      Object.fromEntries(TECHNICAL_DETAIL_FIELDS.map((field) => [field.key, select])),
    );
  };

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    const trimmedEmail = email.trim();

    if (!trimmedMessage) {
      setError("Please add a message before sending.");
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address or leave the field blank.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("You appear to be offline. Please reconnect and try again.");
      return;
    }

    if (!projectId) return;
    setSubmitting(true);
    setError("");
    const submissionStartedAt = performance.now();
    try {
      // Use absolute URL — the widget runs in an iframe on a third-party domain,
      // so a relative path would resolve to the host page's origin, not ours.
      const apiBase = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "");
      const selectedTechnicalDetails = showTechnicalPanel
        ? Object.fromEntries(
            TECHNICAL_DETAIL_FIELDS.filter((field) => technicalSelections[field.key]).map((field) => [
              field.label,
              computeTechnicalDetailValue(field.key),
            ]),
          )
        : undefined;

      const res = await fetch(`${apiBase}/api/feedback?project=${encodeURIComponent(projectId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          email: trimmedEmail || undefined,
          // Sanitize before sending — server validation is the authoritative
          // check, but stripping non-http(s) protocols client-side adds
          // defence-in-depth against protocol-injection via the url param.
          pageUrl: sanitizePageUrl(pageUrl),
          userAgent: navigator.userAgent,
          category: category || undefined,
          rating: rating > 0 ? rating : undefined,
          technicalDetails: selectedTechnicalDetails && Object.keys(selectedTechnicalDetails).length > 0
            ? selectedTechnicalDetails
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        reportMetric("submission_failure");
        if (res.status === 403) setError("This widget is not authorized for this website.");
        else if (res.status === 409) setError("This feedback was already submitted. You can try again with a new message.");
        else if (res.status === 429) setError(data.error ?? "Too many requests. Please wait a moment and try again.");
        else setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      if (typeof data.trackingToken === "string") setTrackingToken(data.trackingToken);
      reportMetric("submission_success", performance.now() - submissionStartedAt);
      setMessage("");
      setEmail("");
      setCategory("");
      setRating(0);
      setShowTechnicalPanel(false);
      setTechnicalSelections({});
    } catch {
      reportMetric("submission_failure");
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const normalizedPosition = position === "bottom-left" ? "bottom-left" : "bottom-right";
  const primaryColor = widgetColor;
  const isRight = normalizedPosition !== "bottom-left";
  const canSubmit = message.trim().length > 0 && !submitting && (!fields.email || !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) && (!consentText || consentGiven);
  const palette = theme === "light"
    ? { panel: "#ffffff", field: "#f5f5f5", border: "#d4d4d4", text: "#171717", muted: "#525252" }
    : { panel: "#1a1a1a", field: "#111111", border: "#2d2d2d", text: "#e5e5e5", muted: "#a3a3a3" };
  const isSharpCorners = cornerStyle === "sharp";
  const LauncherIcon = LAUNCHER_ICONS[launcherIcon] ?? MessageSquare;
  const trackingUrl = trackingToken && typeof window !== "undefined"
    ? `${window.location.origin}/track/${trackingToken}`
    : "";

  return (
    <div
      ref={containerRef}
      dir={isRtl ? "rtl" : "ltr"}
      lang={resolvedParams?.lang ?? "en"}
      className={cn(
        "w-full flex flex-col p-0 bg-transparent font-sans",
        isRight ? "items-end" : "items-start",
      )}
    >
      {/* Feedback panel */}
      {open && (
        <div
          id="feedlyte-feedback-form"
          role="dialog"
          aria-label="Feedback form"
          className={cn(
            "p-4 mb-2.5 max-w-[calc(100vw-2px)] border shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
            isSharpCorners ? "rounded" : "rounded-xl",
            theme === "light"
              ? "bg-white border-[#d4d4d4] text-neutral-900"
              : "bg-[#1a1a1a] border-[#2d2d2d] text-[#e5e5e5]",
          )}
          style={{ width: `${width}px` }}
        >
          {submitted ? (
            <div className="text-center py-2">
              <div className="text-[28px] mb-2 p-3 bg-emerald-500 text-white rounded-full inline-flex items-center justify-center w-14 h-14 font-semibold">
                ✓
              </div>
              <p
                aria-live="polite"
                className={cn(
                  "text-sm font-semibold m-0 mb-1",
                  theme === "light" ? "text-neutral-900" : "text-[#e5e5e5]",
                )}
              >
                Thanks for your feedback!
              </p>
              <p
                className={cn(
                  "text-sm m-0",
                  theme === "light" ? "text-neutral-600" : "text-[#a3a3a3]",
                )}
              >
                We appreciate you taking the time.
              </p>
              {trackingUrl && (
                <>
                  <p
                    className={cn(
                      "text-xs mt-2.5 mb-0",
                      theme === "light" ? "text-neutral-600" : "text-[#a3a3a3]",
                    )}
                  >
                    Want to check back later?{" "}
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline-offset-2 hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Track this feedback
                    </a>
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-2.5 mb-0",
                      theme === "light" ? "text-neutral-600" : "text-[#a3a3a3]",
                    )}
                  >
                    <span className="font-semibold">Note:</span> This tracking
                    link will only show up once and only applies to this specific
                    feedback entry.
                  </p>
                </>
              )}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setOpen(false);
                  setTrackingToken("");
                }}
                className={cn(
                  "mt-3.5 bg-transparent border rounded-md text-xs px-3.5 py-1.5 cursor-pointer transition-colors",
                  theme === "light"
                    ? "border-[#d3d0d0] text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    : "border-[#3d3d3d] text-[#a3a3a3] hover:text-white hover:bg-neutral-800",
                )}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <p
                  className={cn(
                    "text-lg font-semibold m-0",
                    theme === "light" ? "text-neutral-900" : "text-[#e5e5e5]",
                  )}
                >
                  Share your feedback
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    requestAnimationFrame(() => launcherRef.current?.focus());
                  }}
                  className={cn(
                    "bg-transparent border-none text-lg cursor-pointer leading-none px-0.5 transition-colors",
                    theme === "light"
                      ? "text-neutral-500 hover:text-neutral-900"
                      : "text-[#a3a3a3] hover:text-white",
                  )}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              {categoryEnabled && (
                <div className="mb-2.5">
                  <p
                    className={cn(
                      "m-0 mb-1.5 text-sm font-semibold",
                      theme === "light" ? "text-neutral-900" : "text-[#e5e5e5]",
                    )}
                  >
                    What&apos;s this about?{" "}
                    <span
                      className={cn(
                        "font-normal",
                        theme === "light" ? "text-neutral-500" : "text-[#a3a3a3]",
                      )}
                    >
                      (optional)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_OPTIONS.map(({ value, label, Icon }) => {
                      const selected = category === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setCategory(selected ? "" : value)}
                          aria-pressed={selected}
                          className={cn(
                            "flex items-center gap-1.25 text-xs font-semibold px-2.25 py-1.25 cursor-pointer font-sans transition-all border",
                            isSharpCorners ? "rounded-[3px]" : "rounded-[7px]",
                          )}
                          style={{
                            background: selected ? `${primaryColor}20` : "transparent",
                            borderColor: selected ? primaryColor : palette.border,
                            color: selected ? primaryColor : palette.muted,
                          }}
                        >
                          <Icon size={12} strokeWidth={2.25} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <label
                htmlFor="feedlyte-message"
                className={cn(
                  "block mb-1.5 text-sm font-semibold",
                  theme === "light" ? "text-neutral-900" : "text-[#d4d4d4]",
                )}
              >
                Feedback message
              </label>
              <textarea
                ref={messageInputRef}
                id="feedlyte-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={2000}
                rows={3}
                aria-label="Feedback message"
                className={cn(
                  "w-full text-sm px-2.5 py-2 resize-y outline-none mb-2 font-sans border transition-colors box-border",
                  isSharpCorners ? "rounded-[3px]" : "rounded-[7px]",
                  theme === "light"
                    ? "bg-[#f5f5f5] text-neutral-900 border-[#d4d4d4] placeholder:text-neutral-400"
                    : "bg-[#111111] text-[#e5e5e5] border-[#2d2d2d] placeholder:text-neutral-500",
                )}
                onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                onBlur={(e) => (e.target.style.borderColor = palette.border)}
              />
              {ratingEnabled && (
                <div className="mb-2.5">
                  <p
                    className={cn(
                      "m-0 mb-1.5 text-sm font-semibold",
                      theme === "light" ? "text-neutral-900" : "text-[#e5e5e5]",
                    )}
                  >
                    How would you rate your experience?{" "}
                    <span
                      className={cn(
                        "font-normal",
                        theme === "light" ? "text-neutral-500" : "text-[#a3a3a3]",
                      )}
                    >
                      (optional)
                    </span>
                  </p>
                  <div role="radiogroup" aria-label="Rating" className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const filled = value <= (hoveredRating || rating);
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={rating === value}
                          aria-label={`${value} star${value > 1 ? "s" : ""}`}
                          onClick={() => setRating(rating === value ? 0 : value)}
                          onMouseEnter={() => setHoveredRating(value)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="bg-transparent border-none cursor-pointer p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            size={20}
                            strokeWidth={1.75}
                            color={filled ? primaryColor : palette.muted}
                            fill={filled ? primaryColor : "none"}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {fields.email && (
                <>
                  <label
                    htmlFor="feedlyte-email"
                    className={cn(
                      "block mb-1.5 text-sm font-semibold",
                      theme === "light" ? "text-neutral-900" : "text-[#e5e5e5]",
                    )}
                  >
                    Email
                  </label>
                  <input
                    id="feedlyte-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional)"
                    aria-label="Email"
                    className={cn(
                      "w-full text-sm px-2.5 py-1.75 outline-none mb-2.5 font-sans border transition-colors box-border",
                      isSharpCorners ? "rounded-[3px]" : "rounded-[7px]",
                      theme === "light"
                        ? "bg-[#f5f5f5] text-neutral-900 border-[#d4d4d4] placeholder:text-neutral-400"
                        : "bg-[#111111] text-[#e5e5e5] border-[#2d2d2d] placeholder:text-neutral-500",
                    )}
                    onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                    onBlur={(e) => (e.target.style.borderColor = palette.border)}
                  />
                </>
              )}
              {technicalDetailsEnabled && (
                <div className="mb-2.5">
                  <button
                    type="button"
                    onClick={() => setShowTechnicalPanel((prev) => !prev)}
                    aria-expanded={showTechnicalPanel}
                    className={cn(
                      "flex items-center gap-1.25 bg-transparent border-none text-xs font-semibold p-0 cursor-pointer font-sans transition-colors hover:opacity-80",
                      theme === "light" ? "text-neutral-600" : "text-[#a3a3a3]",
                    )}
                  >
                    {showTechnicalPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    Include technical details (optional)
                  </button>
                  {showTechnicalPanel && (
                    <div
                      className={cn(
                        "mt-2 px-2.5 py-2 border font-sans",
                        isSharpCorners ? "rounded-[3px]" : "rounded-[7px]",
                        theme === "light"
                          ? "bg-[#f5f5f5] border-[#d4d4d4]"
                          : "bg-[#111111] border-[#2d2d2d]",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleAllTechnicalDetails(
                            !TECHNICAL_DETAIL_FIELDS.every((field) => technicalSelections[field.key]),
                          )
                        }
                        className="bg-transparent border-none text-[11px] font-semibold p-0 mb-1.5 cursor-pointer font-sans hover:underline"
                        style={{ color: primaryColor }}
                      >
                        {TECHNICAL_DETAIL_FIELDS.every((field) => technicalSelections[field.key])
                          ? "Deselect all"
                          : "Select all"}
                      </button>
                      {TECHNICAL_DETAIL_FIELDS.map((field) => (
                        <label
                          key={field.key}
                          className={cn(
                            "flex items-center gap-1.75 text-xs py-0.75 cursor-pointer select-none",
                            theme === "light" ? "text-neutral-900" : "text-[#e5e5e5]",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(technicalSelections[field.key])}
                            onChange={(e) =>
                              setTechnicalSelections((prev) => ({
                                ...prev,
                                [field.key]: e.target.checked,
                              }))
                            }
                            className="accent-primary"
                          />
                          {field.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {consentText && (
                <label
                  className={cn(
                    "flex gap-2 items-start text-[11px] mb-2.5 cursor-pointer select-none",
                    theme === "light" ? "text-neutral-600" : "text-[#a3a3a3]",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    aria-label="Consent"
                    className="accent-primary mt-0.5"
                  />
                  <span>{consentText}</span>
                </label>
              )}
              {error && (
                <p aria-live="polite" className="text-red-500 text-sm m-0 mb-2 font-medium">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-label={error ? "Try again" : "Send feedback"}
                className={cn(
                  "w-full border-none text-base font-semibold px-4 py-2 font-sans transition-all",
                  isSharpCorners ? "rounded-[3px]" : "rounded-[7px]",
                  !canSubmit
                    ? "bg-[#d3d0d0] text-[#737373] cursor-not-allowed dark:bg-[#333333] dark:text-[#777777]"
                    : "cursor-pointer active:scale-[0.99] text-[#1a1a1a]",
                  prefersReducedMotion ? "transition-none" : "transition-[background,transform] duration-150",
                )}
                style={{
                  background: canSubmit ? primaryColor : undefined,
                }}
              >
                {submitting ? "Sending..." : error ? "Try again" : "Send Feedback"}
              </button>
              {showBranding && (
                <p
                  className={cn(
                    "text-center mt-2.5 mb-0 text-[10px]",
                    theme === "light" ? "text-neutral-500" : "text-[#a3a3a3]",
                  )}
                >
                  Powered by{" "}
                  <a
                    href="https://feedlyte.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "font-semibold hover:underline",
                      theme === "light" ? "text-neutral-600" : "text-[#a3a3a3]",
                    )}
                  >
                    Feedlyte
                  </a>
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) {
            const openedAt = performance.now();
            requestAnimationFrame(() => reportMetric("open", performance.now() - openedAt));
          }
          if (next) {
            requestAnimationFrame(() => messageInputRef.current?.focus());
          } else {
            requestAnimationFrame(() => launcherRef.current?.focus());
          }
        }}
        aria-label="Toggle feedback form"
        aria-controls="feedlyte-feedback-form"
        aria-expanded={open}
        aria-haspopup="dialog"
        data-state={open ? "open" : "closed"}
        className={cn(
          "border-none text-white text-[13px] font-semibold cursor-pointer flex items-center justify-center font-sans whitespace-nowrap outline-none",
          "shadow-[0_4px_16px_rgba(245,158,11,0.35)] focus-visible:ring-2 focus-visible:ring-white/75",
          showLabel ? "px-4.5 py-2.5 gap-1.5" : "p-3 gap-0",
          isSharpCorners
            ? "rounded"
            : !showLabel
              ? "rounded-full"
              : launcherStyle === "tab"
                ? "rounded-t-[7px] rounded-b-none"
                : "rounded-[22px]",
          prefersReducedMotion ? "transition-none" : "transition-transform duration-150 ease-out hover:scale-105 active:scale-95",
        )}
        style={{
          background: primaryColor,
        }}
      >
        <LauncherIcon size={showLabel ? 15 : 18} strokeWidth={2.25} />
        {showLabel && widgetLabel}
      </button>
    </div>
  );
}
