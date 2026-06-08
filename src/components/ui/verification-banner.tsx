"use client";

import { useState } from "react";
import { MailOpen, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { BannerState } from "@/types";


export function VerificationBanner() {
  const { data: session } = useSession();
  const [state, setState] = useState<BannerState>("idle");
  const [dismissed, setDismissed] = useState(false);

  // Do not render if already verified or dismissed
  if (dismissed || session?.user?.emailVerified) return null;

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
    <div className="bg-primary/10 border-b border-primary/20 px-2 sm:px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-1 h-14">
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2">
        <MailOpen size={15} className="text-primary shrink-0" />
        <p className="text-xs lg:text-sm text-foreground break-all">
          Please verify your email address to get the most out of Feedlyte.
        </p>
        </div>

        <a className="flex items-center gap-3 shrink-0">
          {state === "idle" && (
            <button
              onClick={resend}
              className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
            >
              Resend email
            </button>
          )}
          {state === "sending" && (
            <span className="text-xs sm:text-sm text-muted-foreground">
              Sending...
            </span>
          )}
          {state === "sent" && (
            <span className="text-xs sm:text-sm text-success font-medium">
              Sent! Check your inbox.
            </span>
          )}
          {state === "error" && (
            <button
              onClick={resend}
              className="text-xs sm:text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
            >
              Failed. Try again.
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </a>
      </div>
    </div>
  );
}
