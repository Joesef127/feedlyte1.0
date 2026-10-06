import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/components/auth/forgot-password-screen";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your Feedlyte account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
