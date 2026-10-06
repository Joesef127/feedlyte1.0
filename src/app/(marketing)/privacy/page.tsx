import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Feedlyte's commitment to user data protection, sandboxed privacy, and GDPR/CCPA compliance.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Shield size={16} />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
            Trust & Security
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 font-sans">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground mb-10">
          Last updated: October 2026 • Effective immediately
        </p>

        <div className="space-y-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <section className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lock size={16} className="text-primary" /> 1. Principles of Our Sandboxed Architecture
            </h2>
            <p>
              Feedlyte is built on an iframe-isolated sandbox model. Unlike third-party scripts that inject code directly into your host document object model (DOM), Feedlyte runs within a secure cross-origin boundary. We do not inspect, crawl, or record your site visitors’ keystrokes, personal passwords, or private browsing history.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
            <p>
              When a user submits feedback through the Feedlyte widget, we only capture data explicitly provided:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Feedback Message & Rating:</strong> The user&apos;s written commentary and optional 1–5 star sentiment score.</li>
              <li><strong className="text-foreground">Optional Contact Details:</strong> An email address if the user opts in to receive follow-up status updates.</li>
              <li><strong className="text-foreground">Diagnostics (When Enabled):</strong> Browser user-agent, operating system, and the host URL path where the feedback was triggered. We do not collect cookies or fingerprint across sessions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Database size={16} className="text-primary" /> 3. Data Storage & Retention
            </h2>
            <p>
              Feedback submissions are stored in encrypted databases hosted in secure enterprise data centers. Customer data is retained in accordance with your workspace plan (e.g., 7 days on Free, 90 days on Pro, and 365 days on Team). Workspace owners may permanently delete any feedback record or project at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Webhooks & Integrations</h2>
            <p>
              When webhooks are configured, event payloads are dispatched with an optional HMAC-SHA256 signature to your target endpoint (such as Slack or custom microservices). Feedlyte never sells or brokers user feedback to third-party data aggregators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Contact & Data Rights</h2>
            <p>
              To exercise GDPR/CCPA data rights (such as data portability or erasure requests), please reach out to our privacy compliance team at <a href="mailto:privacy@feedlyte.com" className="text-primary hover:underline">privacy@feedlyte.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
