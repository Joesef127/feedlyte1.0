import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/profile-page";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your user account profile, email verification status, and plan usage.",
};

export default function ProfileRoute() {
  return <ProfilePage />;
}