import type { Metadata } from "next";
import { Suspense } from "react";
import { AllFeedbackPage } from "@/components/feedback/all-feedback-page";
import FeedbackLoading from "./loading";

export const metadata: Metadata = {
  title: "All Feedback",
  description: "Triage, filter, search, and export feedback collected across all your projects.",
};

export default function FeedbackRoute() {
  return (
    <Suspense
      fallback={
        <FeedbackLoading />
      }
    >
      <AllFeedbackPage />
    </Suspense>
  );
}