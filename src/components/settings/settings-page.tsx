"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

export function SettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);

  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
          Settings
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1 m-0">
          Account and billing preferences.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-[560px]">
        {/* Account */}
        <Card>
          <h3 className="text-[14px] font-bold text-foreground mb-4">Account</h3>
          <div className="flex flex-col gap-3">
            <FormField label="Name" value={name} onChange={() => {}} />
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={() => {}}
            />
            <Button onClick={handleSave}>{saved ? "Saved!" : "Save Changes"}</Button>
          </div>
        </Card>

        {/* Plan */}
        <Card>
          <h3 className="text-[14px] font-bold text-foreground mb-1">Plan</h3>
          <p className="text-[13px] text-muted-foreground mb-4">
            You are on the{" "}
            <strong className="text-primary">Pro</strong> plan.
          </p>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              ["Projects", "Unlimited"],
              ["Feedback/mo", "100,000"],
              ["Retention", "12 months"],
            ].map(([k, v]) => (
              <div key={k} className="bg-background rounded-lg p-3">
                <p className="text-[11px] text-[#3d3d3d] uppercase tracking-[0.06em] mb-1 m-0">
                  {k}
                </p>
                <p className="text-[14px] font-bold text-foreground m-0">{v}</p>
              </div>
            ))}
          </div>
          <Button variant="secondary">Manage Billing</Button>
        </Card>

        {/* API */}
        <Card>
          <h3 className="text-[14px] font-bold text-foreground mb-1">API Access</h3>
          <p className="text-[13px] text-muted-foreground mb-3">
            Use your API key to submit feedback programmatically.
          </p>
          <div className="bg-background rounded-[7px] px-3 py-2.5 font-mono text-[12px] text-success">
            sk_live_••••••••••••••••••••••••••••••••
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/30">
          <h3 className="text-[14px] font-bold text-destructive mb-1">Danger Zone</h3>
          <p className="text-[13px] text-muted-foreground mb-3">
            Permanently delete your account and all data.
          </p>
          <Button variant="danger">Delete Account</Button>
        </Card>
      </div>
    </div>
  );
}
