"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";

const feedbackRows = [
  {
    msg: "Checkout fails on mobile Safari. Cart empties after payment.",
    tag: "new",
    tagColor: "text-primary bg-primary/10",
  },
  {
    msg: "Love the new dashboard! Much faster than before.",
    tag: "reviewed",
    tagColor: "text-info bg-info/10",
  },
  {
    msg: "Can you add CSV export for the reports section?",
    tag: "new",
    tagColor: "text-primary bg-primary/10",
  },
  {
    msg: "The filter dropdown doesn't close when clicking outside.",
    tag: "resolved",
    tagColor: "text-success bg-success/10",
  },
];

const stats = [
  { label: "Total", value: "24" },
  { label: "Unreviewed", value: "8" },
  { label: "Resolved", value: "12" },
];

export function Hero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden bg-background">
      {/* Amber glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-150 h-100 rounded-full bg-amber-radial pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Beta badge */}
        <div className="flex justify-center mb-8 anim-fade-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-primary/30 text-primary bg-primary/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Now in public beta
          </span>
        </div>

        {/* Headline */}
        <div className="max-w-190 mx-auto text-center">
          <h1 className="font-display anim-fade-up-1 text-[clamp(3rem,6vw,5.2rem)] leading-[1.05] tracking-[-0.03em] mb-7 text-foreground sm:max-w-3/4 lg:max-w-3/4 xl:max-w-full mx-auto">
            Collect feedback{" "}
            <span className="text-primary italic">anywhere</span>
            <br /> with one line of code
          </h1>

          <p className="anim-fade-up-2 text-base md:text-lg leading-relaxed text-muted-foreground max-w-[560px] mx-auto mb-10">
            Drop a single script tag into any website. Feedlyte injects a
            self-contained widget that collects user feedback into your
            dashboard. No SDK. No npm. No configuration.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up-3 flex items-center justify-center gap-3 flex-wrap mb-14">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-amber-glow hover:-translate-y-px transition-all"
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center px-7 py-3.5 rounded-xl text-[15px] font-semibold border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              See how it works
            </a>
          </div>

          <p className="anim-fade-up-4 text-xs text-muted-foreground/50 tracking-wide">
            Free to start. No credit card required.
          </p>
        </div>

        {/* Dashboard preview */}
        <div className="anim-fade-up-4 relative max-w-225 mx-auto mt-18">
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 fade-bottom z-20 pointer-events-none rounded-b-2xl" />

          {/* Mock browser window */}
          <div className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-card-foreground">
            {/* Window chrome */}
            <div className="h-11 border-b border-border flex items-center px-4 gap-2 bg-card">
              {["bg-destructive", "bg-primary", "bg-success"].map((c, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`}
                />
              ))}
              <div className="flex-1 h-6 bg-background rounded ml-2 flex items-center pl-2.5">
                <span className="text-[11px] text-muted-foreground/40 font-mono">
                  app.feedlyte.com/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard body */}
            <div className="flex h-95">
              {/* Sidebar mock */}
              <div className="hidden w-50 border-r border-border p-3 sm:flex flex-col gap-1 shrink-0">
                <div className="flex items-center gap-2 px-2.5 py-2 mb-3">
                  <div className="w-[22px] h-[22px] bg-primary rounded-[5px] flex items-center justify-center">
                    <MessageSquare
                      size={15}
                      className="text-primary-foreground"
                      strokeWidth={2.2}
                    />
                  </div>
                  <span className="text-[13px] font-bold text-foreground">
                    Feedlyte
                  </span>
                </div>
                {["Projects", "All Feedback", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    className={`px-2.5 py-1.5 rounded-[7px] text-xs font-medium ${i === 0 ? "text-foreground bg-white/6" : "text-muted-foreground"}`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content mock */}
              <div className="flex-1 p-6 overflow-hidden">
                <div className="mb-5">
                  <div className="text-base font-bold text-foreground mb-1">
                    All Feedback
                  </div>
                  <div className="text-xs text-muted-foreground/50">
                    24 entries across 3 projects
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-background border border-border rounded-lg p-3"
                    >
                      <div className="text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1">
                        {stat.label}
                      </div>
                      <div className="text-[22px] font-bold text-foreground">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback rows */}
                <div className="flex flex-col gap-2">
                  {feedbackRows.map((item, i) => (
                    <div
                      key={i}
                      className="bg-background border border-border rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3"
                    >
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        {item.msg}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${item.tagColor}`}
                      >
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating widget card */}
          <div className="absolute bottom-10 -right-5 bg-card border border-border/70 rounded-xl p-3.5 w-55 shadow-float z-30">
            <div className="text-xs font-semibold text-foreground mb-2.5">
              Share Feedback
            </div>
            <div className="h-13 bg-background rounded-md mb-2 border border-border" />
            <div className="h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-[11px] font-semibold text-primary-foreground">
                Send Feedback
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
