"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, MessageSquare, X, ArrowRight, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Widget Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-250 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/70 shadow-sm"
          : "bg-transparent border-b border-border/30"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 lg:py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          aria-label="Feedlyte Home"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-amber-sm group-hover:scale-105 transition-transform">
            <MessageSquare size={16} strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[17px] tracking-tight text-foreground font-sans">
              Feedlyte
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={10} /> v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-card/60 border border-border/60 px-3 py-1 rounded-full backdrop-blur-md"
          aria-label="Primary navigation"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Theme Toggle + Auth Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/auth"
              className="text-[13px] font-semibold text-muted-foreground hover:text-foreground px-3.5 py-2 rounded-full hover:bg-accent transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full shadow-amber-sm hover:shadow-amber-glow hover:-translate-y-px transition-all"
            >
              <span>Get started</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="md:hidden w-9 h-9 rounded-lg border border-border/70 flex items-center justify-center text-foreground hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-dialog"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X size={18} strokeWidth={2.2} /> : <Menu size={18} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer & Scrim Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-dialog"
          className="md:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-2xl border-b border-border flex flex-col justify-between p-6 overflow-y-auto anim-fade-up"
        >
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-3 py-1">
              Navigation
            </div>
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground hover:text-primary px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-border flex flex-col gap-3">
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-3 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Sign in to Dashboard
            </Link>
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-amber-glow transition-all"
            >
              <span>Get started for free</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <p className="text-center text-xs text-muted-foreground/60 mt-1">
              Free plan includes 1 project. No credit card required.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
