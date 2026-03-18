"use client";

import { useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { ProjectCard } from "./project-card";
import { useProjects, useCreateProject } from "@/hooks/use-projects";

interface ProjectsPageProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectsPage({ onSelectProject }: ProjectsPageProps) {
  const { data: projects = [], isLoading, isError } = useProjects();
  const createProject = useCreateProject();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#F59E0B");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");

  const create = async () => {
    if (!name.trim()) return;
    try {
      await createProject.mutateAsync({ name: name.trim(), color, position });
      setShowModal(false);
      setName("");
      setColor("#F59E0B");
      setPosition("bottom-right");
    } catch {
      // error handled by mutation state
    }
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

      {isLoading && (
        <div className="text-center py-20 text-muted-foreground text-[14px]">
          Loading projects...
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-destructive text-[14px]">
          Failed to load projects. Please refresh.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && projects.length === 0 && (
        <div className="text-center py-20">
          <div className="w-[52px] h-[52px] bg-card rounded-xl flex items-center justify-center mx-auto mb-4">
            <LayoutGrid size={24} className="text-[#d3d0d0]" />
          </div>
          <p className="text-muted-foreground text-[15px] m-0">No projects yet.</p>
          <p className="text-[#d3d0d0] text-[13px] mt-1.5 mb-5">
            Create one to start collecting feedback.
          </p>
          <Button onClick={() => setShowModal(true)} className="gap-1.5">
            <Plus size={14} />
            Create your first project
          </Button>
        </div>
      )}

      {!isLoading && !isError && projects.length > 0 && (
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
            <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
              Widget Color
            </p>
            <div className="flex items-center gap-3">
              <div
                style={{ background: color }}
                className="w-8 h-8 rounded-full border-2 border-sidebar-border shrink-0"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                title="Pick a color"
              />
              <span className="text-[12px] text-muted-foreground font-mono">{color}</span>
            </div>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
              Widget Position
            </p>
            <div className="flex gap-2">
              {(["bottom-right", "bottom-left"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  style={{
                    borderColor: position === pos ? color : "var(--border)",
                    color: position === pos ? color : "var(--muted-foreground)",
                    background: position === pos ? color + "15" : "transparent",
                  }}
                  className="px-3 py-[7px] rounded-[7px] border text-[12px] font-medium cursor-pointer transition-all"
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
          {createProject.isError && (
            <p className="text-destructive text-[13px]">
              {(createProject.error as Error)?.message ?? "Failed to create project."}
            </p>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={!name.trim() || createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
