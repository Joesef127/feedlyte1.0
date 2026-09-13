"use client";

import { useState } from "react";
import { Copy, Check, Code2, Sparkles } from "lucide-react";
import { howItWorksSteps } from "./marketing-data";

export function HowItWorks() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "nextjs" | "react">("html");

  const codeSnippets = {
    html: `<!-- 1. Drop before closing </body> tag -->
<script
  src="https://feedlyte.vercel.app/widget.js"
  data-project="proj_live_94k2m"
  defer
></script>`,
    nextjs: `// In your app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://feedlyte.vercel.app/widget.js"
          data-project="proj_live_94k2m"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`,
    react: `// In your App.tsx or index.html
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://feedlyte.vercel.app/widget.js";
  script.setAttribute("data-project", "proj_live_94k2m");
  script.defer = true;
  document.body.appendChild(script);
  return () => document.body.removeChild(script);
}, []);`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-background relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border bg-card text-muted-foreground mb-4">
            <Sparkles size={12} className="text-primary" /> The 3-Minute Journey
          </span>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.5rem)] tracking-tight text-foreground mb-4">
            From sign-up to live feedback in minutes.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            No complex SDKs. No npm dependencies. No backend routing to configure.
          </p>
        </div>

        {/* 3 Step Cards Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {howItWorksSteps.map((step) => (
            <div
              key={step.number}
              className="p-7 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between relative group hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display text-4xl text-primary/40 font-normal group-hover:text-primary transition-colors">
                    {step.number}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground/80 font-mono">
                {step.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Code Preview Box */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-card border border-border/80 shadow-card-elevated overflow-hidden">
          {/* Code Window Header */}
          <div className="h-12 border-b border-border px-4 sm:px-6 flex items-center justify-between bg-card/80">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground font-mono">
                Single-Line Embed
              </span>
            </div>

            {/* Framework Switcher Tabs */}
            <div className="flex items-center gap-1 bg-background border border-border/60 p-0.5 rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("html")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "html"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                HTML
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("nextjs")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "nextjs"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Next.js
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("react")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === "react"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                React
              </button>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border border-border/70 hover:bg-accent text-foreground transition-colors"
              aria-label="Copy embed script code"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-muted-foreground" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <div className="p-5 sm:p-6 bg-background/60 font-mono text-xs sm:text-[13px] overflow-x-auto leading-relaxed">
            <pre className="text-foreground">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}