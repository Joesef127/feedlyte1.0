import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing the use of Feedlyte feedback infrastructure.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsOfServicePage() {
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
            <FileText size={16} />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
            Legal Agreement
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 font-sans">
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground mb-10">
          Last updated: October 2026 • Effective immediately
        </p>

        <div className="space-y-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <section className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By embedding the Feedlyte widget script tag or accessing the Feedlyte management dashboard, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or entity, you represent that you have authority to bind that entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Permitted Use & Service Integrity</h2>
            <p>
              Feedlyte grants you a non-exclusive, revocable license to embed our feedback widget on websites you own or operate. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Reverse engineer or disassemble the sandboxed iframe architecture or backend API routes.</li>
              <li>Use the widget to transmit malware, phishing payloads, or malicious scripts.</li>
              <li>Exceed authorized plan rate limits or attempt denial-of-service against the ingestion endpoints.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Service Availability & SLA</h2>
            <p>
              We strive to maintain 99.9% uptime for the widget JavaScript delivery and submission endpoints. In the rare event of upstream network interruption, the widget fails gracefully and silently without affecting your host site&apos;s rendering or performance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Subscriptions & Billing</h2>
            <p>
              Paid subscription plans are billed on a recurring monthly or annual basis. You may cancel your subscription at any time via your Account Settings. Upon cancellation, your workspace remains active until the end of the current billing cycle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Termination & Inquiries</h2>
            <p>
              For legal questions regarding these terms, contact our team at <a href="mailto:support@feedlyte.com" className="text-primary hover:underline">support@feedlyte.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
