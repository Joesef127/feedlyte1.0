"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { pricingPlans } from "./marketing-data";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-card/20 border-y border-border/70 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border bg-card text-muted-foreground mb-4">
            <Sparkles size={12} className="text-primary" /> Transparent Pricing
          </span>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.5rem)] tracking-tight text-foreground mb-4">
            Simple, predictable pricing.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
            Start free. Upgrade as your application grows and customer feedback demands higher scale.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center gap-3 bg-card border border-border/80 p-1.5 rounded-full shadow-xs">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !isAnnual
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isAnnual
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const displayPrice = plan.monthlyPrice === 0 ? "$0" : `$${price}`;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 border transition-all ${
                  plan.highlighted
                    ? "bg-card border-primary/50 shadow-card-deep shadow-amber-sm"
                    : "bg-card border-border/80 shadow-sm hover:border-border"
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                      {plan.projectLimit}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-6 min-h-[36px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 pb-6 border-b border-border/60 mb-6">
                    <span className="font-display text-4xl sm:text-5xl text-foreground font-normal tracking-tight">
                      {displayPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-xs text-muted-foreground/70 font-medium">
                        / month {isAnnual && "(billed annually)"}
                      </span>
                    )}
                  </div>

                  {/* Retention Tag */}
                  <div className="mb-6 text-xs font-mono text-primary font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    <span>{plan.retention}</span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 text-xs text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check size={14} className="text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action CTA */}
                <div>
                  <Link
                    href={plan.ctaHref}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-amber-sm hover:shadow-amber-glow"
                        : "bg-background border border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Micro Guarantee */}
        <p className="text-center text-xs text-muted-foreground/60 mt-10">
          All paid plans include a 14-day free trial. Cancel anytime with 1-click in your settings.
        </p>
      </div>
    </section>
  );
}