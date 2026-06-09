"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProjectCard } from "./project-card";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { ProjectFilterBar, ProjectFilters } from "./project-filter-bar";
import { applyProjectFilters } from "./filtering-helper";

export function ProjectsPage() {
  const router = useRouter();
  const { data: projects = [], isLoading, isError } = useProjects();
  const createProject = useCreateProject();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#F59E0B");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">(
    "bottom-right",
  );

  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    position: "",
    sortBy: "newest",
  });
  const filteredProjects = applyProjectFilters(projects, filters);

  const resetForm = () => {
    setName("");
    setColor("#F59E0B");
    setPosition("bottom-right");
  };

  const create = async () => {
    if (!name.trim()) return;
    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        color,
        position,
      });
      setShowModal(false);
      resetForm();
      router.push(`/dashboard/projects/${project.id}`);
    } catch {
      // error handled by mutation state
    }
  };

  return (
    <ErrorBoundary context="projects-page">
      <div className="flex-1 px-4 sm:px-9 py-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-7">
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
              Projects
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 m-0">
              {projects.length} project{projects.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-1.5">
            <Plus size={14} />
            New Project
          </Button>
        </div>

        <ProjectFilterBar filters={filters} onFiltersChange={setFilters} />

        {isLoading && (
          <div className="text-center py-20 text-muted-foreground text-sm">
            Loading projects...
          </div>
        )}

        {isError && (
          <EmptyState
            icon={<LayoutGrid size={24} />}
            title="Failed to load projects"
            description="Something went wrong fetching your projects. Please refresh the page."
            action={
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            }
          />
        )}

        {!isLoading && !isError && projects.length === 0 && (
          <EmptyState
            icon={<LayoutGrid size={24} />}
            title="No projects yet"
            description="Create your first project to start collecting feedback from your users."
            action={
              <Button onClick={() => setShowModal(true)} className="gap-1.5">
                <Plus size={14} />
                Create your first project
              </Button>
            }
          />
        )}

        {!isLoading && !isError && projects.length > 0 && (
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {filteredProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => router.push(`/dashboard/projects/${p.id}`)}
              />
            ))}
          </div>
        )}

        {/* Create modal */}
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title="Create Project"
        >
          <div className="flex flex-col gap-6">
            <FormField
              label="Project Name"
              value={name}
              onChange={setName}
              placeholder="My Website"
            />
            <div>
              <p className="text-sm text-muted-foreground uppercase font-medium  tracking-[0.04em] mb-2">
                Accent Color
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  title="Pick a color"
                />
                <span className="text-sm text-muted-foreground font-mono">
                  {color}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.04em] mb-2">
                Widget Position
              </p>
              <div className="flex gap-2">
                {(["bottom-right", "bottom-left"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    style={{
                      borderColor: position === pos ? color : "var(--border)",
                      color:
                        position === pos ? color : "var(--muted-foreground)",
                      background:
                        position === pos ? color + "15" : "transparent",
                    }}
                    className="px-3 py-2 rounded-[7px] border text-sm font-medium cursor-pointer transition-all"
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {createProject.isError && (
              <p className="text-destructive text-sm">
                {(createProject.error as Error)?.message ??
                  "Failed to create project."}
              </p>
            )}

            <div className="grid grid-cols-2 sm:flex gap-2 justify-end mt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={create}
                disabled={!name.trim() || createProject.isPending}
              >
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}
