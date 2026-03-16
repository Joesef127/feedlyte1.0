"use client";

import { useState, useEffect, useRef, use } from "react";

interface WidgetSearchParams {
  project?: string;
  position?: string;
  url?: string;
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
  const [position, setPosition] = useState(resolvedParams?.position ?? "bottom-right");

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

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
    // Prefer the URL passed by widget.js (most reliable — runs on host page
    // before any cross-origin restrictions). Fall back to document.referrer
    // which browsers set on iframes when no referrer policy blocks it.
    setPageUrl(params.get("url") ?? document.referrer ?? "");
  }, [resolvedParams]);

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

  const handleSubmit = async () => {
    if (!message.trim() || !projectId) return;
    setSubmitting(true);
    setError("");
    try {
      // Use absolute URL — the widget runs in an iframe on a third-party domain,
      // so a relative path would resolve to the host page's origin, not ours.
      const apiBase = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${apiBase}/api/feedback?project=${encodeURIComponent(projectId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          // Sanitize before sending — server validation is the authoritative
          // check, but stripping non-http(s) protocols client-side adds
          // defence-in-depth against protocol-injection via the url param.
          pageUrl: sanitizePageUrl(pageUrl),
          userAgent: navigator.userAgent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
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

  const primaryColor = "#F59E0B";
  const isRight = position !== "bottom-left";

  return (
    <div
      ref={containerRef}
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
          style={{
            background: "#1a1a1a",
            border: "1px solid #2d2d2d",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "10px",
            width: "340px",
            maxWidth: "calc(100vw - 48px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
              <p
                style={{
                  color: "#e5e5e5",
                  fontSize: "14px",
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                Thanks for your feedback!
              </p>
              <p style={{ color: "#737373", fontSize: "12px", margin: 0 }}>
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
                  border: "1px solid #3d3d3d",
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
                    color: "#e5e5e5",
                    fontSize: "13px",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Share your feedback
                </p>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#737373",
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
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={2000}
                rows={3}
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px solid #2d2d2d",
                  borderRadius: "7px",
                  color: "#e5e5e5",
                  fontSize: "13px",
                  padding: "7px 10px",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "10px",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                onBlur={(e) => (e.target.style.borderColor = "#2d2d2d")}
              />
              {error && (
                <p
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
                onClick={handleSubmit}
                disabled={!message.trim() || submitting}
                style={{
                  width: "100%",
                  background:
                    !message.trim() || submitting ? "#3d3d3d" : primaryColor,
                  border: "none",
                  borderRadius: "7px",
                  color:
                    !message.trim() || submitting ? "#737373" : "#1a1a1a",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "8px 16px",
                  cursor:
                    !message.trim() || submitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                {submitting ? "Sending..." : "Send Feedback"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: primaryColor,
          border: "none",
          borderRadius: "22px",
          color: "#1a1a1a",
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
        }}
        aria-label="Toggle feedback form"
      >
        <span style={{ fontSize: "15px" }}>💬</span>
        Feedback
      </button>
    </div>
  );
}
