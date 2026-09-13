export interface TechSpec {
  value: string;
  label: string;
  description: string;
}

export interface PlatformItem {
  name: string;
  category: string;
}

export interface HowItWorksStep {
  number: string;
  badge: string;
  title: string;
  description: string;
  codeSnippet?: string;
  detail: string;
}

export interface BentoFeature {
  id: string;
  badge: string;
  title: string;
  description: string;
  highlightText: string;
  wide?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  badge?: string;
  highlighted: boolean;
  projectLimit: string;
  retention: string;
  features: string[];
  cta: string;
  ctaHref: string;
}

export interface FAQItem {
  id: string;
  category: "all" | "integration" | "privacy" | "plans";
  question: string;
  answer: string;
}

export interface SampleFeedbackScenario {
  id: string;
  title: string;
  category: "bug" | "idea" | "praise" | "question";
  rating: number;
  message: string;
  pageUrl: string;
  device: string;
  browser: string;
  os: string;
  status: "unreviewed" | "reviewed" | "resolved";
}

/* ── Platform Compatibility & Engineering Metrics ── */
export const engineeringMetrics: TechSpec[] = [
  {
    value: "< 2.1 KB",
    label: "Gzipped Embed Size",
    description: "Ultra-compact script loader that never hurts Core Web Vitals",
  },
  {
    value: "0",
    label: "Runtime Dependencies",
    description: "Zero npm packages, zero external font downloads, zero host overhead",
  },
  {
    value: "100%",
    label: "Iframe Sandboxed",
    description: "Guaranteed isolation — host CSS resets and scripts cannot collide",
  },
  {
    value: "GDPR",
    label: "Privacy-First Architecture",
    description: "No third-party trackers, sanitized metadata, and hashed tracking tokens",
  },
];

export const supportedPlatforms: PlatformItem[] = [
  { name: "Next.js", category: "React Framework" },
  { name: "React", category: "SPA Library" },
  { name: "Vite", category: "Modern Bundler" },
  { name: "Vue.js", category: "Progressive Framework" },
  { name: "Svelte / SvelteKit", category: "Compiler" },
  { name: "Astro", category: "Content Sites" },
  { name: "Shopify", category: "E-Commerce" },
  { name: "WordPress", category: "CMS" },
  { name: "Static HTML", category: "Any Web Page" },
];

/* ── The 3-Minute Journey (How It Works) ── */
export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: "01",
    badge: "Configure",
    title: "Create project & choose your style",
    description:
      "Name your project, set your allowed domain, and pick brand colors. Enable optional capabilities like categories, star ratings, or technical context checklists.",
    detail: "Takes under 45 seconds. No API keys exposed in your frontend.",
  },
  {
    number: "02",
    badge: "Embed",
    title: "Paste one lightweight script tag",
    description:
      "Copy your generated script snippet and drop it into your HTML or root layout. The loader defers execution until page paint is complete.",
    detail: "Loads in <50ms. Sandboxed in an iframe with zero CSS or JS bleed.",
    codeSnippet: `<script\n  src="https://feedlyte.vercel.app/widget.js"\n  data-project="proj_live_94k2m"\n  defer\n></script>`,
  },
  {
    number: "03",
    badge: "Act",
    title: "Stream feedback directly into your inbox",
    description:
      "Every submission immediately arrives with URL context, browser metadata, and category tags. Stream events via atomic outbox webhooks to Slack or Discord.",
    detail: "Submitters receive an instant one-time tracking link with zero login required.",
  },
];

