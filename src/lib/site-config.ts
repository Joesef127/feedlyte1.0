/**
 * Site configuration and canonical URLs
 */

export const siteConfig = {
  name: "Feedlyte",
  legalName: "Feedlyte Inc.",
  description:
    "Drop one script tag into any website and instantly collect user feedback. Sandboxed iframe, multi-category triage, and real-time dashboard.",
  domain: "feedlyte.com",
  url:
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.NODE_ENV === "production"
        ? "https://feedlyte.com"
        : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  productionUrl: "https://feedlyte.com",
  previewUrl: "https://feedlyte.vercel.app",
  twitterHandle: "@feedlyte",
  supportEmail: "support@feedlyte.com",
  links: {
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
  keywords: [
    "feedback widget",
    "customer feedback tool",
    "embeddable feedback",
    "product feedback",
    "user feedback triage",
    "iframe feedback widget",
    "bug reporting widget",
    "customer insights",
    "saas feedback infrastructure",
  ],
} as const;

export function getAbsoluteUrl(path: string = ""): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
