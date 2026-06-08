"use client";

import Link from "next/link";

type Plan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description: "For personal projects and early exploration.",
    features: [
      "5 project",
      "200 feedback entries/month",
      "7-day data retention",
      "Basic dashboard",
      "Community support",
    ],
    cta: "Get started free",
    ctaHref: "/auth",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$4",
    period: "/month",
    description: "For indie developers and small teams shipping real products.",
    features: [
      "20 projects",
      "Unlimited feedback entries",
      "90-day data retention",
      "Advanced filtering and search",
      "Webhook delivery (Slack, Discord)",
      "CSV and JSON export",
      "Email notifications",
      "Priority support",
    ],
    cta: "Start Pro",
    ctaHref: "/auth?plan=pro",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Team",
    price: "$12",
    period: "/month",
    description: "For growing teams that need collaboration and scale.",
    features: [
      "Unlimited projects",
      "Unlimited feedback entries",
      "365-day data retention",
      "Team members and role-based access",
      "Public feedback board",
      "API access with key management",
      "Audit log",
      "Dedicated support",
    ],
    cta: "Start Team",
    ctaHref: "/auth?plan=team",
    highlighted: false,
  },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-px">
      <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
    </svg>
  );
}

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl border p-9 h-full",
        plan.highlighted
          ? "bg-card border-primary/30 shadow-[0_0_40px_rgba(245,158,11,0.06)]"
          : "bg-card border-border",
      ].join(" ")}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
          {plan.badge}
        </div>
      )}

      <div className={`text-sm font-bold uppercase tracking-widest mb-3 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`}>
        {plan.name}
      </div>

      <div className="flex items-baseline gap-1 mb-2.5">
        <span className="font-display text-[clamp(2.4rem,4vw,3rem)] text-foreground tracking-tight">
          {plan.price}
        </span>
        {plan.period && (
          <span className="text-sm text-muted-foreground/50">{plan.period}</span>
        )}
      </div>

      <p className="text-sm leading-snug text-muted-foreground mb-7">{plan.description}</p>

      <div className="h-px bg-border mb-6" />

      <ul className="flex flex-col gap-3 flex-1 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <CheckIcon />
            <span className="text-sm text-muted-foreground leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={[
          "flex justify-center items-center w-full py-3 rounded-lg text-sm font-semibold border transition-all",
          plan.highlighted
            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:shadow-amber-glow"
            : "bg-transparent text-muted-foreground border-border hover:bg-accent hover:text-foreground",
        ].join(" ")}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold uppercase tracking-widest border border-border text-muted-foreground bg-card mb-5">
            Pricing
          </span>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] tracking-tight mb-4 text-foreground">
            Simple, honest pricing
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[420px] mx-auto">
            Start free. Upgrade when your product demands it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground/40 mt-9">
          All paid tiers include a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
}