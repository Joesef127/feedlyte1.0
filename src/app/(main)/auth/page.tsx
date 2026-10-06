import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Sign In & Register",
  description: "Sign in to your Feedlyte dashboard or create a new account to collect and triage user feedback.",
};

export default function Auth() {
  return <AuthScreen />;
}
