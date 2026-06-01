"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MenuIcon, MessageSquare, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

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
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-sm bg-background border-b border-border",
        scrolled ? "backdrop-blur-md" : "",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-24">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] bg-primary rounded-lg flex items-center justify-center shrink-0">
            <MessageSquare
              size={15}
              className="text-primary-foreground"
              strokeWidth={2.2}
            />
          </div>
          <span className="font-bold text-[18px] tracking-tight text-foreground">
            Feedlyte
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/auth"
              className="inline-flex items-center px-[18px] py-[9px] rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center px-[18px] py-[9px] rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-amber-glow transition-all"
            >
              Get started free
            </Link>
          </div>

        {/* <ThemeToggle /> */}

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <X size={22} className="text-foreground" strokeWidth={2.5} />
            ) : (
              <MenuIcon
                size={22}
                className="text-foreground"
                strokeWidth={2.5}
              />
            )}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background/97 border-t border-border px-6 pt-5 pb-7 flex flex-col gap-2">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium text-muted-foreground py-2.5 px-2.5 hover:bg-accent rounded-lg transition-colors"
            >
              {item.label}
            </a>
          ))}

          <div className="flex flex-col gap-2.5 mt-2">
            <Link
              href="/auth"
              className="flex justify-center px-5 py-3 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:bg-accent transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth"
              className="flex justify-center px-5 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
