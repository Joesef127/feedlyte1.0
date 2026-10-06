import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Feedlyte — Feedback infrastructure for modern products";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "linear-gradient(135deg, #0A0A0A 0%, #141414 50%, #1A140A 100%)",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Amber radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(0, 0, 0, 0) 70%)",
          }}
        />

        {/* Top Header: Brand Logo & Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "-0.03em" }}>
              Feedlyte
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: "14px",
              color: "#A3A3A3",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
            <span>Production Ready</span>
          </div>
        </div>

        {/* Middle Main Tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "800",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              maxWidth: "960px",
            }}
          >
            Feedback infrastructure for modern products.
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#A3A3A3",
              lineHeight: 1.4,
              maxWidth: "840px",
            }}
          >
            Drop one script tag into any web app. Sandboxed iframe, multi-category triage inbox, and instant real-time analytics.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#F59E0B",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            ✓ Zero CSS Bleed
          </div>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#E5E5E5",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            ✓ Origin-Validated Iframe
          </div>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#E5E5E5",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            ✓ Signed HMAC Webhooks
          </div>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#E5E5E5",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            ✓ Public Status Tracking
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
