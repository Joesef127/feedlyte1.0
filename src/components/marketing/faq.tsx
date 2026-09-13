"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle, Mail } from "lucide-react";
import { faqItems } from "./marketing-data";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>("how-embed-works");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "integration" | "privacy" | "plans">("all");

  const filteredItems = faqItems.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-background relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Heading, Categories & Contact Prompt (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border bg-card text-muted-foreground mb-4">
                <HelpCircle size={12} className="text-primary" /> Questions & Answers
              </span>
              <h2 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] tracking-tight text-foreground mb-4">
                Frequently asked questions.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Everything you need to know about the embed loader, iframe security, and data privacy.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", label: "All Questions" },
                  { id: "integration", label: "Integration" },
                  { id: "privacy", label: "Security & Privacy" },
                  { id: "plans", label: "Plans & Limits" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedCategory === cat.id
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border/70 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Direct Contact Card */}
            <div className="p-5 rounded-2xl bg-card border border-border/70 text-xs">
              <div className="flex items-center gap-2 text-foreground font-bold mb-1">
                <Mail size={14} className="text-primary" />
                <span>Have a technical question?</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Need a custom SLA, origin whitelist configuration, or self-hosted deployment advice?
              </p>
              <a
                href="mailto:support@feedlyte.com"
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                support@feedlyte.com &rarr;
              </a>
            </div>
          </div>

          {/* Right Column: Accessible Smooth Accordions (8 cols) */}
          <div className="lg:col-span-8 divide-y divide-border/60">
            {filteredItems.map((item) => {
              const isOpen = openIndex === item.id;
              return (
                <div key={item.id} className="py-5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="w-full flex items-center justify-between gap-4 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-sm sm:text-base font-semibold transition-colors ${
                        isOpen
                          ? "text-primary"
                          : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {item.question}
                    </span>

                    <span
                      className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isOpen
                          ? "border-primary/40 bg-primary/10 text-primary rotate-180"
                          : "border-border/80 bg-card text-muted-foreground group-hover:border-primary/30"
                      }`}
                    >
                      {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                    </span>
                  </button>

                  {/* Smooth Grid Accordion Expansion */}
                  <div
                    className={`accordion-grid-content ${
                      isOpen ? "expanded" : ""
                    }`}
                  >
                    <div>
                      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground pt-3 pr-8">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}