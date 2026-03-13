"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Bell, MessageSquare, Check } from "lucide-react";
import type { Feedback, Project, ProjectDetailTab } from "@/types";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { WidgetPreview } from "@/components/widget/widget-preview";
import { FeedbackTable } from "../feedback/feedback-table";
import { EmbedCode } from "./embed-code";

interface ProjectDetailPageProps {
  project: Project;
  onBack: () => void;
  feedback: Feedback[];
  setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>;
}

const WIDGET_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444"];
const TABS: { id: ProjectDetailTab; label: string }[] = [
  { id: "feedback", label: "Feedback" },
  { id: "embed", label: "Embed Code" },
  { id: "settings", label: "Widget Settings" },
];

export function ProjectDetailPage({
  project,
  onBack,
  feedback,
  setFeedback,
}: ProjectDetailPageProps) {
  const [tab, setTab] = useState<ProjectDetailTab>("feedback");
  const [deleteModal, setDeleteModal] = useState(false);

  const pFeedback = feedback.filter((f) => f.projectId === project.id);

  const updateStatus = (fbId: string, status: Feedback["status"]) =>
    setFeedback((prev) => prev.map((f) => (f.id === fbId ? { ...f, status } : f)));

  const deleteFb = (fbId: string) =>
    setFeedback((prev) => prev.filter((f) => f.id !== fbId));

  const stats = [
    { label: "Total Feedback", value: pFeedback.length, Icon: MessageSquare },
    { label: "Unreviewed", value: pFeedback.filter((f) => f.status === "new").length, Icon: Bell },
    { label: "Resolved", value: pFeedback.filter((f) => f.status === "resolved").length, Icon: Check },
  ];

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
              <Icon size={14} className="text-[#3d3d3d]" />
            </div>
            <span className="text-[26px] font-bold text-foreground tracking-[-0.04em]">
              {value}
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
          onUpdateStatus={updateStatus}
          onDelete={deleteFb}
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
            <div className="flex flex-col gap-3.5">
              <FormField
                label="Button Label"
                value={project.label || "Feedback"}
                onChange={() => {}}
              />
              <div>
                <p className="text-[12px] text-[#737373] font-medium uppercase tracking-[0.04em] mb-2">
                  Accent Color
                </p>
                <div className="flex gap-2">
                  {WIDGET_COLORS.map((c) => (
                    <div
                      key={c}
                      style={{
                        background: c,
                        border: `3px solid ${project.color === c ? "#E5E5E5" : "transparent"}`,
                      }}
                      className="w-6 h-6 rounded-full"
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#737373] font-medium uppercase tracking-[0.04em] mb-2">
                  Position
                </p>
                <div className="flex gap-2">
                  {(["bottom-right", "bottom-left"] as const).map((pos) => (
                    <button
                      key={pos}
                      style={{
                        borderColor: project.position === pos ? "#F59E0B" : "#2A2A2A",
                        color: project.position === pos ? "#F59E0B" : "#525252",
                      }}
                      className="px-3 py-[7px] rounded-[7px] border bg-transparent text-[12px] font-medium cursor-pointer"
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <Button fullWidth>Save Settings</Button>
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
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setDeleteModal(false)}>
            Delete Project
          </Button>
        </div>
      </Modal>
    </div>
  );
}
