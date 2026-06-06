import { FeedbackDetailPage } from "@/components/feedback/feedback-detail-page";

export default function FeedbackDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <FeedbackDetailPage params={params} />;
}