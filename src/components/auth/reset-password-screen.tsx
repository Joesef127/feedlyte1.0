"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/useAuth";

type State = "idle" | "loading" | "success";

export function ResetPasswordScreen() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";
  const { resetPassword, resetPasswordIsPending } = useAuth();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [state, setState]         = useState<State>("idle");
  const [error, setError]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timeoutRef                = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // No token in URL — show an error immediately
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-[380px] text-center">
          <div className="w-12 h-12 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 6v4M9 12.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-destructive" />
              <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" className="text-destructive" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-foreground mb-2">Invalid link</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            This reset link is missing or malformed. Request a new one from
            the forgot password page.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  const submit = async () => {
    setError("");

    if (!password || !confirm) {
      setError("Both fields are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      await resetPassword({ token, password });
      setState("success");
      // Redirect to sign in after 2 seconds
      timeoutRef.current = setTimeout(() => router.push("/auth"), 2000);
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
        {state === "success" ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4.5 4.5 7.5-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-success" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-foreground mb-2 tracking-tight">
              Password updated
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your password has been reset. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-base font-bold text-foreground mb-1.5 tracking-tight">
                Set new password
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose a strong password with at least 8 characters.
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="relative">
                <FormField
                  label="New password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <div className="relative">
                <FormField
                  label="Confirm password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={setConfirm}
                  placeholder="••••••••"
                />
                {confirm && (
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {error && (
                <p className="text-destructive text-[12px]">{error}</p>
              )}

              <button
                onClick={submit}
                disabled={resetPasswordIsPending}
                className="w-full bg-primary text-primary-foreground py-xs rounded-lg text-sm font-bold cursor-pointer mt-1 tracking-[0.02em] transition-opacity disabled:opacity-70 disabled:cursor-wait"
              >
                {resetPasswordIsPending ? "Updating password..." : "Update password"}
              </button>            </div>

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