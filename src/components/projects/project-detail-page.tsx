"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Bell, MessageSquare, Check } from "lucide-react";
import type { Project, ProjectDetailTab } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { WidgetPreview } from "@/components/widget/widget-preview";
import { FeedbackTable } from "../feedback/feedback-table";
import { EmbedCode } from "./embed-code";
import {
  useFeedback,
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from "@/hooks/use-feedback";
import { useDeleteProject, useUpdateProject } from "@/hooks/use-projects";

interface ProjectDetailPageProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
}

const TABS: { id: ProjectDetailTab; label: string }[] = [
  { id: "feedback", label: "Feedback" },
  { id: "embed", label: "Embed Code" },
  { id: "settings", label: "Widget Settings" },
];

export function ProjectDetailPage({ project, onBack, onUpdate }: ProjectDetailPageProps) {
  const [tab, setTab] = useState<ProjectDetailTab>("feedback");
  const [deleteModal, setDeleteModal] = useState(false);

  // Widget settings local state — initialised from the current project
  const [editColor, setEditColor] = useState(project.color);
  const [editPosition, setEditPosition] = useState(project.position);
  const [editLabel, setEditLabel] = useState(project.label);

  const { data: pFeedback = [], isLoading: feedbackLoading } = useFeedback(project.id);
  const updateStatus = useUpdateFeedbackStatus(project.id);
  const deleteFb = useDeleteFeedback(project.id);
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();

  const stats = [
    { label: "Total Feedback", value: pFeedback.length, Icon: MessageSquare },
    { label: "Unreviewed", value: pFeedback.filter((f) => f.status === "new").length, Icon: Bell },
    { label: "Resolved", value: pFeedback.filter((f) => f.status === "resolved").length, Icon: Check },
  ];

  const handleDeleteProject = async () => {
    try {
      await deleteProject.mutateAsync(project.id);
      onBack();
    } catch {
      // handled by mutation state
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updated = await updateProject.mutateAsync({
        id: project.id,
        data: { color: editColor, position: editPosition, label: editLabel },
      });
      onUpdate({ ...project, ...updated });
    } catch {
      // handled by mutation state
    }
  };

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      {/* Back + title */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-transparent border-none text-muted-foreground cursor-pointer text-[13px] mb-4 p-0 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
              {project.name}
            </h1>
            <p className="text-[13px] text-muted-foreground font-mono mt-1 m-0">
              {project.id}
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)} className="gap-1.5">
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ label, value, Icon }) => (
          <Card key={label}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] text-muted-foreground font-medium">{label}</span>
              <Icon size={14} className="text-[#d3d0d0]" />
            </div>
            <span className="text-[26px] font-bold text-foreground tracking-[-0.04em]">
              {feedbackLoading ? "—" : value}
            </span>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-5 border-b border-sidebar-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              "px-4 py-[9px] border-none bg-transparent text-[13px] font-semibold cursor-pointer transition-all",
              "border-b-2 -mb-px",
              tab === id
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "feedback" && (
        <FeedbackTable
          feedback={pFeedback}
          isLoading={feedbackLoading}
          onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
          onDelete={(id) => deleteFb.mutate(id)}
        />
      )}

      {tab === "embed" && (
        <div className="max-w-[600px] space-y-4">
          <EmbedCode project={project} />
          <Card>
            <h3 className="text-[14px] font-bold text-foreground mb-2">Widget Preview</h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              This is how your widget appears on external websites.
            </p>
            <WidgetPreview project={project} />
          </Card>
        </div>
      )}

      {tab === "settings" && (
        <div className="max-w-[480px]">
          <Card>
            <h3 className="text-[14px] font-bold text-foreground mb-4">Widget Configuration</h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
                  Accent Color
                </p>
                <div className="flex items-center gap-3">
                  <div
                    style={{ background: editColor }}
                    className="w-8 h-8 rounded-full border-2 border-sidebar-border shrink-0"
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                    title="Pick a color"
                  />
                  <span className="text-[12px] text-muted-foreground font-mono">{editColor}</span>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
                  Position
                </p>
                <div className="flex gap-2">
                  {(["bottom-right", "bottom-left"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setEditPosition(pos)}
                      style={{
                        borderColor: editPosition === pos ? editColor : "var(--border)",
                        color: editPosition === pos ? editColor : "var(--muted-foreground)",
                        background: editPosition === pos ? editColor + "15" : "transparent",
                      }}
                      className="px-3 py-[7px] rounded-[7px] border text-[12px] font-medium cursor-pointer transition-all"
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <FormField
                label="Button Label"
                value={editLabel}
                onChange={setEditLabel}
                placeholder="Feedback"
              />
              {updateProject.isError && (
                <p className="text-destructive text-[13px]">
                  {(updateProject.error as Error)?.message ?? "Failed to save."}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={updateProject.isPending}
                >
                  {updateProject.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
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
          <p className="text-destructive text-[13px] mb-4">
            Failed to delete project. Please try again.
          </p>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
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
