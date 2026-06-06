import type { Feedback, Status } from "@/types";

export interface FeedbackItem extends Feedback {
  project: {
    id:    string;
    name:  string;
    color: string;
  };
  similar: {
    id:        string;
    message:   string;
    status:    Status;
    createdAt: string;
  }[];
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

export async function fetchFeedback(
  projectId: string,
  filters?: { status?: string; q?: string }
): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.q)      params.set("q",      filters.q);
  const qs = params.size ? `?${params.toString()}` : "";

  const res = await fetch(`/api/projects/${projectId}/feedback${qs}`);
  if (!res.ok) throw new Error("Failed to load feedback");
  return res.json();
}

export async function fetchFeedbackItem(id: string): Promise<FeedbackItem> {
  const res = await fetch(`/api/feedback/${id}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to load feedback");
  }
  return res.json();
}

export async function fetchAllFeedback(filters?: {
  status?: string;
  q?: string;
}): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.q)      params.set("q",      filters.q);
  const qs = params.size ? `?${params.toString()}` : "";

  const res = await fetch(`/api/feedback${qs}`);
  if (!res.ok) throw new Error("Failed to load feedback");
  return res.json();
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateFeedbackStatus(
  id: string,
  status: Status
): Promise<void> {
  const res = await fetch(`/api/feedback/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteFeedback(id: string): Promise<void> {
  const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feedback");
}