import type { Feedback, FeedbackNote, Status } from "@/types";
import type { BulkFeedbackActionInput } from "@/lib/validations";

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

export interface FeedbackFiltersQuery {
  status?:     string;
  q?:          string;
  category?:   string;
  tag?:        string;
  assignedTo?: string;
  projectId?:  string;
  from?:       string;
  to?:         string;
}

export async function fetchFeedback(
  projectId: string,
  filters?: FeedbackFiltersQuery
): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filters?.status)     params.set("status",     filters.status);
  if (filters?.q)          params.set("q",          filters.q);
  if (filters?.category)   params.set("category",   filters.category);
  if (filters?.tag)        params.set("tag",        filters.tag);
  if (filters?.assignedTo) params.set("assignedTo", filters.assignedTo);
  if (filters?.from)       params.set("from",       filters.from);
  if (filters?.to)         params.set("to",         filters.to);
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

export async function fetchAllFeedback(
  filters?: FeedbackFiltersQuery
): Promise<Feedback[]> {
  const params = new URLSearchParams();
  if (filters?.status)     params.set("status",     filters.status);
  if (filters?.q)          params.set("q",          filters.q);
  if (filters?.category)   params.set("category",   filters.category);
  if (filters?.tag)        params.set("tag",        filters.tag);
  if (filters?.assignedTo) params.set("assignedTo", filters.assignedTo);
  if (filters?.projectId)  params.set("projectId",  filters.projectId);
  if (filters?.from)       params.set("from",       filters.from);
  if (filters?.to)         params.set("to",         filters.to);
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

export async function updateFeedbackDetails(
  id: string,
  details: {
    status?:       Status;
    tags?:         string[];
    assignedToId?: string | null;
  }
): Promise<Feedback> {
  const res = await fetch(`/api/feedback/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(details),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to update feedback details");
  }
  return res.json();
}

// ─── Bulk ────────────────────────────────────────────────────────────────────

export async function bulkFeedbackAction(
  payload: BulkFeedbackActionInput
): Promise<{ success: boolean; count: number; action: string }> {
  const res = await fetch("/api/feedback/bulk", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to perform bulk action");
  }
  return res.json();
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function fetchFeedbackNotes(
  feedbackId: string
): Promise<FeedbackNote[]> {
  const res = await fetch(`/api/feedback/${feedbackId}/notes`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to fetch feedback notes");
  }
  return res.json();
}

export async function addFeedbackNote(
  feedbackId: string,
  content: string
): Promise<FeedbackNote> {
  const res = await fetch(`/api/feedback/${feedbackId}/notes`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to add note");
  }
  return res.json();
}

export async function deleteFeedbackNote(
  feedbackId: string,
  noteId: string
): Promise<void> {
  const res = await fetch(`/api/feedback/${feedbackId}/notes/${noteId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to delete note");
  }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteFeedback(id: string): Promise<void> {
  const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feedback");
}