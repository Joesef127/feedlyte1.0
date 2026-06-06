"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";

export default function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: projects = [] } = useProjects();

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Project not found.</p>
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