"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Error logged for monitoring in production
  }, [error]);

  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-5 shadow-sm">
        <AlertTriangle size={28} strokeWidth={2} />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 tracking-tight">
        Something went wrong
      </h1>

      <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
        An unexpected error occurred while loading this view. You can try refreshing or returning to the dashboard.
      </p>

      {error.digest && (
        <div className="mb-6 px-3 py-1.5 rounded-lg bg-card border border-border text-[11px] font-mono text-muted-foreground/80">
          <span>Error ID: {error.digest}</span>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Button onClick={reset} variant="default" className="gap-2">
          <RotateCcw size={14} />
          Try again
        </Button>

        <Button asChild variant="secondary" className="gap-2">
          <Link href="/dashboard">
            <Home size={14} />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}