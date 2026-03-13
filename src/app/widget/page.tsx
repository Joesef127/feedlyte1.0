"use client";

import { useState, useEffect, useRef } from "react";

interface WidgetPageProps {
  searchParams: Promise<{ project?: string; position?: string }>;
}

export default function WidgetPage({ searchParams }: WidgetPageProps) {
  const [projectId, setProjectId] = useState("");
  const [position, setPosition] = useState("bottom-right");

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve searchParams (Next.js 15+ returns a Promise)
  useEffect(() => {
    Promise.resolve(searchParams).then((p) => {
      setProjectId(p.project ?? "");
      setPosition(p.position ?? "bottom-right");
    });
  }, [searchParams]);

  // Notify parent of height changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = containerRef.current?.scrollHeight ?? 68;
    window.parent.postMessage({ type: "feedstack:resize", height: h }, "*");
  }, [open, submitted]);

  const handleSubmit = async () => {
    if (!message.trim() || !projectId) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          message: message.trim(),
          email: email.trim() || undefined,
          pageUrl: window.parent?.location?.href ?? "",
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
