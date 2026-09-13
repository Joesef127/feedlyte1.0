"use client";

import { CheckCircle2, Layers, Cpu, Shield, Zap } from "lucide-react";
import { engineeringMetrics, supportedPlatforms } from "./marketing-data";

export function SocialProof() {
  return (
    <section className="py-16 sm:py-20 bg-card/40 border-y border-border/70 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hard Engineering Specs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-14">
          {engineeringMetrics.map((spec, i) => (
            <div
              key={spec.label}
              className="p-5 sm:p-6 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-2xl sm:text-3xl lg:text-4xl text-primary font-normal tracking-tight">
                    {spec.value}
                  </span>
                  {i === 0 && <Zap size={18} className="text-primary/70" />}
                  {i === 1 && <Cpu size={18} className="text-primary/70" />}
                  {i === 2 && <Layers size={18} className="text-primary/70" />}
                  {i === 3 && <Shield size={18} className="text-primary/70" />}
                </div>
                <div className="text-sm font-bold text-foreground mb-1">
                  {spec.label}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                {spec.description}
              </p>
            </div>
          ))}
        </div>

        {/* Universal Platform Compatibility Strip */}
        <div className="text-center pt-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60 mb-5">
            Works out of the box on any stack
          </p>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-4xl mx-auto">
            {supportedPlatforms.map((platform) => (
              <div
                key={platform.name}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-background border border-border/70 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-card transition-colors shadow-xs"
              >
                <CheckCircle2 size={13} className="text-primary" />
                <span>{platform.name}</span>
                <span className="text-[10px] text-muted-foreground/50 font-normal">
                  ({platform.category})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}