"use client";

import { useState } from "react";

type FAQItem = { question: string; answer: string };

const faqs: FAQItem[] = [
  {
    question: "How does the embed actually work?",
    answer:
      "You paste a single script tag into your site's HTML. When a visitor loads your page, the script injects a small, self-contained feedback button. Clicking it opens a form inside a sandboxed iframe. Submissions go directly to Feedlyte's API and land in your dashboard. Your site's styles, scripts, and fonts are completely unaffected.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. There is no npm package, no SDK, no build step. The entire integration is one script tag. It works on any website regardless of the framework or stack you use.",
  },
  {
    question: "Will the widget slow down my website?",
    answer:
      "No. The script tag uses the defer attribute, which means it loads after your page content has rendered. The widget file is under 2kb. It will not affect your Lighthouse scores or Core Web Vitals.",
  },
  {
    question: "What happens to feedback if I hit the free plan limit?",
    answer:
      "The widget remains visible, but new submissions are rejected with an over-limit error and the user is notified. Your existing feedback data is preserved. Upgrade to restore full submission capacity.",
  },
  {
    question: "Is the feedback data private?",
    answer:
      "Your feedback is only accessible to you from your authenticated dashboard. The public submission endpoint accepts data but exposes none. We do not sell, share, or analyze your feedback for any purpose.",
  },
  {
    question: "Can I use Feedlyte on multiple sites?",
    answer:
      "Yes. Each project you create gets its own embed code. The free plan includes one project. Pro gives you ten, and the Team plan is unlimited. Feedback from each project is isolated in its own stream.",
  },
  {
    question: "Do you support custom widget branding?",
    answer:
      "Custom widget colors, button position, and placeholder text are on the roadmap for the Pro plan. The current release ships a clean, neutral design that works well on dark and light backgrounds.",
  },
  {
    question: "How do I cancel or delete my account?",
    answer:
      "You delete your account directly from the dashboard settings page. All associated projects, feedback data, and embed codes are immediately and permanently removed. No support ticket required.",
  },
];

function FAQRow({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-5 py-[22px] text-left bg-transparent border-none cursor-pointer"
      >
        <span className={`text-base font-semibold tracking-tight transition-colors ${isOpen ? "text-foreground" : "text-muted-foreground"}`}>
          {item.question}
        </span>
        <div
          className={[
            "w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all",
            isOpen ? "bg-primary/10 border-primary/30" : "border-border bg-transparent",
          ].join(" ")}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform duration-200 ${isOpen ? "rotate-45 text-primary" : "text-muted-foreground"}`}
          >
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground pb-[22px]">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-24 bg-card border-t border-border">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-20 items-start">

          {/* Left sticky label */}
          <div className="md:sticky md:top-24">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-border text-muted-foreground bg-background mb-5">
              FAQ
            </span>
            <h2 className="font-display text-[clamp(2rem,3vw,2.8rem)] tracking-tight mb-4 text-foreground">
              Common questions
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Something not covered here? Reach out at{" "}
              <a
                href="mailto:support@feedlyte.com"
                className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
              >
                support@feedlyte.com
              </a>
            </p>
          </div>

          {/* Accordions */}
          <div>
            {faqs.map((item, i) => (
              <FAQRow key={i} item={item} isOpen={openIndex === i} onToggle={() => toggle(i)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}