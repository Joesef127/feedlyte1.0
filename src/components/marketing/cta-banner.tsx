"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Shield } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-20 sm:py-28 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-card border border-primary/25 p-8 sm:p-14 lg:p-16 text-center overflow-hidden shadow-card-deep shadow-amber-sm">
          {/* Ambient Warm Radial Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[600px] h-[350px] rounded-full bg-amber-radial-sm blur-3xl opacity-80" />
          </div>

          {/* Dot Grid Layer inside Card */}
          <div className="absolute inset-0 bg-dot-grid mask-radial-section pointer-events-none opacity-40 z-0" />

          {/* Corner Tech Accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-primary/30 rounded-tl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-primary/30 rounded-br-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-6">
              <Sparkles size={12} /> Instant Setup
            </div>

            <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.08] tracking-tight text-foreground mb-5">
              Turn customer feedback into{" "}
              <span className="text-primary italic font-normal">product momentum</span>.
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
              Drop one script tag into your web app. Zero CSS conflicts, atomic delivery outbox, and an effortless triage inbox. Live in under 3 minutes.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-8">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-amber-glow hover:-translate-y-px transition-all"
              >
                <span>Create your free account</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center px-6 py-3.5 rounded-xl text-sm font-semibold border border-border bg-background/80 text-foreground hover:bg-accent transition-colors"
              >
                <span>Sign in to Dashboard</span>
              </Link>
            </div>

            {/* Trust Micro-Row */}
            <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground/70 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-primary" /> Free forever tier
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield size={13} className="text-primary" /> No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-primary" /> 1-line script embed
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}