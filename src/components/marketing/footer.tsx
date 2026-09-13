"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ArrowUp, ShieldCheck, Github, Twitter } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features & Architecture", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Interactive Demo", href: "#demo" },
    { label: "Pricing & Plans", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Developer: [
    { label: "Embed Snippet Guide", href: "#how-it-works" },
    { label: "Iframe Sandbox Specs", href: "#features" },
    { label: "HMAC Webhooks", href: "#features" },
    { label: "Public Status Tracking", href: "#demo" },
  ],
  Company: [
    { label: "Sign In", href: "/auth" },
    { label: "Create Free Account", href: "/auth" },
    { label: "Support Contact", href: "mailto:support@feedlyte.com" },
    { label: "Terms & Privacy", href: "#" },
  ],
};

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Non-intrusive Smooth Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 z-40 w-10 h-10 rounded-full bg-card border border-border/80 shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Scroll to top of page"
        >
          <ArrowUp size={16} strokeWidth={2.2} />
        </button>
      )}

      <footer className="border-t border-border/70 bg-card/60 pt-16 pb-10 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-border/60">
            {/* Brand Column (2 cols on md) */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                  <MessageSquare size={14} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-base text-foreground font-sans tracking-tight">
                  Feedlyte
                </span>
              </Link>

              <p className="text-muted-foreground leading-relaxed max-w-sm">
                Feedback infrastructure for modern web applications. One script tag, isolated iframe sandboxing, and real-time triage.
              </p>

              {/* Operational Status Pill */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-background border border-border/80 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>

            {/* Navigation Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
                  {category}
                </span>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="pt-8 flex items-center justify-between flex-wrap gap-4 text-muted-foreground/60 text-[11px]">
            <p>© {new Date().getFullYear()} Feedlyte Inc. All rights reserved.</p>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={12} className="text-primary" /> GDPR & Privacy Compliant
              </span>
              <span>•</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="Feedlyte on GitHub"
              >
                <Github size={14} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="Feedlyte on Twitter"
              >
                <Twitter size={14} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}