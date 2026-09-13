"use client";

import {
  Layers,
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
  Star,
  Webhook,
  Users,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <section id="capabilities" className="py-24 sm:py-32 bg-card/30 border-y border-border/70 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border bg-card text-muted-foreground mb-4">
            <Layers size={12} className="text-primary" /> Product Architecture
          </span>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.5rem)] tracking-tight text-foreground mb-4">
            Engineered for reliability, privacy, and zero host conflicts.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Feedlyte is built around a single philosophy: give you deep customer insights without polluting your codebase or slowing down your site.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Card 1: Wide Lead Block - Iframe Sandbox (Span 12 on lg) */}
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                  <span>Zero CSS Bleed</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 tracking-tight">
                  Iframe-Isolated Sandboxed Widget Engine
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                  Your widget runs in an isolated iframe container with origin-validated postMessage communication. No matter how many global CSS resets, Tailwind utilities, or aggressive script overrides exist on your host site, Feedlyte will always look clean, consistent, and glitch-free.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-background border border-border/60">
                    <span className="text-primary font-bold block mb-0.5">✓ Zero Bleed</span>
                    <span className="text-muted-foreground/70 text-[11px]">Strict styles isolation</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border border-border/60">
                    <span className="text-primary font-bold block mb-0.5">✓ PostMessage</span>
                    <span className="text-muted-foreground/70 text-[11px]">Origin validation</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border border-border/60 col-span-2 sm:col-span-1">
                    <span className="text-primary font-bold block mb-0.5">✓ Auto Resize</span>
                    <span className="text-muted-foreground/70 text-[11px]">Zero layout shift</span>
                  </div>
                </div>
              </div>

              {/* Visual Demo for Isolation */}
              <div className="lg:col-span-5 bg-background border border-border/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-3 text-[11px] font-mono text-muted-foreground">
                  <span>Host Page vs Sandboxed Iframe</span>
                  <span className="text-success font-semibold">100% Isolated</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-xs">
                    <div className="text-destructive font-semibold text-[11px] mb-0.5">
                      Host Page Style Scope
                    </div>
                    <code className="text-[10px] text-muted-foreground font-mono block">
                      * &#123; margin: 0; font-family: Papyrus; &#125;
                    </code>
                    <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                      Cannot contaminate or distort the feedback widget.
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-xs">
                    <div className="text-primary font-semibold text-[11px] mb-0.5">
                      Feedlyte Iframe Runtime
                    </div>
                    <code className="text-[10px] text-foreground font-mono block">
                      Autonomous styling, dark/light theme, accessible focus
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Multi-Category & Star Sentiment (Span 6 on lg) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between group hover:border-primary/40 transition-colors">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-info/10 text-info border border-info/20 mb-4">
                <span>Structured Ingestion</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2.5 tracking-tight">
                Structured Categories & 1–5 Star Sentiment
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Stop sifting through chaotic, unstructured emails. Collect categorized submissions with Lucide iconography and optional star ratings so your team can triage at high speed.
              </p>
            </div>

            {/* Category Pill Showcase */}
            <div className="p-4 rounded-xl bg-background border border-border/70 space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                  <Bug size={12} /> Bug Report
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-info/10 text-info border border-info/20">
                  <Lightbulb size={12} /> Feature Idea
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                  <Heart size={12} /> User Praise
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <HelpCircle size={12} /> Question
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                <span>Sentiment tracking:</span>
                <div className="flex text-primary">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-primary" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Deep Technical Context & Public Tracking (Span 6 on lg) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between group hover:border-primary/40 transition-colors">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20 mb-4">
                <span>Effortless Reproduction</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2.5 tracking-tight">
                Automated Context & Zero-Account Tracking
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Never ask &ldquo;which browser were you using?&rdquo; again. Users can automatically attach current URL path, device, and viewport dimensions. Submitters receive a secure public tracking link.
              </p>
            </div>

            {/* Simulated Tracking & Metadata Block */}
            <div className="p-4 rounded-xl bg-background border border-border/70 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground/80">Page Route</span>
                <span className="text-foreground font-semibold">/checkout/payment</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground/80">Environment</span>
                <span className="text-foreground">macOS 15.1 • Chrome 132</span>
              </div>
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground/80">Public Tracking Token</span>
                <span className="text-primary truncate">/track/tk_79a2ef...</span>
              </div>
            </div>
          </div>

          {/* Card 4: Atomic Outbox & Webhooks (Span 6 on lg) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between group hover:border-primary/40 transition-colors">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                <span>Fail-Safe Delivery</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2.5 tracking-tight">
                Atomic Database Outbox & HMAC Webhooks
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Submissions are committed to PostgreSQL before outbound tasks are queued. Even if Slack, Discord, or downstream APIs experience outages, Feedlyte safely retries with exponential backoff.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Webhook size={16} className="text-primary" />
                <span className="font-mono text-muted-foreground">Slack, Discord, Custom URL</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                SSRF-Protected
              </span>
            </div>
          </div>

          {/* Card 5: Built for Fast, Safe Teams (Span 6 on lg) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between group hover:border-primary/40 transition-colors">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
                <span>Security & Team Scale</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2.5 tracking-tight">
                Origin Protection & Role-Based Workspaces
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Lock widget submissions strictly to your verified domain origins. Block automated spam with honeypots and client-aware rate limiting, while managing projects with role-based access.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <span className="text-muted-foreground">Owner, Admin, Analyst, Contributor</span>
              </div>
              <span className="text-success font-mono text-[10px] font-bold">
                Origin Guard Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
