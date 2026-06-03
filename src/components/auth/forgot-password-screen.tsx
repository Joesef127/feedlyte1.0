"use client";

import { useState } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

type State = "idle" | "loading" | "sent";

export function ForgotPasswordScreen() {
  const { requestPasswordReset, requestPasswordResetIsPending } = useAuth();
  
  const [email, setEmail]   = useState("");
  const [state, setState]   = useState<State>("idle");
  const [error, setError]   = useState("");

  const submit = async () => {
    setError("");
    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      await requestPasswordReset({ email });
      setState("sent");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errorMessage);
    }
  };

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

      {/* Card */}
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-95">
        {state === "sent" ? (
          /* Success state */
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4.5 4.5 7.5-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-success" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-foreground mb-2 tracking-tight">
              Check your inbox
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              If an account exists for{" "}
              <span className="text-foreground font-medium">{email}</span>,
              you will receive a password reset link shortly.
            </p>
            <p className="text-xs text-muted-foreground/50 mb-6">
              The link expires in 1 hour. Check your spam folder if you
              don&apos;t see it.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        ) : (
          /* Request form */
          <>
            <div className="mb-6">
              <h2 className="text-base font-bold text-foreground mb-1.5 tracking-tight">
                Forgot your password?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your account email and we&apos;ll send you a link to reset
                your password.
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              <FormField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
              />

              {error && (
                <p className="text-destructive text-[12px]">{error}</p>
              )}

              <button
                onClick={submit}
                disabled={requestPasswordResetIsPending}
                className="w-full bg-primary text-primary-foreground py-2.75 rounded-lg text-sm font-bold cursor-pointer mt-1 tracking-[0.02em] transition-opacity disabled:opacity-70 disabled:cursor-wait"
              >
                {requestPasswordResetIsPending ? "Sending link..." : "Send reset link"}
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-border text-center">
              <Link
                href="/auth"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}