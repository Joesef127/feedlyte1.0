"use client";

import { AccountCard } from "./account-card";
import { DangerCard } from "./danger-card";
import { PasswordCard } from "./password-card";
import { PlanCard } from "./plan-card";
import { useSettings } from "@/hooks/use-settings";


export function SettingsPage() {
  const settings = useSettings();

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage account and preferences
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-3/4">
        <AccountCard {...settings} />
        <PasswordCard {...settings} />
        <PlanCard />
        <DangerCard {...settings} />
      </div>
    </div>
  );
}