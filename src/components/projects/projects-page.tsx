"use client";

import { useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { ProjectCard } from "./project-card";

interface ProjectsPageProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onSelectProject: (project: Project) => void;
}

const WIDGET_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#EC4899"];

export function ProjectsPage({ projects, setProjects, onSelectProject }: ProjectsPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#F59E0B");
  const [creating, setCreating] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    setCreating(true);
    setTimeout(() => {
      const id = "proj_" + Math.random().toString(36).slice(2, 8);
      setProjects((prev) => [
        ...prev,
        {
          id,
          name: name.trim(),
          apiKey: id,
          createdAt: new Date().toISOString().split("T")[0],
          feedbackCount: 0,
          newCount: 0,
          color,
          position: "bottom-right",
          label: "Feedback",
        },
      ]);
      setShowModal(false);
      setName("");
      setCreating(false);
    }, 700);
  };

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      {/* Header row */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
            Projects
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1 m-0">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1.5">
          <Plus size={14} />
          New Project
        </Button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-[52px] h-[52px] bg-card rounded-xl flex items-center justify-center mx-auto mb-4">
            <LayoutGrid size={24} className="text-[#3d3d3d]" />
          </div>
          <p className="text-muted-foreground text-[15px] m-0">No projects yet.</p>
          <p className="text-[#3d3d3d] text-[13px] mt-1.5 mb-5">
            Create one to start collecting feedback.
          </p>
          <Button onClick={() => setShowModal(true)} className="gap-1.5">
            <Plus size={14} />
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onClick={() => onSelectProject(p)} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Project">
        <div className="flex flex-col gap-4">
          <FormField
            label="Project Name"
            value={name}
            onChange={setName}
            placeholder="My Website"
          />
          <div>
            <p className="text-[12px] text-[#737373] font-medium uppercase tracking-[0.04em] mb-2">
              Widget Color
            </p>
            <div className="flex gap-2">
              {WIDGET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    background: c,
                    border: `3px solid ${color === c ? "#E5E5E5" : "transparent"}`,
                  }}
                  className="w-7 h-7 rounded-full cursor-pointer transition-all"
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={!name.trim() || creating}>
              {creating ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
