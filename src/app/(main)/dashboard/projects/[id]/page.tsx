"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/hooks/use-projects";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";

export default function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-2">
        <p className="text-muted-foreground text-sm">Project not found.</p>
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="text-xs text-primary hover:underline"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <ProjectDetailPage
      project={project}
      onBack={() => router.push("/dashboard/projects")}
      onUpdate={() => router.refresh()}
    />
  );
}
