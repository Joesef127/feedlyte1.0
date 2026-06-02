"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

// ── Account Section ───────────────────────────────────────────────────────────

function AccountCard() {
  const { data: session, update } = useSession();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

    // Fetch user data from API on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (res.ok) {
          setName(data.name ?? "");
          setEmail(data.email ?? "");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    
    fetchUser();
  }, []);
  

  const handleSave = async () => {
    setError("");
    setState("saving");

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save changes.");
        setState("error");
        return;
      }

      // Refresh session so header reflects new name/email
      await update({ name: data.name, email: data.email });
      setState("saved");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
      setState("error");
    }
  };

  const handleClear = () => {
    setName(session?.user?.name ?? "");
    setEmail(session?.user?.email ?? "");
    setError("");
    setState("idle");
  };

  const isDirty =
    name !== (session?.user?.name ?? "") ||
    email !== (session?.user?.email ?? "");

  return (
    <Card>
      <h3 className="text-[14px] font-bold text-foreground mb-4">Account</h3>
      <div className="flex flex-col gap-3">
        <FormField
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
        />
        {error && <p className="text-destructive text-xs">{error}</p>}
        {state === "saved" && (
          <p className="text-success text-xs">Changes saved.</p>
        )}
        <div className="flex justify-end gap-2.5">
          <Button
            onClick={handleClear}
            disabled={state === "saving" || !isDirty}
            variant="secondary"
          >
            Clear
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || state === "saving"}
          >
            {state === "saving" ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ── Password Section ──────────────────────────────────────────────────────────

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = async () => {
    setError("");

    if (!current || !next || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setState("saving");
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to update password.");
        setState("error");
        return;
      }

      setState("saved");
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
      setState("error");
    }
  };

  const handleClear = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
    setState("idle");
  };

  const isValid =
    current.length > 0 &&
    next.length >= 8 &&
    confirm.length > 0 &&
    next === confirm;

  return (
    <Card>
      <h3 className="text-[14px] font-bold text-foreground mb-4">Password</h3>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleChange();
        }}
      >
        <div className="relative">
          <FormField
            label="Current password"
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={setCurrent}
            placeholder="********"
          />
          {current && (
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showCurrent ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        <div className="relative">
          <FormField
            label="New password"
            type={showNext ? "text" : "password"}
            value={next}
            onChange={setNext}
            placeholder="********"
          />
          {next && (
            <button
              type="button"
              onClick={() => setShowNext(!showNext)}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showNext ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        <div className="relative">
          <FormField
            label="Confirm new password"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={setConfirm}
            placeholder="********"
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
        {error && <p className="text-destructive text-xs">{error}</p>}
        {state === "saved" && (
          <p className="text-success text-xs">Password updated.</p>
        )}
        <div className="flex justify-end gap-2.5">
          <Button
            onClick={handleClear}
            disabled={state === "saving"}
            variant="secondary"
          >
            Clear
          </Button>

          <Button disabled={!isValid || state === "saving"}>
            {state === "saving" ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ── Plan Section ──────────────────────────────────────────────────────────────

function PlanCard() {
  return (
    <Card>
      <h3 className="text-[14px] font-bold text-foreground mb-1">Plan</h3>
      <p className="text-sm text-muted-foreground mb-4">
        You are on the <strong className="text-primary">Free</strong> plan.
      </p>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          ["Projects", "1"],
          ["Feedback/mo", "200"],
          ["Retention", "7 days"],
        ].map(([k, v]) => (
          <div key={k} className="bg-background rounded-lg p-3">
            <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest mb-1">
              {k}
            </p>
            <p className="text-[14px] font-bold text-foreground">{v}</p>
          </div>
        ))}
      </div>
      <Button variant="secondary">Manage Billing</Button>
    </Card>
  );
}

// ── Danger Zone ───────────────────────────────────────────────────────────────

function DangerCard() {
  const { data: session } = useSession();
  const [modal, setModal] = useState(false);
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "deleting" | "error">("idle");
  const [error, setError] = useState("");

  const confirmText = "delete my account";
  const confirmed = input.toLowerCase() === confirmText;

  const handleDelete = async () => {
    if (!confirmed || !session?.user?.id) return;
    setState("deleting");
    setError("");

    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete account.");
        setState("error");
        return;
      }

      // Sign out and redirect after deletion
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Something went wrong. Please try again.");
      setState("error");
    }
  };

  return (
    <>
      <Card className="border-destructive/30">
        <h3 className="text-[14px] font-bold text-destructive mb-1">
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Permanently delete your account and all associated projects and
          feedback. This cannot be undone.
        </p>
        <Button variant="destructive" onClick={() => setModal(true)}>
          Delete Account
        </Button>
      </Card>

      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          setInput("");
          setState("idle");
          setError("");
        }}
        title="Delete Account"
      >
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          This will permanently delete your account, all your projects, and
          every feedback entry. This action cannot be undone.
        </p>
        <p className="text-sm text-foreground font-medium mb-2">
          Type{" "}
          <span className="font-mono text-destructive">delete my account</span>{" "}
          to confirm.
        </p>
        <FormField
          label=""
          hideLabel
          value={input}
          onChange={setInput}
          placeholder="delete my account"
        />
        {error && <p className="text-destructive text-xs mt-2">{error}</p>}
        <div className="flex gap-2 justify-end mt-5">
          <Button
            variant="secondary"
            onClick={() => {
              setModal(false);
              setInput("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!confirmed || state === "deleting"}
          >
            {state === "deleting" ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1 m-0">
          Manage your account and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-140">
        <AccountCard />
        <PasswordCard />
        <PlanCard />
        <DangerCard />
      </div>
    </div>
  );
}
