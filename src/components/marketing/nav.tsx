"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        background: scrolled ? "rgba(8,8,8,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30,
            height: 30,
            background: "var(--amber)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
                        <MessageSquare size={16} className="text-primary-foreground" strokeWidth={2} />
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: "var(--fg)" }}>
            Feedlyte
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--fg-muted)",
                transition: "color var(--transition)",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-muted)")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="desktop-nav">
          <Link href="/auth" className="btn btn--ghost" style={{ padding: "9px 18px", fontSize: 14 }}>
            Sign in
          </Link>
          <Link href="/auth" className="btn btn--primary" style={{ padding: "9px 18px", fontSize: 14 }}>
            Get started free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--fg)",
            padding: 4,
            display: "none",
          }}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="3" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="3" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: "rgba(8,8,8,0.97)",
          borderTop: "1px solid var(--border)",
          padding: "20px 24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 16, fontWeight: 500, color: "var(--fg-muted)", padding: "10px 0", borderBottom: "1px solid var(--border)" }}
            >
              {item.label}
            </a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            <Link href="/auth" className="btn btn--ghost" style={{ justifyContent: "center" }}>Sign in</Link>
            <Link href="/auth" className="btn btn--primary" style={{ justifyContent: "center" }}>Get started free</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}