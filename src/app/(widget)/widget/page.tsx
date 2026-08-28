"use client";

import { useState, useEffect, useRef, use } from "react";

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
  const [width, setWidth] = useState(sanitizeWidgetNumber(resolvedParams?.width, 360, 280, 480));
  const [theme, setTheme] = useState(sanitizeWidgetTheme(resolvedParams?.theme));
  const [fields, setFields] = useState(sanitizeWidgetFields(resolvedParams?.fields));
  const [consentText, setConsentText] = useState((resolvedParams?.consent ?? "").slice(0, 160));
  const [consentGiven, setConsentGiven] = useState(false);
  const [launcherStyle] = useState(resolvedParams?.launcher === "tab" ? "tab" : "pill");
  const [isRtl, setIsRtl] = useState(Boolean(resolvedParams?.rtl === "true" || resolvedParams?.rtl === "1"));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
    setWidth(sanitizeWidgetNumber(params.get("width") ?? undefined, 360, 280, 480));
    setTheme(sanitizeWidgetTheme(params.get("theme") ?? undefined));
    setFields(sanitizeWidgetFields(params.get("fields") ?? undefined));
    setConsentText((params.get("consent") ?? "").slice(0, 160));
    setIsRtl(params.get("rtl") === "true" || params.get("rtl") === "1");
    // Prefer the URL passed by widget.js (most reliable — runs on host page
    // before any cross-origin restrictions). Fall back to document.referrer
    // which browsers set on iframes when no referrer policy blocks it.
    setPageUrl(params.get("url") ?? document.referrer ?? "");
  }, [resolvedParams]);

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

  // Fetch project config (color, label) from the public widget-config endpoint.
  // This ensures the widget always reflects what’s saved in the dashboard.
  useEffect(() => {
    const id = projectId || resolvedParams?.project;
    if (!id) return;
    const base = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "");
    fetch(`${base}/api/widget-config?project=${encodeURIComponent(id)}`)      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        if (data.color) setWidgetColor(sanitizeWidgetColor(data.color));
        if (data.label) setWidgetLabel(sanitizeWidgetLabel(data.label));
        if (data.position) setPosition(data.position);
      })
      .catch(() => {});
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
    const h = containerRef.current?.scrollHeight ?? 68;
    window.parent.postMessage({ type: "feedlyte:resize", height: h }, targetOrigin);
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
    try {
      // Use absolute URL — the widget runs in an iframe on a third-party domain,
      // so a relative path would resolve to the host page's origin, not ours.
      const apiBase = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "");
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) setError("This widget is not authorized for this website.");
        else if (res.status === 409) setError("This feedback was already submitted. You can try again with a new message.");
        else if (res.status === 429) setError(data.error ?? "Too many requests. Please wait a moment and try again.");
        else setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      setMessage("");
      setEmail("");
    } catch {
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

  return (
    <div
      ref={containerRef}
      dir={isRtl ? "rtl" : "ltr"}
      lang={resolvedParams?.lang ?? "en"}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: isRight ? "flex-end" : "flex-start",
        padding: "0",
        background: "transparent",
        width: "100%",
      }}
    >
      {/* Feedback panel */}
      {open && (
        <div
          id="feedlyte-feedback-form"
          role="dialog"
          aria-label="Feedback form"
          style={{
            background: palette.panel,
            border: `1px solid ${palette.border}`,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "10px",
            width: `${width}px`,
            maxWidth: "calc(100vw - 32px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
              <p
                aria-live="polite"
                style={{
                  color: palette.text,
                  fontSize: "14px",
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                Thanks for your feedback!
              </p>
              <p style={{ color: palette.muted, fontSize: "12px", margin: 0 }}>
                We appreciate you taking the time.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setOpen(false);
                }}
                style={{
                  marginTop: "14px",
                  background: "transparent",
                  border: "1px solid #d3d0d0",
                  borderRadius: "6px",
                  color: "#a3a3a3",
                  fontSize: "12px",
                  padding: "6px 14px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    color: palette.text,
                    fontSize: "13px",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Share your feedback
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    requestAnimationFrame(() => launcherRef.current?.focus());
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: palette.muted,
                    fontSize: "18px",
                    cursor: "pointer",
                    lineHeight: 1,
                    padding: "0 2px",
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <label htmlFor="feedlyte-message" style={{ display: "block", marginBottom: "6px", color: "#d4d4d4", fontSize: "12px", fontWeight: 600 }}>
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
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px solid #2d2d2d",
                  borderRadius: "7px",
                  color: "#e5e5e5",
                  fontSize: "13px",
                  padding: "8px 10px",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "8px",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                onBlur={(e) => (e.target.style.borderColor = "#2d2d2d")}
              />
              {fields.email && <>
                <label htmlFor="feedlyte-email" style={{ display: "block", marginBottom: "6px", color: palette.text, fontSize: "12px", fontWeight: 600 }}>
                  Email
                </label>
                <input
                  id="feedlyte-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  aria-label="Email"
                  style={{ width: "100%", background: palette.field, border: `1px solid ${palette.border}`, borderRadius: "7px", color: palette.text, fontSize: "13px", padding: "7px 10px", outline: "none", boxSizing: "border-box", marginBottom: "10px", fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                  onBlur={(e) => (e.target.style.borderColor = palette.border)}
                />
              </>}
              {consentText && <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", color: palette.muted, fontSize: "11px", marginBottom: "10px" }}>
                <input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} aria-label="Consent" />
                <span>{consentText}</span>
              </label>}
              {error && (
                <p
                  aria-live="polite"
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    margin: "0 0 8px",
                  }}
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-label={error ? "Try again" : "Send feedback"}
                style={{
                  width: "100%",
                  background: !canSubmit ? "#d3d0d0" : primaryColor,
                  border: "none",
                  borderRadius: "7px",
                  color: !canSubmit ? "#737373" : "#1a1a1a",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "8px 16px",
                  cursor: !canSubmit ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: prefersReducedMotion ? "none" : "background 0.15s",
                }}
              >
                {submitting ? "Sending..." : error ? "Try again" : "Send Feedback"}
              </button>
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
        style={{
          background: primaryColor,
          border: "none",
          borderRadius: launcherStyle === "tab" ? "7px 7px 0 0" : "22px",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 600,
          padding: "10px 18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          transition: prefersReducedMotion ? "none" : "transform 0.15s ease",
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.75), 0 4px 16px rgba(245,158,11,0.35)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,158,11,0.35)";
        }}
      >
        <span style={{ fontSize: "15px" }}>💬</span>
        {widgetLabel}
      </button>
    </div>
  );
}
