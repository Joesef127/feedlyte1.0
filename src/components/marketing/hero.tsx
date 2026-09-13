"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { ProductStageSimulator } from "./product-stage-simulator";

export function Hero() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-20 md:pb-28 overflow-hidden bg-background">
      {/* Background Dot Grid with Radial Mask */}
      <div className="absolute inset-0 bg-dot-grid mask-radial-hero pointer-events-none z-0 opacity-70" />

      {/* Ambient Warm Amber Glow */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] h-[320px] rounded-full bg-amber-radial pointer-events-none z-0 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Product Release Badge */}
        <div className="flex justify-center mb-6 sm:mb-8 anim-fade-up">
          {/* <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-primary/30 text-primary bg-primary/10 shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" />
            <span>Feedlyte 2.0 • Sandboxed Feedback Engine</span>
          </span> */}
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display anim-fade-up-1 text-[clamp(2.5rem,6.5vw,5rem)] leading-[1.04] tracking-[-0.03em] mb-6 text-foreground">
            Collect feedback{" "}
            <span className="text-primary italic font-normal">anywhere</span>
            <br className="hidden sm:inline" /> with one line of code.
          </h1>

          {/* Subtitle */}
          <p className="anim-fade-up-2 text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 font-sans">
            Drop a single script tag into any website or web app. Feedlyte injects an
            isolated, sandboxed feedback widget that streams structured bugs, ideas,
            and praise straight into your dashboard.
          </p>

          {/* Action CTAs */}
          <div className="anim-fade-up-3 flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-6">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl text-sm sm:text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-amber-glow hover:-translate-y-px transition-all"
            >
              <span>Start for free</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 px-6 sm:px-8 py-3.5 rounded-xl text-sm sm:text-[15px] font-semibold border border-border text-foreground hover:bg-accent hover:border-border/80 transition-colors"
            >
              <span>See how it works</span>
            </a>
          </div>

          {/* Value Micro-Copy */}
          <div className="anim-fade-up-4 flex items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground/70 tracking-wide flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Zap size={13} className="text-primary" /> Free forever tier
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck size={13} className="text-primary" /> Zero CSS or script bleed
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles size={13} className="text-primary" /> Live in 3 minutes
            </span>
          </div>
        </div>

        {/* Interactive Dual-Pane Product Stage Simulator */}
        <div className="anim-fade-up-4">
          <ProductStageSimulator />
        </div>
      </div>
    </section>
  );
}
