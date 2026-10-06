import type { Metadata } from "next";
import { FeedbackDetailPage } from "@/components/feedback/feedback-detail-page";

export const metadata: Metadata = {
  title: "Feedback Details",
  description: "View submission metadata, user environment, and collaborate on internal notes.",
};

export default function FeedbackDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <FeedbackDetailPage params={params} />;
}