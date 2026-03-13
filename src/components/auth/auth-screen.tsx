"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { FormField } from "@/components/ui/form-field";

interface AuthScreenProps {
  onLogin: () => void;
}

type Mode = "login" | "register";

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("jordan@acme.dev");
  const [password, setPassword] = useState("password");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (!email || !password) {
      setError("All fields required.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 900);
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
            FeedStack
          </span>
        </div>
        <p className="text-muted-foreground text-[13px]">
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
              onClick={() => { setMode(m); setError(""); }}
              className={[
                "flex-1 py-[7px] rounded-md border-none text-[13px] font-semibold cursor-pointer transition-all",
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
        <div className="flex flex-col gap-3.5">
          {mode === "register" && (
            <FormField label="Name" value={name} onChange={setName} placeholder="Jordan Kim" />
          )}
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
          />
          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />
          {error && <p className="text-destructive text-[12px] m-0">{error}</p>}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground border-none py-[11px] rounded-lg text-[13px] font-bold cursor-pointer mt-1 tracking-[0.02em] transition-opacity disabled:opacity-70 disabled:cursor-wait"
          >
            {loading
              ? "Authenticating..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </div>

        {mode === "login" && (
          <p className="text-center text-muted-foreground text-[12px] mt-5 mb-0">
            Demo: any email + password works.
          </p>
        )}
      </div>
    </div>
  );
}
