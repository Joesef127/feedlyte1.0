/**
 * Projects API Service
 * Centralized API calls for project-related operations
 */

import type { Project } from "@/types";

export type ProjectPayload = Partial<Pick<Project, "name" | "color" | "position" | "label">>;

// ─── Fetch ───────────────────────────────────────────────────────────────────

/**
 * Fetch all projects for the authenticated user
 */
export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

// ─── Create ──────────────────────────────────────────────────────────────────

/**
 * Create a new project
 */
export async function createProject(data: ProjectPayload): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create project");
  }
  return res.json();
}

// ─── Update ──────────────────────────────────────────────────────────────────

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  data: ProjectPayload
): Promise<Partial<Project>> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to update project");
  }
  return res.json();
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
}
