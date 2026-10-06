import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailScreen } from "@/components/auth/verify-email-screen";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your Feedlyte account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailScreen />
    </Suspense>
  );
}