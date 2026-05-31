"use client";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
};

const features: Feature[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7 9h6M7 12h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Iframe-isolated widget",
    description:
      "The widget runs in a sandboxed iframe so it never conflicts with your site's CSS or JavaScript. Drop it on any stack without a second thought.",
    highlight: true,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2l2.4 4.8 5.3.8-3.85 3.75.91 5.3L10 14.1l-4.76 2.55.91-5.3L2.3 7.6l5.3-.8L10 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Multi-project dashboard",
    description:
      "Manage feedback from multiple websites and apps in one place. Each project gets its own embed code, feedback stream, and status tracking.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9 3H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15 3l2 2-6 6H9v-2l6-6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Status management",
    description:
      "Triage every submission with new, reviewed, and resolved statuses. Filter and search across projects to keep your backlog clean.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 6v4l3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Page context capture",
    description:
      "Every submission automatically records the page URL and timestamp. Know exactly where on your product the feedback came from.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="2"
          y="3"
          width="16"
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 16l1-3h2l1 3M6 19h8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Responsive by default",
    description:
      "The widget and dashboard are fully responsive. Works cleanly on desktop, tablet, and mobile without any extra configuration.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 6a2 2 0 012-2h10a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    title: "Rate-limited public endpoint",
    description:
      "The widget submission endpoint is rate-limited per project to prevent abuse. Your dashboard stays clean without manual spam filtering.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 6v4l3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "JWT-secured sessions",
    description:
      "Authentication uses short-lived JWT tokens with server-side validation on every protected route. No session cookies to manage.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13 2H7a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 7h2M9 10h4M9 13h2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Minimal, auditable codebase",
    description:
      "Built on Next.js, Prisma, and PostgreSQL with a clean separation between the marketing layer, dashboard, and public widget route.",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div
      className={[
        "rounded-xl p-7 border transition-all duration-200 cursor-default group",
        feature.highlight
          ? "bg-primary/10 border-primary/20 hover:border-primary/40"
          : "bg-card border-border hover:border-border/80",
      ].join(" ")}
    >
      <div
        className={[
          "w-10 h-10 rounded-lg border flex items-center justify-center mb-5 shrink-0",
          feature.highlight
            ? "bg-primary/15 border-primary/25 text-primary"
            : "bg-background border-border text-muted-foreground group-hover:text-foreground",
        ].join(" ")}
      >
        {feature.icon}
      </div>
      <h3 className="text-sm font-bold text-foreground mb-2 tracking-tight">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </div>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-card border-t border-b border-border"
    >
      <div className="mx-auto max-w-[1120px] px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-border text-muted-foreground bg-background mb-5">
            Features
          </span>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] tracking-tight mb-4 text-foreground">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[460px] mx-auto">
            Feedlyte is built around a single job: get user feedback into your
            hands fast.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