/* ── Product Superpowers (Bento Grid) ── */
export const bentoFeatures: BentoFeature[] = [
  {
    id: "iframe-sandbox",
    badge: "Engine Architecture",
    title: "Iframe-Isolated Sandboxed Widget",
    description:
      "Your widget runs inside a secure, styled iframe container with postMessage protocol validation. No matter how complex or aggressive your host site's CSS, Tailwind resets, or script loaders are, Feedlyte will render with pixel-perfect consistency.",
    highlightText: "Zero CSS Bleed Guaranteed",
    wide: true,
  },
  {
    id: "structured-triage",
    badge: "Intelligent Ingestion",
    title: "Structured Categories & 1–5 Star Sentiment",
    description:
      "Turn vague complaints into structured product tasks. Visitors tag submissions as Bug, Idea, Praise, or Question with optional star ratings.",
    highlightText: "Instant clarity for bug reports vs feature requests",
  },
  {
    id: "context-capture",
    badge: "Developer Experience",
    title: "Automated Context & One-Time Tracking",
    description:
      "Automatically collects current route URL, viewport dimensions, browser, and OS to eliminate reproduction guesswork. Users get a private tracking link without creating an account.",
    highlightText: "Zero friction for users, rich telemetry for engineers",
  },
  {
    id: "outbox-webhooks",
    badge: "Durable Infrastructure",
    title: "Database-Backed Atomic Outbox & Webhooks",
    description:
      "Never drop user feedback during downstream provider hiccups. Submissions persist atomically before triggering HMAC-SHA256 signed webhooks to Slack, Discord, or custom endpoints with SSRF protection.",
    highlightText: "100% submission durability with exponential backoff",
  },
  {
    id: "team-rbac",
    badge: "Collaboration",
    title: "Built for Fast, Secure Product Teams",
    description:
      "Restrict widget submissions to verified domain origins. Block bots with honeypot defenses, manage multi-project portfolios, and invite teammates with role-based access control.",
    highlightText: "Enterprise security without the enterprise complexity",
  },
];

/* ── Harmonized Pricing Plans ── */
export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "For indie hackers, personal sites, and early prototypes.",
    highlighted: false,
    projectLimit: "1 Project",
    retention: "7-Day Data Retention",
    features: [
      "1 active project",
      "200 feedback submissions / mo",
      "7-day data retention",
      "Sandboxed iframe widget",
      "Multi-category triage (Bug, Idea, Praise)",
      "Public tracking links for users",
      "Origin-domain protection",
      "Community support",
    ],
    cta: "Get started free",
    ctaHref: "/auth",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 4,
    annualPrice: 3.3, // ~$40/yr billed annually
    description: "For creators, startups, and small teams shipping real products.",
    badge: "Most Popular",
    highlighted: true,
    projectLimit: "10 Projects",
    retention: "90-Day Data Retention",
    features: [
      "10 active projects",
      "Unlimited feedback submissions",
      "90-day data retention",
      "1–5 Star sentiment ratings",
      "Collapsible technical context capture",
      "Custom brand colors & launcher styles",
      "Signed HMAC Webhooks (Slack, Discord)",
      "CSV & JSON data exports",
      "Automated daily email digests",
      "Priority developer support",
    ],
    cta: "Start Pro 14-day trial",
    ctaHref: "/auth?plan=pro",
  },
  {
    id: "team",
    name: "Team",
    monthlyPrice: 12,
    annualPrice: 10, // ~$120/yr billed annually
    description: "For growing organizations needing collaboration and scale.",
    highlighted: false,
    projectLimit: "Unlimited Projects",
    retention: "365-Day Data Retention",
    features: [
      "Unlimited projects",
      "Unlimited feedback submissions",
      "365-day data retention",
      "Team workspaces & invitations",
      "Role-based access control (RBAC)",
      "Audit event logs & compliance history",
      "Dedicated webhook routing per project",
      "Remove 'Powered by Feedlyte' badge",
      "Custom data retention policies",
      "Direct technical onboarding",
    ],
    cta: "Start Team trial",
    ctaHref: "/auth?plan=team",
  },
];

