/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { FormField } from "@/components/ui/form-field";

type Mode = "login" | "register";
type Status = "default" | "checking-email";

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("default");

  const submit = async () => {
    setError("");
    if (!email || !password || (mode === "register" && !name)) {
      setError("All fields required.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        // Register — verification email will be sent
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error ?? "Registration failed.");
          setLoading(false);
          return;
        }

        // Show "check your email" message — don't verify here
        setStatus("checking-email");
        setLoading(false);
        return;
      }

      // Login flow
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Show "check email" screen after successful registration
  if (status === "checking-email") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
        <div className="mb-10 text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare
                size={16}
                className="text-primary-foreground"
                strokeWidth={2}
              />
            </div>
            <span className="text-[22px] font-bold text-foreground tracking-[-0.03em]">
              Feedlyte
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Feedback infrastructure for modern products.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-[380px] text-center">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 5l6 5 8-8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              />
            </svg>
          </div>
          <h2 className="text-base font-bold text-foreground mb-2">
            Verify your email
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>. 
            Click the link in your email to verify your account.
          </p>
          <button
            onClick={() => {
              setStatus("default");
              setEmail("");
              setPassword("");
              setName("");
              setMode("login");
            }}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            Back to Sign In
          </button>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
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
            <MessageSquare
              size={16}
              className="text-primary-foreground"
              strokeWidth={2}
            />
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
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-[380px]">
        {/* Mode toggle */}
        <div className="flex gap-1 mb-7 bg-background rounded-lg p-1">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={[
                "flex-1 py-[7px] rounded-md border-none text-sm font-semibold cursor-pointer transition-all",
                mode === m
                  ? "bg-secondary text-foreground"
                  : "bg-transparent text-muted-foreground",
              ].join(" ")}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          className="flex flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {mode === "register" && (
            <FormField
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Your name"
            />
          )}
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
          />

          {/* Password field with forgot link inline */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              {mode === "login" && (
                <Link
                  href="/auth/change-password"
                  className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <FormField
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              hideLabel
            />
          </div>

          {error && <p className="text-destructive text-[12px]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground border-none py-[11px] rounded-lg text-sm font-bold cursor-pointer mt-1 tracking-[0.02em] transition-opacity disabled:opacity-70 disabled:cursor-wait"
          >
            {loading
              ? mode === "register"
                ? "Creating account..."
                : "Signing in..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
