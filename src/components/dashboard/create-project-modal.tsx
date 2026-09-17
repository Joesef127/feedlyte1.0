"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/hooks/use-projects";
import { toast } from "sonner";
import { friendlyError } from "@/lib/error-messages";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#F59E0B");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">(
    "bottom-right",
  );

  const resetForm = () => {
    setName("");
    setColor("#F59E0B");
    setPosition("bottom-right");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        color,
        position,
      });
      toast.success("Project created");
      handleClose();
      onCreated(project.id);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create New Project">
      <div className="flex flex-col gap-4">
        <FormField
          label="Project Name"
          value={name}
          onChange={setName}
          placeholder="e.g. My SaaS App"
        />

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
            Widget Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="font-mono text-sm text-muted-foreground">
              {color}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
            Widget Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["bottom-right", "bottom-left"] as const).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(pos)}
                style={{
                  borderColor: position === pos ? color : "var(--border)",
                  color: position === pos ? color : "var(--muted-foreground)",
                  background: position === pos ? color + "15" : "transparent",
                }}
                className="px-3 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all capitalize"
              >
                {pos.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createProject.isPending}
          >
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