/* ── FAQ Data ── */
export const faqItems: FAQItem[] = [
  {
    id: "how-embed-works",
    category: "integration",
    question: "How does the embed actually work on my site?",
    answer:
      "You copy and paste a single `<script>` tag into your site's HTML or root layout. When a visitor views your page, the script injects a small, self-contained launcher button. Clicking it loads the feedback form inside a sandboxed iframe. Submissions go straight to Feedlyte's hardened API and your dashboard in real time. Your site's CSS, JavaScript, and fonts are completely isolated.",
  },
  {
    id: "performance-impact",
    category: "integration",
    question: "Will the widget slow down my website or impact Core Web Vitals?",
    answer:
      "No. The script loader uses the `defer` attribute and measures under 2.1 KB gzipped. It does not block page parsing, HTML rendering, or First Contentful Paint (FCP). The iframe runtime is only rendered when initialized and performs zero intensive background computation.",
  },
  {
    id: "framework-compatibility",
    category: "integration",
    question: "Does Feedlyte work with Next.js App Router, Vite, or Shopify?",
    answer:
      "Yes. Feedlyte is completely framework-agnostic. Whether your application is built with Next.js (App Router or Pages Router), Vite, React, Vue, SvelteKit, Astro, Shopify, WordPress, or plain HTML, Feedlyte works seamlessly with the same script tag.",
  },
  {
    id: "technical-details",
    category: "privacy",
    question: "What technical context is captured with feedback?",
    answer:
      "When enabled in your project settings, users can optionally include their current page URL, browser name, operating system version, and viewport resolution. This information is displayed in your triage dashboard to make bug reproduction effortless. Visitors can review and toggle off any of these details before submitting.",
  },
  {
    id: "tracking-links",
    category: "privacy",
    question: "What are public tracking links and are they secure?",
    answer:
      "When a user submits feedback, Feedlyte generates a unique, one-time status URL (e.g. `/track/[token]`). The token is cryptographically generated and stored as a SHA-256 hash with an automatic 90-day expiration. The public page only displays the status (Unreviewed, Reviewed, Resolved) and category. It never exposes user email addresses, IP addresses, or internal project IDs.",
  },
  {
    id: "webhook-resilience",
    category: "privacy",
    question: "What happens if our Slack or Discord webhook endpoint fails?",
    answer:
      "Feedlyte uses a database-backed atomic outbox pattern. When feedback is submitted, the event is persisted to our primary database first. Downstream webhook dispatching and email notifications operate with automatic exponential backoff retries. A temporary outage in Discord or Slack will never result in lost customer feedback.",
  },
  {
    id: "plan-limits",
    category: "plans",
    question: "What happens if my project hits the free plan limit?",
    answer:
      "The Free tier includes 1 active project and 200 feedback entries per month. If you exceed this volume, existing feedback remains safe in your dashboard, and new submissions are gracefully throttled with a clear user notice until the quota resets or you upgrade to Pro.",
  },
  {
    id: "cancel-account",
    category: "plans",
    question: "Can I cancel my subscription or delete my data anytime?",
    answer:
      "Yes. You can manage your subscription or permanently delete your account directly from your dashboard settings. Account deletion immediately and permanently purges all projects, feedback records, and embed keys without requiring a support ticket.",
  },
];

/* ── Pre-configured Simulator Scenarios ── */
export const simulatorScenarios: SampleFeedbackScenario[] = [
  {
    id: "scenario-1",
    title: "Checkout Bug",
    category: "bug",
    rating: 1,
    message: "Checkout button freezes on iOS Safari after entering card details.",
    pageUrl: "https://acme-app.com/checkout",
    device: "Mobile",
    browser: "Mobile Safari 18.2",
    os: "iOS 18.2",
    status: "unreviewed",
  },
  {
    id: "scenario-2",
    title: "Feature Idea",
    category: "idea",
    rating: 5,
    message: "Would love a one-click CSV export option for quarterly metrics!",
    pageUrl: "https://acme-app.com/reports",
    device: "Desktop",
    browser: "Chrome 132.0",
    os: "macOS Sonoma",
    status: "reviewed",
  },
  {
    id: "scenario-3",
    title: "User Praise",
    category: "praise",
    rating: 5,
    message: "The new search speed is incredible. Such an improvement!",
    pageUrl: "https://acme-app.com/dashboard",
    device: "Desktop",
    browser: "Firefox 134.0",
    os: "Windows 11",
    status: "resolved",
  },
];
