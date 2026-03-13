import type { Feedback, Project, User } from "@/types";

export const MOCK_USER: User = {
  name: "Jordan Kim",
  email: "jordan@acme.dev",
  plan: "Pro",
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_a1b2c3",
    name: "Acme Storefront",
    apiKey: "proj_a1b2c3",
    createdAt: "2025-11-04",
    feedbackCount: 47,
    newCount: 12,
    color: "#F59E0B",
    position: "bottom-right",
    label: "Feedback",
  },
  {
    id: "proj_d4e5f6",
    name: "Internal Portal",
    apiKey: "proj_d4e5f6",
    createdAt: "2025-12-18",
    feedbackCount: 14,
    newCount: 3,
    color: "#3B82F6",
    position: "bottom-left",
    label: "Feedback",
  },
  {
    id: "proj_g7h8i9",
    name: "Docs Site",
    apiKey: "proj_g7h8i9",
    createdAt: "2026-01-22",
    feedbackCount: 6,
    newCount: 1,
    color: "#10B981",
    position: "bottom-right",
    label: "Suggest",
  },
];

const RAW_FEEDBACK = [
  {
    m: "Checkout fails on mobile Safari. Cart empties after payment.",
    e: "sue@email.com",
    url: "/checkout",
    ua: "Safari/17 iOS",
    s: "new" as const,
    d: "2026-03-12 14:22",
  },
  {
    m: "Love the new dashboard! Much faster than before.",
    e: "",
    url: "/dashboard",
    ua: "Chrome/122 Mac",
    s: "reviewed" as const,
    d: "2026-03-11 09:45",
  },
  {
    m: "Can you add CSV export for the reports section?",
    e: "dev@corp.io",
    url: "/reports",
    ua: "Firefox/124 Win",
    s: "new" as const,
    d: "2026-03-11 08:01",
  },
  {
    m: "The filter dropdown doesn't close when clicking outside.",
    e: "",
    url: "/projects",
    ua: "Chrome/122 Win",
    s: "resolved" as const,
    d: "2026-03-10 17:33",
  },
  {
    m: "Would love dark mode support.",
    e: "nightowl@dev.co",
    url: "/settings",
    ua: "Safari/17 Mac",
    s: "reviewed" as const,
    d: "2026-03-09 22:14",
  },
  {
    m: "Search is blazing fast now. Great work on the latest update!",
    e: "",
    url: "/search",
    ua: "Edge/122 Win",
    s: "resolved" as const,
    d: "2026-03-08 11:05",
  },
  {
    m: "Pagination breaks when filtering + sorting at the same time.",
    e: "qa@test.dev",
    url: "/feedback",
    ua: "Chrome/122 Linux",
    s: "new" as const,
    d: "2026-03-07 16:48",
  },
];

export function generateFeedback(projectId: string): Feedback[] {
  return RAW_FEEDBACK.map((f, i) => ({
    id: `fb_${projectId}_${i}`,
    projectId,
    message: f.m,
    email: f.e,
    pageUrl: f.url,
    userAgent: f.ua,
    status: f.s,
    createdAt: f.d,
  }));
}

export const INITIAL_FEEDBACK: Feedback[] = MOCK_PROJECTS.flatMap((p) =>
  generateFeedback(p.id)
);
