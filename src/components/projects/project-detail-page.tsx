"use client";

import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Project, ProjectDetailTab } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProjectStats } from "./project-stats";
import { ProjectTabs } from "./project-tabs";
import { FeedbackTab } from "./tabs/feedback-tab";
import { EmbedTab } from "./tabs/embed-tab";
import { SettingsTab } from "./tabs/settings-tab";
import {
  useFeedback,
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from "@/hooks/use-feedback";
import { useDeleteProject, useUpdateProject } from "@/hooks/use-projects";

interface ProjectDetailPageProps {
  project:  Project;
  onBack:   () => void;
  onUpdate: (project: Project) => void;
}

export function ProjectDetailPage({
  project,
  onBack,
  onUpdate,
}: ProjectDetailPageProps) {
  const [tab,         setTab]         = useState<ProjectDetailTab>("feedback");
  const [deleteModal, setDeleteModal] = useState(false);

  const { data: pFeedback = [], isLoading: feedbackLoading } = useFeedback(project.id);
  const updateStatus  = useUpdateFeedbackStatus(project.id);
  const deleteFb      = useDeleteFeedback(project.id);
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();

  const handleDeleteProject = async () => {
    try {
      await deleteProject.mutateAsync(project.id);
      onBack();
    } catch {
      // error shown inside modal via deleteProject.isError
    }
  };

  const handleSaveSettings = async (data: {
    color:         string;
    position:      string;
    label:         string;
    allowedOrigin: string;
  }) => {
    try {
      const updated = await updateProject.mutateAsync({
        id:   project.id,
        data: {
          ...data,
          allowedOrigin: data.allowedOrigin || null,
        },
      });
      onUpdate({ ...project, ...updated });
    } catch {
      // error surfaced via updateProject.isError
    }
  };

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">

      {/* Back + title */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-transparent border-none text-muted-foreground cursor-pointer text-sm mb-4 p-0 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
              {project.name}
            </h1>
            <p className="text-sm text-muted-foreground font-mono mt-1 m-0">
              {project.id}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteModal(true)}
            className="gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ProjectStats feedback={pFeedback} isLoading={feedbackLoading} />

      {/* Tabs */}
      <ProjectTabs active={tab} onChange={setTab} />

      {/* Tab content */}
      {tab === "feedback" && (
        <FeedbackTab
          feedback={pFeedback}
          isLoading={feedbackLoading}
          onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
          onDelete={(id) => deleteFb.mutate(id)}
        />
      )}

      {tab === "embed" && (
        <EmbedTab project={project} />
      )}

      {tab === "settings" && (
        <SettingsTab
          project={project}
          onUpdate={onUpdate}
          isSaving={updateProject.isPending}
          isError={updateProject.isError}
          errorMsg={(updateProject.error as Error)?.message ?? "Failed to save."}
          onSave={handleSaveSettings}
        />
      )}

      {/* Delete modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Project"
      >
        <p className="text-secondary-foreground text-[14px] mb-6">
          This will permanently delete{" "}
          <strong className="text-foreground">{project.name}</strong> and all{" "}
          {pFeedback.length} feedback entries. This cannot be undone.
        </p>
        {deleteProject.isError && (
          <p className="text-destructive text-sm mb-4">
            Failed to delete project. Please try again.
          </p>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteProject}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? "Deleting..." : "Delete Project"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}