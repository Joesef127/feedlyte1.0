"use client";

import Link from "next/link";

export function CTABanner() {
  return (
    <section className="py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative bg-card border border-primary/15 rounded-2xl py-20 px-6 sm:px-12 text-center overflow-hidden">

          {/* Radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[300px] rounded-full bg-amber-radial-sm" />
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-[120px] h-[120px] border-t border-l border-primary/20 rounded-tl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[120px] h-[120px] border-b border-r border-primary/20 rounded-br-2xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] tracking-tight mb-5 text-foreground">
              Start collecting feedback{" "}
              <span className="text-primary italic">today</span>
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-[460px] mx-auto mb-10 leading-relaxed">
              Free to start. One script tag. Your first project is live in under five minutes.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-amber-glow hover:-translate-y-px transition-all"
              >
                Create your free account
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center px-7 py-3.5 rounded-xl text-[15px] font-semibold border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            </div>

            <p className="text-xs text-muted-foreground/40 mt-6">
              No credit card required. Free plan includes one project.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}