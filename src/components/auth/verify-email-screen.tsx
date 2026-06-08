"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type State = "verifying" | "success" | "error";

export function VerifyEmailScreen() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";
  const { verifyEmail } = useAuth();

  const [state, setState]     = useState<State>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Only run effect if token exists
    if (!token) return;

    verifyEmail(token)
      .then(() => {
        setState("success");
        // Redirect to dashboard after 2.5s
        setTimeout(() => router.push("/dashboard"), 2500);
      })
      .catch((err) => {
        setState("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [token, router, verifyEmail]);

  // Show error state if token is missing, without calling setState in effect
  if (!token && state === "verifying") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare size={16} className="text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="text-[22px] font-bold text-foreground tracking-[-0.03em]">
              Feedlyte
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Feedback infrastructure for modern products.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-95 text-center">
          <div className="w-12 h-12 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 6v4M9 12.5h.01"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="text-destructive"
              />
              <circle
                cx="9"
                cy="9"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-destructive"
              />
            </svg>
          </div>
          <h2 className="text-base font-bold text-foreground mb-2">
            Verification failed
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Verification token is missing.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="w-full flex justify-center py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to dashboard
            </Link>
            <p className="text-sm text-muted-foreground/50 mt-1">
              You can resend the verification email from your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">

      {/* Brand */}
      <div className="mb-10 text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MessageSquare size={16} className="text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="text-[22px] font-bold text-foreground tracking-[-0.03em]">
            Feedlyte
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Feedback infrastructure for modern products.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-95 text-center">

        {state === "verifying" && (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-border border-t-primary animate-spin mx-auto mb-5" />
            <h2 className="text-base font-bold text-foreground mb-2">
              Verifying your email...
            </h2>
            <p className="text-sm text-muted-foreground">
              Just a moment.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-12 h-12 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10l4.5 4.5 7.5-8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-success"
                />
              </svg>
            </div>
            <h2 className="text-base font-bold text-foreground mb-2">
              Email verified
            </h2>
            <p className="text-sm text-muted-foreground">
              Your email has been confirmed. Redirecting you to the
              dashboard...
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-12 h-12 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 6v4M9 12.5h.01"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="text-destructive"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-destructive"
                />
              </svg>
            </div>
            <h2 className="text-base font-bold text-foreground mb-2">
              Verification failed
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {message}
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="w-full flex justify-center py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Go to dashboard
              </Link>
              <p className="text-sm text-muted-foreground/50 mt-1">
                You can resend the verification email from your dashboard.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}