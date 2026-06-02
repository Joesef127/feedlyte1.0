"use client";

import { useState } from "react";
import { MailOpen, X } from "lucide-react";

type BannerState = "idle" | "sending" | "sent" | "error";

export function VerificationBanner() {
  const [state, setState]     = useState<BannerState>("idle");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const resend = async () => {
    setState("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <MailOpen size={15} className="text-primary shrink-0" />
        <p className="text-sm text-foreground truncate">
          Please verify your email address to get the most out of Feedlyte.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {state === "idle" && (
          <button
            onClick={resend}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
          >
            Resend email
          </button>
        )}
        {state === "sending" && (
          <span className="text-xs text-muted-foreground">Sending...</span>
        )}
        {state === "sent" && (
          <span className="text-xs text-success font-medium">Email sent!</span>
        )}
        {state === "error" && (
          <button
            onClick={resend}
            className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors"
          >
            Failed — try again
          </button>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}