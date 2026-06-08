"use client";

import { AccountCard } from "./account-card";
import { DangerCard } from "./danger-card";
import { PasswordCard } from "./password-card";
import { PlanCard } from "./plan-card";
import { useSettings } from "@/hooks/use-settings";


export function SettingsPage() {
  const settings = useSettings();

  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage account and preferences
        </p>
      </div>

      <div className="flex flex-col gap-4 xl:max-w-3/5 2xl:max-w-2/5">
        <AccountCard {...settings} />
        <PasswordCard {...settings} />
        <PlanCard />
        <DangerCard {...settings} />
      </div>
    </div>
  );
}