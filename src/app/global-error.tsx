"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Global boundary telemetry
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          backgroundColor: "#0A0A0A",
          color: "#E5E5E5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "460px",
            width: "90%",
            textAlign: "center",
            padding: "40px 24px",
            background: "#141414",
            border: "1px solid #1F1F1F",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              color: "#EF4444",
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: "700",
              margin: "0 0 10px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Application Error
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "#A3A3A3",
              lineHeight: 1.6,
              margin: "0 0 24px 0",
            }}
          >
            A critical error occurred while initializing the application. Please reload the page to restore your session.
          </p>

          {error.digest && (
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#0A0A0A",
                border: "1px solid #1F1F1F",
                fontSize: "12px",
                fontFamily: "monospace",
                color: "#737373",
                marginBottom: "24px",
              }}
            >
              ID: {error.digest}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#F59E0B",
                color: "#0F0F0F",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
