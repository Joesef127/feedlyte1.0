"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: 160,
        paddingBottom: 96,
        overflow: "hidden",
      }}
    >
      {/* Amber glow behind hero */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <span className="badge badge--amber badge--dot animate-fade-up">
            Now in public beta
          </span>
        </div>

        {/* Headline */}
        <div className="container--narrow" style={{ padding: 0, textAlign: "center" }}>
          <h1
            className="animate-fade-up-delay-1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 6vw, 5.2rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 28,
              color: "var(--fg)",
            }}
          >
            Collect feedback{" "}
            <span style={{ color: "var(--amber)", fontStyle: "italic" }}>
              anywhere
            </span>
            {" "}with one line of code
          </h1>

          <p
            className="animate-fade-up-delay-2"
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.65,
              color: "var(--fg-muted)",
              maxWidth: 560,
              margin: "0 auto 40px",
            }}
          >
            Drop a single script tag into any website. Feedlyte injects a
            self-contained widget that collects user feedback into your
            dashboard. No SDK. No npm. No configuration.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up-delay-3"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 56,
            }}
          >
            <Link href="/auth" className="btn btn--primary btn--lg">
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#how-it-works" className="btn btn--ghost btn--lg">
              See how it works
            </a>
          </div>

          {/* Social proof line */}
          <p
            className="animate-fade-up-delay-4"
            style={{
              fontSize: 13,
              color: "var(--fg-faint)",
              letterSpacing: "0.02em",
            }}
          >
            Free to start. No credit card required.
          </p>
        </div>

        {/* Dashboard preview */}
        <div
          className="animate-fade-up-delay-4"
          style={{
            marginTop: 72,
            position: "relative",
            maxWidth: 900,
            margin: "72px auto 0",
          }}
        >
          {/* Fade gradient at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              background: "linear-gradient(to bottom, transparent, var(--bg))",
              zIndex: 2,
              pointerEvents: "none",
              borderRadius: "0 0 var(--radius-xl) var(--radius-xl)",
            }}
          />

          {/* Mock dashboard window */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Window chrome */}
            <div
              style={{
                height: 44,
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: 8,
                background: "var(--bg-subtle)",
              }}
            >
              {["#ef4444", "#f59e0b", "#10b981"].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
              ))}
              <div
                style={{
                  flex: 1,
                  height: 24,
                  background: "var(--bg-card)",
                  borderRadius: 6,
                  marginLeft: 8,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 10,
                }}
              >
                <span style={{ fontSize: 11, color: "var(--fg-faint)", fontFamily: "var(--font-mono)" }}>
                  app.feedlyte.com/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard body */}
            <div style={{ display: "flex", height: 380 }}>
              {/* Sidebar mock */}
              <div
                style={{
                  width: 200,
                  borderRight: "1px solid var(--border)",
                  padding: "20px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 12 }}>
                  <div style={{ width: 22, height: 22, background: "var(--amber)", borderRadius: 5 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>Feedlyte</span>
                </div>
                {["Projects", "All Feedback", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 500,
                      color: i === 0 ? "var(--fg)" : "var(--fg-muted)",
                      background: i === 0 ? "rgba(255,255,255,0.06)" : "transparent",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content mock */}
              <div style={{ flex: 1, padding: "24px 28px", overflow: "hidden" }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>All Feedback</div>
                  <div style={{ fontSize: 12, color: "var(--fg-faint)" }}>24 entries across 3 projects</div>
                </div>

                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Total", value: "24" },
                    { label: "Unreviewed", value: "8" },
                    { label: "Resolved", value: "12" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: "var(--fg-faint)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--fg)" }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Feedback rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { msg: "Checkout fails on mobile Safari. Cart empties after payment.", tag: "new", tagColor: "#f59e0b" },
                    { msg: "Love the new dashboard! Much faster than before.", tag: "reviewed", tagColor: "#3b82f6" },
                    { msg: "Can you add CSV export for the reports section?", tag: "new", tagColor: "#f59e0b" },
                    { msg: "The filter dropdown doesn't close when clicking outside.", tag: "resolved", tagColor: "#10b981" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 12, color: "var(--fg-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.msg}
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: item.tagColor,
                        background: `${item.tagColor}18`,
                        padding: "3px 8px",
                        borderRadius: 99,
                        flexShrink: 0,
                      }}>
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating widget preview */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              right: -20,
              background: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              padding: "14px 16px",
              width: 220,
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              zIndex: 3,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)", marginBottom: 10 }}>Share Feedback</div>
            <div style={{ height: 52, background: "var(--bg-subtle)", borderRadius: 6, marginBottom: 8, border: "1px solid var(--border)" }} />
            <div style={{ height: 28, background: "var(--amber)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0a0a0a" }}>Send Feedback</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}