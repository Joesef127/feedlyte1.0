import { Suspense } from "react";
import { AllFeedbackPage } from "@/components/feedback/all-feedback-page";

export default function FeedbackRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 px-5 sm:px-9 py-8">
          <div className="h-8 w-48 bg-card border border-border rounded-lg animate-pulse mb-6" />
          <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />
        </div>
      }
    >
      <AllFeedbackPage />
    </Suspense>
  );
}