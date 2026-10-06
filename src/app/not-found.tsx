import Link from "next/link";
import { MessageSquare, ArrowLeft, Home, LayoutGrid, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "404 — Page Not Found | Feedlyte",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
            <MessageSquare size={16} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            Feedlyte
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Go to Dashboard →
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="max-w-xl mx-auto w-full text-center py-12 flex flex-col items-center">
        {/* Glow Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto text-primary shadow-amber-sm">
            <span className="font-mono text-2xl font-extrabold tracking-tighter">404</span>
          </div>
          <div className="absolute -inset-2 bg-primary/10 rounded-full blur-xl -z-10" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 font-sans">
          Page not found
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, renamed, or perhaps it never existed.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-10 w-full sm:w-auto">
          <Button asChild variant="default" className="gap-2 px-5 py-2.5">
            <Link href="/dashboard">
              <LayoutGrid size={15} />
              Open Dashboard
            </Link>
          </Button>

          <Button asChild variant="secondary" className="gap-2 px-5 py-2.5">
            <Link href="/">
              <Home size={15} />
              Homepage
            </Link>
          </Button>
        </div>

        {/* Quick Directory Box */}
        <div className="w-full bg-card border border-border/80 rounded-2xl p-5 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-3 px-1">
            Looking for something specific?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutGrid size={14} className="text-primary" />
              <span>Manage Projects</span>
            </Link>
            <Link
              href="/dashboard/feedback"
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare size={14} className="text-primary" />
              <span>Feedback Inbox</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle size={14} className="text-primary" />
              <span>Widget Embed Guide</span>
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} className="text-primary" />
              <span>Sign In / Register</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="text-center text-xs text-muted-foreground/50 max-w-5xl mx-auto w-full">
        <p>© {new Date().getFullYear()} Feedlyte Inc. All systems operational.</p>
      </footer>
    </div>
  );
}
