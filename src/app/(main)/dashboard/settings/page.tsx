import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings/settings-page";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account credentials, security preferences, and subscription tier.",
};

export default function SettingsRoute() {
  return <SettingsPage />;
}