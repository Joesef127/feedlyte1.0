import type { Metadata } from "next";
import { ProjectDetailView } from "@/components/projects/project-detail-view";

export const metadata: Metadata = {
  title: "Project Configuration",
  description: "Configure widget appearance, origin security, HMAC webhooks, and analytics.",
};

export default function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ProjectDetailView params={params} />;
}
