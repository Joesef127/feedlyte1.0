/**
 * Feedback API Service
 * Centralized API calls for feedback-related operations
 */

import type { Feedback, Status } from "@/types";

// ─── Fetch ───────────────────────────────────────────────────────────────────

/**
 * Fetch feedback for a specific project
 * @param projectId - The project ID
 * @param filters - Optional filters: status, search query
 */
export async function fetchFeedback(
  projectId: string,
  filters?: { status?: string; q?: string }
): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.q) params.set("q", filters.q);
  const qs = params.size ? `?${params.toString()}` : "";

  const res = await fetch(`/api/projects/${projectId}/feedback${qs}`);
  if (!res.ok) throw new Error("Failed to load feedback");
  return res.json();
}

/**
 * Fetch all feedback for the authenticated user (cross-project)
 * @param filters - Optional filters: status, search query
 */
export async function fetchAllFeedback(filters?: {
  status?: string;
  q?: string;
}): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.q) params.set("q", filters.q);
  const qs = params.size ? `?${params.toString()}` : "";

  const res = await fetch(`/api/feedback${qs}`);
  if (!res.ok) throw new Error("Failed to load feedback");
  return res.json();
}

// ─── Update ──────────────────────────────────────────────────────────────────

/**
 * Update feedback status (e.g., new, read, resolved)
 */
export async function updateFeedbackStatus(
  id: string,
  status: Status
): Promise<void> {
  const res = await fetch(`/api/feedback/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/**
 * Delete feedback
 */
export async function deleteFeedback(id: string): Promise<void> {
  const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feedback");
}
