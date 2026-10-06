"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, ArrowLeft } from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import ProjectDetailLoading from "@/app/(main)/dashboard/projects/[id]/loading";

export function ProjectDetailView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return <ProjectDetailLoading />;
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={<LayoutGrid size={24} />}
          title="Project not found"
          description="This project may have been deleted or you may not have permission to view it."
          action={
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard/projects")}
              className="gap-2"
            >
              <ArrowLeft size={14} />
              Back to Projects
            </Button>
          }
        />
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
